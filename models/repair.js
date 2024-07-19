const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
    detailrepair: { type: String, default: "" },
    value: { type: String, default: "" },
    success: { type: String, default: "" },
    fail: { type: String, default: "" },
    repairremark: { type: String, default: "" },
    repairdate: { type: Date, default: null },
    total:{ type: String, default: ""},
    computername: { type: mongoose.Schema.Types.ObjectId, ref: "assetlist" },
});

module.exports = mongoose.model('repair', repairSchema);
