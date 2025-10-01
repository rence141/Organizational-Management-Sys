// app.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); 
const { MONGODB_URI, JWT_SECRET } = require("./config");
const orderModels = require('./models/orderModels');
const Product = require('./models/productModels');


const app = express();

console.log("Starting application...");

console.log("Connecting to:", MONGODB_URI);
console.log("JWT Secret:", JWT_SECRET);


// Middleware (must come first)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", require("./routes/productRoutes"));
app.use("/api", require("./routes/adminRoutes"));
app.use("/api", require("./routes/statsRoutes"));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


// In-memory store (temporary — safe to remove once you fully use MongoDB)
const store = { users: [] };
app.use((req, res, next) => {
  req.store = store;
  next();
});

// ✅ MongoDB Connection (use the actual variable, not the string)
mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Routes
app.use('/api/users', userRoutes);      // e.g., /api/users
app.use('/api/auth', authRoutes);       // e.g., /api/auth/signup, /api/auth/login

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// 404 middleware (for routes not found)
app.use((req, res, next) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err); // debug log
  return res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;
