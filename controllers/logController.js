const Notification = require('../models/notificationModel');
const SecurityLog = require('../models/securityLogModel');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    await Notification.updateMany({ userId, unread: true }, { unread: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSecurityLogs = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "User ID required" });

    const logs = await SecurityLog.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
