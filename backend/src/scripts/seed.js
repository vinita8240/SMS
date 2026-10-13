const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function runSeed() {
  console.log('[Seed] Starting database seeding...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_data',
    multipleStatements: true
  });

  try {
    const seedSql = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'seed.sql'), 'utf-8');
    console.log('[Seed] Executing seed.sql...');
    await connection.query(seedSql);
    console.log('[Seed] Seeding completed successfully.');
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
  } finally {
    await connection.end();
  }
}

runSeed();
