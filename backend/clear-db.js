const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'mentor_bridge_bloom',
});

async function clearDatabase() {
  try {
    await client.connect();
    console.log('Connected to database: mentor_bridge_bloom');

    // Disable foreign key constraints temporarily
    await client.query('SET CONSTRAINTS ALL DEFERRED');

    // Delete data in order of dependencies
    console.log('Clearing all data...');
    
    await client.query('DELETE FROM analytics;');
    console.log('✓ Cleared analytics table');
    
    await client.query('DELETE FROM jobs;');
    console.log('✓ Cleared jobs table');
    
    await client.query('DELETE FROM events;');
    console.log('✓ Cleared events table');
    
    await client.query('DELETE FROM messages;');
    console.log('✓ Cleared messages table');
    
    await client.query('DELETE FROM connections;');
    console.log('✓ Cleared connections table');
    
    await client.query('DELETE FROM user_profiles;');
    console.log('✓ Cleared user_profiles table');
    
    await client.query('DELETE FROM users;');
    console.log('✓ Cleared users table');

    console.log('\n✅ All user data has been removed from the database!');
  } catch (err) {
    console.error('Error clearing database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearDatabase();
