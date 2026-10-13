const studentTool = require('./student.tool');
const attendanceTool = require('./attendance.tool');
const marksTool = require('./marks.tool');
const feesTool = require('./fees.tool');
const assignmentTool = require('./assignment.tool');
const materialTool = require('./material.tool');
const examTool = require('./exam.tool');
const noticeTool = require('./notice.tool');
const eventTool = require('./event.tool');
const cmsTool = require('./cms.tool');
const teacherTool = require('./teacher.tool');
const classTool = require('./class.tool');
const libraryTool = require('./library.tool');
const transportTool = require('./transport.tool');
const knowledgeTool = require('./knowledge.tool');
const permissionService = require('../services/permission.service');
const pool = require('../../../config/db');

/**
 * Enterprise AI Tool Registry
 * Manages tool schemas, role restrictions, execution handlers, and audit logging
 */
class ToolRegistry {
  constructor() {
    this.tools = new Map();
    this.registerAllTools();
  }

  registerTool(name, config) {
    this.tools.set(name, {
      name,
      description: config.description,
      parameters: config.parameters || {},
      requiredRoles: config.requiredRoles || ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: config.handler
    });
  }

  getTool(name) {
    return this.tools.get(name);
  }

  getAllToolDefinitions(userRole = 'public') {
    const definitions = [];
    for (const [name, tool] of this.tools.entries()) {
      if (tool.requiredRoles.includes(userRole) || userRole === 'admin') {
        definitions.push({
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        });
      }
    }
    return definitions;
  }

