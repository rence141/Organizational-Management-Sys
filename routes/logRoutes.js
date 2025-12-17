const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/notifications', logController.getNotifications);
router.post('/notifications/read', logController.markNotificationsRead);
router.get('/security-logs', logController.getSecurityLogs);

module.exports = router;