const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('x-auth-token') || 
                     req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.token;

        // Check if no token
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token, authorization denied' 
            });
        }

        // Verify token
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            console.error('Token verification failed:', err.message);
            return res.status(401).json({ 
                success: false, 
                message: 'Token is not valid' 
            });
        }
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = auth;
