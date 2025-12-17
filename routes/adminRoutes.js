// routes/adminRoutes.js
const express = require("express");      
const router = express.Router();
const User = require("../models/userModel");
const { protect } = require("../middleware/authmiddleware");  // Changed from auth to { protect }
const allow = require("../middleware/roleMiddleware");
const Organization = require("../models/organizationModel");

// Admin: list users (hide passwords)    
router.get("/admin/users", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
  const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).limit(500);
  res.json(users);
});

// Admin: suspend user
router.put("/admin/users/:id/suspend", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User suspended successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user", error: error.message });
  }
});

// Admin: activate user
router.put("/admin/users/:id/activate", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User activated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate user", error: error.message });
  }
});

// Admin: delete user
router.delete("/admin/users/:id", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
  try {
    const user = await User.findByIdAndDelete(req.params.id).select('-password'); 

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
});

// Admin: Get all organizations
router.get("/admin/organizations", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
    try {
        const orgs = await Organization.find()
            .populate('owner_ID', 'name email')
            .sort({ createdAt: -1 });    
        res.json(orgs);
    } catch (error) {
        console.error("Error fetching organizations:", error);
        res.status(500).json({ message: error.message });
    }
});

// Admin: Get dashboard stats
router.get("/admin/stats", protect, allow("admin"), async (req, res) => {  // Changed auth to protect
    try {
        const totalUsers = await User.countDocuments();
        const totalOrgs = await Organization.countDocuments();
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });
        const orgsWithPlan = await Organization.find({}, 'plan') || [];
        const revenue = orgsWithPlan.reduce((acc, org) => {
            if (org.plan === 'Pro') return acc + 29;
            if (org.plan === 'Enterprise') return acc + 99;
            return acc;
        }, 0);
        res.json({ totalUsers, totalOrgs, activeUsers, revenue });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;