const express = require("express");
const router = express.Router();

const PO = require("../models/PO");
const PR = require("../models/PR");
const ITEM = require("../models/ITEM");
const ExcelJS = require("exceljs");
const path = require("path");

// === CREATE PO from PR ===
router.get("/frompr", async (req, res) => {
  try {
    const prId = req.query.prId;
    let pr = null;
    let po = {};

    if (prId) {
      pr = await PR.findById(prId).lean();
      if (!pr) return res.status(404).send("PR not found");

      const fields = [
        "name", "dept", "supplier", "supplierdetail", "term", "discount", "item"
      ];
      for (const f of fields) po[f] = pr[f];
    }

    res.render("POfromPR", { po, pr, errors: null });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading PO form");
  }
});

router.post("/frompr", async (req, res) => {
  try {
    const poData = req.body;

    if (poData.prId) {
      poData.pr = poData.prId;
      const pr = await PR.findById(poData.prId).lean();
      if (!pr) return res.status(404).send("PR not found");

      poData.name = poData.name || pr.name;
      poData.dept = poData.dept || pr.dept;
      poData.supplier = poData.supplier || pr.supplier;
      poData.supplierdetail = poData.supplierdetail || pr.supplierdetail;
      poData.term = poData.term || pr.term;
      poData.discount = poData.discount || pr.discount;
    }

    const po = new PO(poData);
    await po.save();

    // Link PR items to PO
    if (poData.prId) {
      const prWithItems = await PR.findById(poData.prId).populate("item");
      if (prWithItems?.item?.length > 0) {
        await Promise.all(
          prWithItems.item.map(item =>
            ITEM.findByIdAndUpdate(item._id, { po: po._id })
          )
        );
        po.item = prWithItems.item.map(i => i._id);
        await po.save();
      }
      await PR.findByIdAndUpdate(poData.prId, { po: po._id });
    }

    res.redirect(`/po/${po._id}`);
  } catch (err) {
    console.error(err);
    res.render("POfromPR", {
      po: req.body,
      pr: null,
      errors: err.errors || err
    });
  }
});

// === PO LIST ===
router.get("/list", async (req, res) => {
  try {
    const poList = await PO.find()
      .sort({ POno: -1 })
      .populate("item")
      .populate("pr", "PRno dept") // <-- populate PRno and dept for pr
      .lean();

    // Calculate totalPrice for each PO (like podetail)
    const poListWithTotal = poList.map(po => {
      const allItems = (po.item || []).map(item => {
        const quantity = parseFloat(item.quantity || 0);
        const ppu = parseFloat(item.ppu || 0);
        return {
          ...item,
          price: (quantity * ppu).toFixed(2)
        };
      });
      const totalPrice = allItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
      return {
        ...po,
        totalPrice: totalPrice.toFixed(2)
      };
    });

    res.render("polist", { poList: poListWithTotal });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// === CREATE PO ===
router.get("/new", (req, res) => {
  res.render("createPO", { po: {}, errors: null });
});

router.post("/new", async (req, res) => {
  try {
    const po = new PO(req.body);
    await po.save();
    res.redirect(`/po/${po._id}/poitem`);
  } catch (err) {
    console.error(err);
    res.render("createPO", { po: req.body, errors: err.errors });
  }
});

// === EDIT PO ===
router.get("/:poId/edit", async (req, res) => {
  const po = await PO.findById(req.params.poId).lean();
  if (!po) return res.status(404).send("PO not found");
  res.render("createPO", { po, errors: null });
});

router.post("/:poId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      manual_POno: req.body.manual_POno ? Number(req.body.manual_POno) : undefined,
      date: req.body.date ? new Date(req.body.date) : undefined,
      discount: req.body.discount ? Number(req.body.discount) : 0,
    };

    const updated = await PO.findByIdAndUpdate(req.params.poId, updateData, { new: true });

    if (updated.pr) {
      await PR.findByIdAndUpdate(updated.pr, {
        name: updated.name,
        dept: updated.dept,
        supplier: updated.supplier,
        supplierdetail: updated.supplierdetail,
        term: updated.term,
        discount: updated.discount,
      });
    }

    res.redirect(`/po/${req.params.poId}`);
  } catch (err) {
    console.error(err);
    const po = await PO.findById(req.params.poId).lean();
    res.render("createPO", { po: { ...req.body, _id: req.params.poId }, errors: err.errors || err });
  }
});

