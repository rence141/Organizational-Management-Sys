// app.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authroutes');

const app = express();

// Middleware
app.use(express.json());

// In-memory store (optional, remove if you fully move to MongoDB)
const store = { users: [] };
app.use((req, res, next) => {
  req.store = store;
  next();
});

// MongoDB Connection
mongoose.connect("mongodb+srv://test:Lorenzezz003421@cluster0.vovdaod.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use('/api', userRoutes);      // e.g., /api/users
app.use('/api/auth', authRoutes); // e.g., /api/auth/signup, /api/auth/login

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// 404 middleware (for routes not found)
app.use((req, res, next) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler (for unexpected errors)
app.use((err, req, res, next) => {
  console.error(err);                             // Log the actual error for debugging
  return res.status(500).json({ message: 'Internal Server Error' });
});