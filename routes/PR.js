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

// === CREATE PR ===
router.get("/new", (req, res) => {
  res.render("createPR", { pr: {}, errors: null });
});

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


// GET /pr/frompo
// Render form to create a PR from a given PO ID with editable item fields
router.get("/frompo", async (req, res) => {
  try {
    const poId = req.query.poId;
    if (!poId) return res.status(400).send("Missing PO ID");

    const po = await PO.findById(poId).populate("item").lean();
    if (!po) return res.status(404).send("PO not found");

    // Render the form, initially no PR data or errors
    res.render("PRfromPO", { po, pr: null, errors: null });
  } catch (err) {
    console.error("GET /pr/frompo error:", err);
    res.status(500).send("Error loading PR from PO form");
  }
});

// POST /pr/frompo
// Create PR from PO and update shared ITEM documents accordingly
router.post("/frompo", async (req, res) => {
  try {
    const poData = req.body;
    const poId = poData.poId;
    if (!poId) return res.status(400).send("Missing PO ID");

    console.log("Received POST data:", poData);

    // Load PO with items as Mongoose documents (not lean) for item updates
    const po = await PO.findById(poId).populate("item");
    if (!po) return res.status(404).send("PO not found");

    // Create new PR copying from PO + override with form data
    const pr = new PR({
      manual_PRno: poData.manual_PRno || undefined,
      date: poData.date || po.date,
      name: poData.name || po.name,
      dept: poData.dept || po.dept,
      note: poData.note || "",
      customer: poData.customer || "",
      supplier: poData.supplier || po.supplier,
      supplierdetail: poData.supplierdetail || po.supplierdetail,
      term: poData.term || po.term,
      delivery: poData.delivery || "",
      validity: poData.validity || "-",
      transport: poData.transport || "-",
      ref: poData.ref || "",
      discount: poData.discount || po.discount,
      po: po._id,
    });

    await pr.save();
    console.log(`Created PR with ID ${pr._id} and PRno ${pr.PRno}`);

    // Normalize remarks array from poData['remark[]']
    const remarks = Array.isArray(poData['remark[]']) ? poData['remark[]'] : [poData['remark[]']];

    // Rebuild stockLocs array from keys like 'stockLocation[0]', 'stockLocation[1]'
    const stockLocs = [];
    for (const key in poData) {
      const match = key.match(/^stockLocation\[(\d+)\]$/);
      if (match) {
        stockLocs[parseInt(match[1], 10)] = poData[key];
      }
    }

    // Update each ITEM in the PO's item array with form values and set pr ref
    for (let i = 0; i < po.item.length; i++) {
      const item = po.item[i];
      if (!item) continue;

      item.remark = remarks[i] || "";

      const loc = stockLocs[i];
      if (loc === "instock") {
        item.instock = "/";
        item.outstock = "";
      } else if (loc === "outstock") {
        item.instock = "";
        item.outstock = "/";
      } else {
        item.instock = "";
        item.outstock = "";
      }

      item.pr = pr._id; // Link item to PR
      await item.save();

      console.log(`Updated ITEM ${item._id}: remark='${item.remark}', instock='${item.instock}', outstock='${item.outstock}'`);
    }

    // Link PR's item array to the same items as PO's
    pr.item = po.item.map((i) => i._id);
    await pr.save();
    console.log(`Linked ${pr.item.length} items to PR ${pr._id}`);

    // Update PO to link to this PR
    await PO.findByIdAndUpdate(po._id, { pr: pr._id });

    // Redirect to the new PR page
    res.redirect(`/pr/${pr._id}`);
  } catch (err) {
    console.error("POST /pr/frompo error:", err);

    // On error, reload PO and render form with previous data and errors
    const po = await PO.findById(req.body.poId).populate("item").lean();

    res.render("PRfromPO", {
      po,
      pr: req.body,
      errors: err.errors || err.message || err,
    });
  }
});


