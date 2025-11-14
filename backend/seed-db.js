const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  user: 'postgres',
  password: '12345678',
  host: 'localhost',
  port: 5432,
  database: 'mentor_bridge_bloom',
});

async function seedDatabase() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin@123', 10);
    const studentPassword = await bcrypt.hash('student@123', 10);
    const alumniPassword = await bcrypt.hash('alumni@123', 10);

    // Insert Admin User
    console.log('Creating admin user...');
    const adminResult = await client.query(
      `INSERT INTO users (email, password, role, status, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      ['admin@mentorbridge.com', adminPassword, 'admin', 'active', true]
    );
    const adminId = adminResult.rows[0].id;
    console.log('✓ Admin user created');

    // Insert Admin Profile
    await client.query(
      `INSERT INTO user_profiles (id, "firstName", "lastName", "profileType", "userId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
      ['Admin', 'Portal', 'student', adminId]
    );
    console.log('✓ Admin profile created');

    // Insert Student User
    console.log('Creating student user...');
    const studentResult = await client.query(
      `INSERT INTO users (email, password, role, status, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      ['student@mentorbridge.com', studentPassword, 'student', 'active', true]
    );
    const studentId = studentResult.rows[0].id;
    console.log('✓ Student user created');

    // Insert Student Profile
    await client.query(
      `INSERT INTO user_profiles (id, "firstName", "lastName", "profileType", "userId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
      ['John', 'Student', 'student', studentId]
    );
    console.log('✓ Student profile created');

    // Insert Alumni User
    console.log('Creating alumni user...');
    const alumniResult = await client.query(
      `INSERT INTO users (email, password, role, status, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      ['alumni@mentorbridge.com', alumniPassword, 'alumni', 'active', true]
    );
    const alumniId = alumniResult.rows[0].id;
    console.log('✓ Alumni user created');

    // Insert Alumni Profile
    await client.query(
      `INSERT INTO user_profiles (id, "firstName", "lastName", "profileType", "userId", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
      ['Sarah', 'Alumni', 'alumni', alumniId]
    );
    console.log('✓ Alumni profile created');

    console.log('\n✅ Database seeding completed!\n');
    console.log('📋 Test Accounts Created:');
    console.log('─'.repeat(60));
    console.log('\n🔐 ADMIN PORTAL:');
    console.log('   Email:    admin@mentorbridge.com');
    console.log('   Password: admin@123');
    console.log('   Role:     Admin');
    console.log('\n🎓 STUDENT PORTAL:');
    console.log('   Email:    student@mentorbridge.com');
    console.log('   Password: student@123');
    console.log('   Role:     Student');
    console.log('\n👥 ALUMNI PORTAL:');
    console.log('   Email:    alumni@mentorbridge.com');
    console.log('   Password: alumni@123');
    console.log('   Role:     Alumni');
    console.log('\n' + '─'.repeat(60));
  } catch (err) {
    console.error('Error seeding database:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase();
