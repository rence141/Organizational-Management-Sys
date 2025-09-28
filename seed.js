// seed.js
// Purpose: Seed realistic data for Week 6 aggregation (users + orders) without wiping existing accounts.

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("./models/userModel");       // reuse Week 5 User model
const Order = require("./models/orderModels");     // new Order model

// 1) Read connection string from environment (recommended)
//    Create a .env with MONGODB_URI=your_atlas_uri and load with dotenv if you like
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://lorenzezz0987:Lorenzezz003421@cluster0.vovdaod.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";  //✅ Again replace this with your mongodb connection

(async () => {
  try {
    // 2) Connect to MongoDB
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Connected to MongoDB for seeding");

    // 3) Prepare a known demo account for login tests
    const demoEmail = "demo.user@example.com";
    const demoPasswordPlain = "password123";
    const demoPasswordHash = await bcrypt.hash(demoPasswordPlain, 10);

    // 4) Base user list (20 users total; includes the demo user)
    const baseUsers = [
      { name: "Demo User", email: demoEmail, password: demoPasswordHash, age: 21, hobbies: ["reading","gaming"], createdAt: new Date("2024-01-10") },
      { name: "Alice Reyes", email: "alice.reyes@example.com",  password: await bcrypt.hash("P@ssw0rd1", 10), age: 22, hobbies: ["music","travel"], createdAt: new Date("2024-02-05") },
      { name: "Bob Cruz",   email: "bob.cruz@example.com",      password: await bcrypt.hash("P@ssw0rd2", 10), age: 28, hobbies: ["cycling","films"], createdAt: new Date("2024-02-15") },
      { name: "Charlie Dela Cruz", email: "charlie.dc@example.com", password: await bcrypt.hash("P@ssw0rd3", 10), age: 35, hobbies: ["cooking","travel"], createdAt: new Date("2024-03-01") },
      { name: "Diana Santos", email: "diana.santos@example.com", password: await bcrypt.hash("P@ssw0rd4", 10), age: 40, hobbies: ["gaming","yoga"], createdAt: new Date("2024-03-12") },
      { name: "Evan Flores",  email: "evan.flores@example.com",  password: await bcrypt.hash("P@ssw0rd5", 10), age: 26, hobbies: ["reading","music"], createdAt: new Date("2024-03-28") },
      { name: "Faye Ramos",   email: "faye.ramos@example.com",   password: await bcrypt.hash("P@ssw0rd6", 10), age: 19, hobbies: ["dance","vlog"], createdAt: new Date("2024-04-04") },
      { name: "Gino Tan",     email: "gino.tan@example.com",     password: await bcrypt.hash("P@ssw0rd7", 10), age: 31, hobbies: ["basketball","gaming"], createdAt: new Date("2024-04-11") },
      { name: "Hannah Uy",    email: "hannah.uy@example.com",    password: await bcrypt.hash("P@ssw0rd8", 10), age: 24, hobbies: ["art","music"], createdAt: new Date("2024-04-19") },
      { name: "Ivan Lim",     email: "ivan.lim@example.com",     password: await bcrypt.hash("P@ssw0rd9", 10), age: 27, hobbies: ["coding","reading"], createdAt: new Date("2024-05-02") },
      { name: "Jana Lee",     email: "jana.lee@example.com",     password: await bcrypt.hash("P@ssw0rd10",10), age: 33, hobbies: ["hiking","yoga"], createdAt: new Date("2024-05-10") },
      { name: "Karl Ong",     email: "karl.ong@example.com",     password: await bcrypt.hash("P@ssw0rd11",10), age: 29, hobbies: ["cycling","music"], createdAt: new Date("2024-05-15") },
      { name: "Lara Go",      email: "lara.go@example.com",      password: await bcrypt.hash("P@ssw0rd12",10), age: 23, hobbies: ["films","travel"], createdAt: new Date("2024-05-28") },
      { name: "Mark Dizon",   email: "mark.dizon@example.com",   password: await bcrypt.hash("P@ssw0rd13",10), age: 37, hobbies: ["cooking","basketball"], createdAt: new Date("2024-06-02") },
      { name: "Nina Cruz",    email: "nina.cruz@example.com",    password: await bcrypt.hash("P@ssw0rd14",10), age: 21, hobbies: ["art","dance"], createdAt: new Date("2024-06-11") },
      { name: "Owen Pineda",  email: "owen.pineda@example.com",  password: await bcrypt.hash("P@ssw0rd15",10), age: 25, hobbies: ["gaming","coding"], createdAt: new Date("2024-06-20") },
      { name: "Pam Roque",    email: "pam.roque@example.com",    password: await bcrypt.hash("P@ssw0rd16",10), age: 30, hobbies: ["yoga","reading"], createdAt: new Date("2024-07-03") },
      { name: "Quinn Ramos",  email: "quinn.ramos@example.com",  password: await bcrypt.hash("P@ssw0rd17",10), age: 34, hobbies: ["travel","music"], createdAt: new Date("2024-07-12") },
      { name: "Ruth Chua",    email: "ruth.chua@example.com",    password: await bcrypt.hash("P@ssw0rd18",10), age: 20, hobbies: ["vlog","art"], createdAt: new Date("2024-07-24") },
      { name: "Sam dela Vega",email: "sam.dv@example.com",       password: await bcrypt.hash("P@ssw0rd19",10), age: 27, hobbies: ["hiking","coding"], createdAt: new Date("2024-08-01") }
    ];

    // 5) Upsert users by email (no deletion)
    const bulkOps = baseUsers.map(u => ({
      updateOne: {
        filter: { email: u.email }, // unique key
        update: { $set: u },        // set fields (adds optional analytics data)
        upsert: true                // create if not found
      }
    }));
    await User.bulkWrite(bulkOps);
    console.log("✅ Users upserted (no accounts deleted)");

    // 6) Fetch all users to map emails -> _ids (for linking orders)
    const users = await User.find({}, { _id: 1, email: 1 });
    const byEmail = Object.fromEntries(users.map(u => [u.email, u._id]));

    // 7) Build ~60 orders across months, distributed among 10 users
    const orderTemplates = [
      { product: "Laptop",     price: 1000 },
      { product: "Phone",      price: 650  },
      { product: "Tablet",     price: 480  },
      { product: "Headphones", price: 180  },
      { product: "Mouse",      price: 35   },
      { product: "Keyboard",   price: 75   },
      { product: "Monitor",    price: 220  },
    ];

    // choose a subset of user emails to assign orders
    const orderEmails = [
      "alice.reyes@example.com","bob.cruz@example.com","charlie.dc@example.com",
      "diana.santos@example.com","evan.flores@example.com","gino.tan@example.com",
      "hannah.uy@example.com","ivan.lim@example.com","jana.lee@example.com","karl.ong@example.com"
    ];

    // helper to randomize dates between Jan and Aug 2024
    function randomDate() {
      const start = new Date("2024-01-01").getTime();
      const end   = new Date("2024-08-31").getTime();
      return new Date(start + Math.random() * (end - start));
    }

    // 8) Create ~60 orders
    const orders = [];
    for (let i = 0; i < 60; i++) {
      const uEmail = orderEmails[i % orderEmails.length];              // cycle through 10 users
      const template = orderTemplates[i % orderTemplates.length];      // cycle products
      const doc = {
        userId: byEmail[uEmail],                                       // link to user
        product: template.product,
        price: template.price + Math.round(Math.random() * 50),        // slight variation
        orderDate: randomDate()
      };
      orders.push(doc);
    }

    // 9) Optional: clear ONLY orders to avoid duplicates on re-run
    await Order.deleteMany({});
    await Order.insertMany(orders);
    console.log("✅ Inserted ~60 orders");

    console.log("🎯 Seeding complete. Demo login:", demoEmail, "/ password123");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
})();
