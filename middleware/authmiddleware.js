const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user info to request
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role || "user" };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
