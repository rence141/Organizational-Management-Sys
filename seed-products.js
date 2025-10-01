// seed-products.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/userModel");
const Product = require("./models/productModels");
const { MONGODB_URI, JWT_SECRET } = require("./config");
console.log("Connecting to:", MONGODB_URI);
console.log("JWT Secret:", JWT_SECRET);

(async () => {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Upsert admin and two sellers
  const mk = async (name, email, role) => {
    const hash = await bcrypt.hash("password123", 10);
    await User.updateOne(
      { email }, 
      { $setOnInsert: { name, email, password: hash, role } },
      { upsert: true }
    );
    return (await User.findOne({ email }))._id;
  };

  const adminId  = await mk("Admin One",  "admin1@example.com",  "admin");
  const sellerA  = await mk("Seller A",   "sellerA@example.com", "seller");
  const sellerB  = await mk("Seller B",   "sellerB@example.com", "seller");

  // Seed products for both sellers (clear then insert a small set)
  await Product.deleteMany({});
  const prods = [
    { sellerId: sellerA, name: "Aurora Laptop 14", category: "laptop", price: 45990, stock: 12 },
    { sellerId: sellerA, name: "Nebula Phone X",   category: "phone",  price: 28990, stock: 20 },
    { sellerId: sellerA, name: "Orion Tablet 10",  category: "tablet", price: 17990, stock: 15 },
    { sellerId: sellerB, name: "Echo Headphones",  category: "audio",  price: 2990,  stock: 50 },
    { sellerId: sellerB, name: "Pulse Keyboard",   category: "access", price: 1790,  stock: 30 },
    { sellerId: sellerB, name: "Glide Mouse",      category: "access", price: 990,   stock: 40 },
    { sellerId: sellerA, name: "Zen Monitor 24",   category: "monitor",price: 8990,  stock: 10 },
    { sellerId: sellerB, name: "Wave Speaker",     category: "audio",  price: 3490,  stock: 22 },
    { sellerId: sellerA, name: "Nova Phone S",     category: "phone",  price: 19990, stock: 18 },
    { sellerId: sellerB, name: "Skybuds",          category: "audio",  price: 2490,  stock: 35 }
  ];
  await Product.insertMany(prods);

  console.log("✅ Seeded admin, sellers, and products.");
  await mongoose.disconnect();
})();
