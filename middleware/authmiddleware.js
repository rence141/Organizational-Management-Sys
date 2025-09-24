// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");                    // Import jsonwebtoken to verify tokens

// Auth middleware to protect routes
// Reads "Authorization: Bearer <token>" header, verifies token, and sets req.user
function auth(req, res, next) {
  // Extract the Authorization header and split "Bearer <token>"
  const token = req.header("Authorization")?.split(" ")[1];

  // If no token is provided, block access with 401 Unauthorized
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    // Verify token with the same secret used to sign; throws if invalid/expired
    const decoded = jwt.verify(token, "secretkey");

    // Attach decoded payload to req.user for downstream controllers
    req.user = decoded;

    // Continue to the next middleware/controller
    return next();
  } catch (err) {
    // Bad or expired token → 400 Invalid Token (you could also use 401)
    return res.status(400).json({ message: "Invalid Token" });
  }
}

// Export the middleware function so routers can use it
module.exports = auth;