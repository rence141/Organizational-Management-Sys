const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
const config = require('./config');

async function createAdmin() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);
      mongoose.connection.close();
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
