class IntentService {
  /**
   * Alias for detectIntent to support AIProviderInterface
   */
  classify(message, user = null) {
    return this.detectIntent(message, user);
  }

  /**
   * Detect intent and extract entities from user's natural language message
   */
  detectIntent(message, user = null) {
    const raw = (message || '').trim();
    const text = raw.toLowerCase();
    const userRole = (user?.role || user?.userType || 'guest').toLowerCase();

    const entities = this.extractEntities(text, user);

    // 1. General Greetings & Small Talk
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|help|what can you do|assist me)\b/i.test(text) && text.split(/\s+/).length <= 4) {
      return { intent: 'GENERAL_GREETING', confidence: 0.98, entities };
    }

    // 1.1 Class Teacher Query ("Who is the class teacher of class 10", "who is his class teacher", "class teacher")
    if (/\b(class teacher|head teacher|homeroom teacher)\b/i.test(text)) {
      return { intent: 'CLASS_TEACHER', confidence: 0.98, entities };
    }

    // 1.2 Specific Student Lookup / Search ("Samarth Maurya is in which class", "Which class is Samarth Maurya in", "Find student Samarth")
    if (/(?:is in which class|which class is|what class is|class of|find student|lookup student|search student|who is)\s+([a-zA-Z\s]+)/i.test(raw) ||
        /([a-zA-Z\s]+?)\s+is in which class/i.test(raw)) {
      let queryName = '';
      const m1 = raw.match(/([a-zA-Z\s]+?)\s+is in which class/i);
      const m2 = raw.match(/(?:which class is|what class is|class of|find student|lookup student|search student|who is)\s+([a-zA-Z\s]+?)(?:\s+in|\s+studying|\?|$)/i);
      
      if (m1 && m1[1]) queryName = m1[1].trim();
      else if (m2 && m2[1]) queryName = m2[1].trim();

      const ignored = ['the principal', 'principal', 'the school', 'school', 'director', 'our school', 'the headmaster', 'headmaster', 'the class teacher', 'class teacher', 'his class teacher', 'her class teacher'];
      if (queryName && !ignored.includes(queryName.toLowerCase()) && queryName.length > 2) {
        entities.studentQuery = queryName;
        return { intent: 'STUDENT_SEARCH', confidence: 0.98, entities };
      }
    }


    // 2. Student / Parent / Teacher Attendance Queries
    if (/\b(attendance|absent|present|working days|absentee|absentees)\b/i.test(text) || text.includes('how many days was i absent')) {
      if (userRole === 'teacher') {
        if (text.includes('low') || text.includes('shortage') || text.includes('defaulter') || text.includes('below')) {
          return { intent: 'TEACHER_LOW_ATTENDANCE', confidence: 0.95, entities };
        }
        if (text.includes('class') || text.includes('today') || text.includes('absent')) {
          return { intent: 'TEACHER_ATTENDANCE', confidence: 0.95, entities };
        }
      }
      if (userRole === 'admin' || userRole === 'super_admin') {
        if (text.includes('today') || text.includes('school') || text.includes('overall') || text.includes('summary')) {
          return { intent: 'ADMIN_ATTENDANCE_SUMMARY', confidence: 0.95, entities };
        }
      }
      if (userRole === 'parent' || entities.childName) {
        return { intent: 'PARENT_CHILD_ATTENDANCE', confidence: 0.95, entities };
      }
      return { intent: 'STUDENT_ATTENDANCE', confidence: 0.95, entities };
    }

    // 3. Marks, Grades, Percentage & Exam Results
    if (/\b(mark|marks|score|scores|percentage|grade|grades|result|results|report card|gpa|cgpa)\b/i.test(text)) {
      if (userRole === 'teacher' && (text.includes('average') || text.includes('highest') || text.includes('class') || text.includes('subject'))) {
        return { intent: 'TEACHER_MARKS', confidence: 0.95, entities };
      }
      if (userRole === 'parent' || entities.childName) {
        return { intent: 'PARENT_CHILD_MARKS', confidence: 0.95, entities };
      }
      return { intent: 'STUDENT_MARKS', confidence: 0.95, entities };
    }

    // 4. Assignments & Homework (Checked before Fee Dues so "assignments due" goes here)
    if (/\b(assignment|assignments|homework|homeworks|task|tasks|project work|submission|submissions)\b/i.test(text)) {
      if (userRole === 'teacher') {
        return { intent: 'TEACHER_ASSIGNMENTS', confidence: 0.95, entities };
      }
      if (userRole === 'parent' || entities.childName) {
        return { intent: 'PARENT_CHILD_ASSIGNMENTS', confidence: 0.95, entities };
      }
      return { intent: 'STUDENT_ASSIGNMENTS', confidence: 0.95, entities };
    }

    // 5. Fees & Financial Ledgers
    if (/\b(fee|fees|due|dues|balance|invoice|invoices|payment|payments|pay|tuition|receipt|collected|outstanding)\b/i.test(text)) {
      if ((userRole === 'admin' || userRole === 'super_admin') && (text.includes('collected') || text.includes('total') || text.includes('outstanding') || text.includes('revenue') || text.includes('summary') || text.includes('how much'))) {
        return { intent: 'ADMIN_FEE_SUMMARY', confidence: 0.95, entities };
      }
      if (userRole === 'parent' || entities.childName) {
        return { intent: 'PARENT_CHILD_FEES', confidence: 0.95, entities };
      }
      if (userRole === 'student') {
        return { intent: 'STUDENT_FEES', confidence: 0.95, entities };
      }
      return { intent: 'PUBLIC_FEE_STRUCTURE', confidence: 0.9, entities };
    }

    // 6. Notices & Circulars (Checked before exams so "latest notices" doesn't hit "test")
    if (/\b(notice|notices|noticeboard|announcement|announcements|circular|circulars)\b/i.test(text)) {
      return { intent: 'NOTICE_SEARCH', confidence: 0.95, entities };
    }

    // 7. Study Materials & Syllabus
    if (/\b(material|materials|syllabus|syllabi|notes|study material|study materials|download notes)\b/i.test(text)) {
      return { intent: 'STUDENT_MATERIALS', confidence: 0.9, entities };
    }

    // 8. Exams & Schedules (Using precise word boundaries so "latest" doesn't match "test")
    if (/\b(exam|exams|examination|examinations|test|tests|routine|date sheet|datesheet|schedule|timetable|mid term|midterm|final exam)\b/i.test(text)) {
      return { intent: 'STUDENT_EXAMS', confidence: 0.9, entities };
    }

    // 9. General Student / Teacher count & stats (accessible to everyone)
    if (text.includes('how many students') || text.includes('total students') || text.includes('student count') || text.includes('enrolled students') || /how many student/i.test(text)) {
      return { intent: 'ADMIN_STUDENT_STATS', confidence: 0.95, entities };
    }
    if (text.includes('how many teacher') || text.includes('teacher count') || text.includes('total teacher') || text.includes('faculty count') || text.includes('how many teachers') || text.includes('total staff')) {
      return { intent: 'ADMIN_TEACHER_STATS', confidence: 0.95, entities };
    }

    // 9b. Admin Metrics & Inquiries (admin-specific detailed actions)
    if (userRole === 'admin' || userRole === 'super_admin') {
      if (text.includes('enrolled') || text.includes('student')) {
        return { intent: 'ADMIN_STUDENT_STATS', confidence: 0.92, entities };
      }
      if (text.includes('class') && (text.includes('distribution') || text.includes('each class') || text.includes('in each class'))) {
        return { intent: 'ADMIN_CLASS_DISTRIBUTION', confidence: 0.95, entities };
      }
      if (text.includes('recent admission') || text.includes('new admission')) {
        return { intent: 'ADMIN_RECENT_ADMISSIONS', confidence: 0.95, entities };
      }
      if (/\b(enquiry|enquiries|inquiry|inquiries)\b/i.test(text)) {
        return { intent: 'ADMIN_ENQUIRIES', confidence: 0.95, entities };
      }
    }

    // 10. Teacher Specific Class / Subject allocations
    if (userRole === 'teacher') {
      if (text.includes('subject') || text.includes('assigned')) {
        return { intent: 'TEACHER_SUBJECTS', confidence: 0.95, entities };
      }
      if (text.includes('my class') || text.includes('my student') || text.includes('how many student') || text.includes('roster')) {
        return { intent: 'TEACHER_STUDENTS', confidence: 0.95, entities };
      }
    }

    // 11. Admissions Process (Checked before general History/Vision)
    if (/\b(admission|admissions|apply|registration|enroll|enrollment|eligibility|admission open)\b/i.test(text)) {
      return { intent: 'PUBLIC_ADMISSION', confidence: 0.95, entities };
    }

    // 12. Courses, Subjects & Curriculum
    if (/\b(course|courses|offer|offers|offered|curriculum|subject|subjects|academic program|academic programs|streams|what do you teach)\b/i.test(text)) {
      return { intent: 'PUBLIC_COURSES', confidence: 0.95, entities };
    }

    // 13. School History & Founding
    if (/\b(history|establish|established|founded|background|story|origin|since when|vision|mission)\b/i.test(text)) {
      return { intent: 'PUBLIC_HISTORY', confidence: 0.95, entities };
    }

    // 14. School Location, Address & Directions
    if (/\b(where is|location|address|reach|direction|directions|situated|map|find the school)\b/i.test(text) || text.includes('where is the school')) {
      return { intent: 'PUBLIC_LOCATION', confidence: 0.95, entities };
    }

    // 15. School Timings & Operational Hours
    if (/\b(timing|timings|time|hours|open|close|start time|schedule time)\b/i.test(text)) {
      return { intent: 'PUBLIC_TIMINGS', confidence: 0.95, entities };
    }

    // 16. Principal, Leadership & Management
    if (/\b(principal|headmaster|director|head of school|leader)\b/i.test(text)) {
      return { intent: 'PUBLIC_PRINCIPAL', confidence: 0.95, entities };
    }

    // 17. Contact Details & Phone Numbers
    if (/\b(contact|phone|number|email|helpline|call|reach out)\b/i.test(text)) {
      return { intent: 'PUBLIC_CONTACT', confidence: 0.95, entities };
    }

    // 18. Campus Facilities, Laboratories & Infrastructure
    if (/\b(facility|facilities|lab|labs|robotics|smart class|smart classroom|infrastructure|sports complex|auditorium|ground|swimming)\b/i.test(text)) {
      return { intent: 'PUBLIC_FACILITIES', confidence: 0.95, entities };
    }

    // 19. Library & Books
    if (/\b(library|book|books|reading room|e-book)\b/i.test(text)) {
      return { intent: 'PUBLIC_LIBRARY', confidence: 0.95, entities };
    }

    // 20. Transport & Bus Service
    if (/\b(transport|bus|buses|route|routes|van|pick up|drop)\b/i.test(text)) {
      return { intent: 'PUBLIC_TRANSPORT', confidence: 0.95, entities };
    }

    // 21. Hostel & Dormitories
    if (/\b(hostel|dormitory|dormitories|boarding|room|rooms|stay)\b/i.test(text)) {
      return { intent: 'PUBLIC_HOSTEL', confidence: 0.95, entities };
    }

    // 22. Clubs & Extracurricular Activities
    if (/\b(club|clubs|activity|activities|extracurricular|music|drama|sports)\b/i.test(text)) {
      return { intent: 'PUBLIC_CLUBS', confidence: 0.95, entities };
    }

    // 23. Events & Calendar
    if (/\b(event|events|function|annual day|sports day|holiday|celebration|calendar)\b/i.test(text)) {
      return { intent: 'EVENT_SEARCH', confidence: 0.95, entities };
    }

    // 24. Photo Gallery & Campus Life
    if (/\b(gallery|photo|photos|picture|pictures|image|images|album|albums)\b/i.test(text)) {
      return { intent: 'CMS_GALLERY', confidence: 0.95, entities };
    }

    // 25. Staff / Teacher directory queries
    if (/\b(staff|faculty|teacher|teachers|professor|professors|lecturer|lecturers|department|departments|hr|human resource|employees|employee)\b/i.test(text)) {
      // Specific teacher name lookup
      if (entities.teacherName && text.length < 80) {
        return { intent: 'STAFF_SEARCH', confidence: 0.97, entities };
      }
      if (text.includes('how many') || text.includes('count') || text.includes('total') || text.includes('number of')) {
        return { intent: 'STAFF_STATS', confidence: 0.95, entities };
      }
      if (text.includes('list') || text.includes('show') || text.includes('all') || text.includes('who are')) {
        return { intent: 'STAFF_LIST', confidence: 0.93, entities };
      }
      if (text.includes('department')) {
        return { intent: 'STAFF_DEPARTMENTS', confidence: 0.93, entities };
      }
      return { intent: 'STAFF_LIST', confidence: 0.88, entities };
    }

    // Fallback: General School Information search
    return { intent: 'PUBLIC_INFORMATION', confidence: 0.8, entities };
  }

  /**
   * Extract entities like subjects, child names, numbers
   */
  extractEntities(text, user) {
    const entities = {
      subject: null,
      childName: null,
      examName: null,
      month: null,
      year: null,
      classNumber: null,
      rawQuery: text
    };

    // Common subjects
    const subjects = ['mathematics', 'math', 'physics', 'chemistry', 'biology', 'science', 'computer', 'ai', 'literature', 'english', 'history', 'geography', 'hindi', 'social studies'];
    for (const sub of subjects) {
      if (new RegExp(`\\b${sub}\\b`, 'i').test(text)) {
        if (sub === 'math') entities.subject = 'Mathematics';
        else if (sub === 'ai') entities.subject = 'Computer Science & AI';
        else entities.subject = sub.charAt(0).toUpperCase() + sub.slice(1);
        break;
      }
    }

    // Month extraction
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    for (let i = 0; i < months.length; i++) {
      if (new RegExp(`\\b${months[i]}\\b`, 'i').test(text)) {
        entities.month = i + 1;
        break;
      }
    }

    // Extract book search query e.g. "search book physics", "is chemistry book available"
    const bookMatch = text.match(/(?:book|books)\s+(?:for|on|about|named|titled)?\s*([a-zA-Z0-9\s]+)/i) ||
                      text.match(/(?:search|find|lookup)\s+([a-zA-Z0-9\s]+?)\s+(?:book|books)/i);
    if (bookMatch && bookMatch[1]) {
      const bTerm = bookMatch[1].replace(/\b(available|in library|please|can i get)\b/gi, '').trim();
      if (bTerm.length > 1) entities.bookQuery = bTerm;
    }

    // Extract teacher query
    const teacherMatch = text.match(/(?:teacher|mr|ms|mrs|dr|prof)\.?\s+([a-zA-Z]+)/i);
    if (teacherMatch && !['the', 'my', 'our', 'a', 'this'].includes(teacherMatch[1].toLowerCase())) {
      entities.teacherName = teacherMatch[1];
    }

    return entities;
  }
}

module.exports = new IntentService();

