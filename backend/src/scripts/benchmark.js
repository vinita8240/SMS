const http = require('http');

async function test(path, token) {
  const start = Date.now();
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: token ? { 'Authorization': 'Bearer ' + token } : {}
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        console.log(`${path} -> ${res.statusCode} in ${time}ms (size: ${data.length} bytes)`);
        try {
          resolve({ status: res.statusCode, time, data: JSON.parse(data || '{}') });
        } catch {
          resolve({ status: res.statusCode, time, data });
        }
      });
    });
    req.on('error', (e) => {
      console.log(`${path} -> ERROR: ${e.message}`);
      resolve(null);
    });
    req.end();
  });
}

async function run() {
  console.log('Testing unauthenticated health:');
  await test('/health');

  // Login
  const startLogin = Date.now();
  const postData = JSON.stringify({ email: 'admin@school.com', password: 'admin123' });
  const loginReq = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', async () => {
      console.log(`/api/auth/login -> ${res.statusCode} in ${Date.now() - startLogin}ms`);
      try {
        const body = JSON.parse(d);
        if (body.data && body.data.token) {
          const token = body.data.token;
          console.log('\nTesting Authenticated Endpoints:');
          await test('/api/auth/me', token);
          await test('/api/dashboard', token);
          await test('/api/students?limit=10', token);
          await test('/api/teachers?limit=10', token);
          await test('/api/academics/classes', token);
          await test('/api/academics/subjects', token);
          await test('/api/finance/invoices?limit=10', token);
          await test('/api/library/books?limit=10', token);
          await test('/api/facilities/hostels', token);
          await test('/api/hr/leaves?limit=10', token);
        }
      } catch (e) {
        console.error('Login parsing error', e);
      }
    });
  });
  loginReq.write(postData);
  loginReq.end();
}

run();
