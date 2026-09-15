import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
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
  FileSpreadsheet
} from 'lucide-react';

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
    deleteAttendanceRecord,
    addNotification,
    siteSettings
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeGrades = grades || [];

  // For Student or Parent: Show ONLY their own attendance history
  if (currentRole === 'student' || currentRole === 'parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || { id: 'STU-101', name: currentUser?.name || 'طالب متميز' };
    const myRecords = attendance.filter(a => a.studentId === studentUser.id);
    const presentDays = myRecords.filter(r => r.status === 'حاضر').length;
    const absentDays = myRecords.filter(r => r.status === 'غائب' || r.status === 'بعذر').length;
    const lateDays = myRecords.filter(r => r.status === 'متأخر').length;
    
    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0284C7]">سجل حضور وغياب الطالب</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? `التقرير التفصيلي لحضور وغياب التلميذ: ${studentUser.name}` : `Attendance records for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-emerald-800 font-bold block">أيام الحضور</span>
            <span className="text-xl font-black text-emerald-700">{presentDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-red-800 font-bold block">أيام الغياب</span>
            <span className="text-xl font-black text-red-700">{absentDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
            <span className="text-xs text-amber-800 font-bold block">أيام التأخر</span>
            <span className="text-xl font-black text-amber-700">{lateDays} {isAr ? 'يوم' : 'Days'}</span>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">جدول التواريخ والتفاصيل</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[#0284C7] border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">التاريخ</th>
                  <th className="p-3">حالة الحضور</th>
                  <th className="p-3 text-left">ملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-6 text-slate-400 font-bold">لم يتم تسجيل أي غيابات أو تأخيرات في السجل بعد. حضور كامل! 🟢</td>
                  </tr>
                ) : (
                  myRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="p-3 text-right font-mono">{rec.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'حاضر' ? 'bg-emerald-100 text-emerald-800' :
                          rec.status === 'غائب' ? 'bg-red-100 text-red-800' :
                          rec.status === 'متأخر' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="p-3 text-left text-slate-500 font-bold">{rec.notes || '—'}</td>
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

  // Official School Days rule: Monday (1), Tuesday (2), Wednesday (3), Thursday (4)
  const isSchoolDay = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    return day >= 1 && day <= 4;
  };

  const getDayNameAr = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[d.getDay()] || '';
  };

  const [activeSubTab, setActiveSubTab] = useState('daily'); // 'daily', 'monthly_print', 'yearly_print', 'staff', 'reports'
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState(safeGrades[0]?.name || 'الصف السادس الابتدائي');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all'); // 'all' or studentId
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Months and Year selection for reports and printing
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1 - 12
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const monthsList = [
    { num: 1, name: 'كانون الثاني / يناير' },
    { num: 2, name: 'شباط / فبراير' },
    { num: 3, name: 'آذار / مارس' },
    { num: 4, name: 'نيسان / أبريل' },
    { num: 5, name: 'أيار / مايو' },
    { num: 6, name: 'حزيران / يونيو' },
    { num: 7, name: 'تموز / يوليو' },
    { num: 8, name: 'آب / أغسطس' },
    { num: 9, name: 'أيلول / سبتمبر' },
    { num: 10, name: 'تشرين الأول / أكتوبر' },
    { num: 11, name: 'تشرين الثاني / نوفمبر' },
    { num: 12, name: 'كانون الأول / ديسمبر' },
  ];

  // All students in the selected Grade
  const studentsInGrade = useMemo(() => {
    return safeStudents.filter(s => !selectedGrade || s.grade === selectedGrade || (s.grade && s.grade.includes(selectedGrade)));
  }, [safeStudents, selectedGrade]);

  // Filtered Students for the selected Grade & specific Student Filter
  const filteredStudents = useMemo(() => {
    return safeStudents.filter((s) => {
      const matchGrade = !selectedGrade || s.grade === selectedGrade || (s.grade && s.grade.includes(selectedGrade));
      const matchStudent = selectedStudentFilter === 'all' || s.id === selectedStudentFilter;
      const matchSearch = !searchTerm || s.name.includes(searchTerm) || s.id.includes(searchTerm);
      return matchGrade && matchStudent && matchSearch;
    });
  }, [safeStudents, selectedGrade, selectedStudentFilter, searchTerm]);

  // Generate valid official school days for a given month (Only Mon, Tue, Wed, Thu)
  const currentMonthSchoolDays = useMemo(() => {
    const days = [];
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    while (date.getMonth() === selectedMonth - 1) {
      const dNum = date.getDay();
      if (dNum >= 1 && dNum <= 4) { // Monday to Thursday
        days.push(date.toISOString().split('T')[0]);
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [selectedYear, selectedMonth]);

  // Strictly return 'حاضر' or 'غائب' only
  const getStudentStatusForDate = (studentId, dateStr) => {
    const rec = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    if (!rec) return 'حاضر'; // default present
    return rec.status === 'غائب' ? 'غائب' : 'حاضر';
  };

  const handleMarkStatus = (student, status) => {
    const cleanStatus = status === 'غائب' ? 'غائب' : 'حاضر';
    addAttendanceRecord({
      date: selectedDate,
      studentId: student.id,
      studentName: student.name,
      grade: student.grade || selectedGrade,
      status: cleanStatus,
      notes: cleanStatus
    });

    setToastMsg(isAr ? `تم تسجيل (${student.name}): ${cleanStatus === 'حاضر' ? 'حاضر 🟢' : 'غائب 🔴'}` : `Marked ${cleanStatus}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleMarkAllPresent = () => {
    filteredStudents.forEach(stu => {
      addAttendanceRecord({
        date: selectedDate,
        studentId: stu.id,
        studentName: stu.name,
        grade: stu.grade || selectedGrade,
        status: 'حاضر',
        notes: 'حاضر'
      });
    });
    setToastMsg(isAr ? 'تم تسجيل الجميع كـ (حاضر 🟢) بنجاح' : 'All students marked present!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Accurate Stats calculation for selected Date
  const presentCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) === 'حاضر').length;
  const absentCount = filteredStudents.filter(s => getStudentStatusForDate(s.id, selectedDate) === 'غائب').length;
  const attendanceRate = filteredStudents.length > 0 ? Math.round((presentCount / filteredStudents.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-attendance-sheet, #printable-attendance-sheet * {
            visibility: visible;
          }
          #printable-attendance-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #333 !important;
            color: black !important;
            padding: 6px !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#0284C7] text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-2xl z-[99999] animate-bounce flex items-center gap-2 border border-sky-300 no-print">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0284C7] via-sky-700 to-[#0369A1] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-amber-300" />
            <h2 className="text-xl font-black">{isAr ? 'سجل الحضور والغياب المدرسي' : 'School Attendance Registry'}</h2>
          </div>
          <p className="text-xs text-sky-100 font-medium">
            أيام الدوام المعتمدة: <span className="font-black underline text-amber-300">الاثنين • الثلاثاء • الأربعاء • الخميس</span> (حاضر / غائب فقط)
          </p>
        </div>

        {/* Subtab navigation */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 relative z-10 shrink-0 flex-wrap">
          <button
            onClick={() => setActiveSubTab('daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'daily' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            📋 الكشف اليومي
          </button>
          <button
            onClick={() => setActiveSubTab('monthly_print')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'monthly_print' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨️ طباعة شهرية</span>
          </button>
          <button
            onClick={() => setActiveSubTab('yearly_print')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'yearly_print' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🎓 طباعة آخر السنة</span>
          </button>
        </div>
      </div>

      {/* ─── FILTER CONTROLS BAR ─── */}
      <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-3xl shadow-sm space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Grade Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>الصف الدراسي الكامل:</span>
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedStudentFilter('all');
              }}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
            >
              {safeGrades.map((g) => (
                <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
              ))}
            </select>
          </div>

          {/* Student Filter: All Grade OR Specific Student */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>تحديد النطاق (الصف كاملاً أو تلميذ معين):</span>
            </label>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7]"
            >
              <option value="all">👥 كامل طلاب الصف ({studentsInGrade.length} طلاب)</option>
              {studentsInGrade.map((stu) => (
                <option key={stu.id} value={stu.id}>👤 {stu.name} (ID: {stu.id})</option>
              ))}
            </select>
          </div>

          {/* Date Picker or Month Selector */}
          {activeSubTab === 'daily' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 block flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>تاريخ اليوم ({getDayNameAr(selectedDate)}):</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full bg-[#F8FAFC] border rounded-xl px-3 py-2 text-xs font-bold focus:outline-none font-mono ${
                  isSchoolDay(selectedDate) ? 'border-[#E2E8F0] text-[#0F172A]' : 'border-amber-400 bg-amber-50 text-amber-900'
                }`}
              />
            </div>
          ) : activeSubTab === 'monthly_print' ? (
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 block flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>شهر التقرير:</span>
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              >
                {monthsList.map(m => (
                  <option key={m.num} value={m.num}>{m.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-extrabold text-slate-600 block flex items-center gap-1">
                <CalendarDays className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>العام الدراسي:</span>
              </label>
              <input
                type="text"
                disabled
                value={siteSettings?.academicYear || '2026/2027'}
                className="w-full bg-slate-100 border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold font-mono text-center"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div>
            {activeSubTab === 'daily' ? (
              <button
                onClick={handleMarkAllPresent}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-3 text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تثبيت الكل حاضر 🟢</span>
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="w-full bg-[#0284C7] hover:bg-sky-700 text-white rounded-xl py-2 px-3 text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الكشف الرسمي 🖨️</span>
              </button>
            )}
          </div>
        </div>

        {/* Weekend notice if non-school day */}
        {activeSubTab === 'daily' && !isSchoolDay(selectedDate) && (
          <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
            <span>⚠️ تنبيه: تاريخ ({selectedDate} - {getDayNameAr(selectedDate)}) هو يوم عطلة. أيام الدوام المعتمدة هي الاثنين والثلاثاء والأربعاء والخميس فقط.</span>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SUBTAB 1: DAILY ATTENDANCE (حاضر / غائب فقط) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'daily' && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 block">الحاضرون اليوم</span>
                <span className="text-base font-black text-emerald-700">{presentCount} طالب</span>
              </div>
              <UserCheck className="w-6 h-6 text-emerald-600 opacity-80" />
            </div>

            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-red-800 block">الغائبون اليوم</span>
                <span className="text-base font-black text-red-700">{absentCount} طالب</span>
              </div>
              <UserX className="w-6 h-6 text-red-600 opacity-80" />
            </div>

            <div className="col-span-2 sm:col-span-1 bg-sky-50 border border-sky-200 p-3 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-sky-800 block">إجمالي طلاب الكشف</span>
                <span className="text-base font-black text-[#0284C7]">{filteredStudents.length} طالب</span>
              </div>
              <Users className="w-6 h-6 text-[#0284C7] opacity-80" />
            </div>
          </div>

          {/* Students Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">لا يوجد طلاب مطابقون للتحديد الحالي.</p>
              </div>
            ) : (
              filteredStudents.map((stu) => {
                const status = getStudentStatusForDate(stu.id, selectedDate);
                const isPresent = status === 'حاضر';

                return (
                  <div 
                    key={stu.id}
                    className={`bg-white border-2 p-4 rounded-3xl shadow-xs transition-all flex flex-col justify-between gap-3 ${
                      isPresent ? 'border-emerald-200 hover:border-emerald-400' : 'border-red-200 bg-red-50/20 hover:border-red-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-white shrink-0 ${
                          isPresent ? 'bg-emerald-600' : 'bg-red-600'
                        }`}>
                          {(stu.name || 'ط')[0]}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-black text-[#0F172A] truncate">{stu.name}</h4>
                          <span className="text-[10px] font-mono text-slate-400 block">ID: {stu.id} • {stu.grade}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                        isPresent ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {isPresent ? '🟢 حاضر' : '🔴 غائب'}
                      </span>
                    </div>

                    {/* Action buttons: Strictly Present and Absent */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleMarkStatus(stu, 'حاضر')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isPresent ? 'bg-emerald-600 text-white shadow-sm font-black' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>حاضر 🟢</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleMarkStatus(stu, 'غائب')}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          !isPresent ? 'bg-red-600 text-white shadow-sm font-black' : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>غائب 🔴</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SUBTAB 2: MONTHLY PRINT SHEET (طباعة شهرية رسمية) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'monthly_print' && (
        <div id="printable-attendance-sheet" className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          {/* Print Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">
                {siteSettings?.schoolName || 'مدرسة الدعم التعليمي'} - سجل الحضور والغياب الشهري الرسمي
              </h2>
              <div className="text-xs text-slate-600 font-bold flex items-center gap-3">
                <span>📚 الصف: {selectedGrade}</span>
                <span>•</span>
                <span>📅 الشهر: {monthsList.find(m => m.num === selectedMonth)?.name} {selectedYear}</span>
                {selectedStudentFilter !== 'all' && (
                  <>
                    <span>•</span>
                    <span className="text-[#0284C7]">👤 التلميذ: {safeStudents.find(s => s.id === selectedStudentFilter)?.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-left font-mono text-[10px] text-slate-500">
              <span>تاريخ الطباعة: {new Date().toLocaleDateString('ar-LB')}</span>
              <br />
              <span>دوام رسمي (إثنين - خميس)</span>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black">
                  <th className="p-2 border border-slate-300 text-right">#</th>
                  <th className="p-2 border border-slate-300 text-right">اسم التلميذ</th>
                  <th className="p-2 border border-slate-300 text-center">الصف</th>
                  {currentMonthSchoolDays.map((dateStr) => {
                    const dayNum = dateStr.split('-')[2];
                    const dayName = getDayNameAr(dateStr);
                    return (
                      <th key={dateStr} className="p-1 border border-slate-300 text-center font-mono">
                        <span className="block text-[9px] text-slate-500">{dayName.slice(0, 3)}</span>
                        <span>{dayNum}</span>
                      </th>
                    );
                  })}
                  <th className="p-2 border border-slate-300 text-center text-emerald-700 bg-emerald-50">حاضر</th>
                  <th className="p-2 border border-slate-300 text-center text-red-700 bg-red-50">غائب</th>
                  <th className="p-2 border border-slate-300 text-center bg-sky-50">النسبة %</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu, sIdx) => {
                  let stuPresent = 0;
                  let stuAbsent = 0;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="p-2 border border-slate-300 font-mono text-center">{sIdx + 1}</td>
                      <td className="p-2 border border-slate-300 font-bold whitespace-nowrap">{stu.name}</td>
                      <td className="p-2 border border-slate-300 text-center whitespace-nowrap text-[10px] text-slate-600">{stu.grade}</td>
                      {currentMonthSchoolDays.map((dateStr) => {
                        const status = getStudentStatusForDate(stu.id, dateStr);
                        const isPres = status === 'حاضر';
                        if (isPres) stuPresent++;
                        else stuAbsent++;

                        return (
                          <td key={dateStr} className="p-1 border border-slate-300 text-center font-bold font-mono">
                            {isPres ? (
                              <span className="text-emerald-700 font-black">✓</span>
                            ) : (
                              <span className="text-red-600 font-black">غ</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2 border border-slate-300 text-center font-bold text-emerald-700 bg-emerald-50 font-mono">
                        {stuPresent}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold text-red-700 bg-red-50 font-mono">
                        {stuAbsent}
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold bg-sky-50 font-mono">
                        {currentMonthSchoolDays.length > 0 ? `${Math.round((stuPresent / currentMonthSchoolDays.length) * 100)}%` : '100%'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 text-center text-xs font-bold text-slate-700">
            <div>
              <span>أستاذ الصف / المشرف</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-32 mx-auto"></div>
            </div>
            <div>
              <span>مسؤول شؤون الطلاب</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-32 mx-auto"></div>
            </div>
            <div>
              <span>توقيع وختم الإدارة العامة</span>
              <div className="mt-8 border-b border-dotted border-slate-400 w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* SUBTAB 3: YEARLY PRINT SHEET (طباعة آخر السنة المجمعة) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeSubTab === 'yearly_print' && (
        <div id="printable-attendance-sheet" className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          {/* Print Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900">
                {siteSettings?.schoolName || 'مدرسة الدعم التعليمي'} - كشف الحضور والغياب الختامي لآخر السنة الدراسية
              </h2>
              <div className="text-xs text-slate-600 font-bold flex items-center gap-3">
                <span>📚 الصف: {selectedGrade}</span>
                <span>•</span>
                <span>🎓 العام الدراسي: {siteSettings?.academicYear || '2026/2027'}</span>
                {selectedStudentFilter !== 'all' && (
                  <>
                    <span>•</span>
                    <span className="text-[#0284C7]">👤 التلميذ: {safeStudents.find(s => s.id === selectedStudentFilter)?.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-left font-mono text-[10px] text-slate-500">
              <span>تاريخ التقرير: {new Date().toLocaleDateString('ar-LB')}</span>
              <br />
              <span>التقرير التراكمي السنوي</span>
            </div>
          </div>

          {/* Yearly Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-black">
                  <th className="p-2.5 border border-slate-300 text-right">#</th>
                  <th className="p-2.5 border border-slate-300 text-right">اسم التلميذ</th>
                  <th className="p-2.5 border border-slate-300 text-center">الصف والشعبة</th>
                  <th className="p-2.5 border border-slate-300 text-center text-emerald-800 bg-emerald-50">إجمالي أيام الحضور</th>
                  <th className="p-2.5 border border-slate-300 text-center text-red-800 bg-red-50">إجمالي أيام الغياب</th>
                  <th className="p-2.5 border border-slate-300 text-center bg-sky-50">نسبة الالتزام السنوية</th>
                  <th className="p-2.5 border border-slate-300 text-center">التقييم العام للحضور</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((stu, sIdx) => {
                  const stuRecords = attendance.filter(a => a.studentId === stu.id);
                  const totalAbsences = stuRecords.filter(a => a.status === 'غائب').length;
                  const totalPresents = stuRecords.filter(a => a.status === 'حاضر').length;
                  const totalRecorded = totalAbsences + totalPresents;
                  const rate = totalRecorded > 0 ? Math.round((totalPresents / totalRecorded) * 100) : 100;

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50 border-b border-slate-200">
                      <td className="p-2.5 border border-slate-300 font-mono text-center">{sIdx + 1}</td>
                      <td className="p-2.5 border border-slate-300 font-bold">{stu.name}</td>
                      <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-600">{stu.grade} ({stu.classroom || stu.classRoom || 'أ'})</td>
                      <td className="p-2.5 border border-slate-300 text-center font-black text-emerald-700 bg-emerald-50 font-mono text-sm">
                        {totalPresents} يوم
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black text-red-700 bg-red-50 font-mono text-sm">
                        {totalAbsences} يوم
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-black bg-sky-50 font-mono text-sm">
                        {rate}%
                      </td>
                      <td className="p-2.5 border border-slate-300 text-center font-bold">
                        {rate >= 95 ? (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">ممتاز (ملتزم جداً) 🌟</span>
                        ) : rate >= 85 ? (
                          <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">جيد جداً 👍</span>
                        ) : rate >= 75 ? (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">مقبول ⚠️</span>
                        ) : (
                          <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[10px]">غياب متكرر 🚨</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-3 text-center text-xs font-bold text-slate-700">
            <div>
              <span>أمين سر شؤون الطلاب</span>
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
