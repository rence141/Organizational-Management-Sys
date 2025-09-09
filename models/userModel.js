
// models/userModel.js
const mongoose = require("mongoose");                   // Import Mongoose to define schemas and models

// Define the structure (schema) of a User document in MongoDB
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },              // User's display name (must be provided)
  email: { type: String, required: true, unique: true },// Email must be provided and unique across users
  password: { type: String, required: true }           // Store the HASHED password (never plain text)
});

// Compile the schema into a Model named "User" (maps to "users" collection)
const User = mongoose.model("User", userSchema);

// Export the model so controllers can import and use it
module.exports = User;

