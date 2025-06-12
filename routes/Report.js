const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');
const fs = require('fs');
const path = require('path');

router.get('/getalldetail', async (req, res) => {
  try {
    const {
      assetid,
      name,
      dept,
      deliveryStart,
      deliveryEnd,
      repairStart,
      repairEnd,
      devicetype,
      sn, // <-- New: S/N field from query
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
      sn, // <-- Pass to view for input value persistence
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


module.exports = router;