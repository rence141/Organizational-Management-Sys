const mongoose = require("mongoose");

// Define schema structure
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 }
});

// Compile model
const User = mongoose.model("User", userSchema);

module.exports = User;