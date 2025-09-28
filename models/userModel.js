// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Required for auth (from Week 5)
  name:     { type: String, required: true },          // user display name
  email:    { type: String, required: true, unique: true }, // unique email
  password: { type: String, required: true },          // hashed password

  // OPTIONAL analytics fields for Week 6+ (do not break auth)
  age:       { type: Number, default: null },          // may be null if not set
  hobbies:   { type: [String], default: [] },          // array of tags
  createdAt: { type: Date, default: Date.now }         // registration time
});

const User = mongoose.model("User", userSchema);
module.exports = User;
