const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login endpoint...\n');

    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@mentorbridge.com',
      password: 'admin@123',
    });

    console.log('✅ Login successful!');
    console.log('\nResponse:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
