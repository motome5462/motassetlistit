// models/PO.js
const mongoose = require("mongoose");
const Counter = require("./Counter");

const POSchema = new mongoose.Schema({
  POno: { type: Number, unique: true },
  manual_POno: { type: Number },
  name: { type: String, default: "" },
  dept: { type: String, default: "" },
  Taxpayerno:{ type: String, default: "" },
  supplier:{ type: String, default: "" },
  supplierdetail:{ type: String, default: "" },
  date:{ type: Date, default: null },
  Texid:{ type: String, default: "" },
  Tel:{ type: String, default: "" },
  fax:{ type: String, default: "" },
  mobile:{ type: String, default: "" },
  attention: { type: String, default: "" },
  email:{ type: String, default: "" },
  Paymentterm:{ type: String, default: "" },
  deliverydate:{ type: Date, default: null },
  quotation:{ type: String, default: "" },
  purchasing:{ type: String, default: "" },
  approval:{ type: String, default: "" },
  term:{ type: String, default: "" },
  discount:{type: String, default: "" },
item: [{ type: mongoose.Schema.Types.ObjectId, ref: "ITEM" }],
pr: { type: mongoose.Schema.Types.ObjectId, ref: "PR" },
});

// Pre-save hook to auto-increment POno
POSchema.pre("save", async function (next) {
  const doc = this;

  if (!doc.isNew) return next(); // Only assign POno for new documents

  let counter = await Counter.findById("POno");
  if (!counter) {
    counter = await Counter.create({ _id: "POno", seq: 0 });
  }

  if (doc.manual_POno) {
    doc.POno = doc.manual_POno;
    // Don't update the counter unless manual_POno is higher
    if (doc.manual_POno > counter.seq) {
      counter.seq = doc.manual_POno;
      await counter.save();
    }
  } else {
    const updated = await Counter.findByIdAndUpdate(
      "POno",
      { $inc: { seq: 1 } },
      { new: true }
    );
    doc.POno = updated.seq;
  }

  next();
});


module.exports = mongoose.model("PO", POSchema);
