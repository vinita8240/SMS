class ResponseGeneratorService {
  /**
   * Format structured database tool results into natural, accurate Markdown responses
   */
  generateResponse(planResult, originalMessage = '', user = null) {
    const { intent, authorized, requiresAuth, data } = planResult;
    const userRole = (user?.role || user?.userType || 'guest').toLowerCase();
    const userName = user?.name || 'there';
    const text = (originalMessage || '').toLowerCase();

    if (requiresAuth) {
      return data.message || 'Please log in to your Student, Parent, Teacher, or Admin account to access personal school records.';
    }

    if (!authorized) {
      return data.error || 'You do not have authorization to view this private database record.';
    }

    if (!data) {
      return 'I could not find specific records for your request in the database. Please contact the administrative office for more details.';
    }

    switch (intent) {
      // -------------------------------------------------------------
      // 1. GREETINGS
      // -------------------------------------------------------------
      case 'GENERAL_GREETING': {
        const school = data.schoolName || 'Mount Carmel International School';
        if (userRole === 'student') {
          return `Hello **${userName}**! 👋 Welcome to your Student Assistant.\n\nYou can ask me:\n* 📊 *"What is my attendance?"* or *"How many days was I absent?"*\n* 📝 *"What are my marks?"* or *"What is my percentage?"*\n* 💰 *"What is my fee balance?"*\n* 📋 *"What assignments are due?"*\n* 🗓️ *"What exams are coming?"*`;
        }
        if (userRole === 'parent') {
          return `Hello **${userName}**! 👋 Welcome to your Parent Portal Assistant.\n\nYou can ask me:\n* 📊 *"What is my child's attendance?"*\n* 📝 *"What are my child's marks?"*\n* 💰 *"What fees are pending?"*\n* 📋 *"What assignments are pending?"*\n* 📢 *"What notices apply to my child's class?"*`;
        }
        if (userRole === 'teacher') {
          return `Hello **${userName}**! 👋 Welcome to your Teacher Assistant.\n\nYou can ask me:\n* 📅 *"Show today's attendance"* or *"Which students are absent?"*\n* 👥 *"How many students are in my class?"*\n* 📘 *"Show my assigned subjects"*\n* ⚠️ *"Which students have low attendance?"*\n* 📝 *"What is the average mark for my subject?"*`;
        }
        if (userRole === 'admin' || userRole === 'super_admin') {
          return `Greetings **${userName}**. 🏫 Administrator Assistant active.\n\nYou can query real-time analytics:\n* 🎒 *"How many students are enrolled?"*\n* 👨‍🏫 *"How many teachers are there?"*\n* 💰 *"How much fee has been collected?"*\n* 📊 *"What is today's attendance?"*\n* 📑 *"Show recent admissions"* or *"Show pending enquiries"*`;
        }
        return `Hello and welcome to **${school}**! 🎓\n\nI am your AI Campus Assistant powered by real-time database records. Ask me anything about:\n* 📋 **Admissions & Fee Structure**\n* 📚 **Courses & Subjects Offered**\n* 🕒 **School Timings & Location**\n* 🔬 **Campus Facilities & Labs**\n* 👨‍🏫 **Principal's Message & History**\n* 📢 **Latest Notices & Events**`;
      }

      // -------------------------------------------------------------
      // 1.1 CLASS TEACHER
      // -------------------------------------------------------------
      case 'CLASS_TEACHER': {
        const c = data.matchedClass;
        if (c && c.teacher_name) {
          return `👨‍🏫 The class teacher for **${c.name}** is **${c.teacher_name}** (${c.teacher_email || 'Faculty'}).`;
        }
        if (data.classList && data.classList.length > 0) {
          let res = `Class Teacher Allocations:\n\n`;
          data.classList.forEach(cl => {
            res += `* **${cl.name}:** ${cl.teacher_name || 'Assigned Faculty'}\n`;
          });
          return res;
        }
        return `No specific class teacher allocation was found.`;
      }

      // -------------------------------------------------------------
      // 1.2 STUDENT LOOKUP / CLASS SEARCH
      // -------------------------------------------------------------
      case 'STUDENT_SEARCH': {
        const students = data.students || [];
        if (students.length === 0) {
          return `No enrolled student matching **"${data.query}"** was found in the school database. Please check the spelling or contact administration.`;
        }

        if (students.length === 1) {
          const st = students[0];
          return `🎓 **${st.name}** is currently enrolled in **${st.class_name || 'Class'}** (${st.section_name || 'Section A'}, Roll No: **${st.roll_no || '-'}**, Admission No: **${st.admission_no}**, Status: **${(st.status || 'active').toUpperCase()}**).`;
        }

        let response = `Found **${students.length}** matching student(s):\n\n`;
        students.forEach(st => {
          response += `* 🎓 **${st.name}** — **${st.class_name || 'Class'}** (${st.section_name || 'Section A'}, Roll: **${st.roll_no || '-'}**, Adm: **${st.admission_no}**)\n`;
        });
        return response;
      }


      // -------------------------------------------------------------
      // 2. COURSES, SUBJECTS & CURRICULUM
      // -------------------------------------------------------------
      case 'PUBLIC_COURSES': {
        let response = `📚 **Courses & Academic Programs Offered:**\n\n`;

        if (data.programOverview) {
          response += `${data.programOverview.substring(0, 450)}...\n\n`;
        }

        if (data.subjects && data.subjects.length > 0) {
          response += `### Registered Subject Courses by Grade Level:\n`;
          const subjectsByClass = {};
          data.subjects.forEach(s => {
            const cls = s.class_name || 'General';
            if (!subjectsByClass[cls]) subjectsByClass[cls] = [];
            subjectsByClass[cls].push(s.subject_name);
          });

          Object.keys(subjectsByClass).forEach(cls => {
            response += `* **${cls}:** ${subjectsByClass[cls].join(', ')}\n`;
          });
          response += `\n`;
        }

        response += `💡 *For syllabus documents, detailed subject weightage, or admission inquiries into specific grades, please visit our admissions desk or explore [/site/p/academics](/site/p/academics).*`;
        return response;
      }

      // -------------------------------------------------------------
      // 3. SCHOOL HISTORY & FOUNDING
      // -------------------------------------------------------------
      case 'PUBLIC_HISTORY': {
        let response = `🏫 **School History & Foundation:**\n\n`;
        if (data.aboutPage && data.aboutPage.markdownContent) {
          response += `${data.aboutPage.markdownContent}\n\n`;
        } else {
          response += `Established in **1998**, Mount Carmel International School has evolved into one of the region's premier educational institutions, dedicated to academic excellence, leadership development, and character building.\n\n`;
        }

        if (data.visionPage && data.visionPage.markdownContent) {
          response += `### Vision & Mission\n${data.visionPage.markdownContent.substring(0, 300)}...\n\n`;
        }

        return response;
      }

      // -------------------------------------------------------------
      // 4. SCHOOL LOCATION, CONTACT & ADDRESS
      // -------------------------------------------------------------
      case 'PUBLIC_LOCATION':
      case 'PUBLIC_CONTACT': {
        const info = data.schoolInfo || {};
        let response = `📍 **School Contact & Campus Location:**\n\n`;
        response += `* 🏢 **Campus Address:** ${info.address || '450 University Boulevard, Academic City, California 90210, USA'}\n`;
        response += `* 📞 **Front Desk Phone:** ${info.phone || '+1 (800) 555-0199'}\n`;
        response += `* 🚨 **Emergency Helpline:** ${info.emergencyPhone || '+1 (800) 555-0198'}\n`;
        response += `* ✉️ **Email:** [${info.email || 'admissions@mountcarmel.edu'}](mailto:${info.email || 'admissions@mountcarmel.edu'})\n`;
        response += `* 🌐 **Website:** [${info.website || 'https://mountcarmel.edu'}](${info.website || 'https://mountcarmel.edu'})\n\n`;
        response += `🕒 **Admissions & Visitor Office Hours:** Monday through Saturday, 8:30 AM to 4:30 PM.\n`;
        response += `🚍 For directions and campus visit bookings, visit [/site/contact](/site/contact).`;
        return response;
      }


      // -------------------------------------------------------------
      // 5. SCHOOL TIMINGS
      // -------------------------------------------------------------
      case 'PUBLIC_TIMINGS': {
        return `🕒 **School Timings & Operating Hours:**\n\n* 🎒 **Student Academic Hours:** Monday to Friday, **8:00 AM – 2:30 PM**\n* 🏢 **Administrative Office Hours:** Monday to Friday, **8:00 AM – 4:00 PM**\n* 📅 **Saturday Consultations & Desk:** **9:00 AM – 1:00 PM**\n* 🛑 **Sunday:** Closed (Except special athletic fixtures)\n\n*Note: Morning bell rings at 7:55 AM. Students must arrive at least 10 minutes prior to morning assembly.*`;
      }

      // -------------------------------------------------------------
      // 6. PRINCIPAL
      // -------------------------------------------------------------
      case 'PUBLIC_PRINCIPAL': {
        let response = `👨‍🏫 **Principal's Desk:**\n\n`;
        response += `**${data.principalName || 'Dr. Margaret E. Harrison, Ph.D.'}**\n`;
        response += `*${data.principalTitle || 'Principal & Managing Director'}*\n\n`;
        if (data.principalMessage) {
          response += `> "${data.principalMessage.replace(/^###.*\n/, '').trim()}"\n`;
        }
        return response;
      }

      // -------------------------------------------------------------
      // 7. FACILITIES
      // -------------------------------------------------------------
      case 'PUBLIC_FACILITIES': {
        let response = `🏫 **Campus Infrastructure & World-Class Facilities:**\n\n`;
        if (Array.isArray(data.facilities) && data.facilities.length > 0) {
          data.facilities.forEach(f => {
            response += `* 🔬 **${f.title || f.name}**: ${f.description || f.subtitle || 'Modern infrastructure'}\n`;
          });
        } else if (data.facilitiesPage && data.facilitiesPage.markdownContent) {
          response += `${data.facilitiesPage.markdownContent}\n`;
        } else {
          response += `* 💻 **Digital Smart Classrooms**: Interactive touchscreens with multimedia learning.\n* 🤖 **STEAM & Robotics Innovation Hub**: 3D printers, IoT, and coding stations.\n* ⚽ **Olympic Sports Complex**: Synthetic athletic track, FIFA-standard turf, and tennis courts.\n* 🔬 **Modern Science Laboratories**: Physics, Chemistry, and Biology research suites.\n* 🎭 **Grand 1200-Seat Auditorium**: Acoustically treated hall for theater and conferences.\n* 📚 **Central Digital Library**: 45,000+ volumes, silent reading pods, and online research terminals.\n`;
        }
        response += `\n📸 *You can view campus photos in our gallery at [/site/gallery](/site/gallery).*`;
        return response;
      }

      // -------------------------------------------------------------
      // 8. ADMISSION PROCESS
      // -------------------------------------------------------------
      case 'PUBLIC_ADMISSION': {
        const info = data.schoolInfo || {};
        if (data.admissionPage && data.admissionPage.markdownContent) {
          return `${data.admissionPage.markdownContent}\n\n📞 **Admissions Office:** ${info.phone || '+1 (800) 555-0199'} | ✉️ **Email:** ${info.email || 'admissions@mountcarmel.edu'}`;
        }
        return `🎓 **Admissions 2026-2027 — Procedure & Guidelines:**\n\n1. **Step 1 - Online Enquiry:** Submit the application inquiry form on our portal at [/site/admissions](/site/admissions) or visit the admissions desk.\n2. **Step 2 - Documentation:** Submit student birth certificate, previous report cards, Transfer Certificate (TC), and passport photos.\n3. **Step 3 - Readiness Interaction:** Baseline grade-appropriate student interaction and parent consultation.\n4. **Step 4 - Seat Confirmation & Fee Settlement:** Complete admission formalities and receive welcome kit.\n\n📞 **Admissions Desk:** ${info.phone || '+1 (800) 555-0199'}\n✉️ **Admissions Email:** ${info.email || 'admissions@mountcarmel.edu'}`;
      }

      // -------------------------------------------------------------
      // 9. FEE STRUCTURE OVERVIEW
      // -------------------------------------------------------------
      case 'PUBLIC_FEE_STRUCTURE': {
        return `💰 **School Fee Structure Overview:**\n\nOur annual tuition and term fees are structured transparently based on grade levels:\n\n* **Primary Years (Grades 1-5):** Standard composite fee covers tuition, library, digital learning, and physical education.\n* **Middle & Secondary (Grades 6-10):** Covers advanced science laboratories, robotics workstations, and co-curricular programs.\n* **Senior Secondary (Grades 11-12):** Stream-specific lab resources (Science, Commerce, Humanities) and career counseling.\n\n🔒 **Enrolled Students & Parents:** Please log in to view your individual student invoice, fee receipts, and pending balance.\n📋 **Prospective Parents:** Please contact admissions at **admissions@mountcarmel.edu** for the comprehensive fee schedule brochure.`;
      }

      // -------------------------------------------------------------
      // 10. LIBRARY & BOOKS
      // -------------------------------------------------------------
      case 'PUBLIC_LIBRARY': {
        const lib = data.libraryInfo;
        if (!lib) return `Our Central Digital Library houses over 45,000 reference volumes, periodicals, and digital research subscriptions.`;
        let response = `📚 **Central Digital Library:**\n\n`;
        response += `* 📖 **Catalogued Book Titles:** **${lib.totalTitles}** titles\n`;
        response += `* 📦 **Total Physical Copies:** **${lib.totalCopies}** books\n`;
        response += `* ✅ **Currently Available for Issue:** **${lib.availableCopies}** copies\n`;
        if (lib.categories && lib.categories.length > 0) {
          response += `* 📑 **Subject Categories:** ${lib.categories.join(', ')}\n`;
        }
        if (lib.sampleBooks && lib.sampleBooks.length > 0) {
          response += `\n**Featured Library Books:**\n`;
          lib.sampleBooks.forEach(b => {
            response += `* *${b.name}* — ${b.author || 'Author'} (${b.subject || 'Reference'})\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 11. TRANSPORT
      // -------------------------------------------------------------
      case 'PUBLIC_TRANSPORT': {
        const tr = data.transportInfo;
        let response = `🚍 **School Transport & Fleet:**\n\nOur dedicated bus fleet features GPS real-time tracking, CCTV surveillance, speed governors, and trained attendant staff.\n\n`;
        if (tr?.routes && tr.routes.length > 0) {
          response += `**Available Transport Routes:**\n`;
          tr.routes.forEach(r => {
            response += `* **${r.route_name}:** ${r.start_place} ➔ ${r.stop_place} (Fare: ₹${r.route_fare || 0}/term)\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 12. HOSTEL
      // -------------------------------------------------------------
      case 'PUBLIC_HOSTEL': {
        const h = data.hostelInfo;
        let response = `🏢 **Hostel & Residential Boarding Facilities:**\n\nWe provide secure, separate residential boarding facilities for boys and girls with full-time wardens, nutritious dining, medical supervision, and evening study halls.\n\n`;
        if (h?.dormitories && h.dormitories.length > 0) {
          response += `**Residential Wings:**\n`;
          h.dormitories.forEach(d => {
            response += `* **${d.name}** (${d.type} Wing) — Capacity: ${d.capacity} residents\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 13. CLUBS
      // -------------------------------------------------------------
      case 'PUBLIC_CLUBS': {
        const c = data.clubsInfo;
        let response = `🎭 **Student Clubs & Extracurricular Activities:**\n\n`;
        if (c?.clubs && c.clubs.length > 0) {
          response += `**Active Student Clubs:**\n`;
          c.clubs.forEach(cl => {
            response += `* 🌟 **${cl.name}**: ${cl.description || 'Student development activities'}\n`;
          });
          response += `\n`;
        }
        if (c?.activities && c.activities.length > 0) {
          response += `**Recent Activities & Events:**\n`;
          c.activities.forEach(a => {
            response += `* **${a.title}** (${a.date || 'Scheduled'})\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 14. STUDENT ATTENDANCE
      // -------------------------------------------------------------
      case 'STUDENT_ATTENDANCE': {
        const pct = data.percentage !== undefined ? `${data.percentage}%` : 'N/A';
        const working = data.totalWorkingDays || 0;
        const present = data.present || 0;
        const absent = data.absent || 0;
        const late = data.late || 0;

        if (text.includes('absent') || text.includes('how many days was i absent')) {
          let res = `You were **absent for ${absent} day(s)** out of ${working} working days.\n\n`;
          res += `* ✅ **Days Present:** ${present} days\n`;
          res += `* 📊 **Attendance Percentage:** **${pct}**\n`;
          if (data.recentAbsences && data.recentAbsences.length > 0) {
            res += `\n**Recent Absence Dates:**\n`;
            data.recentAbsences.forEach(a => {
              res += `* 📅 ${a.date} ${a.remarks ? '(' + a.remarks + ')' : ''}\n`;
            });
          }
          return res;
        }

        let response = `Your overall attendance is **${pct}**.\n\n`;
        response += `* 📅 **Total Working Days:** ${working}\n`;
        response += `* ✅ **Days Present:** ${present}\n`;
        response += `* ❌ **Days Absent:** ${absent}\n`;
        if (late > 0) response += `* ⏰ **Late Arrivals:** ${late}\n`;

        if (data.percentage >= 75) {
          response += `\n🌟 *Great job! Your attendance satisfies the required 75% minimum threshold.*`;
        } else {
          response += `\n⚠️ *Warning: Your attendance is currently below the mandatory 75% academic threshold. Please meet your class teacher.*`;
        }
        return response;
      }

      // -------------------------------------------------------------
      // 15. STUDENT MARKS & PERCENTAGE
      // -------------------------------------------------------------
      case 'STUDENT_MARKS': {
        if (!data.marks || data.marks.length === 0) {
          return data.filterSubject
            ? `No examination marks have been published yet for **${data.filterSubject}**.`
            : `No examination results have been published for your profile yet.`;
        }

        if (data.filterSubject && data.marks.length === 1) {
          const m = data.marks[0];
          return `In **${m.subject_name}** (${m.exam_name}), you scored **${m.mark_obtained}** out of **${m.mark_total}** (Grade: **${m.grade || 'A'}**).`;
        }

        let response = `Here is your examination results breakdown:\n\n`;
        response += `| Subject | Exam | Score | Grade |\n`;
        response += `| :--- | :--- | :---: | :---: |\n`;
        data.marks.forEach(m => {
          response += `| **${m.subject_name}** | ${m.exam_name} | ${m.mark_obtained} / ${m.mark_total} | **${m.grade || '-'}** |\n`;
        });

        if (data.summary) {
          response += `\n📊 **Overall Percentage:** **${data.summary.overallPercentage}%** (Total Marks: ${data.summary.totalObtained} / ${data.summary.totalMaximum})`;
        }
        return response;
      }

      // -------------------------------------------------------------
      // 16. STUDENT FEES
      // -------------------------------------------------------------
      case 'STUDENT_FEES': {
        const total = (data.totalFee || 0).toLocaleString('en-IN');
        const paid = (data.paid || 0).toLocaleString('en-IN');
        const discount = (data.discount || 0).toLocaleString('en-IN');
        const balance = (data.balance || 0).toLocaleString('en-IN');

        let response = `Here is your authoritative fee summary from the school ledger:\n\n`;
        response += `* 💰 **Total Invoiced Fee:** ₹${total}\n`;
        response += `* ✅ **Amount Paid:** ₹${paid}\n`;
        if (data.discount > 0) response += `* 🏷️ **Concession / Discount:** ₹${discount}\n`;
        response += `* 📌 **Outstanding Balance:** **₹${balance}**\n\n`;

        if (data.balance <= 0) {
          response += `🎉 *All your fee dues are fully cleared!*`;
        } else {
          response += `⚠️ *Please settle the pending balance of ₹${balance} before the due date to avoid late fine charges.*`;
        }

        if (data.invoices && data.invoices.length > 0) {
          response += `\n\n**Invoice History:**\n`;
          data.invoices.forEach(inv => {
            response += `* **${inv.title}** (${inv.invoiceNumber}): Invoiced ₹${inv.amount.toLocaleString('en-IN')}, Paid ₹${inv.amountPaid.toLocaleString('en-IN')}, Due: **₹${inv.balance.toLocaleString('en-IN')}** [Status: ${inv.status.toUpperCase()}]\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 17. STUDENT ASSIGNMENTS
      // -------------------------------------------------------------
      case 'STUDENT_ASSIGNMENTS': {
        if (!data.assignments || data.assignments.length === 0) {
          return `You currently have **no pending assignments** due! 🎉 Keep up the great work.`;
        }

        let response = `You have **${data.assignments.length}** pending assignment(s):\n\n`;
        data.assignments.forEach((a, i) => {
          response += `${i + 1}. **${a.title}** (${a.subject_name})\n   * 📅 **Due Date:** ${a.due_date}\n   * 👨‍🏫 **Teacher:** ${a.teacher_name || 'Subject Teacher'}\n   * 📝 ${a.description || 'Complete the assigned questions.'}\n\n`;
        });
        return response;
      }

      // -------------------------------------------------------------
      // 18. STUDENT MATERIALS
      // -------------------------------------------------------------
      case 'STUDENT_MATERIALS': {
        let response = `Here are your class study resources:\n\n`;
        if (data.materials && data.materials.length > 0) {
          response += `📚 **Study Documents & Lesson Notes:**\n`;
          data.materials.forEach(m => {
            response += `* **${m.title}** (${m.subject_name || 'General'})\n`;
          });
          response += `\n`;
        }
        if (data.syllabus && data.syllabus.length > 0) {
          response += `📖 **Academic Syllabus:**\n`;
          data.syllabus.forEach(s => {
            response += `* **${s.title}** (${s.subject_name || 'All Subjects'})\n`;
          });
        }
        if ((!data.materials || data.materials.length === 0) && (!data.syllabus || data.syllabus.length === 0)) {
          response = `No study materials have been uploaded yet for your class.`;
        }
        return response;
      }

      // -------------------------------------------------------------
      // 19. EXAMS
      // -------------------------------------------------------------
      case 'STUDENT_EXAMS': {
        if (!data.exams || data.exams.length === 0) {
          return `There are currently no upcoming exams scheduled on the calendar.`;
        }
        let response = `Scheduled Upcoming Examinations:\n\n`;
        data.exams.forEach((e, idx) => {
          response += `${idx + 1}. 📝 **${e.name}**\n   * 📅 **Date:** ${e.date || 'To be announced'}\n   * 💬 ${e.comment || 'Please refer to the detailed syllabus outline.'}\n\n`;
        });
        return response;
      }

      // -------------------------------------------------------------
      // 20. PARENT QUERIES
      // -------------------------------------------------------------
      case 'PARENT_CHILD_ATTENDANCE': {
        const name = data.childName || 'Your child';
        const pct = data.percentage !== undefined ? `${data.percentage}%` : 'N/A';
        return `**${name}'s** overall attendance is **${pct}**.\n\n* 📅 **Total Working Days:** ${data.totalWorkingDays || 0}\n* ✅ **Days Present:** ${data.present || 0}\n* ❌ **Days Absent:** ${data.absent || 0}\n* ⏰ **Late Arrivals:** ${data.late || 0}`;
      }

      case 'PARENT_CHILD_MARKS': {
        const name = data.childName || 'Your child';
        if (!data.marks || data.marks.length === 0) {
          return `No published examination marks were found for **${name}**.`;
        }
        let response = `Here is **${name}'s** examination performance:\n\n`;
        response += `| Subject | Exam | Score | Grade |\n`;
        response += `| :--- | :--- | :---: | :---: |\n`;
        data.marks.forEach(m => {
          response += `| **${m.subject_name}** | ${m.exam_name} | ${m.mark_obtained}/${m.mark_total} | **${m.grade || '-'}** |\n`;
        });
        if (data.summary) {
          response += `\n📊 **Overall Percentage:** **${data.summary.overallPercentage}%**`;
        }
        return response;
      }

      case 'PARENT_CHILD_FEES': {
        const name = data.childName || 'Your child';
        const total = (data.totalFee || 0).toLocaleString('en-IN');
        const paid = (data.paid || 0).toLocaleString('en-IN');
        const balance = (data.balance || 0).toLocaleString('en-IN');
        return `Fee ledger for **${name}**:\n\n* 💰 **Total Fee:** ₹${total}\n* ✅ **Amount Paid:** ₹${paid}\n* 📌 **Pending Due:** **₹${balance}**\n\n${data.balance <= 0 ? '✨ *All fees for this term are fully settled.*' : '⚠️ *Please settle pending invoices via the online fee payment gateway.*'}`;
      }

      case 'PARENT_CHILD_ASSIGNMENTS': {
        const name = data.childName || 'Your child';
        if (!data.assignments || data.assignments.length === 0) {
          return `**${name}** has no pending homework assignments due at this time.`;
        }
        let response = `Pending homework assignments for **${name}**:\n\n`;
        data.assignments.forEach((a, idx) => {
          response += `${idx + 1}. **${a.title}** (${a.subject_name}) — Due: **${a.due_date}**\n`;
        });
        return response;
      }

      // -------------------------------------------------------------
      // 21. TEACHER QUERIES
      // -------------------------------------------------------------
      case 'TEACHER_ATTENDANCE': {
        const att = data.attendance;
        if (!att) return `Could not fetch attendance records for your class.`;
        let response = `Class Attendance for **${att.date}**:\n\n`;
        response += `* 👥 **Enrolled Students:** ${att.totalStudents}\n`;
        response += `* ✅ **Present:** **${att.presentCount}** (${att.percentage}%)\n`;
        response += `* ❌ **Absent:** **${att.absentCount}**\n`;
        if (att.absentees && att.absentees.length > 0) {
          response += `\n**Absent Students Today:**\n`;
          att.absentees.forEach(a => {
            response += `* 🚫 ${a.name} (Roll: ${a.roll || 'N/A'})\n`;
          });
        }
        return response;
      }

      case 'TEACHER_LOW_ATTENDANCE': {
        if (!data.students || data.students.length === 0) {
          return `All active students in your class maintain attendance above **${data.threshold}%**.`;
        }
        let response = `Students with attendance below **${data.threshold}%**:\n\n`;
        data.students.forEach(s => {
          response += `* ⚠️ **${s.name}** (${s.class_name}, Roll: ${s.roll_no || 'N/A'}) — **${s.percentage}%** (${s.present_days}/${s.total_days} days)\n`;
        });
        return response;
      }

      case 'TEACHER_MARKS': {
        if (!data.averages || data.averages.length === 0) {
          return `No score records found for the requested subject/exam.`;
        }
        let response = `Subject Performance Statistics:\n\n`;
        data.averages.forEach(avg => {
          response += `* 📘 **${avg.subject_name}** (${avg.exam_name})\n   * **Class Average:** ${avg.average_marks} / ${avg.mark_total}\n   * **Highest Score:** ${avg.highest_marks} | **Lowest Score:** ${avg.lowest_marks}\n   * **Students Evaluated:** ${avg.student_count}\n\n`;
        });
        return response;
      }

      case 'TEACHER_ASSIGNMENTS': {
        if (!data.assignments || data.assignments.length === 0) {
          return `You have not created any pending homework assignments for your classes currently.`;
        }
        let response = `📋 **Your Created Classroom Assignments (${data.assignments.length}):**\n\n`;
        data.assignments.forEach((a, idx) => {
          response += `${idx + 1}. **${a.title}** (${a.subject_name}, ${a.class_name || 'Class'})\n   * 📅 **Due Date:** ${a.due_date}\n   * 📝 ${a.description || 'Assignment details'}\n\n`;
        });
        return response;
      }

      case 'TEACHER_SUBJECTS':
      case 'TEACHER_STUDENTS': {

        let response = ``;
        if (data.subjects && data.subjects.length > 0) {
          response += `👨‍🏫 **Your Assigned Subject Allocations:**\n`;
          data.subjects.forEach(s => {
            response += `* **${s.subject_name}** — ${s.class_name}\n`;
          });
          response += `\n`;
        }
        if (data.students && data.students.length > 0) {
          response += `👥 **Class Roster (${data.students.length} students):**\n`;
          data.students.slice(0, 10).forEach(st => {
            response += `* Roll ${st.roll_no || '-'}: **${st.name}** (${st.gender})\n`;
          });
          if (data.students.length > 10) {
            response += `* ...and ${data.students.length - 10} more students.\n`;
          }
        }
        return response || `No assigned classes or subject allocations found in database.`;
      }

      // -------------------------------------------------------------
      // 22. ADMIN METRICS & CRM
      // -------------------------------------------------------------
      case 'ADMIN_STUDENT_STATS':
      case 'ADMIN_TEACHER_STATS':
      case 'ADMIN_CLASS_DISTRIBUTION':
      case 'ADMIN_RECENT_ADMISSIONS': {
        const stats = data.studentStats?.totals || {};
        const totalTeachers = data.teacherCount || 0;
        const specificIntent = data.specific || intent;

        // Teacher-focused response
        if (specificIntent === 'ADMIN_TEACHER_STATS') {
          return `👨‍🏫 **Teaching & Support Staff:**\n\n* 👥 **Total Faculty & Staff:** **${totalTeachers}** teacher(s)\n\nFor a detailed department-wise faculty breakdown, ask: *"show all departments"* or *"list all teachers"*.`;
        }

        // Class distribution response
        if (specificIntent === 'ADMIN_CLASS_DISTRIBUTION' && data.studentStats?.classBreakdown?.length > 0) {
          let response = `📊 **Class-wise Student Distribution:**\n\n`;
          data.studentStats.classBreakdown.forEach(c => {
            response += `* **${c.class_name}:** ${c.student_count} students\n`;
          });
          response += `\n* 🎒 **Total Active Students:** **${stats.active_students || 0}**`;
          return response;
        }

        // Recent admissions response
        if (specificIntent === 'ADMIN_RECENT_ADMISSIONS' && data.recentAdmissions?.length > 0) {
          let response = `📋 **Recent Admissions:**\n\n`;
          data.recentAdmissions.forEach(a => {
            response += `* **${a.name}** — ${a.class_name || 'Grade'}, Adm#: ${a.admission_no}\n`;
          });
          return response;
        }

        // Default: full overview
        let response = `📊 **School Administrative Statistics:**\n\n`;
        response += `* 🎒 **Total Enrolled Students:** **${stats.total_students || 0}** (Active: ${stats.active_students || 0})\n`;
        response += `* 🚻 **Gender Distribution:** ${stats.male_students || 0} Boys | ${stats.female_students || 0} Girls\n`;
        response += `* 👨‍🏫 **Total Faculty & Staff:** **${totalTeachers}** teachers\n\n`;

        if (data.studentStats?.classBreakdown && data.studentStats.classBreakdown.length > 0) {
          response += `**Class-wise Enrollment:**\n`;
          data.studentStats.classBreakdown.forEach(c => {
            response += `* ${c.class_name}: **${c.student_count}** students\n`;
          });
          response += `\n`;
        }

        if (data.recentAdmissions && data.recentAdmissions.length > 0) {
          response += `**Recent Admissions:**\n`;
          data.recentAdmissions.forEach(a => {
            response += `* **${a.name}** (${a.class_name || 'Grade'}, Adm: ${a.admission_no})\n`;
          });
        }
        return response;
      }

      case 'ADMIN_FEE_SUMMARY': {
        const f = data.feeSummary || {};
        const invoiced = (f.totalInvoiced || 0).toLocaleString('en-IN');
        const collected = (f.totalCollected || 0).toLocaleString('en-IN');
        const discount = (f.totalDiscount || 0).toLocaleString('en-IN');
        const outstanding = (f.totalOutstanding || 0).toLocaleString('en-IN');

        let response = `💵 **School Financial & Revenue Summary:**\n\n`;
        response += `* 📑 **Total Invoiced:** ₹${invoiced}\n`;
        response += `* 🏷️ **Concessions & Scholarships:** ₹${discount}\n`;
        response += `* ✅ **Total Revenue Collected:** **₹${collected}**\n`;
        response += `* ⏳ **Total Outstanding Dues:** **₹${outstanding}**\n`;
        response += `* 📈 **Collection Efficiency:** **${f.collectionRate}%**\n\n`;
        response += `*Invoice Breakdown: ${f.paidInvoices} Paid | ${f.partiallyPaidInvoices} Partially Paid | ${f.unpaidInvoices} Unpaid*`;
        return response;
      }

      case 'ADMIN_ATTENDANCE_SUMMARY': {
        const a = data.attendanceSummary || {};
        return `📅 **School-wide Attendance Summary for Today (${a.date}):**\n\n* 👥 **Total Active Students:** ${a.totalActiveStudents}\n* ✅ **Students Present:** **${a.presentCount}**\n* ❌ **Students Absent:** **${a.absentCount}**\n* ⏰ **Late Arrivals:** ${a.lateCount}\n* 📊 **Overall School Attendance Rate:** **${a.overallPercentage}%**`;
      }

      case 'ADMIN_ENQUIRIES': {
        const enq = data.enquiries || {};
        let response = `📑 **Admissions Enquiries Overview:**\n\n* 📥 **Total Registered Enquiries:** **${enq.total || 0}**\n\n`;
        if (enq.recent && enq.recent.length > 0) {
          response += `**Recent Enquiries:**\n`;
          enq.recent.forEach(r => {
            response += `* **${r.name}** (${r.email || r.phone || 'Contact'}) — Subject: "${r.subject || 'Admission Inquiry'}"\n`;
          });
        }
        return response;
      }

      // -------------------------------------------------------------
      // 23. NOTICES, EVENTS & GALLERY
      // -------------------------------------------------------------
      case 'NOTICE_SEARCH': {
        if (!data.notices || data.notices.length === 0) {
          return `There are currently no active notices published on the noticeboard.`;
        }
        let response = `📢 **Latest School Notices & Circulars:**\n\n`;
        data.notices.forEach((n, idx) => {
          response += `${idx + 1}. **${n.notice_title}** (${n.date || 'Recent'})\n   * ${n.notice.replace(/<[^>]*>?/gm, '').substring(0, 160)}...\n\n`;
        });
        return response;
      }

      case 'EVENT_SEARCH': {
        if (!data.events || data.events.length === 0) {
          return `There are currently no upcoming events on the school calendar.`;
        }
        let response = `🗓️ **Upcoming School Events:**\n\n`;
        data.events.forEach((ev, idx) => {
          response += `${idx + 1}. 🎪 **${ev.title}**\n   * 📅 **Date:** ${ev.start_date}${ev.end_date ? ' to ' + ev.end_date : ''}\n   * 📍 **Venue:** ${ev.venue || 'Campus Grounds'}\n   * ℹ️ ${ev.description || ''}\n\n`;
        });
        return response;
      }

      case 'CMS_GALLERY': {
        if (!data.gallery || data.gallery.length === 0) {
          return `Explore our modern campus facilities in the photo gallery section on our website at [/site/gallery](/site/gallery)!`;
        }
        let response = `📸 **Campus Life & Photo Gallery:**\n\nHigh-resolution albums covering academics, athletics, and cultural events are available on our gallery page at [/site/gallery](/site/gallery).\n\nFeatured Highlights:\n`;
        data.gallery.slice(0, 4).forEach(g => {
          response += `* **${g.title}** (${g.category_name || 'Campus'})\n`;
        });
        return response;
      }

      // -------------------------------------------------------------
      // 24. STAFF / TEACHER DIRECTORY
      // -------------------------------------------------------------
      case 'STAFF_SEARCH': {
        const staff = data.staff || [];
        if (staff.length === 0) {
          return `No teacher or staff member matching **"${data.query}"** was found in our directory. Please check the spelling or contact the school office.`;
        }
        if (staff.length === 1) {
          const s = staff[0];
          return `👨‍🏫 **${s.name}** — ${s.designation || 'Faculty'} | ${s.department || 'Staff'}\n\n* 📧 **Email:** ${s.email || 'N/A'}\n* 📞 **Phone:** ${s.phone || 'N/A'}\n* ⚧ **Gender:** ${s.gender || 'N/A'}\n* ✅ **Status:** ${(s.status || 'active').toUpperCase()}`;
        }
        let response = `Found **${staff.length}** matching staff member(s):\n\n`;
        staff.forEach(s => {
          response += `* 👨‍🏫 **${s.name}** — ${s.designation || 'Faculty'} (${s.department || 'Staff'})\n`;
        });
        return response;
      }

      case 'STAFF_LIST': {
        const staff = data.staffList || [];
        if (staff.length === 0) {
          return `No active staff records were found. Please contact the school administration for the faculty directory.`;
        }
        // Group by department
        const byDept = {};
        staff.forEach(s => {
          const dept = s.department || 'General Staff';
          if (!byDept[dept]) byDept[dept] = [];
          byDept[dept].push(s);
        });
        let response = `👥 **School Faculty & Staff Directory:**\n\n`;
        Object.keys(byDept).forEach(dept => {
          response += `**${dept}:**\n`;
          byDept[dept].forEach(s => {
            response += `* ${s.name} — ${s.designation || 'Staff'}\n`;
          });
          response += '\n';
        });
        return response;
      }

      case 'STAFF_STATS': {
        const totals = data.staffStats?.totals || {};
        const byDept = data.staffStats?.byDepartment || [];
        let response = `👨‍🏫 **Teaching & Support Staff Statistics:**\n\n`;
        response += `* 👥 **Total Staff:** **${totals.total_staff || data.teacherCount || 0}**\n`;
        response += `* ✅ **Active Staff:** ${totals.active_staff || 0}\n`;
        response += `* 👨 **Male Staff:** ${totals.male_staff || 0}\n`;
        response += `* 👩 **Female Staff:** ${totals.female_staff || 0}\n`;
        if (byDept.length > 0) {
          response += `\n**Staff by Department:**\n`;
          byDept.forEach(d => {
            response += `* **${d.department}:** ${d.staff_count} staff\n`;
          });
        }
        return response;
      }

      case 'STAFF_DEPARTMENTS': {
        const depts = data.departments || [];
        if (depts.length === 0) {
          return `No academic departments are currently configured in the system.`;
        }
        let response = `🏫 **Academic Departments & Faculty:**\n\n`;
        depts.forEach(d => {
          response += `* **${d.department}:** ${d.staff_count} active staff member(s)\n`;
        });
        return response;
      }

      // -------------------------------------------------------------
      // 24. FALLBACK GENERAL SEARCH
      // -------------------------------------------------------------
      case 'PUBLIC_ABOUT':
      case 'PUBLIC_INFORMATION':
      default: {
        const info = data.schoolInfo || {};
        if (data.page && data.page.markdownContent) {
          return `### ${data.page.title}\n\n${data.page.markdownContent}`;
        }
        let response = `🏫 **About ${info.schoolName || 'Mount Carmel International School'}:**\n\n${info.tagline || 'Excellence in Education & Character Building'}\n\n`;
        response += `* 📍 **Address:** ${info.address || '450 University Boulevard, Academic City'}\n`;
        response += `* 📞 **Phone:** ${info.phone || '+1 (800) 555-0199'}\n`;
        response += `* 🕒 **Timings:** ${info.timings || 'Mon - Fri: 8:00 AM - 2:30 PM'}\n\n`;
        response += `Feel free to ask me about **admissions**, **courses & subjects**, **facilities**, **principal's message**, **events**, or **notices**!`;
        return response;
      }
    }
  }
}

module.exports = new ResponseGeneratorService();
