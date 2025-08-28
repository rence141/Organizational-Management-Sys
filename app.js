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
