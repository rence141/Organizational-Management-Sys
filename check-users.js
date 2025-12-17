const mongoose = require('mongoose');
const User = require('./models/userModel');
const config = require('./config');

async function checkUsers() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const allUsers = await User.find({});
    console.log('Total users in database:', allUsers.length);
    
    if (allUsers.length > 0) {
      console.log('\nUsers found:');
      allUsers.forEach(user => {
        console.log(`- ${user.name || 'Unknown'} (${user.email}) - Role: ${user.role || 'User'} - Verified: ${user.isVerified}`);
      });
    } else {
      console.log('No users found in database');
      console.log('Creating a test user...');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'User',
        isVerified: true
      });
      
      console.log('Test user created: test@example.com / test123');
    }
    
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
