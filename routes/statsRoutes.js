// routes/statsRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authmiddleware');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');

// Get basic stats (protected route)
router.get('/stats', protect, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrgs = await Organization.countDocuments();
        const activeUsers = await User.countDocuments({ 
            lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOrgs,
                activeUsers
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics' 
        });
    }
});

module.exports = router;