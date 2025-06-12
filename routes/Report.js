const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');

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
      page = 1,
      limit = 2
    } = req.query;

    const filters = {};

    // Filter by  (exact or partial match)
    if (assetid) {
      filters.assetid = { $regex: `^${assetid}$`, $options: 'i' };  // case-insensitive exact
    }
    if (name) {
      filters.name = { $regex: name, $options: 'i' };  // case-insensitive partial
    }
    if (dept) {
      filters.dept = { $regex: dept, $options: 'i' };  // case-insensitive partial
    }
    // Filter by delivery date range
    if (deliveryStart || deliveryEnd) {
      filters.deliverydate = {};
      if (deliveryStart) filters.deliverydate.$gte = new Date(deliveryStart);
      if (deliveryEnd) filters.deliverydate.$lte = new Date(deliveryEnd);
    }

    // Filter by device type
    if (devicetype && devicetype !== '') {
      if (devicetype === 'Other') {
        // 'Other' means device types NOT in the main list:
        const mainTypes = ['Laptop', 'PC', 'Server', 'Switch', 'Router'];
        filters.devicetype = { $nin: mainTypes };
      } else {
        filters.devicetype = devicetype;
      }
    }

    // Query assetlist with filters
    let query = assetlistModel.find(filters);

    // Pagination
    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    query = query.skip((pageNumber - 1) * pageLimit).limit(pageLimit);

    // Populate repairs
    const assetlist = await query.populate({
      path: 'repairs',
      match: (() => {
        // Repair date filter inside populate
        const repairDateFilter = {};
        if (repairStart) repairDateFilter.$gte = new Date(repairStart);
        if (repairEnd) repairDateFilter.$lte = new Date(repairEnd);
        if (repairStart || repairEnd) {
          return { repairdate: repairDateFilter };
        }
        return {}; // no filter on repairs
      })()
    }).lean();

    // Calculate totalValue from filtered repairs
    for (const item of assetlist) {
      item.totalValue = (item.repairs || []).reduce((sum, r) => sum + parseFloat(r.value || 0), 0);
    }

    // Count total documents for pagination (without pagination limits)
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
      limit: pageLimit
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

    const assetlist = await assetlistModel.findById(id);

    if (!assetlist) {
      return res.status(404).send({
        message: "Data not found",
        success: false,
      });
    }

    res.render('Report', { data: [assetlist] });

  } catch (error) {
    console.error("Error fetching insertone:", error);
    res.status(500).send({
      message: "Server error",
      success: false,
    });
  }
});

module.exports = router;
