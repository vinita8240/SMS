const pool = require('../config/db');

async function seed() {
  const [existing] = await pool.query('SELECT * FROM student WHERE name LIKE ?', ['%Samarth%']);
  let studentId;
  if (existing.length === 0) {
    const [res] = await pool.query(
      `INSERT INTO student (admission_no, roll_no, name, first_name, last_name, email, class_id, section_id, gender, session, status)
       VALUES ('ADM-2026-088', '1008', 'Samarth Maurya', 'Samarth', 'Maurya', 'samarth@school.edu', 1, 1, 'Male', '2026-2027', 'active')`
    );
    studentId = res.insertId;
    console.log('Inserted Samarth Maurya (ID:', studentId, ')');
  } else {
    studentId = existing[0].student_id;
    console.log('Samarth Maurya already exists with ID:', studentId);
  }

  // Seed sample attendance
  const [att] = await pool.query('SELECT * FROM attendance WHERE student_id = ?', [studentId]);
  if (att.length === 0) {
    await pool.query(
      `INSERT INTO attendance (student_id, class_id, section_id, status, date) VALUES
       (?, 1, 1, 1, '2026-09-01'),
       (?, 1, 1, 1, '2026-09-02'),
       (?, 1, 1, 0, '2026-09-03'),
       (?, 1, 1, 1, '2026-09-04'),
       (?, 1, 1, 1, '2026-09-05')`,
      [studentId, studentId, studentId, studentId, studentId]
    );
    console.log('Seeded attendance for Samarth Maurya');
  }

  // Seed sample mark
  const [marks] = await pool.query('SELECT * FROM mark WHERE student_id = ?', [studentId]);
  if (marks.length === 0) {
    await pool.query(
      `INSERT INTO mark (student_id, subject_id, class_id, section_id, exam_id, mark_obtained, mark_total, grade, comment) VALUES
       (?, 1, 1, 1, 1, 88.50, 100.00, 'A', 'Excellent performance'),
       (?, 2, 1, 1, 1, 92.00, 100.00, 'A+', 'Outstanding problem solving')`,
      [studentId, studentId]
    );
    console.log('Seeded marks for Samarth Maurya');
  }

  // Seed sample invoice
  const [inv] = await pool.query('SELECT * FROM invoice WHERE student_id = ?', [studentId]);
  if (inv.length === 0) {
    await pool.query(
      `INSERT INTO invoice (student_id, title, description, amount, amount_paid, due, status, due_date, year) VALUES
       (?, 'Term 1 Tuition & Lab Fee', 'Academic tuition fee for Term 1', 12500.00, 10000.00, 2500.00, 'partially_paid', '2026-10-15', '2026-2027')`,
      [studentId]
    );
    console.log('Seeded invoice for Samarth Maurya');
  }

  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
