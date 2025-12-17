const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getUserById, 
    updateUser, 
    deleteUser,
    changePassword  // Add this line
} = require('../controllers/userController');

// Existing routes
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);

// Add this new route for password change
router.post('/:id/change-password', protect, changePassword);

module.exports = router;