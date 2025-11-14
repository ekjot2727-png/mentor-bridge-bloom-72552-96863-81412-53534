/**
 * Comprehensive E2E Testing Script
 * Tests all features of MentorBridge Bloom
 * Run with: node e2e-tests.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let testResults = { passed: 0, failed: 0, errors: [] };

// Test credentials
const testUsers = {
  admin: { email: 'admin@mentorbridge.com', password: 'admin@123' },
  student: { email: 'student@mentorbridge.com', password: 'student@123' },
  alumni: { email: 'alumni@mentorbridge.com', password: 'alumni@123' },
};

let tokens = {};

// Utility function
async function test(name, fn) {
  try {
    console.log(`\n📝 Testing: ${name}`);
    await fn();
    testResults.passed++;
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.errors.push(name);
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
  }
}

// AUTH TESTS
console.log('\n🔐 ==================== AUTHENTICATION TESTS ====================');

test('Admin Login', async () => {
  const res = await axios.post(`${API_BASE}/auth/login`, testUsers.admin);
  tokens.admin = res.data.accessToken;
  if (!res.data.accessToken) throw new Error('No access token returned');
  if (res.data.user.role !== 'admin') throw new Error('Wrong role');
});

test('Student Login', async () => {
  const res = await axios.post(`${API_BASE}/auth/login`, testUsers.student);
  tokens.student = res.data.accessToken;
  if (!res.data.accessToken) throw new Error('No access token returned');
});

test('Alumni Login', async () => {
  const res = await axios.post(`${API_BASE}/auth/login`, testUsers.alumni);
  tokens.alumni = res.data.accessToken;
  if (!res.data.accessToken) throw new Error('No access token returned');
});

test('Invalid Login Credentials', async () => {
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'nonexistent@test.com',
      password: 'wrongpassword',
    });
    throw new Error('Should have failed with invalid credentials');
  } catch (err) {
    if (err.response?.status === 401) return; // Expected
    throw err;
  }
});

// PROFILE TESTS
console.log('\n👤 ==================== PROFILE TESTS ====================');

test('Get Student Profile', async () => {
  const res = await axios.get(`${API_BASE}/profiles/student@mentorbridge.com`, {
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!res.data.data.userId) throw new Error('No profile found');
  if (res.data.data.firstName !== 'John') throw new Error('Wrong name');
});

test('Update Profile', async () => {
  const updateData = {
    headline: 'Updated headline at ' + new Date().toISOString(),
    bio: 'Test bio',
  };
  const res = await axios.patch(
    `${API_BASE}/profiles/student@mentorbridge.com`,
    updateData,
    { headers: { Authorization: `Bearer ${tokens.student}` } },
  );
  if (!res.data.data.id) throw new Error('Update failed');
});

test('Search Alumni', async () => {
  const res = await axios.get(`${API_BASE}/profiles/alumni/search`, {
    params: { limit: 10 },
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

test('Get Alumni Directory', async () => {
  const res = await axios.get(`${API_BASE}/profiles/alumni/directory`, {
    params: { limit: 20 },
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

// MESSAGING TESTS
console.log('\n💬 ==================== MESSAGING TESTS ====================');

test('Send Message', async () => {
  const res = await axios.post(
    `${API_BASE}/messages`,
    {
      receiverId: 'alumni@mentorbridge.com',
      content: 'Hello! I want to connect with you.',
    },
    { headers: { Authorization: `Bearer ${tokens.student}` } },
  );
  if (!res.data.data.id) throw new Error('Message not created');
  if (res.data.data.status !== 'sent') throw new Error('Wrong status');
});

test('Get Conversation', async () => {
  const res = await axios.get(
    `${API_BASE}/messages/alumni@mentorbridge.com`,
    { headers: { Authorization: `Bearer ${tokens.student}` } },
  );
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

test('List All Conversations', async () => {
  const res = await axios.get(`${API_BASE}/messages`, {
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

// CONNECTION TESTS
console.log('\n🤝 ==================== CONNECTION TESTS ====================');

test('Send Connection Request', async () => {
  const res = await axios.post(
    `${API_BASE}/connections`,
    {
      receiverId: 'alumni@mentorbridge.com',
      message: 'I would like to connect with you for mentorship.',
    },
    { headers: { Authorization: `Bearer ${tokens.student}` } },
  );
  if (!res.data.data.id) throw new Error('Connection not created');
  if (res.data.data.status !== 'pending') throw new Error('Wrong status');
});

test('Get All Connections', async () => {
  const res = await axios.get(`${API_BASE}/connections`, {
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

test('Get Pending Requests', async () => {
  const res = await axios.get(`${API_BASE}/connections/pending`, {
    headers: { Authorization: `Bearer ${tokens.student}` },
  });
  if (!Array.isArray(res.data.data)) throw new Error('Not an array');
});

// ANALYTICS TESTS
console.log('\n📊 ==================== ANALYTICS TESTS ====================');

test('Get User Statistics', async () => {
  const res = await axios.get(`${API_BASE}/analytics/users`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  if (!res.data.data.totalUsers) throw new Error('No user stats');
});

test('Get Engagement Metrics', async () => {
  const res = await axios.get(`${API_BASE}/analytics/engagement`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  if (!res.data.data) throw new Error('No engagement data');
});

test('Get Platform Health', async () => {
  const res = await axios.get(`${API_BASE}/analytics/platform`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  if (!res.data.data) throw new Error('No platform data');
});

test('Get Dashboard Summary', async () => {
  const res = await axios.get(`${API_BASE}/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${tokens.admin}` },
  });
  if (!res.data.data) throw new Error('No dashboard data');
});

// AUTHORIZATION TESTS
console.log('\n🔒 ==================== AUTHORIZATION TESTS ====================');

test('Student Cannot Access Admin Analytics', async () => {
  try {
    await axios.get(`${API_BASE}/analytics/users`, {
      headers: { Authorization: `Bearer ${tokens.student}` },
    });
    throw new Error('Should have been denied');
  } catch (err) {
    if (err.response?.status === 403) return; // Expected
    throw err;
  }
});

test('Unauthorized Request Without Token', async () => {
  try {
    await axios.get(`${API_BASE}/profiles/student@mentorbridge.com`);
    throw new Error('Should have been denied');
  } catch (err) {
    if (err.response?.status === 401) return; // Expected
    throw err;
  }
});

// FINAL REPORT
console.log('\n\n📋 ==================== TEST REPORT ====================');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
console.log(`✨ Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

if (testResults.errors.length > 0) {
  console.log('\n❌ Failed Tests:');
  testResults.errors.forEach(err => console.log(`   - ${err}`));
}

process.exit(testResults.failed > 0 ? 1 : 0);
