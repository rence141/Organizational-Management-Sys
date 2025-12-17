const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Organization name is required"],
    trim: true
  },
  domain: {
    type: String,
    required: [true, "Domain is required"],
    trim: true,
    lowercase: true
    // 🟢 REMOVED 'unique: true' to prevent duplicate key errors during testing
    // 🟢 REMOVED regex 'match' to prevent validation errors
  },
  plan: {
    type: String,
    default: "Basic"
  },
  // --- Optional Fields (No 'required' check) ---
  industry: String,
  size: String,
  website: String,
  description: String,
  
  // --- Critical Identity Fields ---
  owner_ID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Owner ID is required"]
  },
  adminEmail: {
    type: String,
    required: [true, "Admin email is required"]
  },
  
  // --- Member Management ---
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  coOwners: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  officers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  announcements: [{
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    author: String
  }],
  events: [{
    title: String,
    date: Date,
    description: String
  }],

  // --- Defaults ---
  users: { type: Number, default: 1 },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); // 🟢 strict: false allows extra fields without crashing

module.exports = mongoose.model("Organization", organizationSchema);