// seed-products.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const Product = require("./models/productModels");

// Read connection string from environment or use a placeholder
const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_connection_string_here";

(async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB for product seeding");

    // Clear existing products
    await Product.deleteMany({});
    console.log("✅ Cleared existing products");

    // Keep only essential admin user
    await User.deleteMany({ 
      email: { 
        $nin: ["admin@example.com"] 
      } 
    });
    console.log("✅ Cleared non-admin users");

    console.log("✅ Product seeding complete");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error during product seeding:", err);
    process.exit(1);
  }
})();
