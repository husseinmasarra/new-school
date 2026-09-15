import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, FileSpreadsheet, CheckCircle2, GraduationCap, DollarSign, Search, Users, UserCheck, X } from 'lucide-react';

export const ReportsModule = () => {
  const { 
    lang, t, currentRole, currentUser, students = [], subjects = [], selectedStudentId,
    dailyMarks = [], addDailyMark, deleteDailyMark,
    getStudentSubjectScores, getStudentOverallGpa, behaviorRecords = []
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];

  const getDynamicAcademicYear = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    if (currentMonth >= 9) {
      return `${currentYear} - ${currentYear + 1}`;
    } else {
      return `${currentYear - 1} - ${currentYear}`;
    }
  };

  const getLevantFormattedDate = () => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const levantMonths = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ];
    return `${day} ${levantMonths[today.getMonth()]} ${year}`;
  };

  const [reportType, setReportType] = useState('academic'); // academic, financial, attendance, daily_log
  const [stuId, setStuId] = useState(selectedStudentId || safeStudents[0]?.id);
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportGradeFilter, setReportGradeFilter] = useState('all');

  const getSectionLetter = (str) => {
    if (!str) return '';
    const m = str.match(/[\(\s\-\_]([أبجدA-Z])[\)\s\-\_]?$/) || str.match(/([أبجدA-Z])/g);
    return m ? m[m.length - 1] : '';
  };

  const normGradeStr = (str) => (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الصف', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\-\_\s]/g, '');

  const isStudentAssignedToTeacher = (student, assignedList) => {
    if (!assignedList || assignedList.length === 0) return true;
    const sGrade = normGradeStr(student.grade);
    const sSec = getSectionLetter(student.classRoom || student.classroom);

    return assignedList.some((assignedItem) => {
      const aGrade = normGradeStr(assignedItem);
      const aSec = getSectionLetter(assignedItem);
      const gradeMatches = !sGrade || !aGrade || aGrade.includes(sGrade) || sGrade.includes(aGrade.replace(/[أبجدA-Z]/g, ''));
      const secMatches = !sSec || !aSec || sSec === aSec;
      return gradeMatches && secMatches;
    });
  };

  // Filtered Students for Reports Smart Search
  const filteredReportStudents = safeStudents.filter((s) => {
    const term = reportSearchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
                          (s.name || '').toLowerCase().includes(term) ||
                          (s.nameEn || '').toLowerCase().includes(term) ||
                          (s.id || '').toLowerCase().includes(term) ||
                          (s.username || '').toLowerCase().includes(term) ||
                          (s.grade || '').toLowerCase().includes(term) ||
                          (s.classRoom || '').toLowerCase().includes(term) ||
                          (s.parentName || '').toLowerCase().includes(term) ||
                          (s.parentPhone || '').includes(term) ||
                          (s.phone || '').includes(term) ||
                          (s.ministryClearance || '').toLowerCase().includes(term);
    const matchesGrade = reportGradeFilter === 'all' || (s.grade || '').includes(reportGradeFilter);
    const matchesTeacherAssignment = currentRole !== 'teacher' || isStudentAssignedToTeacher(s, currentUser?.assignedClassrooms || currentUser?.assignedClasses || []);
    return matchesSearch && matchesGrade && matchesTeacherAssignment;
  });

  // Extract unique grades for quick filter pills
  const availableGrades = Array.from(new Set(safeStudents.map(s => s.grade).filter(Boolean)));

  // New Daily Mark Form Modal State
  const [showAddMarkModal, setShowAddMarkModal] = useState(false);
  const [newMark, setNewMark] = useState({
    subjectName: (subjects && subjects[0]?.name) || '',
    type: 'أعمال السنة',
    score: 20,
    maxScore: 20,
    notes: 'مشاركة ممتازة وتفاعل يومي'
  });

  const selectedStudent = safeStudents.find((s) => s.id === stuId) || safeStudents[0];
  const dynamicSubjectScores = getStudentSubjectScores ? getStudentSubjectScores(selectedStudent?.id) : [];
  const computedGpa = getStudentOverallGpa ? getStudentOverallGpa(selectedStudent?.id) : 0;

  const computedClassroomRank = (() => {
    if (!selectedStudent) return 'N/A';
    const peers = safeStudents.filter(
      (s) => s.grade === selectedStudent.grade && (s.classRoom === selectedStudent.classRoom || (!s.classRoom && !selectedStudent.classRoom))
    );
    if (peers.length <= 1) return isAr ? 'الأول (1)' : '1st (1)';
    const peerGpas = peers.map((p) => ({
      id: p.id,
      gpa: Number(getStudentOverallGpa ? getStudentOverallGpa(p.id) : 0)
    }));
    peerGpas.sort((a, b) => b.gpa - a.gpa);
    const rankIndex = peerGpas.findIndex((x) => x.id === selectedStudent.id) + 1;
    const ordinalNamesAr = {
      1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس',
      6: 'السادس', 7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر'
    };
    const rankWord = isAr ? (ordinalNamesAr[rankIndex] || `${rankIndex}`) : `${rankIndex}`;
    return `${rankWord} (${rankIndex})`;
  })();

  const computedGradeRank = (() => {
    if (!selectedStudent) return 'N/A';
    const peers = safeStudents.filter((s) => s.grade === selectedStudent.grade);
    if (peers.length <= 1) return isAr ? 'الأول (1)' : '1st (1)';
    const peerGpas = peers.map((p) => ({
      id: p.id,
      gpa: Number(getStudentOverallGpa ? getStudentOverallGpa(p.id) : 0)
    }));
    peerGpas.sort((a, b) => b.gpa - a.gpa);
    const rankIndex = peerGpas.findIndex((x) => x.id === selectedStudent.id) + 1;
    const ordinalNamesAr = {
      1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس',
      6: 'السادس', 7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر'
    };
    const rankWord = isAr ? (ordinalNamesAr[rankIndex] || `${rankIndex}`) : `${rankIndex}`;
    return `${rankWord} (${rankIndex})`;
  })();

  const computedBehaviorScore = (() => {
    let score = 100;
    const records = (behaviorRecords || []).filter(r => r.studentId === selectedStudent?.id);
    records.forEach(r => {
      if (r.type === 'سلبي' || r.type?.toLowerCase() === 'negative' || r.type === 'إرشاد وسلوك') {
        score -= 5;
      } else if (r.type === 'إيجابي' || r.type?.toLowerCase() === 'positive') {
        score += 2;
      }
    });
    return Math.max(0, Math.min(100, score));
  })();

  if (!selectedStudent) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 animate-fade-in shadow-sm text-[#0F172A]">
        <div className="w-16 h-16 bg-[#0284C7]/10 text-[#0284C7] rounded-3xl flex items-center justify-center mx-auto">
          <Printer className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-[#0284C7]">{isAr ? 'لا يوجد طلاب مضافون حالياً لإصدار التقارير 📄' : 'No Students Available for Reports'}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isAr ? 'يمكنك إضافة طالب جديد من قسم (دليل المدرسة) لبدء إستخراج التقارير والشهادات المدرسية.' : 'Add a student from Directory to generate reports.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Banner Header & Controls (Hidden when printing) */}
      <div className="no-print space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0284C7]">{t('reportsTitle')}</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr 
                  ? "إصدار وطباعة كافة التقارير الأكاديمية والمالية وكشوف الحسابات والشهادات المدرسية."
                  : "Generate and print academic report cards, financial ledger statements, and attendance logs."}
              </p>
            </div>
          </div>

          {/* Quick Select Dropdown */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">{t('studentName')}:</span>
            <select
              value={stuId || ''}
              onChange={(e) => setStuId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
            >
              {safeStudents.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-[#0F172A]">
                  {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Smart Student Cards Selector Grid */}
        <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0284C7]">
                  {isAr ? `اختيار كرت الطالب لإصدار التقرير والشهادة (${filteredReportStudents.length} طالب)` : `Select Student Card for Report (${filteredReportStudents.length})`}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isAr ? 'انقر على كرت أي طالب لاختياره ومعاينة كشف علاماته وتقاريره المدرسية فوراً' : 'Click any student card to select and view their official report card'}
                </p>
              </div>
            </div>

            {/* Smart Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#0284C7] absolute top-2.5 right-3 rtl:right-3 ltr:left-3 pointer-events-none" />
              <input
                type="text"
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                placeholder={isAr ? '🔍 البحث الذكي في كروت الطلاب...' : 'Search student cards...'}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-9 py-2 text-xs font-semibold focus:outline-none focus:border-[#0284C7] transition-all"
              />
              {reportSearchTerm && (
                <button
                  onClick={() => setReportSearchTerm('')}
                  className="absolute top-2 left-3 rtl:left-3 ltr:right-3 text-slate-400 hover:text-red-500 text-xs font-bold bg-slate-200 hover:bg-slate-300 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
                  title="مسح البحث"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Grade Quick Filter Pills */}
          {availableGrades.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-3">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-1">تصفية الصفوف:</span>
              <button
                onClick={() => setReportGradeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                  reportGradeFilter === 'all'
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isAr ? `الكل (${safeStudents.length})` : `All (${safeStudents.length})`}
              </button>
              {availableGrades.map((gradeName) => {
                const count = safeStudents.filter(s => (s.grade || '').includes(gradeName)).length;
                return (
                  <button
                    key={gradeName}
                    onClick={() => setReportGradeFilter(reportGradeFilter === gradeName ? 'all' : gradeName)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                      reportGradeFilter === gradeName
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {gradeName} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Student Cards Grid */}
          {filteredReportStudents.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs font-bold border border-dashed border-slate-200 rounded-2xl">
              {isAr ? 'لا يوجد طالب يطابق كلمات البحث الحالية' : 'No student found matching search'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-[#F8FAFC]">
              {filteredReportStudents.map((s) => {
                const isSelected = s.id === selectedStudent?.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setStuId(s.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-sky-50 border-[#0284C7] ring-2 ring-[#0284C7]/30 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-[#0284C7]/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shrink-0 border ${isSelected ? 'border-[#0284C7] bg-[#0284C7] text-white' : 'border-slate-300 bg-slate-100 text-slate-700'}`}>
                        {(s.name || 'ط')[0]}
                      </div>
                      <div className="truncate">
                        <h4 className={`text-xs font-extrabold truncate ${isSelected ? 'text-[#0284C7]' : 'text-slate-800'}`}>
                          {isAr ? s.name : s.nameEn}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {s.grade} ({s.classRoom || 'أ'})
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="bg-[#0284C7] text-white text-[9px] px-2 py-0.5 rounded-full font-black shrink-0 flex items-center gap-1">
                        ✓ مختار
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold hover:text-[#0284C7] shrink-0">
                        اختيار
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Report Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Academic Report Card */}
          <div
            onClick={() => setReportType('academic')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'academic'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              {reportType === 'academic' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('academicReport')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "كشف درجات الطالب الرسمية وترتيب الصف والمعدل العام والتقييمات." : "Official student grades, rank, GPA, and teacher performance notes."}
            </p>
          </div>

          {/* Daily Marks Registry Card */}
          <div
            onClick={() => setReportType('daily_log')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'daily_log'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              {reportType === 'daily_log' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{isAr ? 'سجل العلامات اليومية 📊' : 'Daily Marks Log'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "رصد وإضافة علامات واختبارات الطالب اليومية وحساب المعدل التراكمي." : "Log & track daily student grades across subjects to compute GPA."}
            </p>
          </div>

          {/* Financial Report Card (Hidden for Teachers) */}
          {currentRole !== 'teacher' && (
            <div
              onClick={() => setReportType('financial')}
              className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
                reportType === 'financial'
                  ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                  : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <DollarSign className="w-6 h-6" />
                </div>
                {reportType === 'financial' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('financialReport')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {isAr ? "كشف حساب مالي تفصيلي بالأقساط المسددة بالدولار والمبالغ المتبقية." : "Detailed student tuition payment statement in USD & remaining dues."}
              </p>
            </div>
          )}

          {/* Attendance Report Card */}
          <div
            onClick={() => setReportType('attendance')}
            className={`interactive-card p-6 rounded-3xl border-2 transition-all cursor-pointer space-y-3 shadow-sm ${
              reportType === 'attendance'
                ? 'bg-[#F8FAFC] dark:bg-[#1E293B] border-[#0284C7] ring-1 ring-[#0284C7]'
                : 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              {reportType === 'attendance' && <CheckCircle2 className="w-5 h-5 text-[#0284C7]" />}
            </div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">{t('attendanceReport')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {isAr ? "تقرير حضور وغياب الطالب وساعات الانضباط والتأخيرات المسجلة." : "Student attendance log, discipline hours, and registered tardiness."}
            </p>
          </div>

        </div>
      </div>

      {/* Main Printable Stage Document */}
      <div className="space-y-6">
        <div className="no-print bg-white border border-[#E2E8F0] rounded-3xl p-4 sm:p-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
            <div>
              <h3 className="text-base font-bold text-[#0284C7]">{isAr ? selectedStudent.name : selectedStudent.nameEn}</h3>
              <p className="text-xs text-slate-500">{isAr ? selectedStudent.grade : selectedStudent.gradeEn} ({selectedStudent.classRoom})</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>
              {reportType === 'academic' 
                ? (isAr ? 'طباعة التقرير الأكاديمي 🖨️' : 'Print Academic Report 🖨️')
                : reportType === 'financial'
                ? (isAr ? 'طباعة الكشف المالي 🖨️' : 'Print Financial Statement 🖨️')
                : (isAr ? 'طباعة تقرير الحضور 🖨️' : 'Print Attendance Log 🖨️')}
            </span>
          </button>
        </div>

        {/* Academic Report Section - Harmonized Official Report Certificate */}
        {reportType === 'academic' && (
          <div 
            className="printable-document bg-white dark:bg-[#0F172A] border-0 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative my-4 text-[#0F172A] dark:text-white"
          >
            
            {/* 🏫 Official School Crest & Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-[#0284C7] pb-5 text-center sm:text-right gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shadow-md border-2 border-[#0284C7] flex items-center justify-center">
                  <img src="/emblem.png" alt="School Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-[#0284C7] dark:text-[#38BDF8]">{isAr ? 'مدرسة الدعم التعليمي' : 'Educational Support School'}</h1>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="inline-block bg-[#0284C7]/10 dark:bg-[#0284C7]/20 text-[#0284C7] dark:text-[#38BDF8] px-3 py-1 rounded-full text-xs font-black border border-[#0284C7]/30">
                  كشف درجات وشهادة تقويم رسمية 📜
                </div>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 block pt-1">رقم المستند: SCH-2026/9842</p>
                <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 block">التاريخ: {getLevantFormattedDate()}</p>
              </div>
            </div>

            {/* 👤 Student Information Summary Box */}
            <div className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#0284C7]/30 dark:border-[#334155] rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs text-[#0F172A] dark:text-white">
              <div className="flex items-center gap-3 col-span-2">
                <div className="w-14 h-14 rounded-2xl font-black text-xl bg-[#0284C7]/10 text-[#0284C7] border-2 border-[#0284C7] flex items-center justify-center shadow-sm shrink-0">
                  {(selectedStudent.name || 'ط')[0]}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">اسم الطالب الرباعي:</span>
                  <h3 className="text-base font-black text-[#0F172A] dark:text-white">{selectedStudent.name}</h3>
                  <span className="text-xs font-mono font-extrabold text-slate-500 dark:text-slate-400">{selectedStudent.nameEn || selectedStudent.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">الصف والشعبة:</span>
                <span className="text-sm font-black text-[#0F172A] dark:text-white block">{selectedStudent.grade} ({selectedStudent.classRoom || 'أ'})</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8] block">العام الدراسي والمرحلة:</span>
                <span className="text-sm font-black text-[#0F172A] dark:text-white block">{getDynamicAcademicYear()} (الفصل الثاني)</span>
                <span className="text-xs block font-bold">
                  {(() => {
                    const hasFailedSubject = dynamicSubjectScores.some(s => s.total > 0 && s.total < 40);
                    const isOverallFail = hasFailedSubject || (Number(computedGpa) > 0 && Number(computedGpa) < 40);
                    if (isOverallFail) {
                      return <span className="text-red-600 dark:text-red-400">الحالة: راسب 🔴 (أقل من 40%)</span>;
                    }
                    return <span className="text-emerald-600 dark:text-emerald-400">الحالة: ناجح ومجتاز 🟢</span>;
                  })()}
                </span>
              </div>
            </div>

            {/* 📊 Official Detailed Marks Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-between border-b border-slate-200 dark:border-[#334155] pb-2">
                <span className="font-extrabold">جدول تفاصيل درجات المواد الدراسية للعام الحالي:</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 font-extrabold">العلامة الكلية للمادة (100)</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right border-collapse border border-slate-200 dark:border-[#334155] text-xs">
                  <thead>
                    <tr className="bg-[#0284C7] text-white text-xs font-black">
                      <th className="p-3 border border-sky-700 text-right">المادة الدراسية</th>
                      <th className="p-3 border border-sky-700 text-center print:hidden">أعمال السنة (20)</th>
                      <th className="p-3 border border-sky-700 text-center print:hidden">الاختبارات (20)</th>
                      <th className="p-3 border border-sky-700 text-center">منتصف الفصل (20)</th>
                      <th className="p-3 border border-sky-700 text-center">النهائي (40)</th>
                      <th className="p-3 border border-sky-700 text-center">المجموع (100)</th>
                      <th className="p-3 border border-sky-700 text-center">التقدير الرسمي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
                    {dynamicSubjectScores.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
                          {isAr ? 'لم يتم إضافة أي مواد دراسية للنظام بعد. يمكنك إضافة المواد من قسم دليل المواد.' : 'No active subjects added yet.'}
                        </td>
                      </tr>
                    ) : (
                      dynamicSubjectScores.map((row, idx) => (
                        <tr 
                          key={row.id || idx} 
                          className="bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-[#334155] transition-colors"
                        >
                          <td className="p-3 border border-slate-200 dark:border-[#334155] font-black text-sm text-[#0F172A] dark:text-white">
                            {row.name}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200 print:hidden">
                            {row.hw}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200 print:hidden">
                            {row.quiz}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                            {row.midterm}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                            {row.final}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-black text-base text-[#0284C7] dark:text-[#38BDF8]">
                            {row.total}
                          </td>
                          <td className="p-3 border border-slate-200 dark:border-[#334155] text-center">
                            <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              {row.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

             {/* 🏅 Final Result KPI Summary Cards */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono pt-2">
               <div className="bg-sky-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-sky-200 dark:border-[#334155] text-center space-y-1">
                 <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">المعدل العام التراكمي:</span>
                 <span className="text-xl font-black text-[#0284C7] dark:text-[#38BDF8] block">
                   {Number(computedGpa) > 0 ? `${computedGpa}%` : (isAr ? 'لا يوجد درجات' : 'N/A')}
                 </span>
               </div>
               <div className="bg-purple-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-purple-200 dark:border-[#334155] text-center space-y-1">
                 <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">الترتيب على الشعبة:</span>
                 <span className="text-xl font-black text-purple-700 dark:text-purple-400 block">{computedClassroomRank} 🏆</span>
               </div>
               <div className="bg-indigo-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-indigo-200 dark:border-[#334155] text-center space-y-1">
                 <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">الترتيب على المرحلة:</span>
                 <span className="text-xl font-black text-indigo-700 dark:text-indigo-400 block">{computedGradeRank} 🌟</span>
               </div>
               <div className="bg-emerald-50 dark:bg-[#1E293B] p-3.5 rounded-2xl border border-emerald-200 dark:border-[#334155] text-center space-y-1">
                 <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold">درجة الانضباط والسلوك:</span>
                 <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 block">{computedBehaviorScore} / 100 🟢</span>
               </div>
             </div>

            {/* ✍️ Official Signatures & School Seal Space */}
            <div className="pt-6 border-t-2 border-[#0284C7] dark:border-[#334155] grid grid-cols-3 gap-6 items-end text-xs text-[#0F172A] dark:text-white">
              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">توقيع مربي الصف ومعلم المادة:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>

              {/* Clean Official Signature & School Seal Space */}
              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">خاتم المدرسة والتصديق الرسمي:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>

              <div className="text-center space-y-4">
                <span className="font-extrabold text-[#0284C7] dark:text-[#38BDF8] text-xs block">توقيع مدير المدرسة:</span>
                <div className="h-10 border-b border-dashed border-[#0284C7] dark:border-[#334155] mx-4"></div>
              </div>
            </div>

          </div>
        )}

        {/* Financial Statement Section */}
        {reportType === 'financial' && (
          <div className="space-y-4">
            {selectedStudent.frozen && (
              <div className="bg-cyan-50 border-2 border-cyan-300 p-4 rounded-2xl text-cyan-900 font-bold text-xs flex items-center gap-2">
                <span className="text-xl">❄️</span>
                <div>
                  <h4 className="font-black text-sm text-cyan-950">حساب الطالب مجمد (موقوف عن المطالبات والدفعات المتأخرة المستحقة)</h4>
                  <p className="text-[11px] text-cyan-800 font-semibold pt-0.5">تم تجميد مطالبات الدفعات المتأخرة عن هذا الحساب تلقائياً ولا يُحسب ضمن الذمم المالية النشطة.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                <span className="text-slate-500 block">{t('totalTuition')}:</span>
                <span className="text-lg font-bold text-[#0F172A]">${selectedStudent.tuitionTotal || 1200} USD</span>
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
                <span className="text-slate-500 block">{t('paidAmount')}:</span>
                <span className="text-lg font-bold text-[#0284C7]">${selectedStudent.tuitionPaid || 0} USD</span>
              </div>
              <div className={`p-4 rounded-2xl border ${selectedStudent.frozen ? 'bg-cyan-50 border-cyan-300' : 'bg-[#F8FAFC] border-red-300'}`}>
                <span className={`${selectedStudent.frozen ? 'text-cyan-800 font-black' : 'text-red-600 font-bold'} block`}>
                  {selectedStudent.frozen ? 'حالة المتأخرات والمطالبة:' : t('remainingAmount') + ':'}
                </span>
                <span className={`text-lg font-bold ${selectedStudent.frozen ? 'text-cyan-900 font-black' : 'text-red-600'}`}>
                  {selectedStudent.frozen ? '❄️ مجمد (معفى من المتأخرات)' : `$${(selectedStudent.tuitionTotal || 1200) - (selectedStudent.tuitionPaid || 0)} USD`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Log Section */}
        {reportType === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'أيام الحضور المسجلة:' : 'Days Present:'}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">175 {isAr ? 'يوم' : 'Days'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'أيام الغياب بعذر:' : 'Excused Absences:'}</span>
                <span className="text-lg font-bold text-[#0284C7] dark:text-[#38BDF8]">2 {isAr ? 'يوم' : 'Days'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-[#1E293B] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#334155]">
                <span className="text-slate-500 dark:text-slate-400 block">{isAr ? 'نسبة الانضباط:' : 'Attendance Rate:'}</span>
                <span className="text-lg font-bold text-[#0F172A] dark:text-white">98.8%</span>
              </div>
            </div>
          </div>
        )}

        {/* 📊 Daily Marks & Cumulative Assessment Registry Log */}
        {reportType === 'daily_log' && (
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0284C7] dark:text-[#38BDF8]">
                  {isAr ? `سجل العلامات اليومية والتراكمية للطالب: ${selectedStudent.name}` : `Daily Marks Log: ${selectedStudent.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isAr 
                    ? "رصد كافة العلامات اليومية واختبارات المواد طوال العام وتجميعها تلقائياً لاحتساب المعدل العام." 
                    : "Track daily marks, homework, and quizzes across the entire academic year to calculate cumulative GPA."}
                </p>
              </div>

              <button
                onClick={() => setShowAddMarkModal(true)}
                className="btn-mustard flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                <span>{isAr ? 'إضافة تقييم/علامة يومية جديدة ➕' : 'Add Daily Mark ➕'}</span>
              </button>
            </div>

            {/* Daily Marks Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right border-collapse border border-slate-200 dark:border-[#334155] text-xs">
                <thead>
                  <tr className="bg-[#0284C7] text-white text-xs font-bold">
                    <th className="p-3 border border-sky-700 text-right">التاريخ</th>
                    <th className="p-3 border border-sky-700 text-right">المادة الدراسية</th>
                    <th className="p-3 border border-sky-700 text-center">نوع التقييم</th>
                    <th className="p-3 border border-sky-700 text-center">العلامة</th>
                    <th className="p-3 border border-sky-700 text-center">العلامة العظمى</th>
                    <th className="p-3 border border-sky-700 text-right">الملاحظات والتفاصيل</th>
                    <th className="p-3 border border-sky-700 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
                  {(dailyMarks.filter((m) => m.studentId === selectedStudent.id)).length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400 font-bold">
                        {isAr ? 'لا توجد علامات يومية مسجلة لهذا الطالب بعد. اضغط على زر الإضافة أعلاه لرصد علامة جديدة.' : 'No daily marks recorded yet for this student.'}
                      </td>
                    </tr>
                  ) : (
                    dailyMarks.filter((m) => m.studentId === selectedStudent.id).map((m) => (
                      <tr key={m.id} className="bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="p-3 border border-slate-200 dark:border-[#334155] font-mono font-bold text-slate-600 dark:text-slate-300">
                          {m.date}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] font-black text-[#0F172A] dark:text-white">
                          {m.subjectName || m.subject}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-bold">
                          <span className="px-2 py-1 rounded-md text-[11px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-black">
                            {m.type}
                          </span>
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-black text-sm text-[#0284C7] dark:text-[#38BDF8]">
                          {m.score}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center font-mono font-bold text-slate-500 dark:text-slate-400">
                          {m.maxScore || 20}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-300 font-medium">
                          {m.notes || '-'}
                        </td>
                        <td className="p-3 border border-slate-200 dark:border-[#334155] text-center">
                          <button
                            onClick={() => deleteDailyMark && deleteDailyMark(m.id)}
                            className="p-1.5 bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                            title="حذف العلامة"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Daily Mark Modal */}
      {showAddMarkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl text-[#0F172A] dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h3 className="text-base font-bold text-[#0284C7] dark:text-[#38BDF8]">
                {isAr ? `إضافة علامة يومية للطالب: ${selectedStudent.name}` : `Add Daily Mark: ${selectedStudent.name}`}
              </h3>
              <button 
                onClick={() => setShowAddMarkModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (addDailyMark) {
                  addDailyMark({
                    studentId: selectedStudent.id,
                    studentName: selectedStudent.name,
                    ...newMark
                  });
                }
                setShowAddMarkModal(false);
              }}
              className="space-y-4 text-xs font-bold"
            >
              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">المادة الدراسية:</label>
                <select
                  value={newMark.subjectName || (subjects && subjects[0]?.name) || ''}
                  onChange={(e) => setNewMark({ ...newMark, subjectName: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                >
                  {(subjects || []).map((sub) => (
                    <option key={sub.id || sub.name} value={sub.name}>
                      {sub.name} {sub.nameEn ? `(${sub.nameEn})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">نوع التقييم / الاختبار:</label>
                <select
                  value={newMark.type}
                  onChange={(e) => setNewMark({ ...newMark, type: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                >
                  <option value="أعمال السنة">أعمال السنة والواجبات (20)</option>
                  <option value="اختبار قصير">اختبار قصير (20)</option>
                  <option value="منتصف الفصل">امتحان منتصف الفصل (20)</option>
                  <option value="النهائي">الامتحان النهائي (40)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300">العلامة المستحقة:</label>
                  <input
                    type="number"
                    min="0"
                    max={newMark.maxScore}
                    value={newMark.score}
                    onChange={(e) => setNewMark({ ...newMark, score: Number(e.target.value) })}
                    className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300">العلامة العظمى:</label>
                  <input
                    type="number"
                    value={newMark.type === 'النهائي' ? 40 : 20}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs font-bold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 dark:text-slate-300">ملاحظات والتفاصيل:</label>
                <input
                  type="text"
                  placeholder="مثال: تفوق ملحوظ وحفظ سليم للقواعد"
                  value={newMark.notes}
                  onChange={(e) => setNewMark({ ...newMark, notes: e.target.value })}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs font-bold text-[#0F172A] dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setShowAddMarkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  حفظ العلامة التراكمية 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
