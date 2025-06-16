const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    img: { type: String, default: "" },
    assetid: { type: mongoose.Schema.Types.ObjectId, ref: "assetlist" },
});

module.exports = mongoose.model('img', imgSchema);