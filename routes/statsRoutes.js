// routes/statsRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Order = require("../models/orderModels");
const auth = require("../middleware/authmiddleware");

// GET /api/stats/signups-by-month  (optionally ?from=YYYY-MM-DD&to=YYYY-MM-DD)
router.get("/stats/signups-by-month", auth, async (req, res) => {
  const match = {};
  if (req.query.from || req.query.to) {
    match.createdAt = {};
    if (req.query.from) match.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) match.createdAt.$lte = new Date(req.query.to);
  }
  const raw = await User.aggregate([
    { $match: match },
    { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, signups: { $sum: 1 } } },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
    { $project: { _id: 0, year: "$_id.y", monthNum: "$_id.m", signups: 1 } }
  ]);
  const monthNames = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  res.json(raw.map(d => ({ year: d.year, month: `${monthNames[d.monthNum]} ${d.year}`, signups: d.signups })));
});

// GET /api/stats/top-spenders  (default limit 5)
router.get("/stats/top-spenders", auth, async (req, res) => {
  const limit = Number(req.query.limit || 5);
  const data = await Order.aggregate([
    { $group: { _id: "$userId", totalSpent: { $sum: "$price" } } },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "customer" } },
    { $unwind: "$customer" },
    { $project: { _id: 0, name: "$customer.name", email: "$customer.email", totalSpent: 1 } }
  ]);
  res.json(data);
});

// GET /api/stats/hobbies
router.get("/stats/hobbies", auth, async (req, res) => {
  const data = await User.aggregate([
    { $unwind: "$hobbies" },
    { $group: { _id: "$hobbies", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, hobby: "$_id", count: 1 } }
  ]);
  res.json(data);
});

module.exports = router;