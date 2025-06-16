const express = require("express");
const router = express.Router();
const PR = require("../models/PR");

// Show PR form
router.get("/new", (req, res) => {
  res.render("PR");
});

// Submit PR and redirect to PRITEM form
router.post("/new", async (req, res) => {
  try {
    const pr = new PR(req.body);
    await pr.save();
    res.redirect(`/pritem/new?prid=${pr._id}`); // Pass PR ID to PRITEM form
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving PR.");
  }
});

// View all PRs
router.get("/all", async (req, res) => {
  try {
    const prs = await PR.find().populate("PRITEM");
    res.render("PRdetail", { prs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving PRs.");
  }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
  const pr = await PR.findById(req.params.id);
  res.render('PR_edit', { pr });
});

// Handle form submission
router.post('/edit/:id', async (req, res) => {
  try {
    await PR.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/pr/all');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating PR.");
  }
});

// Delete PR
router.post('/delete/:id', async (req, res) => {
  try {
    await PR.findByIdAndDelete(req.params.id);
    res.redirect('/pr/all');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting PR.");
  }
});


module.exports = router;
