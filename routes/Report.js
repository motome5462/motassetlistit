const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');

// Your existing route handlers (adapted/fixed for clarity)

router.get('/search', async (req, res) => {
  const { query, page = 1, limit = 2 } = req.query;

  try {
    const regex = new RegExp(query, 'i');
    const results = await assetlistModel.find({
      $or: [
        { name: regex },
        { assetid: regex },
        { devicesn: regex },
        { dept: regex }
      ]
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('repairs');

    results.forEach(asset => {
      asset.totalValue = asset.repairs.reduce((acc, repair) => acc + parseFloat(repair.value || 0), 0);
    });

    const count = await assetlistModel.countDocuments({
      $or: [
        { name: regex },
        { assetid: regex },
        { devicesn: regex },
        { dept: regex }
      ]
    });

    res.render('Report', {
      data: results,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      query: query,
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.get('/getalldetail', async (req, res) => {
  const { page = 1, limit = 2 } = req.query;

  try {
    let assetlist = await assetlistModel.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    for (let item of assetlist) {
      item.repairs = await repairModel.find({ computername: item._id }).populate('computername').lean();
      item.totalValue = item.repairs.reduce((sum, repair) => sum + parseFloat(repair.value || 0), 0);
    }

    let total = assetlist.reduce((acc, item) => acc + item.totalValue, 0);

    const count = await assetlistModel.countDocuments();

    res.render('Report', {
      data: assetlist,
      total: total,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      message: "success",
      success: true,
    });
  } catch (error) {
    console.error("Error fetching assetlist:", error);
    res.status(500).send({
      message: "server error",
      success: false,
    });
  }
});

router.get('/detail/:id', async (req, res) => {
  try {
    let id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "ID Invalid",
        success: false,
        error: ["ID is not a ObjectId"],
      });
    }

    let assetlist = await assetlistModel.findById(id);

    if (!assetlist) {
      return res.status(404).send({
        message: "Data not found",
        success: false,
      });
    }

    res.render('Report', { data: [assetlist] });  // or another view if needed

  } catch (error) {
    console.error("Error fetching insertone:", error);
    res.status(500).send({
      message: "Server error",
      success: false,
    });
  }
});

module.exports = router;
