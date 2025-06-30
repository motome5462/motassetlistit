// models/PRITEM.js
const mongoose = require("mongoose");


const PRITEMSchema  = new mongoose.Schema({
    quantity: { type: String, default: "" },
    unit: {type: String, default: ""},
    sn: {type: String, default: ""},
    description: {type: String, default: ""},
    instock: { type: String, default: "" },
    outstock: { type: String, default: "" },
    price: { type: String, default: "" },
    ppu: { type: String, default: "" },
    remark: { type: String, default: "" },
    total:{ type: String, default: ""},
    pr: { type: mongoose.Schema.Types.ObjectId, ref: "PR" },
})
module.exports = mongoose.model("PRITEM",PRITEMSchema)
