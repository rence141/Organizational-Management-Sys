const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationExpires: Date,
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  // --- Profile Fields ---
  profilePicture: String, // Stores Base64 string
  firstName: String,
  lastName: String,
  phone: String,
  location: String,
  department: String,
  bio: String,
  employeeId: String,
  clearance: String,
  
  // --- Security Settings ---
  twoFactorEnabled: { type: Boolean, default: false },
  loginAlertsEnabled: { type: Boolean, default: true },
  lastPasswordChange: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'users' });

// Hash password before saving
// In userModel.js, update the pre-save hook to:
userSchema.pre('save', async function(next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.lastPasswordChange = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);