const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { JWT_SECRET, BASE_URL } = require("../config");
const sendEmail = require("../utils/sendEmail");
const SecurityLog = require("../models/securityLogModel");
const Notification = require("../models/notificationModel");

// --- SIGNUP ---
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password, // Mongoose pre-save hook in userModel.js handles hashing
      isVerified: true, 
      role: 'user'
    });
    
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id.toString(), email: newUser.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Initial Logs
    await SecurityLog.create({ userId: newUser._id, action: "Account Created", ip: req.ip });
    await Notification.create({ userId: newUser._id, title: "Welcome", message: "Account created successfully.", type: "success" });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "An error occurred during registration." });
  }
};

// --- LOGIN (FIXED: PREVENTS DOUBLE HASHING) ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Add detailed logging
    console.log('\n--- Login Attempt ---');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');
    
    if (!email || !password) {
      console.log('Login failed: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    // 1. Find user and explicitly include password field
    console.log('Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('Login failed: No user found with this email');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    // 2. Compare the plaintext password with the stored hash
    console.log('\n--- Password Verification ---');
    console.log('Stored password hash:', user.password);
    console.log('Password being checked:', password);
    
    const valid = await bcrypt.compare(password, user.password);
    console.log('Bcrypt compare result:', valid);
    
    if (!valid) {
      console.log('Login failed: Password does not match');
      console.log('Hash algorithm used:', user.password.substring(0, 4) === '$2b$' ? 'bcrypt' : 'unknown');
      return res.status(400).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }
    
    console.log('Login successful for user:', user.email);

    // 3. UPDATE STATS WITHOUT TRIGGERING PRE-SAVE HOOK
    // Using findByIdAndUpdate ensures the password hashing middleware is NOT triggered
    await User.findByIdAndUpdate(user._id, {
      $set: { lastLogin: new Date() },
      $inc: { loginCount: 1 }
    });

    // 4. Generate Session Token
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role || 'user' }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // 5. Log Security Event
    await SecurityLog.create({
      userId: user._id,
      action: "Login",
      ip: req.ip,
      device: req.headers['user-agent']
    });

    // 6. Return response to frontend
    return res.status(200).json({ 
      success: true,
      message: "Login successful", 
      token,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        accId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        // Include additional profile fields if they exist
        profilePicture: user.profilePicture,
        location: user.location,
        department: user.department
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "An error occurred during login." });
  }
};

// --- ADMIN LOGIN ---
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid credentials" });

    await User.findByIdAndUpdate(user._id, { $set: { lastLogin: new Date() }, $inc: { loginCount: 1 } });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({ success: true, message: "Admin login successful", token, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Admin login failed" });
  }
};

// --- VERIFY EMAIL ---
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      verificationToken: token, 
      verificationExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification link" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save(); // Password wasn't modified, so this won't double-hash if your hook is written correctly

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "An error occurred during verification." });
  }
};

// --- TEST DATABASE CONNECTION ---
exports.testDB = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ success: true, message: "Database connection successful", userCount: count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed", error: error.message });
  }
};