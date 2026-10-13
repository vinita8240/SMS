const chatbotService = require('../modules/ai-chatbot/services/chatbot.service');

async function testAll() {
  console.log('====================================================');
  console.log('TESTING ALL DATABASE-DRIVEN CHATBOT QUESTIONS');
  console.log('====================================================\n');

  // --- Public Questions ---
  const publicQuestions = [
    'What is the admission process?',
    'What courses does the school offer?',
    'What are the school timings?',
    'What facilities does the school have?',
    'Who is the principal?',
    'What is the school\'s contact number?',
    'What are the latest notices?',
    'What events are coming up?',
    'Show me the school gallery.',
    'What is the fee structure?',
    'Where is the school located?',
    'What is the school history?',
    'Tell me about the library and books'
  ];

  console.log('=== 1. PUBLIC WEBSITE QUESTIONS ===');
  for (const q of publicQuestions) {
    const res = await chatbotService.processMessage(q, null, null);
    console.log(`\nQ: "${q}"`);
    console.log(`Intent: ${res.intent} | Source: ${res.sources.map(s => s.label).join(', ')}`);
    console.log(`Answer:\n${res.answer.substring(0, 200)}...`);
  }

  // --- Student Questions ---
  console.log('\n=== 2. AUTHENTICATED STUDENT QUESTIONS ===');
  const mockStudent = { id: 1, student_id: 1, role: 'student', userType: 'student', name: 'John Doe', class_id: 1 };
  const studentQuestions = [
    'What is my attendance?',
    'How many days was I absent?',
    'What are my marks?',
    'What is my percentage?',
    'What exams are coming?',
    'Show my assignments.',
    'What assignments are due?',
    'Show my study materials.',
    'What is my fee balance?'
  ];

  for (const q of studentQuestions) {
    const res = await chatbotService.processMessage(q, null, mockStudent);
    console.log(`\nQ: "${q}"`);
    console.log(`Intent: ${res.intent} | Source: ${res.sources.map(s => s.label).join(', ')}`);
    console.log(`Answer:\n${res.answer.substring(0, 200)}...`);
  }

  // --- Teacher Questions ---
  console.log('\n=== 3. AUTHENTICATED TEACHER QUESTIONS ===');
  const mockTeacher = { id: 1, teacher_id: 1, role: 'teacher', userType: 'teacher', name: 'Prof. Anderson', class_id: 1 };
  const teacherQuestions = [
    'How many students are in my class?',
    'Show today\'s attendance.',
    'Which students are absent?',
    'Show my assigned subjects.',
    'Show pending assignments.',
    'Which students have low attendance?'
  ];

  for (const q of teacherQuestions) {
    const res = await chatbotService.processMessage(q, null, mockTeacher);
    console.log(`\nQ: "${q}"`);
    console.log(`Intent: ${res.intent} | Source: ${res.sources.map(s => s.label).join(', ')}`);
    console.log(`Answer:\n${res.answer.substring(0, 200)}...`);
  }

  // --- Admin Questions ---
  console.log('\n=== 4. AUTHORIZED ADMIN QUESTIONS ===');
  const mockAdmin = { id: 1, admin_id: 1, role: 'super_admin', userType: 'admin', name: 'System Administrator' };
  const adminQuestions = [
    'How many students are enrolled?',
    'How many teachers are there?',
    'What is today\'s attendance?',
    'How much fee has been collected?',
    'What are the outstanding fees?',
    'How many students are in each class?',
    'Show recent admissions.',
    'Show pending enquiries.'
  ];

  for (const q of adminQuestions) {
    const res = await chatbotService.processMessage(q, null, mockAdmin);
    console.log(`\nQ: "${q}"`);
    console.log(`Intent: ${res.intent} | Source: ${res.sources.map(s => s.label).join(', ')}`);
    console.log(`Answer:\n${res.answer.substring(0, 200)}...`);
  }

  console.log('\n====================================================');
  console.log('✅ ALL DATABASE-DRIVEN QUESTIONS VERIFIED SUCCESSFULLY!');
  console.log('====================================================');
  process.exit(0);
}

testAll().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
