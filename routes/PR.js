const express = require("express");
const router = express.Router();

const PR = require("../models/PR");
const PRITEM = require("../models/PRITEM");

// Redirect /pr to /pr/list
router.get("/", (req, res) => {
  res.redirect("/pr/list");
});

// GET form to create new PR
router.get("/new", (req, res) => {
  res.render("pr", { pr: {}, errors: null });
});

// POST new PR
router.post("/new", async (req, res) => {
  try {
    const prData = req.body;
    const pr = new PR(prData);
    await pr.save();
    res.redirect(`/pr/${pr._id}/pritem`); // After PR created, go to add items
  } catch (err) {
    console.error(err);
    res.render("pr", { pr: req.body, errors: err.errors || err });
  }
});

// GET form to add PRITEM(s) to a PR
router.get("/:prId/pritem", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");
    res.render("pritem", { pr, pritem: {}, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST add PRITEM to a PR
router.post("/:prId/pritem", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");

    const pritemData = req.body;
    pritemData.PRNO = pr._id; // Link PRITEM to PR

    pritemData.instock = req.body.stockLocation === 'instock' ? '/' : '';
    pritemData.outstock = req.body.stockLocation === 'outstock' ? '/' : '';
    
    const pritem = new PRITEM(pritemData);
    await pritem.save();

    // Add PRITEM ref to PR document
    pr.pritem.push(pritem._id);
    await pr.save();

    res.redirect(`/pr/${pr._id}/pritem`); // Stay on add PRITEM form for more items
  } catch (err) {
    console.error(err);
    const pr = await PR.findById(req.params.prId);
    res.render("pritem", { pr, pritem: req.body, errors: err.errors || err });
  }
});

// GET form to edit a PR
router.get("/:prId/edit", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");
    res.render("pr", { pr, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST update a PR
router.post("/:prId/edit", async (req, res) => {
  try {
    const prId = req.params.prId;
    const updateData = { ...req.body };

    // Convert manual_PRno to Number or undefined
    if (updateData.manual_PRno) {
      const num = Number(updateData.manual_PRno);
      updateData.manual_PRno = isNaN(num) ? undefined : num;
    } else {
      updateData.manual_PRno = undefined;
    }

    // Convert date string to Date object if present
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const updatedPR = await PR.findByIdAndUpdate(prId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPR) return res.status(404).send("PR not found");

    res.redirect(`/pr/${prId}`);
  } catch (err) {
    console.error(err);
    const pr = await PR.findById(req.params.prId);
    res.render("pr", {
      pr: { ...req.body, _id: req.params.prId },
      errors: err.errors || err,
    });
  }
});


// POST delete a PR
router.post("/:prId/delete", async (req, res) => {
  try {
    const pr = await PR.findByIdAndDelete(req.params.prId);
    await PRITEM.deleteMany({ PRNO: pr._id }); // Delete linked PRITEMs too
    res.redirect("/pr/list");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET form to edit PRITEM
router.get("/:prId/pritem/:itemId/edit", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    const pritem = await PRITEM.findById(req.params.itemId);
    if (!pr || !pritem) return res.status(404).send("PR or Item not found");
    res.render("pritemedit", { pr, pritem, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST update PRITEM
router.post("/:prId/pritem/:itemId/edit", async (req, res) => {
  try {
    const updateData = req.body;

    updateData.instock = req.body.stockLocation === 'instock' ? '/' : '';
    updateData.outstock = req.body.stockLocation === 'outstock' ? '/' : '';

    await PRITEM.findByIdAndUpdate(req.params.itemId, updateData, {
      runValidators: true,
    });

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    const pr = await PR.findById(req.params.prId);
    const pritem = { ...req.body, _id: req.params.itemId };
    res.render("pritemedit", { pr, pritem, errors: err.errors || err });
  }
});

// POST delete PRITEM
router.post("/:prId/pritem/:itemId/delete", async (req, res) => {
  try {
    await PRITEM.findByIdAndDelete(req.params.itemId);
    await PR.findByIdAndUpdate(req.params.prId, {
      $pull: { pritem: req.params.itemId }
    });
    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});



// GET list of all PRs
router.get("/list", async (req, res) => {
  try {
    const prList = await PR.find().sort({ PRno: -1 }).exec();
    res.render("prlist", { prList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// GET PR detail page with all PRITEMs
router.get("/:prId", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId).populate("pritem").lean();
    if (!pr) return res.status(404).send("PR not found");

    // Calculate price total
    pr.pritem = pr.pritem.map(item => {
      const quantity = parseFloat(item.quantity || 0);
      const price = parseFloat(item.ppu || 0);
      item.price = quantity !== 0 ? (price * quantity).toFixed(2) : "0.00";
      return item;
    });

    // Calculate total price
    const totalPrice = (pr.pritem || []).reduce((sum, item) => {
      return sum + parseFloat(item.price || 0);
    }, 0);


    // Calculate VAT and Net
    const vat = +(totalPrice * 0.07).toFixed(2);
    const discount = parseFloat(pr.discount || 0);
    const net = +(totalPrice + vat - discount).toFixed(2);

    res.render("prdetail", {
      pr,
      totalPrice: totalPrice.toFixed(2),
      vat: vat.toFixed(2),
      net: net.toFixed(2),
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});



module.exports = router;
