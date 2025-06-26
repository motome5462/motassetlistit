const express = require("express");
const router = express.Router();
const PO = require("../models/PO");
const PR = require("../models/PR");
const PRITEM = require("../models/PRITEM");

// GET form to create new PO (optionally linked to PR)
router.get("/new", async (req, res) => {
  try {
    const prId = req.query.prId;
    let pr = null;

    if (prId) {
      pr = await PR.findById(prId);
      if (!pr) return res.status(404).send("PR not found");
    }

    res.render("po", { po: {}, pr, errors: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading PO form");
  }
});

// POST create new PO
router.post("/new", async (req, res) => {
  try {
    const poData = req.body;

    // Link PR if prId included
    if (poData.prId) {
      poData.pr = [poData.prId];
    }

    const po = new PO(poData);
    await po.save();

    res.redirect(`/po/${po._id}`); // Redirect to PO detail view
  } catch (err) {
    console.error(err);
    res.render("po", { po: req.body, pr: null, errors: err.errors || err });
  }
});

// GET PO list
router.get("/list", async (req, res) => {
  try {
    const poList = await PO.find()
  .sort({ POno: -1 })
  .populate("pr")      // <-- populate single PR ref
  .lean();

    res.render("polist", { poList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// GET PO detail page with nested PR and PRITEMs
router.get("/:poId", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId)
      .populate({
        path: "pr",
        populate: {
          path: "pritem",
          model: "PRITEM",
        },
      })
      .lean();

    if (!po) return res.status(404).send("PO not found");

    let allItems = [];

    if (po.pr) {
      po.pr.pritem = po.pr.pritem.map(item => {
        const quantity = parseFloat(item.quantity || 0);
        const ppu = parseFloat(item.ppu || 0);
        item.price = quantity !== 0 ? (quantity * ppu).toFixed(2) : "0.00";
        return item;
      });
      allItems = po.pr.pritem;
    }

    // Calculate total, VAT, and net
    const totalPrice = allItems.reduce((sum, item) => {
      return sum + parseFloat(item.price || 0);
    }, 0);

    const vat = +(totalPrice * 0.07).toFixed(2);
    const net = +(totalPrice + vat).toFixed(2); // Add discount if needed

    res.render("podetail", {
      po,
      totalPrice: totalPrice.toFixed(2),
      vat: vat.toFixed(2),
      net: net.toFixed(2),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});



module.exports = router;
