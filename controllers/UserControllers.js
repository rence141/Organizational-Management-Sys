// controllers/userController.js
const User = require("../models/userModel");

// ==========================
// MONGO CRUD (ACTIVE)
// ==========================

// CREATE
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body); // Save to MongoDB
    res.status(201).json(user);               // ✅ includes _id
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// READ ALL
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users); // ✅ includes _id for each user
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// READ ONE
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID format" });
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ==========================
// IN-MEMORY CRUD (COMMENTED OUT)
// ==========================

// // Create User
// exports.createUser = (req, res) => {
//   const { name, email } = req.body || {};
//   if (!name || !email) {
//     return res.status(400).json({ message: 'name and email are required.' });
//   }
//
//   // Generate next id
//   const newId = req.store.users.length > 0
//     ? req.store.users[req.store.users.length - 1].id + 1
//     : 1;  
//
//   // Create new user
//   const newUser = { id: newId, name, email, age: req.body.age || null };
//   req.store.users.push(newUser);
//
//   return res.status(201).json({ message: 'User created', user: newUser });
// };
//
// // Get All Users
// exports.getUsers = (req, res) => {
//   return res.status(200).json(req.store.users);
// };
//
// // Get User by ID
// exports.getUserById = (req, res) => {
//   const id = Number(req.params.id);
//   const user = req.store.users.find(u => u.id === id);
//   if (!user) return res.status(404).json({ message: 'User not found' });
//   return res.status(200).json(user);
// };
//
// // Update User
// exports.updateUser = (req, res) => {
//   const id = Number(req.params.id);
//   const { name, email } = req.body || {};
//
//   const userIndex = req.store.users.findIndex(u => u.id === id);
//   if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
//
//   if (name) req.store.users[userIndex].name = name;
//   if (email) req.store.users[userIndex].email = email;
//
//   return res.status(200).json({ message: 'User updated', user: req.store.users[userIndex] });
// };
//
// // Delete User
// exports.deleteUser = (req, res) => {
//   const id = Number(req.params.id);
//
//   const userIndex = req.store.users.findIndex(u => u.id === id);
//   if (userIndex === -1) return res.status(404).json({ message: 'User not found' });
//
//   req.store.users.splice(userIndex, 1);
//
//   return res.status(200).json({ message: 'User deleted' });
// };
