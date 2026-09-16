import React, {useState, useMemo} from'react';
import {useApp} from'../context/AppContext';
import {
  UserCheck, 
  UserX, 
  Clock, 
  FileText, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search,
  Users,
  Award,
  Sparkles,
  Phone,
  MessageSquare,
  Printer,
  CalendarDays,
  FileSpreadsheet,
  Check,
  X,
  RefreshCw,
  Send,
  ShieldCheck,
  Info,
  ChevronDown
} from'lucide-react';

export const AttendanceModule = () => {
  const {
    lang, 
    t, 
    currentRole, 
    currentUser,
    students = [], 
    teachers = [], 
    grades = [], 
    classrooms = [],
    attendance = [],
    addAttendanceRecord,
    batchUpdateAttendanceRecords,
    deleteAttendanceRecord,
    addNotification,
    siteSettings,
    selectedStudentId,
    setSelectedStudentId
  } = useApp();

  const isAr = lang ==='ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeGrades = grades || [];

  // Local date formatting avoiding UTC timezone shift
  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return`${year}-${month}-${day}`;
  };

  // Section extractor helper:'الشعبة (أ)'->'أ'
  const getSectionLetter = (str) => {
    if (!str) return'';
    const clean = String(str).replace(/[أإآ]/g,'ا');
    const m = clean.match(/[\(\s\-\_]([ابجدA-Z])[\)\s\-\_]?$/) || clean.match(/([ابجدA-Z])/g);
    const res = m ? m[m.length - 1] :'';
    return res ==='ا'?'أ': res;
  };

  // Grade normalization helper
  const normStr = (str) => (str ||'')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g,'ا')
    .replace('الابتدائي','')
    .replace('المتوسط','')
    .replace('الثانوي','')
    .replace('الصف','')
    .replace('الشعبة','')
    .replace(/[\(\)\-\_\s]/g,'');

  const isGradeMatch = (g1, g2) => {
    if (!g1 || !g2) return false;
    const n1 = normStr(g1);
    const n2 = normStr(g2);
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  // Active teacher resolution if current user is teacher
  const activeTeacher = (safeTeachers || []).find((t) => 
    t.id === currentUser?.id || 
    t.username === currentUser?.username || 
    t.name === currentUser?.name
  ) || (currentRole ==='teacher'? currentUser : null);

  const teacherAssignedList = (currentRole ==='teacher')
    ? (
        activeTeacher?.assignedClassrooms?.length > 0 
          ? activeTeacher.assignedClassrooms 
          : activeTeacher?.assignedClasses?.length > 0
          ? activeTeacher.assignedClasses
          : (currentUser?.assignedClassrooms || currentUser?.assignedClasses || [])
      )
    : [];

  // Allowed grades for this user
  const availableGrades = useMemo(() => {
    return safeGrades.filter(g => {
      if (currentRole !=='teacher'|| teacherAssignedList.length === 0) return true;
      return teacherAssignedList.some(assigned => isGradeMatch(g.name, assigned));
    });
  }, [safeGrades, currentRole, teacherAssignedList]);

  // View Subtabs
  const [activeSubTab, setActiveSubTab] = useState('monthly_interactive'); 
  //'monthly_interactive','daily','yearly_summary'

  // View display mode in Daily:'cards'or'table'
  const [dailyViewMode, setDailyViewMode] = useState('cards');

  // Selected Date for Daily attendance
  const [selectedDate, setSelectedDate] = useState(() => formatLocalDate(new Date()));
  
  // Selected Grade & Section
  const initialGrade = availableGrades[0]?.name || safeGrades[0]?.name ||'الصف السادس الابتدائي';
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [selectedSection, setSelectedSection] = useState('ALL'); //'ALL','أ','ب','ج','د'
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Months and Year selection for monthly registry & printing
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // School days mode:
  //'sun_thu': Sunday to Thursday (5 days - official Arab standard)
  //'sat_thu': Saturday to Thursday (6 days - tutoring / institute mode)
  //'all_days': All days of month
  const [schoolDaysMode, setSchoolDaysMode] = useState('sun_thu');

  // Quick cell popover state in monthly grid: {studentId, dateStr}
  const [activeCellMenu, setActiveCellMenu] = useState(null);

  const monthsList = [
    {num: 1, name:'كانون الثاني / يناير'},
    {num: 2, name:'شباط / فبراير'},
    {num: 3, name:'آذار / مارس'},
    {num: 4, name:'نيسان / أبريل'},
    {num: 5, name:'أيار / مايو'},
    {num: 6, name:'حزيران / يونيو'},
    {num: 7, name:'تموز / يوليو'},
    {num: 8, name:'آب / أغسطس'},
    {num: 9, name:'أيلول / سبتمبر'},
    {num: 10, name:'تشرين الأول / أكتوبر'},
    {num: 11, name:'تشرين الثاني / نوفمبر'},
    {num: 12, name:'كانون الأول / ديسمبر'},
  ];

  // Day Name Helper in Arabic
  const getDayNameAr = (dateStr) => {
    if (!dateStr) return'';
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    return days[d.getDay()] ||'';
  };

  const getShortDayNameAr = (dateStr) => {
    const full = getDayNameAr(dateStr);
    return full ? full.slice(0, 4) :'';
  };

  // Check if a date is a school day based on selected mode
  const isSchoolDay = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('-');
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayNum = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat

    if (schoolDaysMode ==='sun_thu') {
      // Sunday (0) to Thursday (4)
      return dayNum >= 0 && dayNum <= 4;
    }
    if (schoolDaysMode ==='sat_thu') {
      // Saturday (6) + Sunday (0) to Thursday (4) => everything except Friday (5)
      return dayNum !== 5;
    }
    // all_days
    return true;
  };

  // Generate valid school days for the selected month and year
  const currentMonthDays = useMemo(() => {
    const days = [];
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    while (date.getMonth() === selectedMonth - 1) {
      const dateStr = formatLocalDate(date);
      if (isSchoolDay(dateStr)) {
        days.push(dateStr);
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [selectedYear, selectedMonth, schoolDaysMode]);

  // Filtered Students for the selected Grade & Section & Search
  const filteredStudents = useMemo(() => {
    return safeStudents.filter((s) => {
      const matchGrade = !selectedGrade || isGradeMatch(s.grade, selectedGrade);
      
      const stuSection = getSectionLetter(s.classRoom || s.classroom) ||'أ';
      const matchSection = selectedSection ==='ALL'|| stuSection === selectedSection;

      const matchSearch = !searchTerm || 
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.id && s.id.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchGrade && matchSection && matchSearch;
    });
  }, [safeStudents, selectedGrade, selectedSection, searchTerm]);

  // Student Attendance Record resolution
  const getStudentStatusForDate = (studentId, dateStr) => {
    const rec = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    if (!rec) return'حاضر'; // default present
    return rec.status ||'حاضر';
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Single mark status (Interactive click)
  const handleMarkStatus = (student, status, dateToMark = selectedDate) => {
    const cleanStatus = ['حاضر','غائب','متأخر','بعذر'].includes(status) ? status :'حاضر';
    addAttendanceRecord({
      date: dateToMark,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade || selectedGrade,
      classRoom: student.classRoom || student.classroom ||'أ',
      section: student.classRoom || student.classroom ||'أ',
      status: cleanStatus,
      notes: cleanStatus
    });

    setActiveCellMenu(null);
    showToast(`تم تسجيل (${student.name}): ${cleanStatus}`);
  };

  // Toggle status for a cell in monthly grid (Cycle: حاضر -> غائب -> متأخر -> بعذر -> حاضر)
  const handleToggleCellStatus = (student, dateStr) => {
    const current = getStudentStatusForDate(student.id, dateStr);
    const order = ['حاضر','غائب','متأخر','بعذر'];
    const nextIdx = (order.indexOf(current) + 1) % order.length;
    const nextStatus = order[nextIdx];

    handleMarkStatus(student, nextStatus, dateStr);
  };

  // Batch action: Mark all filtered students as present on a specific date
  const handleBatchMarkDay = (dateStr, statusToSet ='حاضر') => {
    if (filteredStudents.length === 0) return;

    const records = filteredStudents.map(stu => ({
      date: dateStr,
      studentId: stu.id,
      studentName: stu.name,
      grade: stu.grade || selectedGrade,
      classRoom: stu.classRoom || stu.classroom ||'أ',
      section: stu.classRoom || stu.classroom ||'أ',
      status: statusToSet,
      notes: statusToSet
    }));

    if (batchUpdateAttendanceRecords) {
      batchUpdateAttendanceRecords(records);
    } else {
      records.forEach(r => addAttendanceRecord(r));
    }

    showToast(statusToSet ==='حاضر'
      ?`تم تثبيت جميع الطلاب كـ (حاضر) ليوم ${dateStr}`
      :`تم تحديد جميع الطلاب كـ (${statusToSet}) ليوم ${dateStr}`);
  };

  // Batch action: Mark one student present for all days of the month
  const handleMarkStudentAllMonth = (student, statusToSet ='حاضر') => {
    if (currentMonthDays.length === 0) return;

    const records = currentMonthDays.map(dateStr => ({
      date: dateStr,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade || selectedGrade,
      classRoom: student.classRoom || student.classroom ||'أ',
      section: student.classRoom || student.classroom ||'أ',
      status: statusToSet,
      notes: statusToSet
    }));

    if (batchUpdateAttendanceRecords) {
      batchUpdateAttendanceRecords(records);
    } else {
      records.forEach(r => addAttendanceRecord(r));
    }

    showToast(`تم تسجيل التلميذ (${student.name}) ${statusToSet} لكامل أيام الشهر!`);
  };

  // Invert daily status
  const handleInvertDay = () => {
    if (filteredStudents.length === 0) return;

    const records = filteredStudents.map(stu => {
      const cur = getStudentStatusForDate(stu.id, selectedDate);
      const next = cur ==='حاضر'?'غائب':'حاضر';
      return {
        date: selectedDate,
        studentId: stu.id,
        studentName: stu.name,
        grade: stu.grade || selectedGrade,
        classRoom: stu.classRoom || stu.classroom ||'أ',
        section: stu.classRoom || stu.classroom ||'أ',
        status: next,
        notes: next
      };
    });

    if (batchUpdateAttendanceRecords) {
      batchUpdateAttendanceRecords(records);
    } else {
      records.forEach(r => addAttendanceRecord(r));
    }

    showToast('تم عكس حالات الحضور والغياب بنجاح');
  };

  // Trigger Landscape Print
  const handlePrintLandscape = () => {
    window.print();
  };

  // Accurate daily stats
  const presentCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) ==='حاضر').length;
  const absentCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) ==='غائب').length;
  const lateCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) ==='متأخر').length;
  const excusedCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) ==='بعذر').length;
  const attendanceRate = filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 100;

  // ─── PARENT & STUDENT VIEW ────────────────────────────────────────────────
  if (currentRole ==='student'|| currentRole ==='parent') {
    const studentUser = safeStudents.find(s => 
      s.id === selectedStudentId || 
      s.id === currentUser?.id || 
      s.id === currentUser?.studentId || 
      s.name === currentUser?.name
    ) || safeStudents[0] || {id:'STU-101', name: currentUser?.name ||'طالب متميز', grade:'الصف السادس'};

    const myRecords = attendance.filter(a => a.studentId === studentUser.id);
    const myPresents = myRecords.filter(r => r.status ==='حاضر').length;
    const myAbsents = myRecords.filter(r => r.status ==='غائب').length;
    const myLates = myRecords.filter(r => r.status ==='متأخر').length;
    const myExcused = myRecords.filter(r => r.status ==='بعذر').length;
    const totalLogged = myPresents + myAbsents + myLates + myExcused;
    const myRate = totalLogged > 0 ? Math.round((myPresents / totalLogged) * 100) : 100;

    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <UserCheck className="w-6 h-6"/>
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0284C7]">سجل حضور وغياب الطالب التفاعلي</h2>
              <p className="text-xs text-slate-500 mt-1">
                كشف إحصائي وتفصيلي لحضور التلميذ: <span className="font-bold text-slate-800">{studentUser.name}</span> ({studentUser.grade ||'صف غير محدد'} - شعبة {studentUser.classRoom ||'أ'})
              </p>
            </div>
          </div>

          {currentRole ==='parent'&& safeStudents.length > 1 && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-2xl">
              <Users className="w-4 h-4 text-[#0284C7]"/>
              <span className="text-xs font-bold text-slate-700">تبديل التلميذ:</span>
              <select
                value={studentUser.id}
                onChange={(e) => setSelectedStudentId && setSelectedStudentId(e.target.value)}
                className="bg-white border border-sky-300 text-sky-900 rounded-xl px-2 py-1 text-xs font-bold outline-none cursor-pointer"
              >
                {safeStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-emerald-800 font-bold block">أيام الحضور</span>
            <span className="text-xl font-black text-emerald-700">{myPresents} يوم</span>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-red-800 font-bold block">أيام الغياب</span>
            <span className="text-xl font-black text-red-700">{myAbsents} يوم</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-amber-800 font-bold block">التأخر</span>
            <span className="text-xl font-black text-amber-700">{myLates} يوم</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-blue-800 font-bold block">غياب بعذر</span>
            <span className="text-xl font-black text-blue-700">{myExcused} يوم</span>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-purple-50 border border-purple-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-purple-800 font-bold block">نسبة الالتزام</span>
            <span className="text-xl font-black text-purple-700">{myRate}%</span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">السجل الزمني للحضور والغياب</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#0284C7] border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">التاريخ واليوم</th>
                  <th className="p-3">حالة الحضور</th>
                  <th className="p-3 text-left">ملاحظات المدرسة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan="3"className="p-8 text-slate-400 font-bold">
                      سجل نظيف بالكامل! التلميذ حاضر ومثالي في جميع الأيام الدراسية 
                    </td>
                  </tr>
                ) : (
                  myRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-3 text-right font-mono font-bold">
                        {rec.date} ({getDayNameAr(rec.date)})
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          rec.status ==='حاضر'?'bg-emerald-100 text-emerald-800':
                          rec.status ==='غائب'?'bg-red-100 text-red-800':
                          rec.status ==='متأخر'?'bg-amber-100 text-amber-800':'bg-blue-100 text-blue-800'
                        }`}>
                          {rec.status ==='حاضر'?'حاضر':
                           rec.status ==='غائب'?'غائب':
                           rec.status ==='متأخر'?'متأخر':'بعذر'}
                        </span>
                      </td>
                      <td className="p-3 text-left text-slate-500 font-bold">{rec.notes ||'—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADMIN, TEACHER & VICE-PRINCIPAL VIEW ─────────────────────────────────
  return (
    <div className="space-y-6 text-[#0F172A]">
      {/* Landscape Printing Styles */}
      <style>{`
        @media print {
          @page {
            size: landscape !important;
            margin: 6mm 6mm 6mm 6mm !important;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-attendance-sheet, #printable-attendance-sheet * {
            visibility: visible !important;
          }
          #printable-attendance-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 4px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            page-break-inside: auto !important;
            font-size: 8.5pt !important;
          }
          tr {
            page-break-inside: avoid !important;
          }
          th, td {
            border: 1px solid #1e293b !important;
            color: #000 !important;
            padding: 3px 2px !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0284C7] text-white text-xs font-black px-6 py-3 rounded-2xl shadow-2xl z-[999999] animate-bounce flex items-center gap-2 border border-sky-300 no-print">
          <CheckCircle2 className="w-4 h-4 text-white"/>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0284C7] via-sky-700 to-[#0369A1] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-amber-300"/>
            <h2 className="text-xl font-black">{isAr ?'سجل الحضور والغياب المدرسي التفاعلي':'Interactive Attendance Registry'}</h2>
            <span className="text-[10px] font-black bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/30 text-white">
              طباعة Landscape 
            </span>
          </div>
          <p className="text-xs text-sky-100 font-medium">
            سجل ديناميكي متكامل: رصد فوري بالضغط المباشر على الخلايا، فلترة دقيقة حسب الصف والشعبة، وتوليد تقارير أفقية عريضة جاهزة للطباعة.
          </p>
        </div>

        {/* Subtabs Selector */}
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md p-1.5 rounded-2xl border border-white/25 relative z-10 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveSubTab('monthly_interactive')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab ==='monthly_interactive'?'bg-white text-[#0284C7] shadow-md font-black':'text-white hover:bg-white/10'
            }`}
          >
            <CalendarDays className="w-4 h-4"/>
            <span> السجل الشهري التفاعلي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('daily')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab ==='daily'?'bg-white text-[#0284C7] shadow-md font-black':'text-white hover:bg-white/10'
            }`}
          >
            <CheckCircle2 className="w-4 h-4"/>
            <span> الكشف اليومي المباشر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('yearly_summary')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab ==='yearly_summary'?'bg-white text-[#0284C7] shadow-md font-black':'text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-4 h-4"/>
            <span> التقرير السنوي التراكمي</span>
          </button>
        </div>
      </div>

      {/* Teacher notice if role is teacher */}
      {currentRole ==='teacher'&& (
        <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#0284C7] text-white rounded-xl font-bold shadow-xs"></span>
            <div>
              <span className="font-bold text-slate-800">
                حساب الأستاذ: <strong className="text-[#0284C7]">{activeTeacher?.name || currentUser?.name}</strong>
              </span>
              <span className="text-slate-500 mr-2">
                (الصفوف الموكلة: {teacherAssignedList.length > 0 ? teacherAssignedList.join('،') :'كل الصفوف'})
              </span>
            </div>
          </div>
          <span className="text-[11px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-lg">
            تصفية تلقائية بحسب فصولك
          </span>
        </div>
      )}

      {/* ─── MAIN FILTER TOOLBAR (no-print) ─── */}
      <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-3xl shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          
          {/* 1. Grade Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0284C7]"/>
              <span>الصف الدراسي:</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              {availableGrades.map((g) => (
                <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
              ))}
            </select>
          </div>

          {/* 2. Section Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0284C7]"/>
              <span>الشعبة المستهدفة:</span>
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="ALL">جميع الشُعب (الكل)</option>
              <option value="أ">الشعبة (أ)</option>
              <option value="ب">الشعبة (ب)</option>
              <option value="ج">الشعبة (ج)</option>
              <option value="د">الشعبة (د)</option>
            </select>
          </div>

          {/* 3. Subtab Specific Filter (Date / Month) */}
          {activeSubTab ==='daily'? (
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0284C7]"/>
                <span>تاريخ اليوم ({getDayNameAr(selectedDate)}):</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]"/>
                <span>شهر التقرير:</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
              >
                {monthsList.map(m => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 4. Search Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-[#0284C7]"/>
              <span>بحث عن تلميذ:</span>
            </label>
            <input
              type="text"
              placeholder="اسم التلميذ أو المعرّف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          {/* 5. Quick Print & Landscape Button */}
          <div>
            <button
              type="button"
              onClick={handlePrintLandscape}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-xl py-2 px-3 text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="طباعة السجل بالوضع الأفقي الكامل (Landscape)"
            >
              <Printer className="w-4 h-4 text-amber-400"/>
              <span>طباعة Landscape </span>
            </button>
          </div>
        </div>

        {/* Extra options bar for interactive grid */}
        {activeSubTab ==='monthly_interactive'&& (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-700">نظام أيام الدوام الشهري:</span>
              <select
                value={schoolDaysMode}
                onChange={(e) => setSchoolDaysMode(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-[11px] font-bold cursor-pointer outline-none"
              >
                <option value="sun_thu">الأحد إلى الخميس (5 أيام - الدوام الرسمي العربي)</option>
                <option value="sat_thu">السبت إلى الخميس (6 أيام - معاهد التقوية)</option>
                <option value="all_days">كامل أيام الشهر (30/31 يوم)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold">
              <span> دلالة الرموز في الجدول:</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ حاضر</span>
              <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">غ غائب</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">م متأخر</span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">ع بعذر</span>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. INTERACTIVE MONTHLY GRID (السجل الشهري التفاعلي) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab ==='monthly_interactive'&& (
        <div id="printable-attendance-sheet"className="bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl shadow-sm space-y-4">
          
          {/* Printable Official Header */}
          <div className="border-b-2 border-slate-800 pb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {siteSettings?.schoolLogo ? (
                <img src={siteSettings.schoolLogo} alt="Logo"className="w-12 h-12 object-contain"/>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center font-black text-lg">
                  
                </div>
              )}
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  {siteSettings?.schoolName ||'مدرسة الدعم التعليمي'} - سجل الحضور والغياب الشهري الرسمي
                </h2>
                <div className="text-xs text-slate-600 font-bold flex flex-wrap items-center gap-2 mt-1">
                  <span>الصف: <strong className="text-slate-900">{selectedGrade}</strong></span>
                  <span>•</span>
                  <span>الشعبة: <strong className="text-slate-900">{selectedSection ==='ALL'?'جميع الشُعب':`(${selectedSection})`}</strong></span>
                  <span>•</span>
                  <span>الشهر: <strong className="text-slate-900">{monthsList.find(m => m.num === selectedMonth)?.name} {selectedYear}</strong></span>
                  <span>•</span>
                  <span>العام الدراسي: <strong>{siteSettings?.academicYear ||'2026/2027'}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-left text-[10px] text-slate-500 font-mono shrink-0">
              <span className="font-bold text-slate-800">سجل رسمي معتمد</span>
              <br />
              <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-LB')}</span>
              <br />
              <span>وضع الطباعة: <strong className="text-emerald-700 font-bold">Landscape (أفقي)</strong></span>
            </div>
          </div>

          {/* Interactive Batch Action Bar inside sheet (no-print) */}
          <div className="no-print bg-[#F8FAFC] border border-slate-200 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500"/>
              <span className="font-black text-slate-700">
                الجدول تفاعلي بالكامل: اضغط على أي خانة يوم لتعديل حالة الطالب مباشرة (حاضر / غائب / متأخر / بعذر)!
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrintLandscape}
                className="bg-[#0284C7] hover:bg-sky-700 text-white font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5"/>
                <span>معاينة وطباعة بالعرض (Landscape) </span>
              </button>
            </div>
          </div>

          {/* ─── FULL MATRIX TABLE ─── */}
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-black">
                  <th className="p-1.5 border border-slate-300 text-center w-8">#</th>
                  <th className="p-1.5 border border-slate-300 text-right min-w-[140px]">اسم التلميذ</th>
                  <th className="p-1.5 border border-slate-300 text-center w-12">الشعبة</th>
                  
                  {/* Days columns */}
                  {currentMonthDays.map((dateStr) => {
                    const dayNum = dateStr.split('-')[2];
                    const dayShortName = getShortDayNameAr(dateStr);

                    return (
                      <th 
                        key={dateStr} 
                        className="p-1 border border-slate-300 text-center font-mono hover:bg-sky-100 transition-colors cursor-pointer group relative"
                        title={`اضغط لخيارات يوم ${dateStr}`}
                        onClick={() => {
                          if (window.confirm(`هل تريد تحديد جميع طلاب الكشف كـ (حاضر) ليوم ${dateStr} (${dayShortName})؟`)) {
                            handleBatchMarkDay(dateStr,'حاضر');
                          }
                        }}
                      >
                        <span className="block text-[8px] text-slate-500">{dayShortName}</span>
                        <span className="text-xs font-black">{dayNum}</span>
                        <span className="hidden group-hover:block absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow z-20 whitespace-nowrap">
                          تثبيت الكل حاضر 
                        </span>
                      </th>
                    );
                  })}

                  <th className="p-1.5 border border-slate-300 text-center text-emerald-800 bg-emerald-50 font-black w-12">حاضر</th>
                  <th className="p-1.5 border border-slate-300 text-center text-red-800 bg-red-50 font-black w-12">غائب</th>
                  <th className="p-1.5 border border-slate-300 text-center text-amber-800 bg-amber-50 font-black w-10">تأخر</th>
                  <th className="p-1.5 border border-slate-300 text-center bg-sky-50 font-black w-14">النسبة %</th>
                  <th className="p-1.5 border border-slate-300 text-center no-print w-16">إجراء</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={currentMonthDays.length + 8} className="p-8 text-center text-slate-400 font-bold">
                      لا يوجد تلاميذ مطابقون لخيارات الفلترة الحالية ({selectedGrade} - شعبة {selectedSection}).
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((stu, sIdx) => {
                    let stuPresents = 0;
                    let stuAbsents = 0;
                    let stuLates = 0;
                    let stuExcused = 0;

                    return (
                      <tr key={stu.id} className="hover:bg-slate-50 border-b border-slate-200">
                        <td className="p-1 border border-slate-300 font-mono text-center font-bold text-slate-500">
                          {sIdx + 1}
                        </td>
                        <td className="p-1.5 border border-slate-300 font-black text-slate-900 whitespace-nowrap text-right">
                          {stu.name}
                        </td>
                        <td className="p-1 border border-slate-300 text-center font-bold text-slate-700">
                          {getSectionLetter(stu.classRoom || stu.classroom) ||'أ'}
                        </td>

                        {/* Month Days interactive cells */}
                        {currentMonthDays.map((dateStr) => {
                          const status = getStudentStatusForDate(stu.id, dateStr);
                          if (status ==='حاضر') stuPresents++;
                          else if (status ==='غائب') stuAbsents++;
                          else if (status ==='متأخر') stuLates++;
                          else if (status ==='بعذر') stuExcused++;

                          const isCellActive = activeCellMenu?.studentId === stu.id && activeCellMenu?.dateStr === dateStr;

                          return (
                            <td 
                              key={dateStr} 
                              className={`p-0.5 border border-slate-300 text-center font-black relative transition-all cursor-pointer select-none ${
                                status ==='حاضر'?'bg-emerald-50/40 hover:bg-emerald-100 text-emerald-700':
                                status ==='غائب'?'bg-red-100/70 hover:bg-red-200 text-red-700 font-black':
                                status ==='متأخر'?'bg-amber-100 hover:bg-amber-200 text-amber-700':
                                'bg-blue-100 hover:bg-blue-200 text-blue-700'
                              }`}
                              onClick={() => handleToggleCellStatus(stu, dateStr)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setActiveCellMenu(isCellActive ? null : {studentId: stu.id, dateStr});
                              }}
                              title={`انقر للتبديل: ${stu.name} - ${dateStr} (${status})`}
                            >
                              <span className="text-xs">
                                {status ==='حاضر'?'✓':
                                 status ==='غائب'?'غ':
                                 status ==='متأخر'?'م':'ع'}
                              </span>

                              {/* Interactive Context Menu popup */}
                              {isCellActive && (
                                <div 
                                  className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-slate-300 rounded-xl shadow-xl p-1.5 flex gap-1 no-print animate-scale-up"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleMarkStatus(stu,'حاضر', dateStr)}
                                    className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded font-bold text-[10px]"
                                  >
                                    ✓ حاضر
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkStatus(stu,'غائب', dateStr)}
                                    className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-[10px]"
                                  >
                                    غ غائب
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkStatus(stu,'متأخر', dateStr)}
                                    className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-bold text-[10px]"
                                  >
                                    م متأخر
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkStatus(stu,'بعذر', dateStr)}
                                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold text-[10px]"
                                  >
                                    ع بعذر
                                  </button>
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Row Totals */}
                        <td className="p-1 border border-slate-300 text-center font-black text-emerald-800 bg-emerald-50/50 font-mono text-xs">
                          {stuPresents}
                        </td>
                        <td className="p-1 border border-slate-300 text-center font-black text-red-800 bg-red-50/50 font-mono text-xs">
                          {stuAbsents}
                        </td>
                        <td className="p-1 border border-slate-300 text-center font-black text-amber-800 bg-amber-50/50 font-mono text-xs">
                          {stuLates}
                        </td>
                        <td className="p-1 border border-slate-300 text-center font-black bg-sky-50/70 font-mono text-xs">
                          {currentMonthDays.length > 0 
                            ?`${Math.round((stuPresents / currentMonthDays.length) * 100)}%`
                            :'100%'}
                        </td>
                        
                        {/* Quick action for student row (no-print) */}
                        <td className="p-1 border border-slate-300 text-center no-print">
                          <button
                            type="button"
                            onClick={() => handleMarkStudentAllMonth(stu,'حاضر')}
                            className="px-1.5 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded text-[9px] font-black cursor-pointer transition-all"
                            title="تحديد كامل الشهر حاضر لهذا التلميذ"
                          >
                            كل الشهر 
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* Table Footer: Column Totals for each day */}
              {filteredStudents.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-black border-t-2 border-slate-400">
                    <td colSpan="3"className="p-1.5 border border-slate-300 text-right">
                      مجموع الحاضرين يومياً 
                    </td>
                    {currentMonthDays.map((dateStr) => {
                      const dayPresents = filteredStudents.filter(s => getStudentStatusForDate(s.id, dateStr) ==='حاضر').length;
                      return (
                        <td key={dateStr} className="p-1 border border-slate-300 text-center text-emerald-800 font-mono font-black text-[10px]">
                          {dayPresents}
                        </td>
                      );
                    })}
                    <td colSpan="5"className="p-1 border border-slate-300 text-center text-[9px] text-slate-500 font-bold">
                      إجمالي الطلاب: {filteredStudents.length}
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-black">
                    <td colSpan="3"className="p-1.5 border border-slate-300 text-right text-red-800">
                      مجموع الغائبين يومياً 
                    </td>
                    {currentMonthDays.map((dateStr) => {
                      const dayAbsents = filteredStudents.filter(s => getStudentStatusForDate(s.id, dateStr) ==='غائب').length;
                      return (
                        <td key={dateStr} className={`p-1 border border-slate-300 text-center font-mono font-black text-[10px] ${
                          dayAbsents > 0 ?'text-red-700 bg-red-100/50':'text-slate-400'
                        }`}>
                          {dayAbsents}
                        </td>
                      );
                    })}
                    <td colSpan="5"className="p-1 border border-slate-300 text-center text-[9px] text-slate-500 font-bold">
                      دوام معتمد
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Official Signatures Block at Bottom of Sheet */}
          <div className="pt-6 mt-4 border-t-2 border-slate-300 grid grid-cols-3 text-center text-xs font-bold text-slate-800">
            <div className="space-y-8">
              <span>أستاذ الصف / المشرف التربوي</span>
              <div className="border-b border-dotted border-slate-500 w-36 mx-auto"></div>
            </div>
            <div className="space-y-8">
              <span>مسؤول شؤون الطلاب والتسجيل</span>
              <div className="border-b border-dotted border-slate-500 w-36 mx-auto"></div>
            </div>
            <div className="space-y-8">
              <span>اعتماد وختم مدير المدرسة</span>
              <div className="border-b border-dotted border-slate-500 w-36 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. DAILY ATTENDANCE (الكشف اليومي المباشر) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab ==='daily'&& (
        <div className="space-y-4">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 block">الحاضرون اليوم</span>
                <span className="text-lg font-black text-emerald-700">{presentCount} طالب</span>
              </div>
              <UserCheck className="w-6 h-6 text-emerald-600 opacity-80"/>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-red-800 block">الغائبون اليوم</span>
                <span className="text-lg font-black text-red-700">{absentCount} طالب</span>
              </div>
              <UserX className="w-6 h-6 text-red-600 opacity-80"/>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 block">المتأخرون</span>
                <span className="text-lg font-black text-amber-700">{lateCount} طالب</span>
              </div>
              <Clock className="w-6 h-6 text-amber-600 opacity-80"/>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-sky-800 block">نسبة الالتزام اليوم</span>
                <span className="text-lg font-black text-[#0284C7]">{attendanceRate}%</span>
              </div>
              <Users className="w-6 h-6 text-[#0284C7] opacity-80"/>
            </div>
          </div>

          {/* Action and View Toggle Bar */}
          <div className="bg-white border border-[#E2E8F0] p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleBatchMarkDay(selectedDate,'حاضر')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4"/>
                <span>تثبيت الكل حاضر </span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchMarkDay(selectedDate,'غائب')}
                className="bg-red-600 hover:bg-red-700 text-white font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <UserX className="w-4 h-4"/>
                <span>تحديد الكل غائب </span>
              </button>

              <button
                type="button"
                onClick={handleInvertDay}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5"/>
                <span>عكس التحديد </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">طريقة العرض:</span>
              <button
                type="button"
                onClick={() => setDailyViewMode('cards')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dailyViewMode ==='cards'?'bg-[#0284C7] text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                بطاقات
              </button>
              <button
                type="button"
                onClick={() => setDailyViewMode('table')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dailyViewMode ==='table'?'bg-[#0284C7] text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                جدول كشف
              </button>
            </div>
          </div>

          {/* Cards View */}
          {dailyViewMode ==='cards'&& (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 font-bold">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30"/>
                  <p>لا يوجد طلاب مطابقون للتحديد الحالي.</p>
                </div>
              ) : (
                filteredStudents.map((stu) => {
                  const status = getStudentStatusForDate(stu.id, selectedDate);

                  return (
                    <div 
                      key={stu.id}
                      className={`bg-white border-2 p-4 rounded-3xl shadow-xs transition-all flex flex-col justify-between gap-3 ${
                        status ==='حاضر'?'border-emerald-200 hover:border-emerald-400':
                        status ==='غائب'?'border-red-200 bg-red-50/20 hover:border-red-400':
                        status ==='متأخر'?'border-amber-200 bg-amber-50/20 hover:border-amber-400':
                        'border-blue-200 bg-blue-50/20 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 ${
                            status ==='حاضر'?'bg-emerald-600':
                            status ==='غائب'?'bg-red-600':
                            status ==='متأخر'?'bg-amber-600':'bg-blue-600'
                          }`}>
                            {(stu.name ||'ط')[0]}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-black text-[#0F172A] truncate">{stu.name}</h4>
                            <span className="text-[10px] font-mono text-slate-400 block">
                              شعبة: ({getSectionLetter(stu.classRoom || stu.classroom) ||'أ'}) • ID: {stu.id}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                          status ==='حاضر'?'bg-emerald-100 text-emerald-800 border border-emerald-300':
                          status ==='غائب'?'bg-red-100 text-red-800 border border-red-300':
                          status ==='متأخر'?'bg-amber-100 text-amber-800 border border-amber-300':
                          'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {status ==='حاضر'?'حاضر':
                           status ==='غائب'?'غائب':
                           status ==='متأخر'?'متأخر':'بعذر'}
                        </span>
                      </div>

                      {/* Status action buttons */}
                      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu,'حاضر')}
                          className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            status ==='حاضر'?'bg-emerald-600 text-white font-black shadow-xs':'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          حاضر 
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu,'غائب')}
                          className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            status ==='غائب'?'bg-red-600 text-white font-black shadow-xs':'bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          غائب 
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu,'متأخر')}
                          className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            status ==='متأخر'?'bg-amber-500 text-white font-black shadow-xs':'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          متأخر 
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkStatus(stu,'بعذر')}
                          className={`py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                            status ==='بعذر'?'bg-blue-600 text-white font-black shadow-xs':'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          بعذر 
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Table List View */}
          {dailyViewMode ==='table'&& (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-4 shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-800 border-b border-slate-200 font-bold">
                    <th className="p-2.5 text-right">#</th>
                    <th className="p-2.5 text-right">اسم التلميذ</th>
                    <th className="p-2.5">الشعبة</th>
                    <th className="p-2.5">الحالة الحالية</th>
                    <th className="p-2.5">تعديل الحالة السريع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStudents.map((stu, sIdx) => {
                    const status = getStudentStatusForDate(stu.id, selectedDate);
                    return (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="p-2.5 text-right font-mono font-bold text-slate-400">{sIdx + 1}</td>
                        <td className="p-2.5 text-right font-black text-slate-900">{stu.name}</td>
                        <td className="p-2.5 font-bold">{getSectionLetter(stu.classRoom || stu.classroom) ||'أ'}</td>
                        <td className="p-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            status ==='حاضر'?'bg-emerald-100 text-emerald-800':
                            status ==='غائب'?'bg-red-100 text-red-800':
                            status ==='متأخر'?'bg-amber-100 text-amber-800':'bg-blue-100 text-blue-800'
                          }`}>
                            {status ==='حاضر'?'حاضر':
                             status ==='غائب'?'غائب':
                             status ==='متأخر'?'متأخر':'بعذر'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(stu,'حاضر')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                status ==='حاضر'?'bg-emerald-600 text-white font-black':'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              حاضر 
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(stu,'غائب')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                status ==='غائب'?'bg-red-600 text-white font-black':'bg-red-50 text-red-800 hover:bg-red-100'
                              }`}
                            >
                              غائب 
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(stu,'متأخر')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                status ==='متأخر'?'bg-amber-500 text-white font-black':'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              }`}
                            >
                              متأخر 
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkStatus(stu,'بعذر')}
                              className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                status ==='بعذر'?'bg-blue-600 text-white font-black':'bg-blue-50 text-blue-800 hover:bg-blue-100'
                              }`}
                            >
                              بعذر 
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. YEARLY SUMMARY REPORT (التقرير السنوي التراكمي - Landscape) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab ==='yearly_summary'&& (
        <div id="printable-attendance-sheet"className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">
                {siteSettings?.schoolName ||'مدرسة الدعم التعليمي'} - كشف الحضور والغياب الختامي لآخر السنة الدراسية
              </h2>
              <div className="text-xs text-slate-600 font-bold flex items-center gap-3">
                <span>الصف: <strong>{selectedGrade}</strong></span>
                <span>•</span>
                <span>الشعبة: <strong>{selectedSection ==='ALL'?'جميع الشُعب': selectedSection}</strong></span>
                <span>•</span>
                <span>العام الدراسي: <strong>{siteSettings?.academicYear ||'2026/2027'}</strong></span>
              </div>
            </div>
            <div className="text-left font-mono text-[10px] text-slate-500">
              <span>تاريخ التقرير: {new Date().toLocaleDateString('ar-LB')}</span>
              <br />
              <span>التقرير التراكمي الشامل (Landscape)</span>
            </div>
          </div>

          {/* Yearly Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black">
                  <th className="p-2.5 border border-slate-300 text-right w-10">#</th>
                  <th className="p-2.5 border border-slate-300 text-right">اسم التلميذ</th>
                  <th className="p-2.5 border border-slate-300 text-center w-24">الصف والشعبة</th>
                  <th className="p-2.5 border border-slate-300 text-center text-emerald-800 bg-emerald-50">إجمالي أيام الحضور</th>
                  <th className="p-2.5 border border-slate-300 text-center text-red-800 bg-red-50">إجمالي أيام الغياب</th>
                  <th className="p-2.5 border border-slate-300 text-center text-amber-800 bg-amber-50">أيام التأخر</th>
                  <th className="p-2.5 border border-slate-300 text-center bg-sky-50">نسبة الالتزام السنوية</th>
                  <th className="p-2.5 border border-slate-300 text-center">التقييم السلوكي للحضور</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu, sIdx) => {
                  const stuRecords = attendance.filter(a => a.studentId === stu.id);
                  const totalAbsences = stuRecords.filter(a => a.status ==='غائب').length;
                  const totalPresents = stuRecords.filter(a => a.status ==='حاضر').length;
                  const totalLates = stuRecords.filter(a => a.status ==='متأخر').length;
                  const totalRecorded = totalAbsences + totalPresents + totalLates;
                  const rate = totalRecorded > 0 ? Math.round((totalPresents / totalRecorded) * 100) : 100;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="p-2.5 border border-slate-300 font-mono text-center font-bold">{sIdx + 1}</td>
                      <td className="p-2.5 border border-slate-300 font-black">{stu.name}</td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold text-slate-600">
                        {stu.grade} ({getSectionLetter(stu.classRoom || stu.classroom) ||'أ'})
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black text-emerald-700 bg-emerald-50 font-mono text-sm">
                        {totalPresents} يوم
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black text-red-700 bg-red-50 font-mono text-sm">
                        {totalAbsences} يوم
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black text-amber-700 bg-amber-50 font-mono text-sm">
                        {totalLates} يوم
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black bg-sky-50 font-mono text-sm">
                        {rate}%
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold">
                        {rate >= 95 ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                            ملتزم ومثالي جداً 
                          </span>
                        ) : rate >= 85 ? (
                          <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            جيد جداً 
                          </span>
                        ) : rate >= 75 ? (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            متوسط الالتزام 
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-black">
                            إنذار غياب متكرر 
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 text-center text-xs font-bold text-slate-700">
            <div>
              <span>مسؤول شؤون الطلاب</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-36 mx-auto"></div>
            </div>
            <div>
              <span>المرشد التربوي للمرحلة</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-36 mx-auto"></div>
            </div>
            <div>
              <span>اعتماد مدير عام المدرسة</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-36 mx-auto"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
