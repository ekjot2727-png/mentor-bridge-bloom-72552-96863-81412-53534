const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'mentor_bridge_bloom',
});

async function checkData() {
  try {
    await client.connect();
    console.log('Checking database data...\n');

    const result = await client.query('SELECT id, email, role FROM users ORDER BY "createdAt"');
    console.log('Users in database:');
    console.log(result.rows);

    const profiles = await client.query('SELECT id, "userId", "firstName", "lastName", "profileType" FROM user_profiles');
    console.log('\nProfiles in database:');
    console.log(profiles.rows);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkData();
