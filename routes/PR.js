const express = require("express");
const router = express.Router();

const PR = require("../models/PR");
const PO = require("../models/PO");
const ITEM = require("../models/ITEM");
const ExcelJS = require("exceljs");
const path = require("path");


// Redirect /pr to /pr/list
router.get("/", (req, res) => {
  res.redirect("/pr/list");
});

// GET form to create new PR
router.get("/new", (req, res) => {
  res.render("createPR", { pr: {}, errors: null });
});

// POST new PR
router.post("/new", async (req, res) => {
  try {
    const pr = new PR(req.body);
    await pr.save();
    res.redirect(`/pr/${pr._id}/pritem`);
  } catch (err) {
    console.error(err);
    res.render("createPR", { pr: req.body, errors: err.errors || err });
  }
});

// GET form to add ITEM(s) to a PR
router.get("/:prId/pritem", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");
    res.render("pritem", { pr, item: {}, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST add ITEM to a PR (also add to linked PO if exists)
router.post("/:prId/pritem", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");

    const itemData = {
      ...req.body,
      pr: pr._id,
      po: pr.po, // link item to the PO as well
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : "",
    };

    const item = new ITEM(itemData);
    await item.save();

    pr.item.push(item._id);
    await pr.save();

    // Also add item to PO's item array if PO linked
    if (pr.po) {
      await PO.findByIdAndUpdate(pr.po, { $push: { item: item._id } });
    }

    res.redirect(`/pr/${pr._id}/pritem`);
  } catch (err) {
    console.error(err);
    const pr = await PR.findById(req.params.prId);
    res.render("pritem", { pr, item: req.body, errors: err.errors || err });
  }
});

// GET form to edit PR
router.get("/:prId/edit", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");
    res.render("createPR", { pr, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST update PR (also update linked PO fields)
router.post("/:prId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      manual_PRno: req.body.manual_PRno ? Number(req.body.manual_PRno) : undefined,
      date: req.body.date ? new Date(req.body.date) : undefined,
      discount: req.body.discount ? Number(req.body.discount) : 0,
    };

    const updatedPR = await PR.findByIdAndUpdate(req.params.prId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPR) return res.status(404).send("PR not found");

    // Sync fields to linked PO
    if (updatedPR.po) {
      await PO.findByIdAndUpdate(updatedPR.po, {
        name: updatedPR.name,
        dept: updatedPR.dept,
        supplier: updatedPR.supplier,
        supplierdetail: updatedPR.supplierdetail,
        term: updatedPR.term,
        discount: updatedPR.discount,
      });
    }

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    console.error(err);
    const pr = await PR.findById(req.params.prId);
    res.render("createPR", { pr: { ...req.body, _id: req.params.prId }, errors: err.errors || err });
  }
});

// POST delete PR, clean up references, and delete orphaned items
router.post("/:prId/delete", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");

    // 1. For each item linked to this PR
    for (const itemId of pr.item) {
      const item = await ITEM.findById(itemId);

      if (item) {
        if (!item.po) {
          // Delete item if no PO reference (orphaned)
          await ITEM.findByIdAndDelete(item._id);
        } else {
          // Keep item but remove PR reference
          await ITEM.findByIdAndUpdate(item._id, { $unset: { pr: "" } });
        }
      }
    }

    // 2. Remove PR reference from linked PO (without removing items!)
    if (pr.po) {
      await PO.findByIdAndUpdate(pr.po, {
        $unset: { pr: "" }, // keep items in PO.item intact
      });
    }

    // 3. Delete the PR itself
    await PR.findByIdAndDelete(pr._id);

    res.redirect("/pr/list");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// GET form to edit ITEM
router.get("/:prId/pritem/:itemId/edit", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    const item = await ITEM.findById(req.params.itemId);
    if (!pr || !item) return res.status(404).send("PR or Item not found");
    res.render("pritemedit", { pr, item, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// POST update ITEM
router.post("/:prId/pritem/:itemId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : "",
    };

    await ITEM.findByIdAndUpdate(req.params.itemId, updateData, {
      runValidators: true,
    });

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    const pr = await PR.findById(req.params.prId);
    const item = { ...req.body, _id: req.params.itemId };
    res.render("pritemedit", { pr, item, errors: err.errors || err });
  }
});

// POST delete ITEM (also remove from PO's item list)
router.post("/:prId/pritem/:itemId/delete", async (req, res) => {
  try {
    const item = await ITEM.findById(req.params.itemId);
    if (!item) return res.status(404).send("Item not found");

    await ITEM.findByIdAndDelete(req.params.itemId);

    await PR.findByIdAndUpdate(req.params.prId, {
      $pull: { item: req.params.itemId },
    });

    if (item.po) {
      await PO.findByIdAndUpdate(item.po, {
        $pull: { item: req.params.itemId },
      });
    }

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET PR list
router.get("/list", async (req, res) => {
  try {
    const prList = await PR.find().sort({ PRno: -1 }).exec();
    res.render("prlist", { prList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// GET PR detail with populated items and totals
router.get("/:prId", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId).populate("item").lean();
    if (!pr) return res.status(404).send("PR not found");

    pr.item = pr.item.map(i => {
      const quantity = parseFloat(i.quantity || 0);
      const ppu = parseFloat(i.ppu || 0);
      i.price = (quantity * ppu).toFixed(2);
      return i;
    });

    const totalPrice = pr.item.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);
    const discount = parseFloat(pr.discount || 0);
    const vat = +((totalPrice-discount) * 0.07).toFixed(2);
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

// GET export PR to Excel (unchanged)
router.get("/export/:id", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.id).populate("item");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, "../public/templates/PR_Form.xlsx"));
    const worksheet = workbook.getWorksheet("1");

    worksheet.getCell("D7").value = pr.name;
    worksheet.getCell("D8").value = pr.note;
    worksheet.getCell("I7").value = pr.customer;
    worksheet.getCell("M7").value = pr.date ? new Date(pr.date) : "";
    worksheet.getCell("M8").value = `${pr.PRno || pr._id}-${pr.dept}-MOT`;
    worksheet.getCell("D33").value = pr.supplier;
    worksheet.getCell("D34").value = pr.supplierdetail;
    worksheet.getCell("J34").value = Number(pr.discount);
    worksheet.getCell("J34").numFmt = "#,##0.00";
    worksheet.getCell("M33").value = pr.term;
    worksheet.getCell("M34").value = pr.delivery;
    worksheet.getCell("L35").value = pr.validity;
    worksheet.getCell("L36").value = pr.transport;
    worksheet.getCell("M37").value = pr.ref;

    const startRow = 11;
    pr.item.forEach((item, i) => {
      const row = worksheet.getRow(startRow + i);
      row.getCell(2).value = i + 1;
      row.getCell(3).value = item.quantity;
      row.getCell(4).value = item.unit;
      row.getCell(5).value = item.sn;
      row.getCell(6).value = item.sn ? `${item.description} - ${item.sn}` : item.description;
      row.getCell(8).value = item.instock;
      row.getCell(9).value = item.outstock;
      row.getCell(11).value = Number(item.ppu);
      row.getCell(11).numFmt = "#,##0.00";
      row.getCell(12).value = item.remark;
      row.commit();
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=PR_${pr.PRno || pr._id}-${pr.dept}-MOT.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export PR");
  }
});

module.exports = router;
