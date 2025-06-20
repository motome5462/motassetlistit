const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const sizeOf = require('image-size');

router.get('/getalldetail', async (req, res) => {
  try {
    const {
      assetid,
      name,
      dept,
      UsageYears,
      deliveryStart,
      deliveryEnd,
      repairStart,
      repairEnd,
      devicetype,
      sn,
      page = 1,
      limit = 2
    } = req.query;

    const filters = {};

    if (assetid) {
      filters.assetid = { $regex: `^${assetid}$`, $options: 'i' };
    }
    if (name) {
      filters.name = { $regex: name, $options: 'i' };
    }
    if (dept) {
      filters.dept = { $regex: dept, $options: 'i' };
    }

    const now = new Date();
    const totalMonths = (parseInt(UsageYears) || 0) * 12;

    if (totalMonths) {
      filters.deliverydate = filters.deliverydate || {};
    }

  // Example: at least 24 months used means delivery date <= (today - 24 months)
      if (totalMonths) {
        const maxDeliveryDate = new Date(now);
        maxDeliveryDate.setMonth(maxDeliveryDate.getMonth() - totalMonths);
        filters.deliverydate.$lte = maxDeliveryDate;
      } 

    if (deliveryStart || deliveryEnd) {
      filters.deliverydate = {};
      if (deliveryStart) filters.deliverydate.$gte = new Date(deliveryStart);
      if (deliveryEnd) filters.deliverydate.$lte = new Date(deliveryEnd);
    }

    if (devicetype && devicetype !== '') {
      if (devicetype === 'Other') {
        const mainTypes = ['Laptop', 'PC', 'Server', 'Switch', 'Router'];
        filters.devicetype = { $nin: mainTypes };
      } else {
        filters.devicetype = devicetype;
      }
    }

    // 🔍 Add S/N search (for multiple serial number fields)
    if (sn) {
      const regex = new RegExp(sn, 'i');
      filters.$or = [
        { devicesn: regex },
        { romsn: regex },
        { monitorsn: regex },
        { keyboardsn: regex },
        { mousesn: regex },
        { printersn: regex },
        { upstypesn: regex },
        { adaptorsn: regex },
        { othersn: regex },
        { ossn: regex },
        { officesn: regex }
      ];
    }

    let query = assetlistModel.find(filters);

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    query = query.skip((pageNumber - 1) * pageLimit).limit(pageLimit);

    const assetlist = await query.populate({
      path: 'repairs',
      match: (() => {
        const repairDateFilter = {};
        if (repairStart) repairDateFilter.$gte = new Date(repairStart);
        if (repairEnd) repairDateFilter.$lte = new Date(repairEnd);
        if (repairStart || repairEnd) {
          return { repairdate: repairDateFilter };
        }
        return {};
      })()
    }).lean();

    for (const item of assetlist) {
      item.totalValue = (item.repairs || []).reduce((sum, r) => sum + parseFloat(r.value || 0), 0);

      if (item.img) {
        item.img = path.basename(item.img);
      }

      if (item.deliverydate) {
        const now = new Date();
        const deliveryDate = new Date(item.deliverydate);

        let years = now.getFullYear() - deliveryDate.getFullYear();
        let months = now.getMonth() - deliveryDate.getMonth();

        if (months < 0) {
          years -= 1;
          months += 12;
        }

        item.ageFormatted = `${years} year(s) ${months} month(s)`;
      } else {
        item.ageFormatted = 'N/A';
      }
    }
    
  const count = await assetlistModel.countDocuments(filters);

  res.render('Report', {
    data: assetlist,
    totalPages: Math.ceil(count / pageLimit),
    currentPage: pageNumber,
    assetid,
    name,
    dept,
    deliveryStart,
    deliveryEnd,
    repairStart,
    repairEnd,
    devicetype,
    sn,
    UsageYears,
    limit: pageLimit
  });


    assetlist.forEach(item => {
      item.img = null;
    });

  } catch (error) {
    console.error('Error fetching filtered assetlist:', error);
    res.status(500).send({ message: 'Server error', success: false });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "ID Invalid",
        success: false,
        error: ["ID is not a ObjectId"],
      });
    }

    const assetlist = await assetlistModel.findById(id).lean();

    if (!assetlist) {
      return res.status(404).send({
        message: "Data not found",
        success: false,
      });
    }

    if (assetlist.img) {
      const imgPath = path.join(__dirname, '../public/images', assetlist.img);
      if (fs.existsSync(imgPath)) {
        assetlist.img = path.basename(assetlist.img);
      } else {
        assetlist.img = null;
      }
    }

    res.render('Report', { data: [assetlist] });

  } catch (error) {
    console.error("Error fetching detail:", error);
    res.status(500).send({
      message: "Server error",
      success: false,
    });
  }
});




