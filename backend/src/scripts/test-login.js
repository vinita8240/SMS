const http = require('http');

async function testLogin(username, password) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ username, password });
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          console.log(`[${username}] Status: ${res.statusCode} | Role: ${json.data?.role} | Name: ${json.data?.user?.name} | Msg: ${json.message}`);
        } catch (e) {
          console.log(`[${username}] Status: ${res.statusCode} | Raw: ${body}`);
        }
        resolve();
      });
    });
    req.on('error', (e) => {
      console.error(`[${username}] Error: ${e.message}`);
      resolve();
    });
    req.write(data);
    req.end();
  });
}

async function runAll() {
  console.log('--- Testing Backend Authentication ---');
  await testLogin('admin@school.com', 'admin123');
  await testLogin('superadmin', 'admin123');
  await testLogin('principal@school.com', 'admin123');
  await testLogin('admin', 'admin123');
  await testLogin('teacher@school.com', 'teacher123');
  await testLogin('teacher', 'admin123');
  await testLogin('accountant@school.com', 'admin123');
  await testLogin('receptionist@school.com', 'admin123');
  await testLogin('librarian@school.com', 'admin123');
  await testLogin('student@school.com', 'student123');
  await testLogin('parent@school.com', 'parent123');
  console.log('--- Completed ---');
  process.exit(0);
}

runAll();
