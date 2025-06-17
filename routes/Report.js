const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

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
        // ตรวจสอบค่าพารามิเตอร์ columns ที่รับมาจาก query
        console.log('Received columns:', req.query.columns);

        // ถอดรหัสค่า columns และแยกค่า
        const columnsParam = decodeURIComponent(req.query.columns);
        if (!columnsParam || typeof columnsParam !== 'string') {
            return res.status(400).send('ค่าพารามิเตอร์ columns ไม่ถูกต้องหรือหายไป');
        }

        // แยกค่าโดยใช้เครื่องหมายคอมมา
        const selectedColumns = columnsParam.replace(/^\[|\]$/g, '').split(',').map(col => col.trim());

        if (selectedColumns.length === 0) {
            return res.status(400).send('ไม่ได้เลือกคอลัมน์ใด ๆ สำหรับการส่งออก');
        }

        // ดึงข้อมูลจากฐานข้อมูล
        const assetlist = await assetlistModel.find();
        const repair = await repairModel.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('AssetsList');

        // กำหนดคอลัมน์ทั้งหมดที่มีอยู่
        const allColumns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Department', key: 'dept', width: 20 },
            { header: 'Date', key: 'assetitlistsdate', width: 20 },
            { header: 'Asset Account No', key: 'cpuassetaccountno', width: 30 },
            { header: 'Asset ID', key: 'assetid', width: 30 },
            { header: 'Company', key: 'assetitlistscompany', width: 30 },
            { header: 'Computer Name', key: 'computername', width: 20 },
            { header: 'Brand', key: 'device', width: 20 },
            { header: 'Device Type', key: 'devicetype', width: 20 },
            { header: 'Device Choice', key: 'devicechoice', width: 20 },
            { header: 'Model', key: 'devicemodel', width: 30 },
            { header: 'SN', key: 'devicesn', width: 30 },
            { header: 'CPU', key: 'cpu', width: 20 },
            { header: 'CPU Type', key: 'cputype', width: 20 },
            { header: 'Speed', key: 'speed', width: 20 },
            { header: 'Hard Disk', key: 'harddisk', width: 20 },
            { header: 'RAM', key: 'ram', width: 20 },
            { header: 'ROM Drive Brand', key: 'romdrive', width: 20 },
            { header: 'ROM Drive Type', key: 'romdrivetype', width: 20 },
            { header: 'SN', key: 'romsn', width: 30 },
            { header: 'Asset ID', key: 'romassetid', width: 30 },
            { header: 'Monitor Brand', key: 'monitor', width: 20 },
            { header: 'Monitor Size', key: 'monitortype', width: 20 },
            { header: 'SN', key: 'monitorsn', width: 30 },
            { header: 'Asset ID', key: 'monitorassetid', width: 30 },
            { header: 'Keyboard Brand', key: 'keyboard', width: 20 },
            { header: 'Keyboard Type', key: 'keyboardtype', width: 20 },
            { header: 'SN', key: 'keyboardsn', width: 30 },
            { header: 'Asset ID', key: 'keyboardassetid', width: 30 },
            { header: 'Mouse', key: 'mouse', width: 20 },
            { header: 'Mouse Type', key: 'mousetype', width: 20 },
            { header: 'SN', key: 'mousesn', width: 30 },
            { header: 'Asset ID', key: 'mouseassetid', width: 30 },
            { header: 'Printer Brand', key: 'printer', width: 20 },
            { header: 'Printer Type', key: 'printertype', width: 20 },
            { header: 'Model', key: 'printermodel', width: 30 },
            { header: 'SN', key: 'printersn', width: 30 },
            { header: 'Asset ID', key: 'printerassetid', width: 30 },
            { header: 'UPS Type', key: 'ups', width: 20 },
            { header: 'UPS Brand', key: 'upstype', width: 20 },
            { header: 'UPS VA', key: 'upsva', width: 20 },
            { header: 'Model', key: 'upstypemodel', width: 30 },
            { header: 'SN', key: 'upstypesn', width: 30 },
            { header: 'Asset ID', key: 'upstypeassetid', width: 30 },
            { header: 'Adaptor Brand', key: 'adaptor', width: 20 },
            { header: 'SN', key: 'adaptorsn', width: 30 },
            { header: 'Hardware Other', key: 'other1', width: 20 },
            { header: 'SN', key: 'othersn', width: 30 },
            { header: 'Windown OS', key: 'os', width: 20 },
            { header: 'OS Type', key: 'ostype', width: 20 },
            { header: 'SN', key: 'ossn', width: 30 },
            { header: 'Microsoft Office ', key: 'office', width: 20 },
            { header: 'Office Type', key: 'officetype', width: 20 },
            { header: 'SN', key: 'officesn', width: 30 },
            { header: 'Antivirus', key: 'antivirus', width: 20 },
            { header: 'PDF', key: 'pdf', width: 20 },
            { header: 'Utility', key: 'utility', width: 20 },
            { header: 'Software Other', key: 'other2', width: 20 },
            { header: 'Map Drive', key: 'mapdrive', width: 20 },
            { header: 'Add Printer', key: 'addprinter', width: 20 },
            { header: 'Other', key: 'other3', width: 20 },
            { header: 'Remark', key: 'assetitlistsremark', width: 20 },
            { header: 'Delivery Date', key: 'deliverydate', width: 20 },
            { header: 'Image', key: 'img', width: 40 },
            { header: 'Detail Repair', key: 'detailrepair', width: 20 },
            { header: 'Value', key: 'value', width: 20 },
            { header: 'Success', key: 'success', width: 20 },
            { header: 'Fail', key: 'fail', width: 20 },
            { header: 'Repair Remark', key: 'repairremark', width: 20 },
            { header: 'Repair Date', key: 'repairdate', width: 20 },
            { header: 'Total', key: 'total', width: 20 },
        ];

        const columnsToExport = allColumns.filter(col => selectedColumns.includes(col.key));
        worksheet.columns = columnsToExport;

        // Center text in all columns
        worksheet.columns.forEach(column => {
            column.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // หาตำแหน่งของคอลัมน์ 'img' เพื่อการแทรกรูปภาพ
        const imgColumnIndex = columnsToExport.findIndex(col => col.key === 'img') + 1;

        assetlist.forEach(asset => {
            const row = {};
            columnsToExport.forEach(col => {
                if (col.key === 'img') {
                    // ข้ามการตั้งค่าค่าของคอลัมน์ 'img' เพื่อไม่ให้มีชื่อไฟล์แสดงในเซลล์
                    return;
                }
                // แปลงข้อมูลที่เป็นอาร์เรย์ให้เป็นสตริง โดยถ้ามีเพียงหนึ่งค่า ให้ใช้ค่านั้นโดยตรง
                if (Array.isArray(asset[col.key])) {
                    row[col.key] = asset[col.key].filter(value => value).join(', ') || '';
                } else {
                    row[col.key] = asset[col.key] || '';
                }
            });

            const nonEmptyValues = Object.values(row).some(value => value !== '');
            if (nonEmptyValues) {
                const newRow = worksheet.addRow(row);
                if (asset.img && imgColumnIndex) {
                    const imgPath = path.join(__dirname, '../public/images/', asset.img);
                    if (fs.existsSync(imgPath)) {
                        const imageId = workbook.addImage({
                            filename: imgPath,
                            extension: path.extname(imgPath).slice(1),
                        });

                        const dimensions = sizeOf(imgPath);
                        const cell = worksheet.getCell(newRow.getCell(imgColumnIndex).address);
                        worksheet.addImage(imageId, {
                            tl: { col: cell.col - 1, row: cell.row - 1 },
                            ext: { width: dimensions.width / 4, height: dimensions.height / 4 },
                        });

                        newRow.height = dimensions.height / 4;
                    }
                }
            }

            const repairsForAsset = repair.filter(rep => rep.computername.toString() === asset._id.toString());

            repairsForAsset.forEach(rep => {
                const repairRow = {};
                columnsToExport.forEach(col => {
                    if (!['computername', '_id'].includes(col.key)) {
                        // แปลงข้อมูลที่เป็นอาร์เรย์ให้เป็นสตริง โดยถ้ามีเพียงหนึ่งค่า ให้ใช้ค่านั้นโดยตรง
                        if (Array.isArray(rep[col.key])) {
                            repairRow[col.key] = rep[col.key].filter(value => value).join(', ') || '';
                        } else {
                            repairRow[col.key] = rep[col.key] || '';
                        }
                    }
                });

                const nonEmptyRepairValues = Object.values(repairRow).some(value => value !== '');
                if (nonEmptyRepairValues) {
                    worksheet.addRow(repairRow);
                }
            });
        });

        // สร้างไฟล์ Excel ชั่วคราวและดาวน์โหลด
        const tempFilePath = path.join(__dirname, 'exported_data.xlsx');
        await workbook.xlsx.writeFile(tempFilePath);

        res.download(tempFilePath, 'exported_data.xlsx', err => {
            if (err) {
                console.error(err);
                res.status(500).send('เกิดข้อผิดพลาดในการดาวน์โหลดไฟล์');
            }
            fs.unlinkSync(tempFilePath);
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('เกิดข้อผิดพลาดขณะทำการส่งออกข้อมูล');
    }
});




module.exports = router;