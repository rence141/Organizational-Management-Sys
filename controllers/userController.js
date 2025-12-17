const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const SecurityLog = require('../models/securityLogModel');

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
exports.updateUser = async (req, res) => {
    try {
        const { name, email, firstName, lastName, phone, department, location } = req.body;
        
        // Build user object
        const userFields = {};
        if (name) userFields.name = name;
        if (email) userFields.email = email.toLowerCase();
        if (firstName) userFields.firstName = firstName;
        if (lastName) userFields.lastName = lastName;
        if (phone) userFields.phone = phone;
        if (department) userFields.department = department;
        if (location) userFields.location = location;
        userFields.updatedAt = Date.now();

        // Update the user
        let user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: userFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: 'User updated successfully',
            user 
        });
    } catch (error) {
        console.error('Update user error:', error);
        
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists',
                field: 'email'
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'User deleted successfully',
            userId: req.params.id 
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: error.message 
        });
    }
};

// @desc    Change user password
// @route   POST /api/users/:id/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password and new password are required' 
            });
        }

        // Find user and include password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Update password (the pre-save hook will handle hashing)
        user.password = newPassword;
        user.lastPasswordChange = Date.now();
        await user.save();

        // Log the password change
        await SecurityLog.create({
            userId: user._id,
            action: "Password Changed",
            ip: req.ip
        });

        res.json({ 
            success: true, 
            message: 'Password updated successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