// === ADD ITEM TO PR ===
router.get("/:prId/pritem", async (req, res) => {
  const pr = await PR.findById(req.params.prId);
  if (!pr) return res.status(404).send("PR not found");
  res.render("pritem", { pr, item: {}, errors: null });
});

router.post("/:prId/pritem", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");

    const itemData = {
      ...req.body,
      pr: pr._id,
      po: pr.po,
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : ""
    };

    const item = new ITEM(itemData);
    await item.save();

    pr.item.push(item._id);
    await pr.save();

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

// === EDIT PR ===
router.get("/:prId/edit", async (req, res) => {
  const pr = await PR.findById(req.params.prId);
  if (!pr) return res.status(404).send("PR not found");
  res.render("createPR", { pr, errors: null });
});

router.post("/:prId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      manual_PRno: req.body.manual_PRno ? Number(req.body.manual_PRno) : undefined,
      date: req.body.date ? new Date(req.body.date) : undefined,
      discount: req.body.discount ? Number(req.body.discount) : 0
    };

    const updatedPR = await PR.findByIdAndUpdate(req.params.prId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedPR) return res.status(404).send("PR not found");

    if (updatedPR.po) {
      await PO.findByIdAndUpdate(updatedPR.po, {
        name: updatedPR.name,
        dept: updatedPR.dept,
        supplier: updatedPR.supplier,
        supplierdetail: updatedPR.supplierdetail,
        term: updatedPR.term,
        discount: updatedPR.discount
      });
    }

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    console.error(err);
    const pr = await PR.findById(req.params.prId);
    res.render("createPR", { pr: { ...req.body, _id: req.params.prId }, errors: err.errors || err });
  }
});

// === DELETE PR ===
router.post("/:prId/delete", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.prId);
    if (!pr) return res.status(404).send("PR not found");

    for (const itemId of pr.item) {
      const item = await ITEM.findById(itemId);
      if (item) {
        if (!item.po) {
          await ITEM.findByIdAndDelete(item._id);
        } else {
          await ITEM.findByIdAndUpdate(item._id, { $unset: { pr: "" } });
        }
      }
    }

    if (pr.po) {
      await PO.findByIdAndUpdate(pr.po, { $unset: { pr: "" } });
    }

    await PR.findByIdAndDelete(pr._id);
    res.redirect("/pr/list");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// === EDIT ITEM ===
router.get("/:prId/pritem/:itemId/edit", async (req, res) => {
  const pr = await PR.findById(req.params.prId);
  const item = await ITEM.findById(req.params.itemId);
  if (!pr || !item) return res.status(404).send("PR or Item not found");
  res.render("pritemedit", { pr, item, errors: null });
});

router.post("/:prId/pritem/:itemId/edit", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      instock: req.body.stockLocation === "instock" ? "/" : "",
      outstock: req.body.stockLocation === "outstock" ? "/" : ""
    };

    await ITEM.findByIdAndUpdate(req.params.itemId, updateData, { runValidators: true });

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    const pr = await PR.findById(req.params.prId);
    const item = { ...req.body, _id: req.params.itemId };
    res.render("pritemedit", { pr, item, errors: err.errors || err });
  }
});

