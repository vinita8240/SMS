const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

async function runMigration() {
    console.log('[Migration] Starting database migration...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        const rootDir = path.join(__dirname, '..', '..', '..');

        const migrationSql = fs.readFileSync(path.join(rootDir, 'database', 'migration.sql'), 'utf-8');
        console.log('[Migration] Executing migration.sql...');
        await connection.query(migrationSql);
        console.log('[Migration] Migration execution completed successfully.');
    } catch (err) {
        console.error('[Migration] Error during migration:', err);
    } finally {
        await connection.end();
    }
}

runMigration();