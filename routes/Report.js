// routes/Report.js
const express = require('express');
const router = express.Router();
const assetlistModel = require('../models/assetlist');
const repairModel = require('../models/repair');

router.get('/', (req, res) => {
  // This will render views/Report.ejs
  res.render('Report');
});

// GET all assets
router.get('/assets', async (req, res) => {
  try {
    const assets = await assetlistModel.find();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assets', error });
  }
});

// GET all repair records
router.get('/repairs', async (req, res) => {
  try {
    const repairs = await repairModel.find();
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching repairs', error });
  }
});

module.exports = router;
