const mongoose = require('mongoose');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');
const config = require('./config');

async function testAdminAPI() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get the admin user
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }
    
    console.log('Admin user found:', adminUser.email);
    
    // Create a test token
    const token = jwt.sign(
      { 
        id: adminUser._id.toString(), 
        email: adminUser.email, 
        role: adminUser.role 
      },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('Test token created');
    
    // Test the API endpoint
    const fetch = require('node-fetch');
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response status:', response.status);
    
    if (response.ok) {
      const users = await response.json();
      console.log('Users returned by API:', users.length);
      users.forEach(user => {
        console.log(`- ${user.name || 'Unknown'} (${user.email})`);
      });
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('API Error:', errorData);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testAdminAPI();
