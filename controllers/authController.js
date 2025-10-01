const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      message: "User created successfully",
      userId: newUser._id.toString()
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid email or password" });

     // Payload includes role now
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    console.log("Login successful, token:", token); // 🔹 debug

    return res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

