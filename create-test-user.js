const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/userModel');
const config = require('./config');

async function createTestUser() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingTestUser = await User.findOne({ email: 'test@example.com' });
    if (existingTestUser) {
      console.log('Test user already exists:', existingTestUser.email);
      mongoose.connection.close();
      return;
    }

    // Create test user with PFP data
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user',
      isVerified: true,
      age: 25,
      hobbies: ['coding', 'design', 'music'],
      // Enhanced profile data
      profile: {
        avatar: 'https://picsum.photos/seed/testuser/200/200.jpg',
        bio: 'Test user for admin dashboard',
        location: 'Test City',
        website: 'https://testuser.com',
        social: {
          twitter: '@testuser',
          github: 'testuser',
          linkedin: 'testuser'
        }
      },
      loginHistory: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          location: 'Local'
        },
        {
          timestamp: new Date(), // Now
          ip: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Current Browser)',
          location: 'Local'
        }
      ],
      lastLogin: new Date(),
      loginCount: 2,
      status: 'active'
    });

    console.log('Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('Profile Avatar:', testUser.profile?.avatar);
    
  } catch (error) {
    console.error('Error creating test user:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
