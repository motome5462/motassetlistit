const express = require('express');
const router = express.Router();
const PRITEM = require('../models/pritem');
const PR = require('../models/PR');

// Show PRITEM form with PR ID
router.get('/new', (req, res) => {
  const prid = req.query.prid || "";
  res.render('pritem', { prid });
});

// Handle PRITEM submission and link to PR
router.post('/new', async (req, res) => {
  try {
    const stock = req.body.stock;

    const item = new PRITEM({
      quantity: req.body.quantity,
      unit: req.body.unit,
      sn: req.body.sn,
      description: req.body.description,
      instock: stock === "In Stock" ? "/" : "",
      outstock: stock === "Out Stock" ? "/" : "",
      price: req.body.price,
      ppu: req.body.ppu,
      remark: req.body.remark,
      total: req.body.total,
      PRNO: req.body.PRNO
    });

    await item.save();

    // Push this PRITEM into the PR's PRITEM array
    await PR.findByIdAndUpdate(req.body.PRNO, {
      $push: { PRITEM: item._id }
    });

    res.redirect(`/pritem/new?prid=${req.body.PRNO}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving PRITEM.");
  }
});

router.get('/edit/:id', async (req, res) => {
  const item = await PRITEM.findById(req.params.id);
  res.render('editPritem', { item });
});

router.post('/edit/:id', async (req, res) => {
  await PRITEM.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/pr/all');
});

router.post('/delete/:id', async (req, res) => {
  const item = await PRITEM.findById(req.params.id);
  await PR.findByIdAndUpdate(item.PRNO, { $pull: { PRITEM: item._id } });
  await item.deleteOne();
  res.redirect('/pr/all');
});


module.exports = router;
