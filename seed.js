// seed.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/userModel");
const Order = require("./models/orderModels");

// Read connection string from environment or use a placeholder
const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_connection_string_here";

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await Order.deleteMany({});
    console.log("✅ Cleared existing orders");

    // Keep only essential admin user
    await User.deleteMany({ email: { $ne: "admin@example.com" } });
    console.log("✅ Cleared non-admin users");

    await mongoose.disconnect();
    console.log("✅ Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
})();
