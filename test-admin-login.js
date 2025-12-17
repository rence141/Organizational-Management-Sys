// Test admin login endpoint directly
async function testAdminLogin() {
  try {
    console.log('Testing admin login endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/admin/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Admin-Auth': 'true'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      }),
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Admin login data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testAdminLogin();
