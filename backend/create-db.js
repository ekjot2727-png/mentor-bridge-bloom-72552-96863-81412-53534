const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default postgres db first
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Create database if it doesn't exist
    await client.query('CREATE DATABASE mentor_bridge_bloom;');
    console.log('✅ Database "mentor_bridge_bloom" created successfully!');
  } catch (err) {
    if (err.code === '23505' || err.message.includes('already exists')) {
      console.log('✅ Database "mentor_bridge_bloom" already exists!');
    } else {
      console.error('Error:', err.message);
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
