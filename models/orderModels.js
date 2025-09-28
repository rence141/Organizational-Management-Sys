
// models/orderModel.js
const mongoose = require("mongoose");

// A simple order schema linked to a user via userId
const orderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // reference to User
  product:   { type: String, required: true },    // product name
  price:     { type: Number, required: true },    // price amount
  orderDate: { type: Date, required: true }       // when it was placed
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;