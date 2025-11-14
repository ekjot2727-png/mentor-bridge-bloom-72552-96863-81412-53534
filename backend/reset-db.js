const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default db first
});

async function resetDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Terminate all connections to the database
    console.log('Terminating connections...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = 'mentor_bridge_bloom'
        AND pid <> pg_backend_pid();
    `);
    console.log('✓ Connections terminated');

    // Drop existing database
    console.log('Dropping existing database...');
    await client.query('DROP DATABASE IF EXISTS mentor_bridge_bloom;');
    console.log('✓ Database dropped');

    // Create fresh database
    console.log('Creating new database...');
    await client.query('CREATE DATABASE mentor_bridge_bloom;');
    console.log('✓ Database created');

    console.log('\n✅ Database has been reset successfully!');
    console.log('   The backend will recreate the schema on next startup.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetDatabase();
