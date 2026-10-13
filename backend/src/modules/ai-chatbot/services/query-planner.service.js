const studentTool = require('../tools/student.tool');
const attendanceTool = require('../tools/attendance.tool');
const marksTool = require('../tools/marks.tool');
const feesTool = require('../tools/fees.tool');
const assignmentTool = require('../tools/assignment.tool');
const materialTool = require('../tools/material.tool');
const examTool = require('../tools/exam.tool');
const noticeTool = require('../tools/notice.tool');
const eventTool = require('../tools/event.tool');
const cmsTool = require('../tools/cms.tool');
const teacherTool = require('../tools/teacher.tool');
const staffTool = require('../tools/staff.tool');
const classTool = require('../tools/class.tool');
const libraryTool = require('../tools/library.tool');
const transportTool = require('../tools/transport.tool');
const knowledgeTool = require('../tools/knowledge.tool');
const toolRegistry = require('../tools/tool.registry');
const permissionService = require('./permission.service');
const dateParserService = require('./date-parser.service');
const contextService = require('./context.service');

class QueryPlannerService {
  /**
   * Plan and execute approved data tools based on intent, conversational context, and user permissions
   */
  async planAndExecute(intentResult, user = null, originalMessage = '', conversationContext = {}) {
    const { intent, entities = {} } = intentResult;
    const userRole = (user?.role || user?.userType || 'guest').toLowerCase();
    const userId = user?.id || user?.student_id || user?.parent_id || user?.teacher_id || user?.admin_id;

    // Parse any natural language date mentions
    const parsedDate = dateParserService.parseDateRange(originalMessage);

    const plan = {
      intent,
      authorized: true,
      requiresAuth: false,
      sources: [],
      data: null,
      contextUpdates: {}
    };

    switch (intent) {
      // -------------------------------------------------------------
      // 1. GENERAL GREETINGS
      // -------------------------------------------------------------
      case 'GENERAL_GREETING': {
        const schoolInfo = await cmsTool.getSchoolInformation();
        plan.data = {
          greeting: true,
          schoolName: schoolInfo.schoolName,
          userRole,
          userName: user?.name || null
        };
        plan.sources.push({ type: 'cms', label: 'School Knowledge Base' });
        break;
      }

      // -------------------------------------------------------------
      // 1.1 STUDENT LOOKUP / SEARCH
      // -------------------------------------------------------------
      case 'STUDENT_SEARCH': {
        const query = entities.studentQuery || originalMessage;
        const students = await studentTool.findStudentByNameOrAdmission(query);
        plan.data = { query, students };
        plan.sources.push({ type: 'student', label: 'Student Enrollment Register' });

        if (students && students.length === 1) {
          plan.contextUpdates = {
            lastStudentId: students[0].student_id,
            lastStudentName: students[0].name,
            lastClassId: students[0].class_id,
            lastClassName: students[0].class_name
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 1.2 CLASS TEACHER LOOKUP
      // -------------------------------------------------------------
      case 'CLASS_TEACHER': {
        // Can be queried by class name or resolved from last student in context
        let targetClassId = entities.classNumber || conversationContext.lastClassId;
        
        if (!targetClassId && conversationContext.lastStudentId) {
          const profile = await studentTool.getStudentProfile(conversationContext.lastStudentId);
          if (profile) targetClassId = profile.class_id;
        }

        const classList = await classTool.getClassList();
        let matchedClass = null;
        if (targetClassId) {
          matchedClass = classList.find(c => c.class_id == targetClassId || c.name.toLowerCase().includes(String(targetClassId).toLowerCase()));
        }

        plan.data = {
          matchedClass: matchedClass || classList[0],
          classList,
          studentName: conversationContext.lastStudentName
        };
        plan.sources.push({ type: 'academic', label: 'Faculty & Class Allocation' });

        if (matchedClass && matchedClass.teacher_id) {
          plan.contextUpdates = {
            lastTeacherId: matchedClass.teacher_id,
            lastTeacherName: matchedClass.teacher_name,
            lastClassId: matchedClass.class_id,
            lastClassName: matchedClass.name
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. STUDENT ATTENDANCE & ABSENTEE QUERIES
      // -------------------------------------------------------------
      case 'STUDENT_ATTENDANCE': {
        if (!user || userRole === 'guest') {
          // Check if admin/teacher or public student search context
          if (conversationContext.lastStudentId) {
            const studentId = conversationContext.lastStudentId;
            const attendanceData = await attendanceTool.getStudentAttendance(
              studentId,
              parsedDate?.startDate,
              parsedDate?.endDate
            );
            const profile = await studentTool.getStudentProfile(studentId);
            plan.data = { ...attendanceData, studentName: profile?.name, className: profile?.class_name, dateRange: parsedDate?.label };
            plan.sources.push({ type: 'attendance', label: `Attendance Database (${profile?.name})` });
            break;
          }
          plan.requiresAuth = true;
          plan.data = { message: 'Please log in to your Student or Parent account to view personal attendance records.' };
          break;
        }

        const studentId = userRole === 'student' ? userId : (conversationContext.lastStudentId || entities.studentId || userId);
        const hasAccess = await permissionService.canAccessStudent(user, studentId);
        if (!hasAccess) {
          plan.authorized = false;
          plan.data = { error: 'Unauthorized: You do not have permission to view this student\'s attendance.' };
          break;
        }

        const attendanceData = await attendanceTool.getStudentAttendance(
          studentId,
          parsedDate?.startDate,
          parsedDate?.endDate
        );
        const profile = await studentTool.getStudentProfile(studentId);

        plan.data = { ...attendanceData, studentName: profile?.name, className: profile?.class_name, dateRange: parsedDate?.label };
        plan.sources.push({ type: 'attendance', label: 'Attendance Database' });

        if (profile) {
          plan.contextUpdates = {
            lastStudentId: profile.student_id,
            lastStudentName: profile.name,
            lastClassId: profile.class_id,
            lastClassName: profile.class_name
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. STUDENT MARKS & PERCENTAGE
      // -------------------------------------------------------------
      case 'STUDENT_MARKS': {
        if (!user || userRole === 'guest') {
          if (conversationContext.lastStudentId) {
            const studentId = conversationContext.lastStudentId;
            const marksData = await marksTool.getStudentMarks(studentId);
            const profile = await studentTool.getStudentProfile(studentId);
            plan.data = { ...marksData, studentName: profile?.name, className: profile?.class_name, filterSubject: entities.subject };
            plan.sources.push({ type: 'marks', label: `Examination Database (${profile?.name})` });
            break;
          }
          plan.requiresAuth = true;
          plan.data = { message: 'Please log in to your Student or Parent account to view exam marks and grades.' };
          break;
        }

        const studentId = userRole === 'student' ? userId : (conversationContext.lastStudentId || entities.studentId || userId);
        const hasAccess = await permissionService.canAccessStudent(user, studentId);
        if (!hasAccess) {
          plan.authorized = false;
          plan.data = { error: 'Unauthorized: You do not have permission to view this student\'s marks.' };
          break;
        }

        const marksData = await marksTool.getStudentMarks(studentId);
        const profile = await studentTool.getStudentProfile(studentId);

        plan.data = { ...marksData, studentName: profile?.name, className: profile?.class_name, filterSubject: entities.subject };
        plan.sources.push({ type: 'marks', label: 'Examination Database' });

        if (profile) {
          plan.contextUpdates = {
            lastStudentId: profile.student_id,
            lastStudentName: profile.name,
            lastClassId: profile.class_id,
            lastClassName: profile.class_name
          };
        }
        break;
      }

      // -------------------------------------------------------------
      // 4. STUDENT FEES & INVOICES
      // -------------------------------------------------------------
      case 'STUDENT_FEES': {
        if (!user || userRole === 'guest') {
          if (conversationContext.lastStudentId) {
            const studentId = conversationContext.lastStudentId;
            const feesData = await feesTool.getStudentFees(studentId);
            const profile = await studentTool.getStudentProfile(studentId);
            plan.data = { ...feesData, studentName: profile?.name, className: profile?.class_name };
            plan.sources.push({ type: 'fees', label: `Finance & Invoice Ledger (${profile?.name})` });
            break;
          }
          plan.requiresAuth = true;
          plan.data = { message: 'Please log in to your Student or Parent account to view personal fee invoices and dues.' };
          break;
        }

        const studentId = userRole === 'student' ? userId : (conversationContext.lastStudentId || entities.studentId || userId);
        const hasAccess = await permissionService.canAccessStudent(user, studentId);
        if (!hasAccess) {
          plan.authorized = false;
          plan.data = { error: 'Unauthorized: You do not have permission to view this student\'s fee ledger.' };
          break;
        }

        const feesData = await feesTool.getStudentFees(studentId);
        const profile = await studentTool.getStudentProfile(studentId);

        plan.data = { ...feesData, studentName: profile?.name, className: profile?.class_name };
        plan.sources.push({ type: 'fees', label: 'Finance & Invoice Ledger' });
        break;
      }

      // -------------------------------------------------------------
      // 5. STUDENT ASSIGNMENTS & HOMEWORK
      // -------------------------------------------------------------
      case 'STUDENT_ASSIGNMENTS': {
        const studentId = userRole === 'student' ? userId : conversationContext.lastStudentId;
        const profile = studentId ? await studentTool.getStudentProfile(studentId) : null;
        const classId = profile?.class_id || user?.class_id || 1;
        const assignments = await assignmentTool.getStudentAssignments(studentId, classId);

        plan.data = { assignments, classId, studentName: profile?.name };
        plan.sources.push({ type: 'assignment', label: 'Academic Assignments Database' });
        break;
      }

      // -------------------------------------------------------------
      // 6. STUDENT MATERIALS & SYLLABUS
      // -------------------------------------------------------------
      case 'STUDENT_MATERIALS': {
        const classId = user?.class_id || conversationContext.lastClassId || 1;
        const materials = await materialTool.getStudentMaterials(classId);
        const syllabus = await materialTool.getAcademicSyllabus(classId);

        plan.data = { materials, syllabus, classId };
        plan.sources.push({ type: 'material', label: 'Study Materials Database' });
        break;
      }

      // -------------------------------------------------------------
      // 7. EXAMS & SCHEDULES
      // -------------------------------------------------------------
      case 'STUDENT_EXAMS': {
        const exams = await examTool.getUpcomingExams();
        plan.data = { exams };
        plan.sources.push({ type: 'exam', label: 'Exam Schedule Database' });
        break;
      }

      // -------------------------------------------------------------
      // 8. PARENT LINKED CHILD QUERIES
      // -------------------------------------------------------------
      case 'PARENT_CHILD_ATTENDANCE':
      case 'PARENT_CHILD_MARKS':
      case 'PARENT_CHILD_FEES':
      case 'PARENT_CHILD_ASSIGNMENTS': {
        if (!user || userRole === 'guest') {
          plan.requiresAuth = true;
          plan.data = { message: 'Please log in to your Parent account to view your child\'s records.' };
          break;
        }

        const child = await permissionService.resolveChildForParent(userId, entities.childName);
        if (!child) {
          plan.data = { message: 'No linked student record was found for your parent profile. Please contact school administration.' };
          break;
        }

        if (intent === 'PARENT_CHILD_ATTENDANCE') {
          const attendanceData = await attendanceTool.getStudentAttendance(child.student_id);
          plan.data = { ...attendanceData, childName: child.name, className: child.class_name };
          plan.sources.push({ type: 'attendance', label: `Attendance Records (${child.name})` });
        } else if (intent === 'PARENT_CHILD_MARKS') {
          const marksData = await marksTool.getStudentMarks(child.student_id);
          plan.data = { ...marksData, childName: child.name, className: child.class_name, filterSubject: entities.subject };
          plan.sources.push({ type: 'marks', label: `Marks Records (${child.name})` });
        } else if (intent === 'PARENT_CHILD_FEES') {
          const feesData = await feesTool.getStudentFees(child.student_id);
          plan.data = { ...feesData, childName: child.name, className: child.class_name };
          plan.sources.push({ type: 'fees', label: `Fee Ledger (${child.name})` });
        } else if (intent === 'PARENT_CHILD_ASSIGNMENTS') {
          const assignments = await assignmentTool.getStudentAssignments(child.student_id, child.class_id);
          plan.data = { assignments, childName: child.name, className: child.class_name };
          plan.sources.push({ type: 'assignment', label: `Assignments (${child.name})` });
        }
        break;
      }

      // -------------------------------------------------------------
      // 9. TEACHER SPECIFIC QUERIES
      // -------------------------------------------------------------
      case 'TEACHER_ATTENDANCE': {
        const teacherId = userRole === 'teacher' ? userId : conversationContext.lastTeacherId;
        const subjects = teacherId ? await teacherTool.getTeacherSubjects(teacherId) : [];
        const classId = user?.class_id || (subjects[0] ? subjects[0].class_id : 1);
        const attendance = await attendanceTool.getClassAttendance(classId, null, parsedDate?.exactDate);
        plan.data = { attendance, classId };
        plan.sources.push({ type: 'attendance', label: 'Class Attendance Register' });
        break;
      }

      case 'TEACHER_LOW_ATTENDANCE': {
        const lowAttendanceList = await attendanceTool.getLowAttendanceStudents(75);
        plan.data = { students: lowAttendanceList, threshold: 75 };
        plan.sources.push({ type: 'attendance', label: 'Low Attendance Alert Database' });
        break;
      }

      case 'TEACHER_MARKS': {
        const classId = user?.class_id || conversationContext.lastClassId || 1;
        const averages = await marksTool.getSubjectAverageMarks(classId);
        plan.data = { averages, subjectName: entities.subject };
        plan.sources.push({ type: 'marks', label: 'Gradebook Database' });
        break;
      }

      case 'TEACHER_ASSIGNMENTS': {
        const teacherId = userRole === 'teacher' ? userId : (conversationContext.lastTeacherId || 1);
        const assignments = await assignmentTool.getTeacherAssignments(teacherId);
        plan.data = { assignments };
        plan.sources.push({ type: 'assignment', label: 'Teacher Assignment Ledger' });
        break;
      }

      case 'TEACHER_SUBJECTS':
      case 'TEACHER_STUDENTS': {
        const teacherId = userRole === 'teacher' ? userId : (conversationContext.lastTeacherId || 1);
        const subjects = await teacherTool.getTeacherSubjects(teacherId);
        const classId = subjects[0] ? subjects[0].class_id : (user?.class_id || conversationContext.lastClassId || 1);
        const students = await classTool.getClassStudents(classId);
        plan.data = { subjects, students, classId };
        plan.sources.push({ type: 'academic', label: 'Teacher Timetable & Class Roster' });
        break;
      }

      // -------------------------------------------------------------
      // 10. ADMIN METRICS & ANALYTICS
      // -------------------------------------------------------------
      case 'ADMIN_STUDENT_STATS':
      case 'ADMIN_TEACHER_STATS':
      case 'ADMIN_CLASS_DISTRIBUTION':
      case 'ADMIN_RECENT_ADMISSIONS': {
        const studentStats = await studentTool.getStudentStats();
        const teacherCount = await teacherTool.getTeacherCount();
        const recentAdmissions = await studentTool.getRecentAdmissions(5);

        plan.data = {
          studentStats,
          teacherCount,
          recentAdmissions,
          specific: intent
        };
        plan.sources.push({ type: 'admin', label: 'Student Information System' });
        break;
      }

      case 'ADMIN_FEE_SUMMARY': {
        const summary = await feesTool.getFeeSummary();
        plan.data = { feeSummary: summary };
        plan.sources.push({ type: 'finance', label: 'Fee Collections Database' });
        break;
      }

      case 'ADMIN_ATTENDANCE_SUMMARY': {
        const attendanceSummary = await attendanceTool.getSchoolAttendanceSummary(parsedDate?.exactDate);
        plan.data = { attendanceSummary };
        plan.sources.push({ type: 'attendance', label: 'School-wide Attendance Ledger' });
        break;
      }

      case 'ADMIN_ENQUIRIES': {
        const enquiries = await cmsTool.getEnquiriesCount();
        plan.data = { enquiries };
        plan.sources.push({ type: 'admin', label: 'Admissions Enquiry CRM' });
        break;
      }

      // -------------------------------------------------------------
      // 11. COURSES, SUBJECTS & CURRICULUM
      // -------------------------------------------------------------
      case 'PUBLIC_COURSES': {
        const courseData = await cmsTool.getCoursesAndSubjects();
        plan.data = { ...courseData };
        plan.sources.push({ type: 'cms', label: 'Academic Curriculum Database' });
        break;
      }

      // -------------------------------------------------------------
      // 12. SCHOOL HISTORY & FOUNDING
      // -------------------------------------------------------------
      case 'PUBLIC_HISTORY': {
        const aboutPage = await cmsTool.getCMSPageBySlug('about-us');
        const visionPage = await cmsTool.getCMSPageBySlug('vision-mission');
        const schoolInfo = await cmsTool.getSchoolInformation();
        plan.data = { aboutPage, visionPage, schoolInfo };
        plan.sources.push({ type: 'cms', label: 'School Archive & History' });
        break;
      }

      // -------------------------------------------------------------
      // 13. LOCATION & DIRECTIONS
      // -------------------------------------------------------------
      case 'PUBLIC_LOCATION': {
        const contactPage = await cmsTool.getCMSPageBySlug('contact');
        const schoolInfo = await cmsTool.getSchoolInformation();
        plan.data = { contactPage, schoolInfo };
        plan.sources.push({ type: 'cms', label: 'Campus Map & Directory' });
        break;
      }

      // -------------------------------------------------------------
      // 14. TIMINGS
      // -------------------------------------------------------------
      case 'PUBLIC_TIMINGS': {
        const info = await cmsTool.getSchoolInformation();
        plan.data = { timings: info.timings, schoolName: info.schoolName };
        plan.sources.push({ type: 'cms', label: 'School Schedule Database' });
        break;
      }

      // -------------------------------------------------------------
      // 15. PRINCIPAL
      // -------------------------------------------------------------
      case 'PUBLIC_PRINCIPAL': {
        const info = await cmsTool.getSchoolInformation();
        const principalPage = await cmsTool.getCMSPageBySlug('principal-message');
        plan.data = {
          principalName: info.principalName,
          principalTitle: info.principalTitle,
          principalMessage: principalPage ? principalPage.markdownContent : info.principalMessage
        };
        plan.sources.push({ type: 'cms', label: 'Principal\'s Office' });
        break;
      }

      // -------------------------------------------------------------
      // 16. CONTACT
      // -------------------------------------------------------------
      case 'PUBLIC_CONTACT': {
        const info = await cmsTool.getSchoolInformation();
        plan.data = {
          schoolName: info.schoolName,
          address: info.address,
          phone: info.phone,
          emergencyPhone: info.emergencyPhone,
          email: info.email,
          website: info.website
        };
        plan.sources.push({ type: 'cms', label: 'Official Directory' });
        break;
      }

      // -------------------------------------------------------------
      // 17. ADMISSION PROCESS
      // -------------------------------------------------------------
      case 'PUBLIC_ADMISSION': {
        const info = await cmsTool.getSchoolInformation();
        const admissionPage = await cmsTool.getCMSPageBySlug('admissions');
        plan.data = { schoolInfo: info, admissionPage };
        plan.sources.push({ type: 'cms', label: 'Admissions Desk Database' });
        break;
      }

      // -------------------------------------------------------------
      // 18. FACILITIES
      // -------------------------------------------------------------
      case 'PUBLIC_FACILITIES': {
        const facilities = await cmsTool.getCMSFacilities();
        const facilitiesPage = await cmsTool.getCMSPageBySlug('facilities');
        plan.data = { facilities, facilitiesPage };
        plan.sources.push({ type: 'cms', label: 'Campus Infrastructure Records' });
        break;
      }

      // -------------------------------------------------------------
      // 19. FEE STRUCTURE OVERVIEW
      // -------------------------------------------------------------
      case 'PUBLIC_FEE_STRUCTURE': {
        const info = await cmsTool.getSchoolInformation();
        plan.data = { schoolInfo: info };
        plan.sources.push({ type: 'cms', label: 'Admissions Fee Policy' });
        break;
      }

      // -------------------------------------------------------------
      // 20. LIBRARY & BOOKS
      // -------------------------------------------------------------
      case 'PUBLIC_LIBRARY': {
        const queryTerm = entities.bookQuery || entities.subject;
        let books = [];
        if (queryTerm) {
          books = await libraryTool.searchBooks({ query: queryTerm });
        }
        const libraryInfo = await cmsTool.getLibraryInfo();
        const librarySummary = await libraryTool.getLibrarySummary();
        plan.data = { libraryInfo, librarySummary, searchBooks: books, queryTerm };
        plan.sources.push({ type: 'library', label: 'Central Library Database' });
        break;
      }

      // -------------------------------------------------------------
      // 21. TRANSPORT
      // -------------------------------------------------------------
      case 'PUBLIC_TRANSPORT': {
        const transportRoutes = await transportTool.getTransportRoutes();
        const transportInfo = await cmsTool.getTransportInfo();
        plan.data = { transportRoutes, transportInfo };
        plan.sources.push({ type: 'transport', label: 'Transport Fleet Database' });
        break;
      }

      // -------------------------------------------------------------
      // 22. HOSTEL
      // -------------------------------------------------------------
      case 'PUBLIC_HOSTEL': {
        const hostelInfo = await cmsTool.getHostelInfo();
        plan.data = { hostelInfo };
        plan.sources.push({ type: 'hostel', label: 'Hostel & Housing Database' });
        break;
      }

      // -------------------------------------------------------------
      // 23. CLUBS & ACTIVITIES
      // -------------------------------------------------------------
      case 'PUBLIC_CLUBS': {
        const clubsInfo = await cmsTool.getClubsAndActivities();
        plan.data = { clubsInfo };
        plan.sources.push({ type: 'academic', label: 'Clubs & Activities Database' });
        break;
      }

      // -------------------------------------------------------------
      // 24. NOTICES & CIRCULARS
      // -------------------------------------------------------------
      case 'NOTICE_SEARCH': {
        const notices = await noticeTool.getLatestNotices(5);
        const circulars = await noticeTool.getCirculars(3);
        plan.data = { notices, circulars };
        plan.sources.push({ type: 'notice', label: 'Noticeboard Database' });
        break;
      }

      // -------------------------------------------------------------
      // 25. EVENTS & CALENDAR
      // -------------------------------------------------------------
      case 'EVENT_SEARCH': {
        const events = await eventTool.getUpcomingEvents(5);
        plan.data = { events };
        plan.sources.push({ type: 'event', label: 'Events Calendar Database' });
        break;
      }

      // -------------------------------------------------------------
      // 26. PHOTO GALLERY
      // -------------------------------------------------------------
      case 'CMS_GALLERY': {
        const gallery = await cmsTool.getCMSGallery();
        plan.data = { gallery };
        plan.sources.push({ type: 'gallery', label: 'Photo Gallery Database' });
        break;
      }

      // -------------------------------------------------------------
      // 27. STAFF / TEACHER DIRECTORY QUERIES
      // -------------------------------------------------------------
      case 'STAFF_SEARCH': {
        const name = entities.teacherName || originalMessage;
        const staff = await staffTool.findTeacherByName(name);
        plan.data = { query: name, staff };
        plan.sources.push({ type: 'hr', label: 'Teacher & Staff Directory' });
        if (staff && staff.length === 1) {
          plan.contextUpdates = {
            lastTeacherId: staff[0].teacher_id,
            lastTeacherName: staff[0].name
          };
        }
        break;
      }

      case 'STAFF_LIST': {
        const staffList = await staffTool.getAllStaff();
        plan.data = { staffList };
        plan.sources.push({ type: 'hr', label: 'Teacher & Staff Directory' });
        break;
      }

      case 'STAFF_STATS': {
        const staffStats = await staffTool.getStaffStats();
        const teacherCount = await teacherTool.getTeacherCount();
        plan.data = { staffStats, teacherCount };
        plan.sources.push({ type: 'hr', label: 'Human Resources Database' });
        break;
      }

      case 'STAFF_DEPARTMENTS': {
        const departments = await staffTool.getDepartments();
        const staffStats = await staffTool.getStaffStats();
        plan.data = { departments, staffStats };
        plan.sources.push({ type: 'hr', label: 'Departments & Faculty Records' });
        break;
      }

      // -------------------------------------------------------------
      // 28. FALLBACK / GENERAL INFORMATION / KNOWLEDGE BASE
      // -------------------------------------------------------------
      case 'PUBLIC_ABOUT':
      case 'PUBLIC_INFORMATION':
      default: {
        // First check knowledge base RAG
        const knowledgeResults = await knowledgeTool.searchKnowledge({ query: originalMessage });
        const info = await cmsTool.getSchoolInformation();
        const page = await cmsTool.getCMSPage({ title: originalMessage });
        const news = await cmsTool.getCMSNews(3);
        plan.data = { schoolInfo: info, page, recentNews: news, knowledge: knowledgeResults };
        plan.sources.push({ type: 'cms', label: 'School CMS Database' });
        break;
      }
    }

    return plan;
  }
}

module.exports = new QueryPlannerService();
