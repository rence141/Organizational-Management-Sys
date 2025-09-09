// routes/authRoutes.js
const express = require("express");                     // Import Express to create a Router
const router = express.Router();                        // Create a new Router instance
const authController = require("../controllers/authController"); // Import controller handlers

// Route to create a new account (hashes password then saves)
router.post("/signup", authController.signup);

// Route to log in (verifies password and returns a JWT token)
router.post("/login", authController.login);

// Export the router so it can be mounted in app.js
module.exports = router;