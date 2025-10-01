// models/productModel.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:     { type: String, required: true },
  category: { type: String, index: true, required: true },
  price:    { type: Number, required: true, min: 0 },
  stock:    { type: Number, default: 0, min: 0 },
  createdAt:{ type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);