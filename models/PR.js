// models/PR.js
const mongoose = require("mongoose");
const Counter = require("./Counter");

const PRSchema = new mongoose.Schema({
  PRno: { type: Number, unique: true },
  manual_PRno: { type: Number },
  date:{ type: Date, default: null },
  name: { type: String, default: "" },
  dept: { type: String, default: "" },
  note:{ type: String, default: "" },
  customer:{ type: String, default: "" },
  supplier:{ type: String, default: "" },
  supplierdetail:{ type: String, default: "" },
  term:{ type: String, default: "" },
  delivery:{ type: String, default: "" },
  validity:{ type: String, default: "-" },
  transport:{ type: String, default: "-" },
  ref:{ type: String, default: "" },
  discount:{type: String, default: "" },
  item: [{ type: mongoose.Schema.Types.ObjectId, ref: "ITEM" }],
  po: { type: mongoose.Schema.Types.ObjectId, ref: "PO" },
});

// Pre-save hook to auto-increment PRno
PRSchema.pre("save", async function (next) {
  const doc = this;

  if (!doc.isNew) return next(); // Only assign PRno for new documents

  let counter = await Counter.findById("PRno");
  if (!counter) {
    counter = await Counter.create({ _id: "PRno", seq: 0 });
  }

  if (doc.manual_PRno) {
    doc.PRno = doc.manual_PRno;
    // Don't update the counter unless manual_PRno is higher
    if (doc.manual_PRno > counter.seq) {
      counter.seq = doc.manual_PRno;
      await counter.save();
    }
  } else {
    const updated = await Counter.findByIdAndUpdate(
      "PRno",
      { $inc: { seq: 1 } },
      { new: true }
    );
    doc.PRno = updated.seq;
  }

  next();
});


module.exports = mongoose.model("PR", PRSchema);
