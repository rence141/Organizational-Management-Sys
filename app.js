// app.js
const express = require('express');
const app = express();

app.use(express.json());

// In-memory store
const store = { users: [] };

// Middleware to attach store to every request
app.use((req, res, next) => {
  req.store = store;
  next();
});

const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


// 404 middleware (for routes not found)
app.use((req, res, next) => res.status(404).json({ message: 'Route not found' }));

// Centralized error handler (for unexpected errors)
app.use((err, req, res, next) => {
  console.error(err);                             // Log the actual error for debugging
  return res.status(500).json({ message: 'Internal Server Error' });
});