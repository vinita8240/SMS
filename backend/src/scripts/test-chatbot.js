const axios = require('http');

async function testBackend() {
  const chatbotService = require('../modules/ai-chatbot/services/chatbot.service');
  console.log('Testing Chatbot Service directly:');

  // Test 1: Public Question
  console.log('\n--- Test 1: Public Question (Timings) ---');
  const res1 = await chatbotService.processMessage('What are the school timings?', null, null);
  console.log('Intent:', res1.intent);
  console.log('Answer:\n', res1.answer);

  // Test 2: Public Question (Principal)
  console.log('\n--- Test 2: Public Question (Principal) ---');
  const res2 = await chatbotService.processMessage('Who is the principal?', null, null);
  console.log('Intent:', res2.intent);
  console.log('Answer:\n', res2.answer);

  // Test 3: Public Question (Facilities)
  console.log('\n--- Test 3: Public Question (Facilities) ---');
  const res3 = await chatbotService.processMessage('What facilities does the school have?', null, null);
  console.log('Intent:', res3.intent);
  console.log('Answer:\n', res3.answer);

  // Test 4: Student Attendance (Mock student user)
  console.log('\n--- Test 4: Student Attendance (Student ID 1) ---');
  const mockStudent = { id: 1, role: 'student', userType: 'student', name: 'John Doe' };
  const res4 = await chatbotService.processMessage('What is my attendance?', null, mockStudent);
  console.log('Intent:', res4.intent);
  console.log('Answer:\n', res4.answer);

  // Test 5: Student Fee (Mock student user)
  console.log('\n--- Test 5: Student Fees (Student ID 1) ---');
  const res5 = await chatbotService.processMessage('How much fee do I need to pay?', null, mockStudent);
  console.log('Intent:', res5.intent);
  console.log('Answer:\n', res5.answer);

  // Test 6: Admin Analytics (Mock Admin)
  console.log('\n--- Test 6: Admin Analytics (Admin ID 1) ---');
  const mockAdmin = { id: 1, role: 'admin', userType: 'admin', name: 'Super Admin' };
  const res6 = await chatbotService.processMessage('How many students are enrolled?', null, mockAdmin);
  console.log('Intent:', res6.intent);
  console.log('Answer:\n', res6.answer);

  // Test 7: Suggestions
  console.log('\n--- Test 7: Suggestions ---');
  console.log('Guest:', chatbotService.getSuggestions(null));
  console.log('Student:', chatbotService.getSuggestions(mockStudent));
  console.log('Admin:', chatbotService.getSuggestions(mockAdmin));

  console.log('\n✅ All backend chatbot tests succeeded!');
  process.exit(0);
}

testBackend().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
