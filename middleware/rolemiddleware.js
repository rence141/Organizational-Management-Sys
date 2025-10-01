// middleware/roleMiddleware.js
module.exports = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  return allowed.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: "Forbidden" });
};