import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp, defaultAvatars } from '../context/AppContext';
import { 
  Menu, 
  Globe, 
  LogOut, 
  GraduationCap, 
  User, 
  ShieldCheck, 
  Lock, 
  Camera, 
  Check,
  Bell,
  Smartphone,
  Search,
  X
} from 'lucide-react';


export const Header = ({ activeTab, setActiveTab, setIsSidebarOpen }) => {
  const { 
    lang, 
    dir, 
    t, 
    switchLang, 
    currentUser, 
    currentRole, 
    logout, 
    updateUserAvatar,
    students,
    selectedStudentId,
    setSelectedStudentId,
    siteSettings,
    themeMode,
    toggleThemeMode,
    notifications = [],
    markAllNotificationsRead,
    clearNotifications,
    teachers = [],
    subjects = []
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeSubjects = subjects || [];
  const activeStudent = safeStudents.find((s) => s.id === selectedStudentId || s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0];
  const studentTotalUSD = Number(activeStudent?.tuitionTotal || 0) + Number(activeStudent?.adminFees || 0) + (activeStudent?.hasTransport ? (Number(activeStudent?.transportFee) || 0) : 0);
  const studentDiscountUSD = Number(activeStudent?.tuitionDiscount || activeStudent?.discount || 0);
  const studentPaidUSD = Number(activeStudent?.tuitionPaid || 0);
  const studentRemainingUSD = activeStudent ? Math.max(0, studentTotalUSD - studentDiscountUSD - studentPaidUSD) : 0;

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showNotifsDrawer, setShowNotifsDrawer] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || defaultAvatars[0]);
  const [customUrl, setCustomUrl] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Smart Search States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Ctrl+K / '/' listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        const activeElem = document.activeElement;
        if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.isContentEditable)) {
          return;
        }
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Arabic Normalization Helper for Smart Search
  const normalizeArabic = (text) => {
    if (!text) return '';
    return text
      .toString()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, ''); // Tashkeel
  };

  const normalizedQuery = normalizeArabic(searchQuery.toLowerCase().trim());

  const matchesSearch = (text) => {
    if (!text) return false;
    return normalizeArabic(text.toString().toLowerCase()).includes(normalizedQuery);
  };

  const searchPages = [
    { name: 'الرئيسية (لوحة التحكم)', nameEn: 'Dashboard / Home', tab: 'dashboard', icon: '🏫' },
    { name: 'الرسائل والمحادثات والتنبيهات', nameEn: 'Messages & Chat', tab: 'messages', icon: '💬' },
    ...(currentRole === 'admin' || currentRole === 'teacher' ? [
      { name: 'إدارة الصفوف والشعب وقاعات الدراسة', nameEn: 'Classes & Classrooms', tab: 'classes', icon: '🏢' },
      { name: 'تسجيل الحضور والغياب اليومي للطلاب', nameEn: 'Daily Attendance Roll', tab: 'attendance', icon: '📝' },
      { name: 'الأجندة والدروس اليومية والواجبات', nameEn: 'Daily Agenda & Homework', tab: 'agenda', icon: '📅' },
      { name: 'المواد الدراسية والمناهج المعتمدة', nameEn: 'Subjects & Curriculum', tab: 'subjects', icon: '📚' },
      { name: 'سجل السلوك والبطاقة السلوكية والتقديرات', nameEn: 'Behavioral Records & Conduct', tab: 'behavior', icon: '⭐' },
      { name: 'شؤون الطلاب والدليل المدرسي والبيانات', nameEn: 'Students Directory & Documents', tab: 'directory', icon: '📂' },
    ] : []),
    ...(currentRole === 'admin' ? [
      { name: 'المالية، الأقساط المدرسية ورواتب الموظفين', nameEn: 'Tuition Fees & Financials', tab: 'tuition', icon: '💰' },
      { name: 'إعدادات المنصة العامة واللوجو والاسم', nameEn: 'Platform General Settings', tab: 'settings', icon: '⚙️' },
    ] : []),
    ...(currentRole === 'student' || currentRole === 'parent' ? [
      { name: 'جدول الحصص الدراسي الأسبوعي المخصص', nameEn: 'Weekly Timetable Schedule', tab: 'schedule', icon: '⏱️' },
    ] : [])
  ];

  const filteredPages = searchQuery.trim() ? searchPages.filter(p => 
    matchesSearch(p.name) || matchesSearch(p.nameEn)
  ) : searchPages;

  const filteredStudents = searchQuery.trim() ? safeStudents.filter(s => 
    matchesSearch(s.name) || 
    (s.nameEn && matchesSearch(s.nameEn)) || 
    matchesSearch(s.id) ||
    (s.grade && matchesSearch(s.grade))
  ).slice(0, 6) : [];

  const filteredTeachers = searchQuery.trim() ? safeTeachers.filter(t => 
    matchesSearch(t.name) || 
    (t.nameEn && matchesSearch(t.nameEn)) || 
    (t.subject && matchesSearch(t.subject))
  ).slice(0, 6) : [];

  const filteredSubjects = searchQuery.trim() ? safeSubjects.filter(sub => 
    matchesSearch(sub.name) || 
    (sub.nameEn && matchesSearch(sub.nameEn))
  ).slice(0, 6) : [];

  const hasAnyResults = filteredPages.length > 0 || filteredStudents.length > 0 || filteredTeachers.length > 0 || filteredSubjects.length > 0;

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleDirectAppDownload = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert(lang === 'ar' 
        ? '📱 لتثبيت تطبيق المنظومة مباشرة على هاتفك:\n\n1️⃣ اضغط على خيارات المتصفح (⋮) بالأعلى\n2️⃣ اختر (تثبيت التطبيق / إضافة إلى الشاشة الرئيسية)\n\nوسينزل التطبيق فوراً على هاتفك كـ تطبيق APK رسمي مرتبط بالمنظومة!' 
        : 'To install app directly:\n1. Tap browser options (⋮)\n2. Select Add to Home Screen / Install App');
    }
  };

  const normStr = (str) => (str || '').toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\(\)\-\_\s]/g, '');

  const userNotifications = (notifications || []).filter((n) => {
    if (currentRole === 'admin') return true;
    if (n.targetStudentId && (n.targetStudentId === currentUser?.id || n.targetStudentId === activeStudent?.id)) return true;
    if (n.targetUser && (n.targetUser === currentUser?.username || n.targetUser === currentUser?.name || n.targetUser === activeStudent?.name)) return true;
    if (n.targetGrade && activeStudent?.grade && normStr(n.targetGrade).includes(normStr(activeStudent.grade))) {
      return true;
    }
    if (n.targetRole && (n.targetRole === currentRole || n.targetRole === 'all')) return true;
    if (!n.targetStudentId && !n.targetUser && !n.targetGrade && !n.targetRole) return true;
    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead && !n.read).length;

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomUrl(reader.result);
        setSelectedAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    const finalAvatar = customUrl || selectedAvatar;
    updateUserAvatar(finalAvatar);
    setShowAvatarModal(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0284C7] dark:bg-[#000000] border-b border-sky-600 dark:border-zinc-800 text-white shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-1.5 sm:gap-4">
          
          {/* Right Brand & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="lg:hidden p-1.5 text-white rounded-xl bg-[#0284C7]/20 border border-[#0EA5E9]/30 hover:bg-[#0284C7]/40 transition-all cursor-pointer shrink-0"
              title={lang === 'ar' ? 'القائمة الجانبية' : 'Menu'}
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div 
              onClick={() => typeof setActiveTab === 'function' && setActiveTab('dashboard')}
              className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
              title={lang === 'ar' ? 'العودة للوحة التحكم الرئيسية' : 'Go to Dashboard'}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white p-0.5 sm:p-1 flex items-center justify-center shadow border border-[#0284C7] shrink-0 overflow-hidden">
                <img src={siteSettings?.schoolLogo || "/emblem.png"} alt="Logo" className="w-full h-full object-contain" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xs sm:text-base lg:text-lg font-black text-white leading-tight truncate">
                  {lang === 'ar' ? (siteSettings?.schoolName || t('schoolName')) : (siteSettings?.schoolNameEn || t('schoolName'))}
                </h1>
                <span className="text-[9px] sm:text-[11px] text-[#EF4444] font-extrabold flex items-center gap-1 truncate">
                  <span>{lang === 'ar' ? 'منصة الإدارة الذكية' : 'Smart Platform'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Smart Search Pill */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#0284C7]/20 hover:bg-[#0284C7]/40 border border-sky-400/30 px-4 py-2 rounded-full cursor-pointer transition-all text-slate-100 w-52 lg:w-72 shrink-0 select-none shadow-inner"
            title={lang === 'ar' ? 'البحث الذكي الشامل... (Ctrl+K)' : 'Smart search... (Ctrl+K)'}
          >
            <Search className="w-4 h-4 text-sky-200" />
            <span className="text-xs text-slate-200 font-bold grow text-right">
              {lang === 'ar' ? 'البحث الذكي الشامل... (Ctrl+K)' : 'Smart search... (Ctrl+K)'}
            </span>
          </div>

          {/* Left Actions: Profile, App Download, Bell, Mode, Lang, Logout */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            


            {/* Logged-In User Profile Card (Desktop only) */}
            {currentUser && (
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="hidden md:flex items-center gap-2 bg-[#0284C7]/20 hover:bg-[#0284C7]/35 border border-[#0EA5E9]/20 p-1 pe-3 rounded-2xl transition-all cursor-pointer group"
                title={lang === 'ar' ? 'اضغط لتغيير صورة الحساب الشخصي' : 'Click to change profile picture'}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#0284C7] font-black text-xs flex items-center justify-center border-2 border-[#EF4444] shadow">
                    {(currentUser.name || 'م')[0]}
                  </div>
                </div>

                <div className="text-right rtl:text-right ltr:text-left text-xs">
                  <span className="font-bold text-white block group-hover:text-sky-300 transition-colors">
                    {lang === 'ar' ? currentUser.name : currentUser.nameEn}
                  </span>
                  <span className="text-[10px] text-slate-300 block font-medium">
                    {currentUser.roleTitle || currentUser.role}
                  </span>
                </div>
              </div>
            )}

            {/* 📱 Direct Download / Install App (APK) Button */}
            <a
              href="/school-portal.apk"
              download="school-portal.apk"
              type="application/vnd.android.package-archive"
              className="flex items-center gap-1 bg-[#EF4444] hover:bg-red-600 text-white px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-black shadow transition-all cursor-pointer border border-red-400 shrink-0 animate-pulse"
              title={lang === 'ar' ? 'تنزيل ملف التطبيق (school-portal.apk) مباشرة' : 'Download APK File Directly'}
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span className="hidden xs:inline sm:inline">{lang === 'ar' ? 'تحميل التطبيق (APK) 📱' : 'Download APK'}</span>
            </a>

            {/* Mobile Smart Search Trigger Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl bg-[#0284C7]/20 hover:bg-[#0284C7]/40 border border-[#0EA5E9]/20 text-white transition-all cursor-pointer shrink-0"
              title={lang === 'ar' ? 'البحث الذكي' : 'Smart Search'}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* 🔔 Live Notification Center Bell Button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowNotifsDrawer((prev) => !prev)}
                className="relative p-1.5 sm:p-2 rounded-xl bg-[#0284C7]/20 hover:bg-[#0284C7]/40 border border-[#0EA5E9]/20 text-white transition-all cursor-pointer"
                title={lang === 'ar' ? 'مركز التنبيهات والإشعارات المباشرة' : 'Live Notification Center'}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-[#0284C7] shadow animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Popover (Inline to avoid backdrop issues and respect theme colors) */}
              {showNotifsDrawer && (
                <>
                  {/* Click-outside backdrop overlay to close */}
                  <div 
                    onClick={() => setShowNotifsDrawer(false)} 
                    className="fixed inset-0 z-[9999]" 
                  />
                  <div className="absolute top-12 ltr:right-0 rtl:left-0 w-72 sm:w-96 bg-white dark:bg-[#1E293B] border-2 border-[#0284C7] dark:border-[#334155] rounded-3xl shadow-2xl p-4 sm:p-5 text-[#0F172A] dark:text-white animate-scale-up space-y-3 z-[10000] text-right">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[#0284C7]" />
                        <h4 className="text-xs sm:text-sm font-extrabold">{lang === 'ar' ? 'مركز التنبيهات المباشرة' : 'Notification Center'}</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-[10px] font-bold rounded-full">
                            {unreadCount} {lang === 'ar' ? 'جديد' : 'new'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[10px] sm:text-[11px] font-bold text-[#0284C7] dark:text-sky-400 hover:underline cursor-pointer"
                        >
                          {lang === 'ar' ? 'تعليم الكل كقُرئ' : 'Mark all read'}
                        </button>
                        <button
                          onClick={() => setShowNotifsDrawer(false)}
                          className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2.5 pe-1 custom-scrollbar">
                      {userNotifications.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs font-bold space-y-2">
                          <Bell className="w-7 h-7 text-slate-300 dark:text-slate-700 mx-auto opacity-40" />
                          <p>{lang === 'ar' ? 'لا يوجد تنبيهات أو إشعارات موجهة لك حالياً 🔔' : 'No notifications currently 🔔'}</p>
                        </div>
                      ) : (
                        userNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`p-3 rounded-2xl border text-right space-y-1 transition-all ${
                              !notif.isRead && !notif.read
                                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-850 font-bold' 
                                : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-slate-100 dark:border-[#1E293B] opacity-80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="text-[11px] sm:text-xs font-extrabold text-[#0284C7] dark:text-sky-300">{notif.title}</h5>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{notif.timestamp || notif.time}</span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {userNotifications.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex justify-end">
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-red-500 hover:text-red-600 font-bold hover:underline cursor-pointer"
                        >
                          {lang === 'ar' ? 'مسح كافة التنبيهات 🗑️' : 'Clear all 🗑️'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>



            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1.5 sm:px-3 sm:py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              title={t('logoutBtn')}
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{t('logoutBtn')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Modal: Change User Avatar Photo - Teleported to document.body */}
      {showAvatarModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-scale-up text-[#0F172A] relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-[#0284C7]">
                <Camera className="w-5 h-5 text-[#EF4444]" />
                <span>{lang === 'ar' ? 'تغيير صورة الحساب الشخصي' : 'Change Profile Photo'}</span>
              </h3>
              <button 
                onClick={() => setShowAvatarModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Default Avatars Grid */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">{lang === 'ar' ? 'اختر صورة رمزية جاهزة:' : 'Select preset avatar:'}</label>
              <div className="grid grid-cols-6 gap-2">
                {defaultAvatars.map((av, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedAvatar(av);
                      setCustomUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all h-12 ${
                      selectedAvatar === av && !customUrl ? 'border-[#EF4444] scale-105 shadow-md' : 'border-[#E2E8F0] hover:border-slate-400'
                    }`}
                  >
                    <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                    {selectedAvatar === av && !customUrl && (
                      <div className="absolute inset-0 bg-[#0284C7]/60 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white font-bold" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Image File Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">{lang === 'ar' ? 'أو ارفع صورة جديدة من جهازك:' : 'Or upload image from device:'}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFileUpload}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAvatarModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button onClick={handleSaveAvatar} className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Smart Search Command Palette Portal */}
      {isSearchOpen && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop with premium glassmorphism blur */}
          <div 
            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
          />
          
          {/* Search Dialog */}
          <div className="relative bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] animate-scale-up text-[#0F172A] dark:text-slate-100">
            
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50">
              <Search className="w-5 h-5 text-sky-500" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'البحث الذكي عن طالب، معلم، مادة، قسم...' : 'Smart search for student, teacher, page...'}
                className="grow bg-transparent text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 text-right rtl:text-right"
              />
              <button
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="p-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl transition-all cursor-pointer"
                title={lang === 'ar' ? 'إغلاق' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results Area */}
            <div className="overflow-y-auto p-4 space-y-5 scrollbar-thin text-xs text-right rtl:text-right">
              
              {!hasAnyResults && (
                <div className="py-8 text-center text-slate-400 dark:text-slate-500 font-bold space-y-2">
                  <span className="text-3xl block">🔍</span>
                  <span>{lang === 'ar' ? 'لا توجد نتائج مطابقة لبحثك' : 'No results found matching your search'}</span>
                </div>
              )}

              {/* Group 1: Pages (الصفحات والأقسام) */}
              {filteredPages.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span>📑</span>
                    <span>{lang === 'ar' ? 'الأقسام والصفحات' : 'Pages & Sections'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredPages.map((page, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveTab(page.tab);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-sky-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-sky-100 dark:hover:border-slate-700 cursor-pointer transition-all text-slate-800 dark:text-slate-200"
                      >
                        <span className="text-base">{page.icon}</span>
                        <div className="grow min-w-0">
                          <span className="font-extrabold text-[11px] block truncate">{lang === 'ar' ? page.name : page.nameEn}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">{lang === 'ar' ? 'انتقال سريع للقسم' : 'Quick navigation link'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 2: Students (الطلاب) */}
              {filteredStudents.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span>🎓</span>
                    <span>{lang === 'ar' ? 'الطلاب المسجلين' : 'Students Roster'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredStudents.map((stu) => (
                      <div
                        key={stu.id}
                        onClick={() => {
                          setSelectedStudentId(stu.id);
                          setActiveTab('dashboard');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-emerald-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-emerald-100 dark:hover:border-slate-700 cursor-pointer transition-all text-slate-800 dark:text-slate-200"
                      >
                        <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-xs" />
                        <div className="grow min-w-0">
                          <span className="font-extrabold text-[11px] block truncate">{lang === 'ar' ? stu.name : stu.nameEn}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">🏫 {stu.grade} ({isAr ? `الشعبة ${stu.classRoom || 'أ'}` : `Section ${stu.classRoom || 'A'}`})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 3: Teachers (المعلمين) */}
              {filteredTeachers.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span>👨‍🏫</span>
                    <span>{lang === 'ar' ? 'أعضاء هيئة التدريس' : 'Teachers & Staff'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredTeachers.map((tch) => (
                      <div
                        key={tch.id}
                        onClick={() => {
                          setActiveTab('directory');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-purple-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-purple-100 dark:hover:border-slate-700 cursor-pointer transition-all text-slate-800 dark:text-slate-200"
                      >
                        <img src={tch.avatar} alt={tch.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-xs" />
                        <div className="grow min-w-0">
                          <span className="font-extrabold text-[11px] block truncate">{lang === 'ar' ? tch.name : tch.nameEn}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">📚 {tch.subject || (isAr ? 'عضو هيئة التدريس' : 'Teacher')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group 4: Subjects (المواد) */}
              {filteredSubjects.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span>📚</span>
                    <span>{lang === 'ar' ? 'المواد والمناهج الدراسية' : 'Subjects'}</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setActiveTab('subjects');
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-2.5 p-2.5 rounded-2xl hover:bg-amber-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-amber-100 dark:hover:border-slate-700 cursor-pointer transition-all text-slate-800 dark:text-slate-200"
                      >
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                          📖
                        </div>
                        <div className="grow min-w-0">
                          <span className="font-extrabold text-[11px] block truncate">{lang === 'ar' ? sub.name : sub.nameEn}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">📖 {lang === 'ar' ? 'منهج المادة الدراسي' : 'Academic curriculum'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer Shortcut Guide */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold select-none">
              <span>{isAr ? 'اضغط ESC للإغلاق' : 'Press ESC to close'}</span>
              <span>{isAr ? '💡 اكتب اسم الطالب، المعلم، المادة أو القسم للبحث السريع' : '💡 Type name of student, teacher, subject or page to search'}</span>
            </div>

          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
