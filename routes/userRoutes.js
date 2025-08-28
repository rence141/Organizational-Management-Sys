// routes/userRoutes.js
const express = require('express');              // Import Express
const router = express.Router();                 // Create a new router object
const c = require('../controllers/UserControllers');
 // Import controller functions

// CRUD routes mapping HTTP verbs → controller methods
router.post('/users', c.createUser);             // POST /api/users → create
router.get('/users', c.getUsers);                // GET  /api/users → read all
router.get('/users/:id', c.getUserById);         // GET  /api/users/1 → read one
router.put('/users/:id', c.updateUser);          // PUT  /api/users/1 → update
router.delete('/users/:id', c.deleteUser);       // DELETE /api/users/1 → delete

module.exports = router;                        // Export router so app.js can use it