const express = require("express");
const router = express.Router();
const PO = require("../models/PO");
const PR = require("../models/PR");
const PRITEM = require("../models/PRITEM");

const ExcelJS = require('exceljs');
const path = require('path');

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

router.get('/export/:id', async (req, res) => {
  try {
    const po = await PO.findById(req.params.id)
      .populate({
        path: 'pr',
        populate: { path: 'pritem' }
      });

    if (!po || !po.pr) {
      return res.status(404).send('PO or linked PR not found');
    }

    const pr = po.pr;

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '../public/templates/PO_Form.xlsx'));
    const worksheet = workbook.getWorksheet('Sheet1');

    // --- Fill PO-related data ---
    worksheet.getCell('G4').value = `เลขประจำตัวผู้เสียภาษี : ${po.Taxpayerno}`;
    worksheet.getCell('B5').value = `   VENDOR : ${pr.supplier}`;
    worksheet.getCell('C6').value = pr.supplierdetail;
    worksheet.getCell('G6').value = `${pr.dept}-${po.POno}`;
    worksheet.getCell('G7').value = po.date;
    worksheet.getCell('C8').value = po.Texid;
    worksheet.getCell('C9').value = ` : Tel. ${po.Tel}  Fax. ${po.fax} (AUTO) Mobile. ${po.mobile}`;
    worksheet.getCell('B10').value = `  ATTENTION  : ${po.attention}`;
    worksheet.getCell('C12').value = po.Paymentterm;
    worksheet.getCell('D12').value = pr.name;
    worksheet.getCell('F12').value = po.deliverydate;
    worksheet.getCell('H12').value = `${pr.PRno}-${pr.dept}-MOT`;
    worksheet.getCell('C34').value = `เครดิต ${pr.term}`;
    worksheet.getCell('H34').value = Number(pr.discount);
    worksheet.getCell('H34').numFmt = '#,##0.00'; // Set format to include commas and 2 decimals
    worksheet.getCell('C35').value = `เลขที่ใบเสนอราคา : ${po.quotation}`;
    worksheet.getCell('B40').value = `(${po.purchasing})`;
    worksheet.getCell('E40').value = `                            (${po.approval})`;
    // --- PRITEMS loop ---
    const startRow = 16;
    pr.pritem.forEach((item, i) => {
      const row = worksheet.getRow(startRow + i);
      row.getCell(2).value = i + 1;
      row.getCell(3).value = item.description;
      row.getCell(5).value = item.unit;
      row.getCell(6).value = item.quantity;
      row.getCell(7).value = Number(item.ppu);
      row.getCell(7).numFmt = '#,##0.00';
      row.commit();
    });

    // --- Send file to browser ---
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=PO_${po.POno || po._id}-${pr.dept}-MOT.xlsx`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to export PO');
  }
});

module.exports = router;
