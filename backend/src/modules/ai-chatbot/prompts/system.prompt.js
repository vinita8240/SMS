/**
 * AI School Chatbot - System Prompt & Guidelines
 */

const SYSTEM_PROMPT = `
You are the official AI Assistant for St. Lawrence High School's School Management System (SMS).
Your role is to provide accurate, helpful, friendly, and database-verified information to Students, Parents, Teachers, Administrators, and Public Visitors.

CRITICAL RULES:
1. ONLY use authoritative data provided by the query tools. Never invent or hallucinate student grades, attendance statistics, fee numbers, or exam dates.
2. If financial amounts (fees, payments, discounts) or attendance statistics are provided in the data, present the exact numbers provided by the authoritative backend calculations.
3. For unauthorized or unauthenticated queries regarding personal records (e.g. asking for private student attendance without being logged in), politely advise the user to log in to their student, parent, teacher, or admin portal.
4. Keep answers concise, clear, well-structured, and easy to read using Markdown (bold keys, bullet points, and neat tables when appropriate).
5. Always maintain a professional, courteous, and encouraging tone suitable for an educational institution.
`;

const INTENT_DEFINITIONS = {
  PUBLIC_INFORMATION: 'Queries about school overview, mission, history, principal message, contact details, timings, admission process, and facilities.',
  STUDENT_ATTENDANCE: 'Student asking for their own attendance percentage, present days, absent count, or monthly attendance breakdown.',
  STUDENT_MARKS: 'Student asking for their exam marks, grades, report card, or specific subject scores.',
  STUDENT_FEES: 'Student asking for their fee structure, total fee, amount paid, discount, or outstanding balance.',
  STUDENT_ASSIGNMENTS: 'Student asking for pending or upcoming homework assignments, due dates, and submissions.',
  STUDENT_MATERIALS: 'Student asking for study materials, syllabus documents, notes, or reference documents.',
  STUDENT_EXAMS: 'Student asking for upcoming exam schedules, routine, and exam details.',
  STUDENT_PROFILE: 'Student asking for their profile, roll number, section, category, or admission details.',
  PARENT_CHILD_ATTENDANCE: 'Parent asking for their linked child\'s attendance summary, absent dates, or percentage.',
  PARENT_CHILD_MARKS: 'Parent asking for their child\'s marks, grades, or exam performance.',
  PARENT_CHILD_FEES: 'Parent asking for their child\'s fee balance, pending invoices, or payment receipts.',
  PARENT_CHILD_ASSIGNMENTS: 'Parent asking for homework, pending tasks, or exams assigned to their child.',
  TEACHER_ATTENDANCE: 'Teacher asking for today\'s class attendance, list of absentees, or attendance registers.',
  TEACHER_STUDENTS: 'Teacher asking for student counts, list of students in their assigned class/section, or student performance.',
  TEACHER_MARKS: 'Teacher asking for subject averages, top scorers, or exam mark entry status.',
  TEACHER_ASSIGNMENTS: 'Teacher asking for assignments they created, pending submissions, or due dates.',
  TEACHER_SUBJECTS: 'Teacher asking for their assigned subjects, classes, or teaching timetable.',
  ADMIN_ANALYTICS: 'Administrator asking for total student enrollment, teacher counts, fee collection summaries, class-wise distribution, or recent admissions.',
  NOTICE_SEARCH: 'Queries looking for recent school notices, official announcements, or circulars.',
  EVENT_SEARCH: 'Queries looking for upcoming events, sports day, annual function, holidays, or academic calendar.',
  CMS_SEARCH: 'Queries regarding school news, photo gallery, facilities, campus tours, or custom CMS web pages.',
  GENERAL_GREETING: 'User saying hello, hi, how are you, thank you, or asking what the chatbot can do.'
};

module.exports = {
  SYSTEM_PROMPT,
  INTENT_DEFINITIONS
};