router.get('/export', async (req, res) => {
  try {
    const {
      assetid,
      name,
      dept,
      UsageYears,
      deliveryStart,
      deliveryEnd,
      repairStart,
      repairEnd,
      devicetype,
      sn,
      columns
    } = req.query;

    if (!columns) {
      return res.status(400).send('Missing columns parameter');
    }

    // Parse columns string into array
    const selectedColumns = decodeURIComponent(columns)
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map(col => col.trim())
      .filter(Boolean);

    if (!selectedColumns.length) {
      return res.status(400).send('No columns selected for export');
    }

    // Build asset filters
    const filters = {};
    if (assetid) filters.assetid = { $regex: assetid, $options: 'i' };
    if (name) filters.name = { $regex: name, $options: 'i' };
    if (dept) filters.dept = { $regex: dept, $options: 'i' };

    if (UsageYears) {
      const months = parseInt(UsageYears) * 12;
      if (!filters.deliverydate) filters.deliverydate = {};
      const dateLimit = new Date();
      dateLimit.setMonth(dateLimit.getMonth() - months);
      filters.deliverydate.$lte = dateLimit;
    }

    if (deliveryStart || deliveryEnd) {
      if (!filters.deliverydate) filters.deliverydate = {};
      if (deliveryStart) filters.deliverydate.$gte = new Date(deliveryStart);
      if (deliveryEnd) filters.deliverydate.$lte = new Date(deliveryEnd);
    }

    if (devicetype) {
      if (devicetype === 'Other') {
        filters.devicetype = { $nin: ['Laptop', 'PC', 'Server', 'Switch', 'Router'] };
      } else {
        filters.devicetype = devicetype;
      }
    }

    if (sn) {
      const regex = new RegExp(sn, 'i');
      filters.$or = [
        { devicesn: regex },
        { romsn: regex },
        { monitorsn: regex },
        { keyboardsn: regex },
        { mousesn: regex },
        { printersn: regex },
        { upstypesn: regex },
        { adaptorsn: regex },
        { othersn: regex },
        { ossn: regex },
        { officesn: regex }
      ];
    }

    // Fetch assets
    const assets = await assetlistModel.find(filters).lean();

    // Collect asset IDs for repair filtering
    const assetIds = assets.map(a => a._id);

    // Build repair filters
    const repairFilters = { computername: { $in: assetIds } };
    if (repairStart || repairEnd) {
      repairFilters.repairdate = {};
      if (repairStart) repairFilters.repairdate.$gte = new Date(repairStart);
      if (repairEnd) repairFilters.repairdate.$lte = new Date(repairEnd);
    }

    // Fetch repairs
    const repairs = await repairModel.find(repairFilters).lean();

    // Build Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Export');

    // Setup columns for Excel
    worksheet.columns = selectedColumns.map(col => ({
      header: col.charAt(0).toUpperCase() + col.slice(1),
      key: col,
      width: 20
    }));

    // Helper to format cell values (arrays join, else string)
    const formatValue = val => {
      if (Array.isArray(val)) return val.join(', ');
      if (val == null) return '';
      return val;
    };

    // Add asset rows
    for (const asset of assets) {
      const rowData = {};
      for (const col of selectedColumns) {
        if (col === 'img') continue; // handle images later
        rowData[col] = formatValue(asset[col]);
      }
      const row = worksheet.addRow(rowData);

      // Add image if 'img' column selected and asset has image
      if (selectedColumns.includes('img') && asset.img) {
        const imgPath = path.join(__dirname, '../public/images', asset.img);
        if (fs.existsSync(imgPath)) {
          const imgId = workbook.addImage({
            filename: imgPath,
            extension: path.extname(imgPath).slice(1)
          });
          worksheet.addImage(imgId, {
            tl: { col: selectedColumns.indexOf('img'), row: row.number - 1 },
            ext: { width: 100, height: 100 }
          });
          row.height = 75;
        }
      }

      // Add repairs rows linked to this asset
      const assetRepairs = repairs.filter(r => r.computername?.toString() === asset._id.toString());
      for (const repair of assetRepairs) {
        const repairRow = {};
        for (const col of selectedColumns) {
          // Repairs don't have asset columns, so empty string for asset fields
          if (
            ['name', 'dept', 'assetid', 'computername', 'device', 'devicetype', 'img'].includes(col)
          ) {
            repairRow[col] = '';
          } else {
            repairRow[col] = formatValue(repair[col]);
          }
        }
        worksheet.addRow(repairRow);
      }
    }

    // Write to buffer and send as file response
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Filter_Assetlist.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    return res.send(buffer);

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).send('Error exporting data');
  }
});


module.exports = router;