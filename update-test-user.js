const mongoose = require('mongoose');
const User = require('./models/userModel');
const config = require('./config');

async function updateTestUser() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and update the test user with profile data
    const testUser = await User.findOneAndUpdate(
      { email: 'test@example.com' },
      {
        $set: {
          profile: {
            avatar: 'https://picsum.photos/seed/testuser/200/200.jpg',
            bio: 'Test user for admin dashboard with enhanced profile',
            location: 'Test City, Philippines',
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
        }
      },
      { new: true, upsert: false }
    );

    if (testUser) {
      console.log('Test user updated successfully!');
      console.log('Email:', testUser.email);
      console.log('Name:', testUser.name);
      console.log('Avatar:', testUser.profile?.avatar);
      console.log('Location:', testUser.profile?.location);
      console.log('Login Count:', testUser.loginCount);
    } else {
      console.log('Test user not found');
    }
    
  } catch (error) {
    console.error('Error updating test user:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

updateTestUser();
