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

// GET getalldetail of all POs with populated PRs and PRITEMs
router.get("/getalldetail", async (req, res) => {
  try {
    const poList = await PO.find()
      .sort({ POno: -1 })
      .populate({
        path: "pr",
        populate: {
          path: "pritem",
          model: "PRITEM",
        },
      })
      .lean();

    res.render("podetail", { poList });  // pass poList for the list page
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load PO list");
  }
});

// GET PO detail by ID, populate linked PRs and PRITEMs
router.get("/:id", async (req, res) => {
  try {
    const po = await PO.findById(req.params.id)
      .populate({
        path: "pr",
        populate: {
          path: "pritem",
          model: "PRITEM",
        },
      })
      .lean();

    if (!po) return res.status(404).send("PO not found");

    res.render("podetail", { po });  // pass po for single PO detail page
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load PO detail");
  }
});

module.exports = router;
