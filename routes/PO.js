const express = require("express");
const router = express.Router();
const PO = require("../models/PO");
const PR = require("../models/PR");
const ITEM = require("../models/ITEM");

const ExcelJS = require('exceljs');
const path = require('path');

// GET form to create new PO (optionally linked to PR)
router.get("/frompr", async (req, res) => {
  try {
    const prId = req.query.prId;
    let pr = null;
    let po = {};

    if (prId) {
      pr = await PR.findById(prId).lean();
      if (!pr) return res.status(404).send("PR not found");

      // Fields to copy from PR to PO (exclude date)
      const commonFields = [
        'name', 'dept', 'supplier', 'supplierdetail',
        'term', 'discount', 'item'
      ];

      for (const field of commonFields) {
        po[field] = pr[field];
      }
    }

    res.render("POfromPR", { po, pr, errors: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading PO form");
  }
});

// POST to create PO from PR
router.post("/frompr", async (req, res) => {
  try {
    const poData = req.body;

    if (poData.prId) {
      poData.pr = poData.prId;

      // Fetch PR to fill missing fields from PR data
      const pr = await PR.findById(poData.prId).lean();
      if (!pr) {
        return res.status(404).send("PR not found");
      }

      // Copy fields from PR if missing in poData
      poData.name = poData.name || pr.name;
      poData.dept = poData.dept || pr.dept;
      poData.supplier = poData.supplier || pr.supplier;
      poData.supplierdetail = poData.supplierdetail || pr.supplierdetail;
      poData.term = poData.term || pr.term;
      poData.discount = poData.discount || pr.discount;
    }

    // Create and save PO
    const po = new PO(poData);
    await po.save();

    // Update PR items to link to PO
    if (poData.prId) {
      const prWithItems = await PR.findById(poData.prId).populate("item");

      if (prWithItems && prWithItems.item && prWithItems.item.length > 0) {
        // Update each item's 'po' field
        await Promise.all(
          prWithItems.item.map(item =>
            ITEM.findByIdAndUpdate(item._id, { po: po._id })
          )
        );

        // Save item IDs in PO's item array
        po.item = prWithItems.item.map(item => item._id);
        await po.save();
      }
    }

    res.redirect(`/po/${po._id}`);
  } catch (err) {
    console.error(err);
    res.render("POfromPR", {
      po: req.body,
      pr: null,
      errors: err.errors || err,
    });
  }
});


// GET PO list
router.get("/list", async (req, res) => {
  try {
    const poList = await PO.find()
      .sort({ POno: -1 })
      .populate("pr")
      .lean();

    res.render("polist", { poList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// GET PO detail page with only necessary use of PR
router.get("/:poId", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId)
      .populate("item") // Use PO's own items
      .populate("pr", "PRno") // Only fetch PRno from PR
      .lean();

    if (!po) return res.status(404).send("PO not found");

    // Calculate item price
    const allItems = (po.item || []).map(item => {
      const quantity = parseFloat(item.quantity || 0);
      const ppu = parseFloat(item.ppu || 0);
      item.price = (quantity * ppu).toFixed(2);
      return item;
    });

    const totalPrice = allItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const discount = parseFloat(po.discount || 0);
    const subtotal = +(totalPrice - discount).toFixed(2);
    const vat = +(subtotal * 0.07).toFixed(2);
    const net = +(subtotal + vat).toFixed(2);

    res.render("podetail", {
      po,
      totalPrice: totalPrice.toFixed(2),
      subtotal: subtotal.toFixed(2),
      vat: vat.toFixed(2),
      net: net.toFixed(2),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET export PO to Excel using only PR for PRno if needed
router.get('/export/:id', async (req, res) => {
  try {
    const po = await PO.findById(req.params.id)
      .populate("item") // Use items from PO
      .populate("pr", "PRno dept"); // Only load PRno and dept

    if (!po) {
      return res.status(404).send('PO not found');
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, '../public/templates/PO_Form.xlsx'));
    const worksheet = workbook.getWorksheet('Sheet1');

    worksheet.getCell('G4').value = `เลขประจำตัวผู้เสียภาษี : ${po.Taxpayerno}`;
    worksheet.getCell('B5').value = `   VENDOR : ${po.supplier}`;
    worksheet.getCell('C6').value = po.supplierdetail;
    worksheet.getCell('G6').value = `${po.dept}-${po.POno}`;
    worksheet.getCell('G7').value = po.date;
    worksheet.getCell('C8').value = po.Texid;
    worksheet.getCell('C9').value = ` : Tel. ${po.Tel}  Fax. ${po.fax} (AUTO) Mobile. ${po.mobile}`;
    worksheet.getCell('B10').value = `  ATTENTION  : ${po.attention}`;
    worksheet.getCell('C12').value = po.Paymentterm;
    worksheet.getCell('D12').value = po.name;
    worksheet.getCell('F12').value = po.deliverydate;
    worksheet.getCell('H12').value = `${po.pr?.PRno || ''}-${po.dept}-MOT`;
    worksheet.getCell('C34').value = `เครดิต ${po.term}`;
    worksheet.getCell('H34').value = Number(po.discount || 0);
    worksheet.getCell('H34').numFmt = '#,##0.00';
    worksheet.getCell('C35').value = `เลขที่ใบเสนอราคา : ${po.quotation}`;
    worksheet.getCell('B40').value = `(${po.purchasing})`;
    worksheet.getCell('E40').value = `                            (${po.approval})`;

    // Fill items from PO
    const startRow = 16;
    po.item.forEach((item, i) => {
      const row = worksheet.getRow(startRow + i);
      row.getCell(2).value = i + 1;
      row.getCell(3).value = item.sn ? `${item.description} - ${item.sn}` : item.description;
      row.getCell(5).value = item.unit;
      row.getCell(6).value = item.quantity;
      row.getCell(7).value = Number(item.ppu);
      row.getCell(7).numFmt = '#,##0.00';
      row.commit();
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=PO_${po.POno || po._id}-${po.dept}-MOT.xlsx`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to export PO');
  }
});


module.exports = router;
