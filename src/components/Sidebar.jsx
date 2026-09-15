import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  UserCheck, 
  Award, 
  BookOpen, 
  Wallet, 
  MessageSquareText, 
  IdCard, 
  Bus, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Users, 
  FolderArchive, 
  Printer, 
  TrendingUp, 
  CreditCard, 
  Palette, 
  Building2,
  Calendar,
  Clock,
  Smartphone,
  Presentation,
  X 
} from 'lucide-react';

export const Sidebar = ({ activeTab: activeTabProp, setActiveTab: setActiveTabProp, isOpen, setIsOpen }) => {
  const { lang, t, currentUser, currentRole, setActivePillar, siteSettings, activeTab: activeTabContext, setActiveTab: setActiveTabContext } = useApp();

  const activeTab = activeTabProp || activeTabContext || 'dashboard';
  const setActiveTab = setActiveTabProp || setActiveTabContext || (() => {});

  const isAr = lang === 'ar';

  const [openSections, setOpenSections] = useState({
    academic: true,
    students: true,
    teachers: true,
    exams: true,
    finance: true,
    subjects: true
  });

  const toggleSection = (section, tabId = null, pillar = null) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    if (tabId) {
      handleNavClick(tabId, pillar);
    }
  };

  const handleNavClick = (tabId, pillar = null) => {
    if (pillar && setActivePillar) {
      setActivePillar(pillar);
    }
    if (typeof setActiveTab === 'function') {
      setActiveTab(tabId);
    }
    if (window.innerWidth < 1024 && setIsOpen) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen && setIsOpen(false)} 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 w-72 bg-[#0284C7] dark:bg-[#000000] border-sky-600 dark:border-zinc-800 text-white flex flex-col justify-between transition-all duration-300 shadow-2xl ${
          isAr ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          isOpen ? 'translate-x-0' : isAr ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="p-6 border-b border-sky-600/50 dark:border-zinc-800 flex items-center justify-between">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            title={isAr ? 'العودة للوحة التحكم الرئيسية' : 'Go to Dashboard'}
          >
            <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg border border-white shrink-0 overflow-hidden">
              <img src={siteSettings?.schoolLogo || "/emblem.png"} alt="Logo" className="w-full h-full object-contain" />
            </div>

            <div>
              <h1 className="text-sm font-black text-white leading-tight">
                {isAr ? (siteSettings?.schoolName || t('schoolName')) : (siteSettings?.schoolNameEn || t('schoolName'))}
              </h1>
              <span className="text-[10px] text-amber-300 font-bold block">
                {isAr ? 'منصة الإدارة الرقمية الذكية' : 'Smart Educational Platform'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen && setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
          
          {/* 1. لوحة التحكم */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white shadow-lg ring-2 ring-[#EF4444] scale-[1.02]'
                : 'bg-white/15 dark:bg-zinc-900/50 hover:bg-white/25 text-white border border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-[#EF4444]" />
              <span>
                {currentRole === 'student'
                  ? (isAr ? 'لوحة تحكم الطالب' : 'Student Dashboard')
                  : currentRole === 'parent'
                  ? (isAr ? 'لوحة متابعة الأبناء' : 'Parent Dashboard')
                  : currentRole === 'teacher'
                  ? (isAr ? 'لوحة تحكم المعلم' : 'Teacher Dashboard')
                  : t('navDashboard')}
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>

          {/* ── 1. الصفوف والجداول الدراسية ── */}
          {/* 1.1 الصفوف والشعب الدراسية (للإدارة والمعلمين) */}
          {(currentRole === 'admin' || currentRole === 'teacher') && (
            <button
              onClick={() => handleNavClick('classes', 'academic')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'classes'
                  ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                  : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-[#EF4444]" />
                <span>{isAr ? 'الصفوف والشُعب الدراسية' : 'Grades & Sections'}</span>
              </div>
            </button>
          )}

          {/* 1.2 جدول الحصص الأسبوعي (للطالب وولي الأمر) */}
          {(currentRole === 'student' || currentRole === 'parent') && (
            <button
              onClick={() => handleNavClick('schedule', 'academic')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'schedule'
                  ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                  : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#EF4444]" />
                <span>{isAr ? 'جدول وتوزيع الحصص الأسبوعي' : 'Weekly Timetable'}</span>
              </div>
            </button>
          )}

          {/* ── 2. العملية التعليمية والدروس ── */}
          {/* 2.1 الأجندة والدروس اليومية (للجميع) */}
          <button
            onClick={() => handleNavClick('agenda', 'academic')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'agenda'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md ring-2 ring-[#EF4444]'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#EF4444]" />
              <span>{isAr ? 'الأجندة والدروس اليومية' : 'Daily Agenda & Lessons'}</span>
            </div>
            <span className="bg-[#EF4444] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              {isAr ? 'يومية 📅' : 'Daily'}
            </span>
          </button>

          {/* 2.2 المواد والدروس (مخصصة حسب الدور) */}
          {currentRole === 'admin' || currentRole === 'teacher' ? (
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('subjects', 'subjects', 'academic')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'subjects'
                    ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                    : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#EF4444]" />
                  <span>{isAr ? 'المواد الدراسية والدروس' : 'Subjects & Lessons'}</span>
                </div>
                {openSections.subjects ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
              </button>

              {openSections.subjects && (
                <div className={`space-y-1 text-xs animate-fade-in ${isAr ? 'pr-8 border-r-2' : 'pl-8 border-l-2'} border-white/40`}>
                  <button onClick={() => handleNavClick('subjects', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                    <Palette className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>{isAr ? 'قائمة المواد والألوان' : 'Subjects & Colors'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('subjects', 'academic')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                  : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#EF4444]" />
                <span>{isAr ? 'المواد والدروس المطلوبة' : 'Enrolled Subjects & Lessons'}</span>
              </div>
            </button>
          )}

          {/* ── 3. التقييم والنتائج والأداء ── */}
          {/* 3.1 الاختبارات والنتائج (للجميع) */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('exams', 'exams', 'academic')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'exams' || activeTab === 'reports'
                  ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                  : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-[#EF4444]" />
                <span>
                  {currentRole === 'student' || currentRole === 'parent'
                    ? (isAr ? 'النتائج والشهادات الدراسية' : 'Grades & Report Cards')
                    : (isAr ? 'الاختبارات والنتائج' : 'Exams & Grades')}
                </span>
              </div>
              {openSections.exams ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
            </button>

            {openSections.exams && (
              <div className={`space-y-1 text-xs animate-fade-in ${isAr ? 'pr-8 border-r-2' : 'pl-8 border-l-2'} border-white/40`}>
                <button onClick={() => handleNavClick('exams', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                  <Award className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>{currentRole === 'student' || currentRole === 'parent' ? (isAr ? 'علاماتي الدراسية' : 'My Grades') : (isAr ? 'رصد العلامات والترتيب' : 'Exam Marks & Rankings')}</span>
                </button>
                <button onClick={() => handleNavClick('reports', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                  <Printer className="w-3.5 h-3.5 text-sky-200" />
                  <span>{isAr ? 'طباعة الشهادة الأكاديمية' : 'Academic Report Card'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 3.2 سجل الحضور والغياب (للجميع) */}
          <button
            onClick={() => handleNavClick('attendance', 'academic')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md ring-2 ring-[#EF4444]'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-amber-300" />
              <span>{isAr ? 'سجل الحضور والغياب' : 'Attendance Tracker'}</span>
            </div>
            <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              {isAr ? 'مباشر 🟢' : 'Live'}
            </span>
          </button>

          {/* 3.3 رصد السلوك والتوجيه (للجميع) */}
          <button
            onClick={() => handleNavClick('behavior', 'academic')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'behavior'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md ring-2 ring-[#EF4444]'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-300" />
              <span>{isAr ? 'رصد السلوك والتوجيه' : 'Behavior & Guidance'}</span>
            </div>
            <span className="bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
              {isAr ? 'سلوكي 🌟' : 'Notes'}
            </span>
          </button>

          {/* ── 4. شؤون الطلاب والكادر البشري ── */}
          {/* 4.1 شؤون الطلاب (للإدارة والمعلمين) */}
          {(currentRole === 'admin' || currentRole === 'teacher') && (
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('students', 'directory', 'academic')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'directory' || activeTab === 'documents'
                    ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                    : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-[#EF4444]" />
                  <span>{isAr ? 'إضافة طلاب' : 'Add Students'}</span>
                </div>
                {openSections.students ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
              </button>

              {openSections.students && (
                <div className={`space-y-1 text-xs animate-fade-in ${isAr ? 'pr-8 border-r-2' : 'pl-8 border-l-2'} border-white/40`}>
                  <button onClick={() => handleNavClick('directory', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                    <Users className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>{isAr ? 'دليل الطلاب' : 'Student Directory'}</span>
                  </button>
                  {currentRole === 'admin' && (
                    <button onClick={() => handleNavClick('documents', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                      <FolderArchive className="w-3.5 h-3.5 text-sky-200" />
                      <span>{isAr ? 'أرشفة الوثائق الثبوتية' : 'Documents Archiving'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4.2 كادر المعلمين (للإدارة والمعلمين) */}
          {(currentRole === 'admin' || currentRole === 'teacher') && (
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('teachers', 'teachers', 'academic')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                    : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-[#EF4444]" />
                  <span>{isAr ? 'كادر المعلمين' : 'Teachers'}</span>
                </div>
                {openSections.teachers ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
              </button>

              {openSections.teachers && (
                <div className={`space-y-1 text-xs animate-fade-in ${isAr ? 'pr-8 border-r-2' : 'pl-8 border-l-2'} border-white/40`}>
                  <button onClick={() => handleNavClick('teachers', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                    <Users className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>{isAr ? 'دليل المعلمين المعتمدين' : 'Teachers Directory'}</span>
                  </button>
                  <button onClick={() => handleNavClick('schedule', 'academic')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-amber-300 hover:text-white flex items-center gap-2 cursor-pointer font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{isAr ? 'جدول وتوزيع الحصص الأسبوعية' : 'Master Weekly Timetable'}</span>
                  </button>
                </div>
              )}
            </div>
          )}




          {/* ── 5. الشؤون المالية والرواتب (للإدارة فقط) ── */}
          {currentRole === 'admin' && (
            <div className="space-y-1">
              <button
                onClick={() => toggleSection('finance', 'tuition', 'financial')}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'tuition' || activeTab === 'finance'
                    ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                    : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-[#EF4444]" />
                  <span>{isAr ? 'الشؤون المالية والرواتب' : 'Staff & Finance'}</span>
                </div>
                {openSections.finance ? <ChevronUp className="w-4 h-4 text-white/80" /> : <ChevronDown className="w-4 h-4 text-white/80" />}
              </button>

              {openSections.finance && (
                <div className={`space-y-1 text-xs animate-fade-in ${isAr ? 'pr-8 border-r-2' : 'pl-8 border-l-2'} border-white/40`}>
                  <button onClick={() => handleNavClick('tuition', 'financial')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>{isAr ? 'أقساط الطلاب والخصومات' : 'Tuition & Installments'}</span>
                  </button>
                  <button onClick={() => handleNavClick('finance', 'financial')} className="w-full text-right rtl:text-right ltr:text-left py-1.5 text-white/90 hover:text-white flex items-center gap-2 cursor-pointer">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-200" />
                    <span>{isAr ? 'رواتب الموظفين والنفقات' : 'Staff Payroll & Expenses'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── 6. الخدمات والتواصل ── */}
          {/* 6.1 رسائل الإدارة والتعاميم (للجميع) */}
          <button
            onClick={() => handleNavClick('messages', 'communications')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquareText className="w-5 h-5 text-[#EF4444]" />
              <span>
                {currentRole === 'student' || currentRole === 'parent'
                  ? (isAr ? 'رسائل الإدارة والتعاميم' : 'Announcements & Messages')
                  : (isAr ? 'التواصل والتعاميم' : 'Communications')}
              </span>
            </div>
          </button>

          {/* 6.2 الأنشطة والدورات (للجميع) */}
          <button
            onClick={() => handleNavClick('tutoring', 'academic')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tutoring'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#EF4444]" />
              <span>{isAr ? 'الأنشطة والدورات' : 'Courses & Activities'}</span>
            </div>
          </button>

          {/* 6.3 النقل والحافلات (للجميع) */}
          <button
            onClick={() => handleNavClick('bus', 'services')}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bus'
                ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bus className="w-5 h-5 text-[#EF4444]" />
              <span>{currentRole === 'student' || currentRole === 'parent' ? (isAr ? 'حافلة النقل المدرسي' : 'School Bus') : (isAr ? 'النقل والحافلات' : 'School Transport')}</span>
            </div>
          </button>

          {/* ── 7. إعدادات المنظومة (للإدارة فقط) ── */}
          {currentRole === 'admin' && (
            <button
              onClick={() => handleNavClick('settings', 'settings')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#032541] dark:bg-zinc-900 text-white border border-[#EF4444] shadow-md'
                  : 'text-white dark:text-slate-300 hover:bg-white/15 dark:hover:bg-zinc-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-[#EF4444]" />
                <span>{isAr ? 'إعدادات المنظومة' : 'System Settings'}</span>
              </div>
            </button>
          )}

        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-zinc-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isAr ? (siteSettings?.schoolName || 'مدرسة الدعم التعليمي') : (siteSettings?.schoolNameEn || 'Educational Support School')}</span>
          </div>
          <span className="bg-[#EF4444] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
            {currentUser?.roleTitle || currentUser?.role || 'عضو'}
          </span>
        </div>
      </aside>
    </>
  );
};
