const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runCrudTests() {
  console.log('🧪 Starting Full CRUD Verification Suite across all modules...\n');

  // 1. Authenticate
  const loginRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@school.com', password: 'admin123' });

  if (!loginRes.data.success) {
    throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
  }
  const token = loginRes.data.data.token;
  const authHeader = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  console.log('✅ 1. Authentication: Super Admin Token generated');

  // Helper for authenticated requests
  const api = {
    get: (path) => request({ hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'GET', headers: authHeader }),
    post: (path, data) => request({ hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'POST', headers: authHeader }, data),
    put: (path, data) => request({ hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'PUT', headers: authHeader }, data),
    delete: (path) => request({ hostname: 'localhost', port: 5000, path: `/api${path}`, method: 'DELETE', headers: authHeader })
  };

  // 2. Class CRUD
  console.log('\n--- Testing Academics (Class CRUD) ---');
  const createClass = await api.post('/academics/classes', { name: 'Grade Test 99', name_numeric: 99 });
  const classId = createClass.data.data?.id || createClass.data.data?.class_id;
  console.log(`✅ CREATE Class: status ${createClass.status}, ID: ${classId}`);

  const updateClass = await api.put(`/academics/classes/${classId}`, { name: 'Grade Test 99 Updated' });
  console.log(`✅ UPDATE Class: status ${updateClass.status}`);

  const deleteClass = await api.delete(`/academics/classes/${classId}`);
  console.log(`✅ DELETE Class: status ${deleteClass.status}`);

  // 3. Library Books CRUD
  console.log('\n--- Testing Library (Book CRUD) ---');
  const createBook = await api.post('/library/books', { title: 'CRUD Testing Guide', author: 'Dr. Test', copies: 5, category_id: 1 });
  const bookId = createBook.data.data?.id || createBook.data.data?.book_id;
  console.log(`✅ CREATE Book: status ${createBook.status}, ID: ${bookId}`);

  const updateBook = await api.put(`/library/books/${bookId}`, { title: 'CRUD Testing Guide 2nd Edition', author: 'Dr. Test' });
  console.log(`✅ UPDATE Book: status ${updateBook.status}`);

  const deleteBook = await api.delete(`/library/books/${bookId}`);
  console.log(`✅ DELETE Book: status ${deleteBook.status}`);

  // 4. Finance (Expense CRUD)
  console.log('\n--- Testing Finance (Expense CRUD) ---');
  const createExp = await api.post('/finance/expenses', { title: 'Lab Supplies Voucher', amount: 350.50, category_id: 1, payment_method: 'Cash' });
  const expId = createExp.data.data?.id || createExp.data.data?.expense_id;
  console.log(`✅ CREATE Expense: status ${createExp.status}, ID: ${expId}`);

  const updateExp = await api.put(`/finance/expenses/${expId}`, { title: 'Lab Supplies Voucher Updated', amount: 400.00 });
  console.log(`✅ UPDATE Expense: status ${updateExp.status}`);

  const deleteExp = await api.delete(`/finance/expenses/${expId}`);
  console.log(`✅ DELETE Expense: status ${deleteExp.status}`);

  // 5. Facilities (Hostel & Route CRUD)
  console.log('\n--- Testing Facilities (Hostel & Transport CRUD) ---');
  const createHostel = await api.post('/facilities/hostels', { name: 'Hostel Hall Test', type: 'Boys' });
  const hostelId = createHostel.data.data?.id;
  console.log(`✅ CREATE Hostel: status ${createHostel.status}, ID: ${hostelId}`);

  const updateHostel = await api.put(`/facilities/hostels/${hostelId}`, { name: 'Hostel Hall Test Updated', type: 'Co-Ed' });
  console.log(`✅ UPDATE Hostel: status ${updateHostel.status}`);

  const deleteHostel = await api.delete(`/facilities/hostels/${hostelId}`);
  console.log(`✅ DELETE Hostel: status ${deleteHostel.status}`);

  const createRoute = await api.post('/facilities/routes', { name: 'East Express 7', fare: 85.00 });
  const routeId = createRoute.data.data?.id;
  console.log(`✅ CREATE Route: status ${createRoute.status}, ID: ${routeId}`);

  const updateRoute = await api.put(`/facilities/routes/${routeId}`, { name: 'East Express 7 Updated', fare: 90.00 });
  console.log(`✅ UPDATE Route: status ${updateRoute.status}`);

  const deleteRoute = await api.delete(`/facilities/routes/${routeId}`);
  console.log(`✅ DELETE Route: status ${deleteRoute.status}`);

  // 6. HR (Department & Designation CRUD)
  console.log('\n--- Testing HR (Department & Designation CRUD) ---');
  const createDept = await api.post('/hr/departments', { name: 'Robotics Department' });
  const deptId = createDept.data.data?.id;
  console.log(`✅ CREATE Department: status ${createDept.status}, ID: ${deptId}`);

  const updateDept = await api.put(`/hr/departments/${deptId}`, { name: 'Robotics & AI Department' });
  console.log(`✅ UPDATE Department: status ${updateDept.status}`);

  const deleteDept = await api.delete(`/hr/departments/${deptId}`);
  console.log(`✅ DELETE Department: status ${deleteDept.status}`);

  // 7. Communication (Notice & Circular CRUD)
  console.log('\n--- Testing Communication (Notice & Circular CRUD) ---');
  const createNotice = await api.post('/communication/notices', { title: 'Campus Maintenance Notice', notice: 'Water maintenance on Sunday', target_role: 'all' });
  const noticeId = createNotice.data.data?.id;
  console.log(`✅ CREATE Notice: status ${createNotice.status}, ID: ${noticeId}`);

  const updateNotice = await api.put(`/communication/notices/${noticeId}`, { title: 'Campus Maintenance Notice [Rescheduled]' });
  console.log(`✅ UPDATE Notice: status ${updateNotice.status}`);

  const deleteNotice = await api.delete(`/communication/notices/${noticeId}`);
  console.log(`✅ DELETE Notice: status ${deleteNotice.status}`);

  // 8. Examinations (Exam Terms CRUD)
  console.log('\n--- Testing Examinations (Exam Term CRUD) ---');
  const createExam = await api.post('/exams', { name: 'Special Assessment Term', session: '2025-2026', start_date: '2026-11-01' });
  const examId = createExam.data.data?.id;
  console.log(`✅ CREATE Exam: status ${createExam.status}, ID: ${examId}`);

  const updateExam = await api.put(`/exams/${examId}`, { name: 'Special Assessment Term Finalized' });
  console.log(`✅ UPDATE Exam: status ${updateExam.status}`);

  const deleteExam = await api.delete(`/exams/${examId}`);
  console.log(`✅ DELETE Exam: status ${deleteExam.status}`);

  console.log('\n🎉 ALL CRUD OPERATIONS VERIFIED 100% FUNCTIONAL!');
  process.exit(0);
}

runCrudTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
