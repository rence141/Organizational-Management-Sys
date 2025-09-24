// routes/userRoutes.js
const express = require('express');              // Import Express
const router = express.Router();                 // Create a new router object
const c = require('../controllers/UserControllers');
const auth = require("../middleware/authmiddleware");   // JWT auth middleware
 // Import controller functions


// Public routes (if any) would go here

// Protected routes: require a valid JWT to access
router.get("/users", auth, c.getUsers);    // List users only if token is valid
router.get("/users/:id", auth, c.getUserById); // Get user by id if token valid

// (If you have create/update/delete users, you may protect them too)
router.post("/users", auth, c.createUser);
router.put("/users/:id", auth, c.updateUser);
router.delete("/users/:id", auth, c.deleteUser);

// Export the router to be mounted in app.js at /api
module.exports = router;

module.exports = router;                        // Export router so app.js can use it