// === DELETE PO ===
router.post("/:poId/delete", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId);

    if (po) {
      for (const itemId of po.item) {
        const item = await ITEM.findById(itemId);
        if (item) {
          if (!item.pr) {
            await ITEM.findByIdAndDelete(item._id);
          } else {
            await ITEM.findByIdAndUpdate(item._id, { $unset: { po: "" } });
          }
        }
      }

      if (po.pr) {
        await PR.findByIdAndUpdate(po.pr, { $unset: { po: "" } });
      }

      await PO.findByIdAndDelete(po._id);
    }

    res.redirect("/po/list");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


// === ADD ITEM TO PO ===
router.get("/:poId/poitem", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId);
    if (!po) return res.status(404).send("PO not found");
    res.render("poitem", { po, item: {}, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/:poId/poitem", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId);
    if (!po) return res.status(404).send("PO not found");

    const itemData = {
      ...req.body,
      po: po._id,
      pr: po.pr,
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : "",
    };

    const item = new ITEM(itemData);
    await item.save();

    po.item.push(item._id);
    await po.save();

    if (po.pr) {
      await PR.findByIdAndUpdate(po.pr, { $push: { item: item._id } });
    }

    res.redirect(`/po/${po._id}/poitem`);
  } catch (err) {
    console.error(err);
    const po = await PO.findById(req.params.poId);
    res.render("poitem", { po, item: req.body, errors: err.errors || err });
  }
});

// === EDIT PO ITEM ===
router.get("/:poId/poitem/:itemId/edit", async (req, res) => {
  try {
    const po = await PO.findById(req.params.poId);
    const item = await ITEM.findById(req.params.itemId);
    if (!po || !item) return res.status(404).send("PO or Item not found");
    res.render("poitemedit", { po, item, errors: null });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/:poId/poitem/:itemId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : "",
    };

    await ITEM.findByIdAndUpdate(req.params.itemId, updateData, { runValidators: true });

    res.redirect(`/po/${req.params.poId}`);
  } catch (err) {
    const po = await PO.findById(req.params.poId);
    const item = { ...req.body, _id: req.params.itemId };
    res.render("poitemedit", { po, item, errors: err.errors || err });
  }
});

// === DELETE PO ITEM ===
router.post("/:poId/poitem/:itemId/delete", async (req, res) => {
  try {
    const item = await ITEM.findById(req.params.itemId);
    if (!item) return res.status(404).send("Item not found");

    // Remove item reference from PO
    if (item.po) {
      await PO.findByIdAndUpdate(item.po, { $pull: { item: item._id } });
    }

    // Remove item reference from PR (if linked)
    if (item.pr) {
      await PR.findByIdAndUpdate(item.pr, { $pull: { item: item._id } });
    }

    // Delete the item
    await ITEM.findByIdAndDelete(item._id);

    res.redirect(`/po/${req.params.poId}`);
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send(err.message);
  }
});

