// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  // Week 5 core (auth)
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Roles for Week 7 (default "user"; other values: "seller", "admin")
  role:     { type: String, enum: ["user","seller","admin"], default: "user" },

  // Optional analytics (Week 6) – keep if already present
  age:       { type: Number, default: null },
  hobbies:   { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);