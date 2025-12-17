const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// Analytics dashboard routes
router.get('/dashboard', auth, isAdmin, analyticsController.getDashboardStats);
router.get('/trends/users', auth, isAdmin, analyticsController.getUserSignupTrends);
router.get('/organizations', auth, isAdmin, analyticsController.getOrganizationStats);

module.exports = router;
