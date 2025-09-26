const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Order", orderSchema);
