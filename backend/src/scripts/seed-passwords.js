const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function syncPasswords() {
  const hash = await bcrypt.hash('admin123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const parentHash = await bcrypt.hash('parent123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  await pool.query('UPDATE admin SET password = ?', [hash]);
  await pool.query('UPDATE teacher SET password = ?', [teacherHash]);
  await pool.query('UPDATE parent SET password = ?', [parentHash]);
  await pool.query('UPDATE student SET password = ?', [studentHash]);

  console.log('✅ Synchronized bcrypt password hashes for admin123, teacher123, parent123, student123 in database SMS');
  process.exit(0);
}

syncPasswords().catch(err => {
  console.error(err);
  process.exit(1);
});
