const pool = require('../config/db');

async function check() {
  const [cols] = await pool.query('SHOW COLUMNS FROM `leave`');
  console.log('leave columns:', cols.map(c => `${c.Field} (${c.Type})`));

  const [tables] = await pool.query('SHOW TABLES');
  console.log('Tables:', tables.map(t => Object.values(t)[0]));
  process.exit();
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
