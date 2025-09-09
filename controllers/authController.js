// controllers/authController.js
const User = require("../models/userModel");            // Import the User model for DB operations
const bcrypt = require("bcrypt");                       // Library for hashing and comparing passwords
const jwt = require("jsonwebtoken");                    // Library for creating and verifying JWT tokens

// POST /api/auth/signup
// Purpose: create a new user with a hashed password
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;        // Extract fields from the request body

    // Hash the plain-text password with a saltRounds of 10 (cost factor)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user document in MongoDB (password is stored hashed)
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Return 201 Created with minimal info (never return password)
    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id.toString()
    });
  } catch (err) {
    // 400 Bad Request is fine for validation/duplication errors from Mongoose
    return res.status(400).json({ message: err.message });
  }
};

// POST /api/auth/login
// Purpose: verify credentials and issue a signed JWT for the client to use on protected routes
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;              // Extract login credentials

    // Find a user by email; if not found, fail with generic message (avoid leaking existence)
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare the provided password with the stored HASH using bcrypt
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

    // Create a token payload (keep it small: id + email is enough)
    const payload = { id: user._id.toString(), email: user.email };

    // Sign the JWT with a secret key and expiry (1 hour). In Week 6+ we’ll move "secret" to .env
    const token = jwt.sign(payload, "secretkey", { expiresIn: "1h" });

    // Return the token for the client to store and use in Authorization header
    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    // 500 Internal Server Error for unexpected problems
    return res.status(500).json({ message: err.message });
  }
};