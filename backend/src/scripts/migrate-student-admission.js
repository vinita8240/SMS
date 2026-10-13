const db = require('../config/db');

async function addMissingCols() {
  const [cols] = await db.query('DESCRIBE student');
  const existing = cols.map(c => c.Field.toLowerCase());

  const fieldsToAdd = [
    { name: 'first_name', def: 'VARCHAR(100) NULL' },
    { name: 'last_name', def: 'VARCHAR(100) NULL' },
    { name: 'caste', def: 'VARCHAR(100) NULL' },
    { name: 'height', def: 'VARCHAR(50) NULL' },
    { name: 'weight', def: 'VARCHAR(50) NULL' },
    { name: 'measurement_date', def: 'DATE NULL' },
    { name: 'medical_history', def: 'TEXT NULL' },
    { name: 'father_phone', def: 'VARCHAR(50) NULL' },
    { name: 'father_occupation', def: 'VARCHAR(100) NULL' },
    { name: 'father_photo', def: 'VARCHAR(255) NULL' },
    { name: 'mother_phone', def: 'VARCHAR(50) NULL' },
    { name: 'mother_occupation', def: 'VARCHAR(100) NULL' },
    { name: 'mother_photo', def: 'VARCHAR(255) NULL' },
    { name: 'guardian_is', def: "VARCHAR(50) NULL DEFAULT 'Father'" },
    { name: 'guardian_name', def: 'VARCHAR(191) NULL' },
    { name: 'guardian_relation', def: 'VARCHAR(100) NULL' },
    { name: 'guardian_phone', def: 'VARCHAR(50) NULL' },
    { name: 'guardian_occupation', def: 'VARCHAR(100) NULL' },
    { name: 'guardian_email', def: 'VARCHAR(191) NULL' },
    { name: 'guardian_photo', def: 'VARCHAR(255) NULL' },
    { name: 'guardian_address', def: 'TEXT NULL' },
    { name: 'pickup_point', def: 'VARCHAR(191) NULL' },
    { name: 'fees_month', def: 'VARCHAR(100) NULL' },
    { name: 'route_id', def: 'INT(11) NULL' },
    { name: 'hostel_id', def: 'INT(11) NULL' },
    { name: 'room_no', def: 'VARCHAR(50) NULL' },
    { name: 'bank_name', def: 'VARCHAR(191) NULL' },
    { name: 'bank_account_no', def: 'VARCHAR(100) NULL' },
    { name: 'ifsc_code', def: 'VARCHAR(50) NULL' },
    { name: 'national_id', def: 'VARCHAR(100) NULL' },
    { name: 'local_id', def: 'VARCHAR(100) NULL' }
  ];

  for (const f of fieldsToAdd) {
    if (!existing.includes(f.name.toLowerCase())) {
      await db.query(`ALTER TABLE student ADD COLUMN ${f.name} ${f.def}`);
      console.log(`Added column ${f.name}`);
    }
  }

  // Populate first_name and last_name from name for existing rows
  await db.query(`
    UPDATE student 
    SET first_name = SUBSTRING_INDEX(name, ' ', 1),
        last_name = CASE WHEN INSTR(name, ' ') > 0 THEN SUBSTRING(name, INSTR(name, ' ') + 1) ELSE '' END
    WHERE first_name IS NULL OR first_name = ''
  `);

  console.log('✅ Student table columns verified and up-to-date');
  process.exit(0);
}

addMissingCols().catch(err => {
  console.error(err);
  process.exit(1);
});
