// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/productModels");
const auth = require("../middleware/authmiddleware");
const allow = require("../middleware/roleMiddleware");

// Public: list products (optional ?category=)
router.get("/products", async (req, res) => {
  const q = {};
  if (req.query.category) q.category = req.query.category;
  const items = await Product.find(q).sort({ createdAt: -1 }).limit(200);
  res.json(items);
});

// Public: list distinct categories
router.get("/categories", async (req, res) => {
  const cats = await Product.distinct("category");
  res.json(cats);
});

// Seller: create product
router.post("/products", auth, allow("seller"), async (req, res) => {
  const { name, category, price, stock } = req.body;
  const prod = await Product.create({
    sellerId: req.user.id,
    name, category,
    price: Number(price),
    stock: Number(stock) || 0
  });
  res.status(201).json(prod);
});

// Seller: update own product
router.put("/products/:id", auth, allow("seller"), async (req, res) => {
  const p = await Product.findOneAndUpdate(
    { _id: req.params.id, sellerId: req.user.id },
    { $set: req.body },
    { new: true }
  );
  if (!p) return res.status(404).json({ message: "Not found or not your product" });
  res.json(p);
});

// Seller: delete own product
router.delete("/products/:id", auth, allow("seller"), async (req, res) => {
  const r = await Product.deleteOne({ _id: req.params.id, sellerId: req.user.id });
  if (r.deletedCount === 0) return res.status(404).json({ message: "Not found or not your product" });
  res.json({ ok: true });
});

module.exports = router;