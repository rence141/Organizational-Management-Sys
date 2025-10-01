// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Product = require("../models/productModels");
const auth = require("../middleware/authmiddleware");
const allow = require("../middleware/roleMiddleware");

// Admin: list users (hide passwords)
router.get("/admin/users", auth, allow("admin"), async (req, res) => {
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).limit(500);
  res.json(users);
});

// Admin: product stats by category
router.get("/admin/product-stats", auth, allow("admin"), async (req, res) => {
  const perCat = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, stock: { $sum: "$stock" } } },
    { $sort: { count: -1 } }
  ]);
  res.json({ perCat });
});

module.exports = router;