// === DELETE ITEM ===
router.post("/:prId/pritem/:itemId/delete", async (req, res) => {
  try {
    const item = await ITEM.findById(req.params.itemId);
    if (!item) return res.status(404).send("Item not found");

    // Remove reference from PR
    if (item.pr) {
      await PR.findByIdAndUpdate(item.pr, { $pull: { item: item._id } });
    }

    // Remove reference from PO (if exists)
    if (item.po) {
      await PO.findByIdAndUpdate(item.po, { $pull: { item: item._id } });
    }

    // Delete the item itself
    await ITEM.findByIdAndDelete(item._id);

    res.redirect(`/pr/${req.params.prId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// === PR LIST ===
router.get("/list", async (req, res) => {
  try {
    const prList = await PR.find().sort({ PRno: -1 }).populate("item").populate("po").lean();

    // Calculate totalPrice for each PR (same as prdetail)
    const prListWithTotal = prList.map(pr => {
      const items = (pr.item || []).map(i => {
        const quantity = parseFloat(i.quantity || 0);
        const ppu = parseFloat(i.ppu || 0);
        return {
          ...i,
          price: (quantity * ppu).toFixed(2)
        };
      });
      const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);
      return {
        ...pr,
        totalPrice: totalPrice.toFixed(2)
      };
    });

    res.render("prlist", { prList: prListWithTotal });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// === PR DETAIL ===
router.get("/:prId", async (req, res, next) => {
  // Prevent accidental match for /exportall or /export/:id
  if (req.params.prId === "exportall") return next();
  if (req.params.prId === "export") return next();
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
    const vat = +((totalPrice - discount) * 0.07).toFixed(2);
    const net = +(totalPrice + vat - discount).toFixed(2);

    res.render("prdetail", {
      pr,
      totalPrice: totalPrice.toFixed(2),
      vat: vat.toFixed(2),
      net: net.toFixed(2)
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// === EXPORT PR TO EXCEL ===
router.get("/export/:id", async (req, res) => {
  try {
    const pr = await PR.findById(req.params.id).populate("item");
    // Load related PO for reference info
    let po = null;
    if (pr.po) {
      po = await PO.findById(pr.po).lean();
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path.join(__dirname, "../public/templates/PR_Form.xlsx"));
    const worksheet = workbook.getWorksheet("1");

    worksheet.getCell("D7").value = pr.name;
    worksheet.getCell("D8").value = pr.note;
    worksheet.getCell("I7").value = pr.customer;
    worksheet.getCell("M7").value = pr.date ? new Date(pr.date) : "";
    worksheet.getCell("M8").value = `${pr.PRno || pr._id}-${pr.dept}-MOT`;
    worksheet.getCell("D29").value = pr.supplier;
    worksheet.getCell("D30").value = pr.supplierdetail;
    worksheet.getCell("J30").value = Number(pr.discount);
    worksheet.getCell("M29").value = pr.term;
    worksheet.getCell("M30").value = pr.delivery;
    worksheet.getCell("L31").value = pr.validity;
    worksheet.getCell("L32").value = pr.transport;
    worksheet.getCell("M33").value = pr.ref;
    worksheet.getCell("I28").value = `/`;
    // Fill items from row 11 to 27 (Excel is 1-based)
    const startRow = 11;
    const endRow = 27;

    // Check if all items have empty instock

    // Find the last row that has a description
    let lastDescRow = startRow - 1;
    for (let i = 0; i < (endRow - startRow + 1); i++) {
      const item = pr.item && pr.item[i] ? pr.item[i] : null;
      if (item && item.description && item.description.trim() !== "") {
        lastDescRow = startRow + i;
      }
    }

    for (let i = 0; i < (endRow - startRow + 1); i++) {
      const row = worksheet.getRow(startRow + i);
      const item = pr.item && pr.item[i] ? pr.item[i] : null;

      // Default quantity and ppu to zero if null/empty/NaN
      const quantity = item && item.quantity && !isNaN(Number(item.quantity)) ? Number(item.quantity) : 0;
      const ppu = item && item.ppu && !isNaN(Number(item.ppu)) ? Number(item.ppu) : 0;

      row.getCell(2).value = item ? i + 1 : ""; // Item No.
      row.getCell(3).value = item ? quantity : 0;
      row.getCell(4).value = item ? item.unit : "";
      row.getCell(5).value = item ? item.sn : "";
      row.getCell(6).value = item
        ? (item.sn ? `${item.description} - ${item.sn}` : item.description)
        : "";

      // Instock/Outstock logic
      // Always print "/" in outstock if both instock and outstock are empty
      if (startRow + i > lastDescRow) {
        // After lastDescRow, always print "/" in outstock
        row.getCell(8).value = "";
        row.getCell(9).value = "/";
      } else if ((!item?.instock || item.instock === "") && (!item?.outstock || item.outstock === "")) {
        row.getCell(8).value = "";
        row.getCell(9).value = "/";
      } else {
        row.getCell(8).value = item?.instock || "";
        row.getCell(9).value = item?.outstock || "";
      }

      row.getCell(11).value = item ? ppu : 0;
      row.getCell(12).value = item ? item.remark : "";

      row.commit();
    }

    // Reference row: 4 rows after the last row with description, but not after row 32
    let refRowNum = lastDescRow + 5;
    if (refRowNum > endRow+1) refRowNum = endRow+1;
    const refRow = worksheet.getRow(refRowNum);
    if (po) {
      refRow.getCell(6).value = `อ้างอิงใบเสนอราคา ${po.quotation || ""} / PO No: ${po.dept || ""}-${po.POno || ""}`;
    }
    refRow.commit();

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=PR${pr.PRno || pr._id}-${pr.dept}-MOT.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export PR");
  }
});

// === EXPORT ALL PR LIST TO EXCEL ===
router.get("/exportall", async (req, res) => {
  try {
    const prList = await PR.find()
      .populate("item")
      .populate("po", "POno dept")
      .sort({ PRno: -1 })
      .lean();

    const ExcelJS = require("exceljs");
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("PR List");

    // Header
    sheet.columns = [
      { header: "PR No.", width: 15 },
      { header: "Project Name", width: 20 },
      { header: "Date", width: 12 },
      { header: "Supplier", width: 20 },
      { header: "PO", width: 15 },
      { header: "Customer", width: 15 },
      { header: "Note", width: 15 },
      { header: "Term", width: 12 },
      { header: "Delivery", width: 12 },
      { header: "Discount", width: 10 },
      { header: "Item No.", width: 8 },
      { header: "Description", width: 30 },
      { header: "Unit", width: 10 },
      { header: "Quantity", width: 10 },
      { header: "Unit Price", width: 12 },
      { header: "Amount", width: 12 },
      { header: "Total", width: 15 }
    ];

    prList.forEach(pr => {
      // Calculate totals as in detail
      const items = (pr.item || []).map(i => {
        const quantity = parseFloat(i.quantity || 0);
        const ppu = parseFloat(i.ppu || 0);
        return {
          ...i,
          price: (quantity * ppu).toFixed(2)
        };
      });
      const totalPrice = items.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);
      const discount = parseFloat(pr.discount || 0);

      // PO link format
      const poLink = pr.po && pr.po.POno ? `${pr.po.dept || ""}${pr.po.POno}` : "-";

      // If no items, still output one row for the PR
      if (!items.length) {
        sheet.addRow([
          (pr.PRno || "-") + "-" + (pr.dept || "") + "-MOT",
          pr.name || "",
          pr.date ? new Date(pr.date).toISOString().substr(0, 10) : "",
          pr.supplier || "",
          poLink,
          pr.customer || "",
          pr.note || "",
          pr.term || "",
          pr.delivery || "",
          discount.toFixed(2),
          "", "", "", "", "", "",
          totalPrice.toFixed(2)
        ]);
      } else {
        items.forEach((item, idx) => {
          sheet.addRow([
            idx === 0 ? (pr.PRno || "-") + "-" + (pr.dept || "") + "-MOT" : "",
            idx === 0 ? (pr.name || "") : "",
            idx === 0 ? (pr.date ? new Date(pr.date).toISOString().substr(0, 10) : "") : "",
            idx === 0 ? (pr.supplier || "") : "",
            idx === 0 ? poLink : "",
            idx === 0 ? (pr.customer || "") : "",
            idx === 0 ? (pr.note || "") : "",
            idx === 0 ? (pr.term || "") : "",
            idx === 0 ? (pr.delivery || "") : "",
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

      // Add a blank row after each PR
      sheet.addRow([]);
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=PR_List.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export PR list");
  }
});

module.exports = router;
