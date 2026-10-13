const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function auditDatabase() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`Found ${tableNames.length} tables in MySQL database SMS.`);

    const dbStructure = {};

    for (const table of tableNames) {
      const [columns] = await pool.query(`SHOW FULL COLUMNS FROM \`${table}\``);
      const [createTableResult] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
      const createTableSql = createTableResult[0]['Create Table'];
      
      dbStructure[table] = {
        columns: columns.map(c => ({
          field: c.Field,
          type: c.Type,
          null: c.Null,
          key: c.Key,
          default: c.Default,
          extra: c.Extra,
          comment: c.Comment
        })),
        createSql: createTableSql
      };
    }

    fs.writeFileSync(
      path.join(__dirname, 'actual-db-structure.json'),
      JSON.stringify(dbStructure, null, 2),
      'utf8'
    );

    console.log('Successfully exported actual MySQL DB structure to actual-db-structure.json');

    // Generate accurate schema.sql from actual MySQL live schema
    let completeSchemaSql = `-- ==========================================================\n`;
    completeSchemaSql += `-- School Management System (SMS) - Live Database Schema\n`;
    completeSchemaSql += `-- Database: SMS\n`;
    completeSchemaSql += `-- Generated: ${new Date().toISOString()}\n`;
    completeSchemaSql += `-- ==========================================================\n\n`;
    completeSchemaSql += `CREATE DATABASE IF NOT EXISTS \`SMS\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    completeSchemaSql += `USE \`SMS\`;\n\n`;
    completeSchemaSql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const [table, info] of Object.entries(dbStructure)) {
      completeSchemaSql += `-- ----------------------------------------------------------\n`;
      completeSchemaSql += `-- Table structure for table \`${table}\`\n`;
      completeSchemaSql += `-- ----------------------------------------------------------\n`;
      completeSchemaSql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      completeSchemaSql += `${info.createSql};\n\n`;
    }

    completeSchemaSql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    fs.writeFileSync(
      path.join(__dirname, '../../../database/schema.sql'),
      completeSchemaSql,
      'utf8'
    );

    console.log('Successfully updated database/schema.sql with 100% accurate MySQL table definitions.');
    process.exit(0);
  } catch (err) {
    console.error('Audit failed:', err);
    process.exit(1);
  }
}

auditDatabase();
