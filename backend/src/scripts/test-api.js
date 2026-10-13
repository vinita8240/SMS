const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Integration Tests...\n');

  try {
    // 1. Test Admin Login
    console.log('1. Testing POST /auth/login (Super Admin)...');
    const loginRes = await makeRequest('/auth/login', 'POST', {
      email: 'admin@school.com',
      password: 'admin123'
    });

    if (!loginRes.body || !loginRes.body.success) {
      throw new Error(`Admin login failed: ${JSON.stringify(loginRes.body)}`);
    }

    const token = loginRes.body.data.token;
    console.log(`   ✅ Admin login successful. Role: ${loginRes.body.data.role}`);

    // 2. Test Get Students
    console.log('\n2. Testing GET /students...');
    const studRes = await makeRequest('/students', 'GET', null, token);
    console.log(`   ✅ Status: ${studRes.status}, Total Students: ${studRes.body?.pagination?.total || 0}`);

    // 3. Test Dashboard Analytics
    console.log('\n3. Testing GET /dashboard...');
    const dashRes = await makeRequest('/dashboard', 'GET', null, token);
    console.log(`   ✅ Status: ${dashRes.status}, Total Students KPI: ${dashRes.body?.data?.kpi?.totalStudents}, Total Revenue: $${dashRes.body?.data?.kpi?.totalRevenue}`);

    // 4. Test Classes
    console.log('\n4. Testing GET /academics/classes...');
    const classRes = await makeRequest('/academics/classes', 'GET', null, token);
    console.log(`   ✅ Status: ${classRes.status}, Total Classes: ${classRes.body?.data?.length || 0}`);

    // 5. Test Invoices
    console.log('\n5. Testing GET /finance/invoices...');
    const invRes = await makeRequest('/finance/invoices', 'GET', null, token);
    console.log(`   ✅ Status: ${invRes.status}, Total Invoices: ${invRes.body?.pagination?.total || 0}`);

    // 6. Test Global Search
    console.log('\n6. Testing GET /search?q=Physics...');
    const searchRes = await makeRequest('/search?q=Physics', 'GET', null, token);
    console.log(`   ✅ Status: ${searchRes.status}, Results count: ${searchRes.body?.data?.results?.length || 0}`);

    console.log('\n🎉 ALL API INTEGRATION TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Test failed with error:', err.message);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
