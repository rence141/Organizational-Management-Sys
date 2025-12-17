const jwt = require('jsonwebtoken');
const config = require('./config');

// Generate admin token for testing
function generateAdminToken() {
  const payload = {
    id: 'admin123',
    email: 'admin@example.com',
    role: 'admin'
  };
  
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1h' });
}

// Test the admin endpoint
async function testAdminEndpoint() {
  try {
    console.log('Testing admin endpoint...');
    
    // Generate admin token
    const token = generateAdminToken();
    console.log('Generated admin token:', token.substring(0, 50) + '...');
    
    // Test fetch
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const users = await response.json();
      console.log('Success! Users found:', users.length);
      console.log('User emails:', users.map(u => u.email));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminEndpoint();