  async executeTool(name, params, userContext = {}) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool "${name}" is not registered in Tool Registry.`);
    }

    const startTime = Date.now();
    let status = 'success';
    let errorMessage = null;
    let result = null;

    try {
      // Permission check
      const userRole = userContext.role || 'public';
      if (!tool.requiredRoles.includes(userRole) && userRole !== 'admin') {
        status = 'denied';
        throw new Error(`Unauthorized: Role "${userRole}" cannot execute tool "${name}".`);
      }

      // Execute bound handler
      result = await tool.handler(params, userContext);
      return result;
    } catch (err) {
      if (status !== 'denied') status = 'error';
      errorMessage = err.message;
      throw err;
    } finally {
      // Audit log tool execution
      const executionTimeMs = Date.now() - startTime;
      if (userContext.conversationId) {
        try {
          await pool.query(
            `INSERT INTO chatbot_tool_calls (conversation_id, tool_name, input_params, output_result, execution_time_ms, status, error_message)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              userContext.conversationId,
              name,
              JSON.stringify(params || {}),
              result ? JSON.stringify(result) : null,
              executionTimeMs,
              status,
              errorMessage
            ]
          );
        } catch (logErr) {
          console.error('[ToolRegistry] Audit log error:', logErr.message);
        }
      }
    }
  }

  registerAllTools() {
    // 1. Student Tools
    this.registerTool('findStudent', {
      description: 'Search for a student by name, roll number, or admission number',
      parameters: { query: { type: 'string', description: 'Student name or admission number' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => studentTool.findStudentByNameOrAdmission(p.query)
    });

    this.registerTool('getStudentDetails', {
      description: 'Get full profile details of a student by student_id',
      parameters: { studentId: { type: 'number', description: 'Student ID' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => studentTool.getStudentProfile(p.studentId)
    });

    this.registerTool('getStudentStats', {
      description: 'Get overall school student count and active stats',
      parameters: {},
      requiredRoles: ['admin', 'teacher'],
      handler: async () => studentTool.getStudentStats()
    });

    // 2. Attendance Tools
    this.registerTool('getStudentAttendance', {
      description: 'Get attendance records, summary, and percentage for a student',
      parameters: {
        studentId: { type: 'number', description: 'Student ID' },
        startDate: { type: 'string', description: 'YYYY-MM-DD start date' },
        endDate: { type: 'string', description: 'YYYY-MM-DD end date' }
      },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => attendanceTool.getStudentAttendance(p.studentId, p.startDate, p.endDate)
    });

    this.registerTool('getClassAttendance', {
      description: 'Get attendance report for an entire class on a specific date',
      parameters: {
        classId: { type: 'number', description: 'Class ID' },
        sectionId: { type: 'number', description: 'Optional section ID' },
        date: { type: 'string', description: 'YYYY-MM-DD date' }
      },
      requiredRoles: ['teacher', 'admin'],
      handler: async (p) => attendanceTool.getClassAttendance(p.classId, p.sectionId, p.date)
    });

    this.registerTool('getSchoolAttendanceSummary', {
      description: 'Get school-wide attendance count and percentage for a given date',
      parameters: { date: { type: 'string', description: 'YYYY-MM-DD date' } },
      requiredRoles: ['admin'],
      handler: async (p) => attendanceTool.getSchoolAttendanceSummary(p.date)
    });

    // 3. Marks & Academic Tools
    this.registerTool('getStudentMarks', {
      description: 'Get marks, exam grades, and subject-wise score breakdown for a student',
      parameters: {
        studentId: { type: 'number', description: 'Student ID' },
        examId: { type: 'number', description: 'Optional Exam ID' }
      },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => marksTool.getStudentMarks(p.studentId, p.examId)
    });

    // 4. Fees Tools
    this.registerTool('getStudentFees', {
      description: 'Get invoices, paid amounts, balance due, and payment status for a student',
      parameters: { studentId: { type: 'number', description: 'Student ID' } },
      requiredRoles: ['student', 'parent', 'admin'],
      handler: async (p) => feesTool.getStudentFees(p.studentId)
    });

    this.registerTool('getFeeSummary', {
      description: 'Get school-wide fee collection, total invoices, and outstanding balances',
      parameters: {},
      requiredRoles: ['admin'],
      handler: async () => feesTool.getFeeSummary()
    });

    // 5. Assignment Tools
    this.registerTool('getStudentAssignments', {
      description: 'Get homework and assignments for a student by student_id or class_id',
      parameters: {
        studentId: { type: 'number', description: 'Student ID' },
        classId: { type: 'number', description: 'Class ID' }
      },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => assignmentTool.getStudentAssignments(p.studentId, p.classId)
    });

    // 6. Material Tools
    this.registerTool('getStudentMaterials', {
      description: 'Get study materials and downloadables for a class/subject',
      parameters: {
        classId: { type: 'number', description: 'Class ID' },
        subjectId: { type: 'number', description: 'Subject ID' }
      },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => materialTool.getStudentMaterials(p.classId, p.subjectId)
    });

    this.registerTool('getAcademicSyllabus', {
      description: 'Get academic syllabus for a class',
      parameters: { classId: { type: 'number', description: 'Class ID' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => materialTool.getAcademicSyllabus(p.classId)
    });

    // 7. Exam Tools
    this.registerTool('getUpcomingExams', {
      description: 'Get upcoming exam schedules and dates',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => examTool.getUpcomingExams()
    });

    // 8. Notice & Circular Tools
    this.registerTool('getLatestNotices', {
      description: 'Get active school noticeboard announcements',
      parameters: { limit: { type: 'number', description: 'Number of notices' } },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => noticeTool.getLatestNotices(p?.limit || 5)
    });

    this.registerTool('getCirculars', {
      description: 'Get official school circulars',
      parameters: { limit: { type: 'number', description: 'Number of circulars' } },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => noticeTool.getCirculars(p?.limit || 5)
    });

    // 9. Event Tools
    this.registerTool('getUpcomingEvents', {
      description: 'Get upcoming events and calendar items',
      parameters: { limit: { type: 'number', description: 'Number of events' } },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => eventTool.getUpcomingEvents(p?.limit || 5)
    });

    // 10. CMS & Public Website Tools
    this.registerTool('getSchoolInformation', {
      description: 'Get school name, phone, email, address, timings, principal, and social links',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => cmsTool.getSchoolInformation()
    });

    this.registerTool('getCMSPage', {
      description: 'Get website CMS page content like admission, about-us, contact, curriculum, etc.',
      parameters: { slug: { type: 'string', description: 'Page slug' } },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => cmsTool.getCMSPageBySlug(p.slug)
    });

    this.registerTool('getCoursesAndSubjects', {
      description: 'Get list of offered classes, grades, and subjects',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => cmsTool.getCoursesAndSubjects()
    });

    this.registerTool('getCMSFacilities', {
      description: 'Get list of school facilities, labs, sports, libraries',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => cmsTool.getCMSFacilities()
    });

    this.registerTool('getCMSGallery', {
      description: 'Get school photo and video gallery items',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => cmsTool.getCMSGallery()
    });

    this.registerTool('getCMSNews', {
      description: 'Get latest published news articles and press releases',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => cmsTool.getCMSNews()
    });

    // 11. Teacher Tools
    this.registerTool('getTeacherProfile', {
      description: 'Get teacher profile, designation, email, phone, and department',
      parameters: { query: { type: 'string', description: 'Teacher name or designation' } },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => teacherTool.getTeacherProfile(p.query)
    });

    this.registerTool('getTeacherSubjects', {
      description: 'Get subjects assigned to a teacher',
      parameters: { teacherId: { type: 'number', description: 'Teacher ID' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => teacherTool.getTeacherSubjects(p.teacherId)
    });

    // 12. Class Tools
    this.registerTool('getClassList', {
      description: 'Get list of all classes, sections, and class teachers',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => classTool.getClassList()
    });

    this.registerTool('getClassStudents', {
      description: 'Get student roster for a class and section',
      parameters: {
        classId: { type: 'number', description: 'Class ID' },
        sectionId: { type: 'number', description: 'Optional Section ID' }
      },
      requiredRoles: ['teacher', 'admin'],
      handler: async (p) => classTool.getClassStudents(p.classId, p.sectionId)
    });

    // 13. Library Tools
    this.registerTool('searchBooks', {
      description: 'Search school library catalogue for books by title, author, isbn or subject',
      parameters: {
        query: { type: 'string', description: 'Search term' },
        class_id: { type: 'number', description: 'Class ID' }
      },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => libraryTool.searchBooks(p)
    });

    this.registerTool('getStudentLibraryRecords', {
      description: 'Get student issued books, due dates, and return statuses',
      parameters: { studentId: { type: 'number', description: 'Student ID' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => libraryTool.getStudentLibraryRecords(p.studentId)
    });

    // 14. Transport Tools
    this.registerTool('getTransportRoutes', {
      description: 'Get school transport routes, bus stops, start/end points and fares',
      parameters: {},
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async () => transportTool.getTransportRoutes()
    });

    this.registerTool('getStudentTransport', {
      description: 'Get assigned bus route, pickup point, vehicle number and driver phone for a student',
      parameters: { studentId: { type: 'number', description: 'Student ID' } },
      requiredRoles: ['student', 'parent', 'teacher', 'admin'],
      handler: async (p) => transportTool.getStudentTransport(p.studentId)
    });

    // 15. Knowledge / RAG Tools
    this.registerTool('searchKnowledgeBase', {
      description: 'Search unstructured school policies, documents, rules, and FAQs',
      parameters: {
        query: { type: 'string', description: 'Question or search query' },
        category: { type: 'string', description: 'Optional category filter' }
      },
      requiredRoles: ['public', 'student', 'parent', 'teacher', 'admin'],
      handler: async (p) => knowledgeTool.searchKnowledge(p)
    });
  }
}

module.exports = new ToolRegistry();
