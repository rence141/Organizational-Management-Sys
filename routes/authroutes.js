const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Test database connection
router.get("/test-db", authController.testDB);

// Authentication routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/admin/login", authController.adminLogin);
router.get("/verify-email", authController.verifyEmail);

module.exports = router;