// === PO DETAIL PAGE ===
router.get("/:poId", async (req, res, next) => {
  // Prevent accidental match for /exportall or /export/:id
  if (req.params.poId === "exportall") return next();
  if (req.params.poId === "export") return next();
  try {
    const po = await PO.findById(req.params.poId)
      .populate("item")
      .populate("pr", "PRno")
      .lean();

    if (!po) return res.status(404).send("PO not found");

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

// === EXPORT TO EXCEL ===
router.get("/export/:id", async (req, res) => {
  try {
    const po = await PO.findById(req.params.id)
      .populate("item")
      .populate("pr", "PRno dept");

    if (!po) return res.status(404).send("PO not found");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, "../public/templates/PO_Form.xlsx"));
    const worksheet = workbook.getWorksheet("Sheet1");

    worksheet.getCell("G4").value = `เลขประจำตัวผู้เสียภาษี : ${po.Taxpayerno}`;
    worksheet.getCell("B5").value = `   VENDOR : ${po.supplier}`;
    worksheet.getCell("C6").value = po.supplierdetail;
    worksheet.getCell("G6").value = `${po.dept}-${po.POno}`;
    worksheet.getCell("G7").value = po.date;
    worksheet.getCell("C8").value = `: ${po.Texid}`;
    worksheet.getCell("C9").value = ` : Tel. ${po.Tel}  Fax. ${po.fax} (AUTO) Mobile. ${po.mobile}`;
    worksheet.getCell("B10").value = `ATTENTION : ${po.attention}`;
    worksheet.getCell("D10").value = `Email:${po.email}`;
    worksheet.getCell("C12").value = po.Paymentterm;
    worksheet.getCell("D12").value = po.name;
    worksheet.getCell("F12").value = po.deliverydate;
    worksheet.getCell("H12").value = `${po.pr?.PRno || ""}-${po.dept}-MOT`;
    worksheet.getCell("C34").value = `เครดิต ${po.term}`;
    worksheet.getCell("H34").value = Number(po.discount || 0);
    worksheet.getCell("H34").numFmt = "#,##0.00";
    worksheet.getCell("C35").value = `เลขที่ใบเสนอราคา : ${po.quotation}`;
    worksheet.getCell("B40").value = `(${po.purchasing})`;
    worksheet.getCell("E40").value = `                            (${po.approval})`;

    const startRow = 16;
    po.item.forEach((item, i) => {
      const row = worksheet.getRow(startRow + i);
      row.getCell(2).value = i + 1;
      row.getCell(3).value = item.sn ? `${item.description} - ${item.sn}` : item.description;
      row.getCell(5).value = item.unit;
      row.getCell(6).value = item.quantity;
      row.getCell(7).value = Number(item.ppu);
      row.getCell(7).numFmt = "#,##0.00";
      row.commit();
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${po.dept}-${po.POno || po._id}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export PO");
  }
});

// === EXPORT ALL PO LIST TO EXCEL ===
router.get("/exportall", async (req, res) => {
  try {
    const poList = await PO.find()
      .populate("item")
      .populate("pr", "PRno dept")
      .sort({ POno: -1 })
      .lean();

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PO List");

    // Set column headers and widths
    sheet.columns = [
      { header: "PO No.", width: 15 },
      { header: "Supplier", width: 20 },
      { header: "Quotation", width: 18 },
      { header: "Date", width: 12 },
      { header: "PR", width: 18 },
      { header: "Project Name", width: 20 },
      { header: "Payment Term", width: 15 },
      { header: "Delivery Date", width: 15 },
      { header: "Discount", width: 10 },
      { header: "Item No.", width: 8 },
      { header: "Description", width: 30 },
      { header: "Unit", width: 10 },
      { header: "Quantity", width: 10 },
      { header: "Unit Price", width: 12 },
      { header: "Amount", width: 12 },
      { header: "Total", width: 15 }
    ];

    poList.forEach(po => {
      // Calculate totals as in detail
      const allItems = (po.item || []).map(item => {
        const quantity = parseFloat(item.quantity || 0);
        const ppu = parseFloat(item.ppu || 0);
        return {
          ...item,
          price: (quantity * ppu).toFixed(2)
        };
      });
      const totalPrice = allItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
      const discount = parseFloat(po.discount || 0);

      // PR link format (same as podetail)
      const prLink = po.pr && po.pr.PRno ? `${po.pr.PRno}-${po.dept || ""}-MOT` : "-";

      // If no items, still output one row for the PO
      if (!allItems.length) {
        sheet.addRow([
          (po.dept || "") + (po.POno || "-"),
          po.supplier || "",
          po.quotation || "",
          po.date ? new Date(po.date).toISOString().substr(0, 10) : "",
          prLink,
          po.name || "",
          po.Paymentterm || "",
          po.deliverydate ? new Date(po.deliverydate).toISOString().substr(0, 10) : "",
          discount.toFixed(2),
          "", "", "", "", "", "",
          totalPrice.toFixed(2)
        ]);
      } else {
        allItems.forEach((item, idx) => {
          sheet.addRow([
            idx === 0 ? (po.dept || "") + (po.POno || "-") : "",
            idx === 0 ? (po.supplier || "") : "",
            idx === 0 ? (po.quotation || "") : "",
            idx === 0 ? (po.date ? new Date(po.date).toISOString().substr(0, 10) : "") : "",
            idx === 0 ? prLink : "",
            idx === 0 ? (po.name || "") : "",
            idx === 0 ? (po.Paymentterm || "") : "",
            idx === 0 ? (po.deliverydate ? new Date(po.deliverydate).toISOString().substr(0, 10) : "") : "",
            idx === 0 ? discount.toFixed(2) : "",
            idx + 1,
            item.description || "",
            item.unit || "",
            item.quantity || "",
            item.ppu || "",
            item.price || "",
            idx === 0 ? totalPrice.toFixed(2) : ""
          ]);
        });
      }

      // Add a blank row after each PO
      sheet.addRow([]);
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=PO_List.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export PO list");
  }
});

module.exports = router;
