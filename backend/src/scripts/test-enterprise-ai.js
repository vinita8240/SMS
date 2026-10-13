const chatbotService = require('../modules/ai-chatbot/services/chatbot.service');
const pool = require('../config/db');

async function runTests() {
  console.log('🚀 Starting Enterprise AI Chatbot Test Suite...\n');
  let passed = 0;
  let failed = 0;

  async function testCase(num, title, query, user = null, conversationId = null, validate = null) {
    try {
      const res = await chatbotService.processMessage(query, conversationId, user);
      let isValid = true;
      if (validate) {
        isValid = validate(res);
      } else {
        isValid = res.answer && res.answer.length > 10;
      }

      if (isValid) {
        console.log(`✅ [Test ${num}] ${title}: PASSED`);
        console.log(`   Intent: ${res.intent}`);
        console.log(`   Preview: ${res.answer.replace(/\n/g, ' ').substring(0, 95)}...\n`);
        passed++;
        return res;
      } else {
        console.log(`❌ [Test ${num}] ${title}: FAILED validation`);
        console.log(`   Response: ${res.answer}\n`);
        failed++;
        return res;
      }
    } catch (err) {
      console.log(`❌ [Test ${num}] ${title}: ERROR - ${err.message}\n`);
      failed++;
      return null;
    }
  }

  // --- PUBLIC WEBSITE TESTS ---
  await testCase(1, 'Public: Admission Process', 'What is the admission process?');
  await testCase(2, 'Public: Courses & Subjects', 'What courses does the school offer?');
  await testCase(3, 'Public: School Timings', 'What are the school timings?');
  await testCase(4, 'Public: Campus Facilities', 'What facilities does the school have?');
  await testCase(5, 'Public: Principal', 'Who is the principal?');
  await testCase(6, 'Public: Contact & Address', 'Where is the school located and what is contact number?');
  await testCase(7, 'Public: Latest Notices', 'What are the latest notices?');
  await testCase(8, 'Public: Upcoming Events', 'What events are coming up?');
  await testCase(9, 'Public: Photo Gallery', 'Show me the school gallery');
  await testCase(10, 'Public: Fee Structure', 'What is the fee structure?');
  await testCase(11, 'Public: Library Search', 'Do you have physics books in library?');
  await testCase(12, 'Public: Transport Routes', 'What bus routes are available?');

  // --- CONVERSATION & MEMORY FOLLOW-UP TESTS ---
  const convId = `test_conv_${Date.now()}`;
  const r13 = await testCase(13, 'Entity Search: Samarth Maurya', 'Samarth Maurya is in which class', null, convId, (r) => r.answer.includes('Samarth Maurya'));
  await testCase(14, 'Context Follow-up 1: His Attendance', 'What is his attendance?', null, convId, (r) => r.answer.includes('attendance') || r.answer.includes('working days'));
  await testCase(15, 'Context Follow-up 2: His Marks', 'What are his marks?', null, convId, (r) => r.answer.includes('examination') || r.answer.includes('Score') || r.answer.includes('marks'));
  await testCase(16, 'Context Follow-up 3: Class Teacher', 'Who is his class teacher?', null, convId, (r) => r.answer.includes('class teacher') || r.answer.includes('Faculty') || r.answer.includes('Teacher'));

  // --- AUTHENTICATED STUDENT TESTS ---
  const studentUser = { id: 1, role: 'student', name: 'Samarth Maurya', class_id: 1 };
  await testCase(17, 'Student Portal: My Attendance', 'What is my attendance?', studentUser, null, (r) => r.answer.includes('attendance'));
  await testCase(18, 'Student Portal: My Marks', 'What are my marks?', studentUser, null, (r) => r.answer.includes('Score') || r.answer.includes('Grade') || r.answer.includes('examination'));
  await testCase(19, 'Student Portal: Fee Balance', 'How much fee do I need to pay?', studentUser, null, (r) => r.answer.includes('₹') || r.answer.includes('Fee'));
  await testCase(20, 'Student Portal: Due Assignments', 'What assignments are due?', studentUser);

  // --- AUTHENTICATED TEACHER TESTS ---
  const teacherUser = { id: 1, role: 'teacher', name: 'John Doe Teacher', class_id: 1 };
  await testCase(21, 'Teacher Portal: Class Attendance', 'Show today\'s attendance', teacherUser);
  await testCase(22, 'Teacher Portal: Low Attendance', 'Which students have low attendance?', teacherUser);
  await testCase(23, 'Teacher Portal: Subject Performance', 'What is the average mark for my class?', teacherUser);

  // --- AUTHENTICATED ADMIN TESTS ---
  const adminUser = { id: 1, role: 'admin', name: 'Super Administrator' };
  await testCase(24, 'Admin Portal: Enrolled Stats', 'How many students are enrolled?', adminUser, null, (r) => r.answer.includes('Total Enrolled Students'));
  await testCase(25, 'Admin Portal: Fee Revenue Summary', 'How much fee has been collected?', adminUser, null, (r) => r.answer.includes('Financial & Revenue Summary'));
  await testCase(26, 'Admin Portal: School Attendance Today', 'What is today\'s school attendance?', adminUser, null, (r) => r.answer.includes('School-wide Attendance Summary'));

  console.log('==================================================');
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('==================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
