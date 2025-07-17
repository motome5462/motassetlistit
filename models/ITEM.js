// models/ITEM.js
const mongoose = require("mongoose");


const ITEMSchema  = new mongoose.Schema({
    quantity: { type: String, default: "0" },
    unit: {type: String, default: ""},
    sn: {type: String, default: ""},
    description: {type: String, default: ""},
    instock: { type: String, default: "" },
    outstock: { type: String, default: "" },
    price: { type: String, default: "" },
    ppu: { type: String, default: "0" },
    remark: { type: String, default: "" },
    pr: { type: mongoose.Schema.Types.ObjectId, ref: "PR" },
    po: { type: mongoose.Schema.Types.ObjectId, ref: "PO" },
})
module.exports = mongoose.model("ITEM",ITEMSchema)
