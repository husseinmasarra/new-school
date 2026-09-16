import React, {useState, useEffect} from'react';
import {AppProvider, useApp} from'./context/AppContext';
import {LoginView} from'./views/LoginView';
import {Header} from'./components/Header';
import {Sidebar} from'./components/Sidebar';
import {Dashboard} from'./components/Dashboard';
import {MessagesModule} from'./components/MessagesModule';
import {AgendaModule} from'./components/AgendaModule';
import {ExamsModule} from'./components/ExamsModule';
import {DocumentsModule} from'./components/DocumentsModule';
import {BusModule} from'./components/BusModule';
import {TuitionModule} from'./components/TuitionModule';
import {FinanceModule} from'./components/FinanceModule';
import {TutoringModule} from'./components/TutoringModule';
import {SubjectsModule} from'./components/SubjectsModule';
import {ReportsModule} from'./components/ReportsModule';
import {DirectoryModule} from'./components/DirectoryModule';
import {StudentCardPage} from'./components/StudentCardPage';
import {ClassesModule} from'./components/ClassesModule';
import {SettingsModule} from'./components/SettingsModule';
import {UsersModule} from'./components/UsersModule';
import {AttendanceModule} from'./components/AttendanceModule';
import {BehaviorModule} from'./components/BehaviorModule';
import {GraduationCap} from'lucide-react';

const MainContent = () => {
  const getTabFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/,'');
    if (hash) return hash;
    const saved = localStorage.getItem('school_active_tab');
    return saved ||'dashboard';
  };

  const [activeTab, setActiveTabState] = useState(getTabFromHash);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const {lang, dir, t, currentUser, currentRole} = useApp();

  useEffect(() => {
    document.documentElement.setAttribute('data-role', currentRole ||'admin');

    if (currentRole ==='student') {
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() ==='p') {
          e.preventDefault();
          e.stopPropagation();
          alert(lang ==='ar'?'ميزة الطباعة غير متاحة لحسابات الطلاب الفردية':'Printing is disabled for student accounts.');
          return false;
        }
      };

      const originalPrint = window.print;
      window.print = () => {
        alert(lang ==='ar'?'ميزة الطباعة غير متاحة لحسابات الطلاب الفردية':'Printing is disabled for student accounts.');
        return false;
      };

      window.addEventListener('keydown', handleKeyDown, true);

      return () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        window.print = originalPrint;
      };
    }
  }, [currentRole, lang]);

  const setActiveTab = (newTab) => {
    if (newTab) {
      setActiveTabState(newTab);
      localStorage.setItem('school_active_tab', newTab);
      if (window.location.hash !==`#/${newTab}`) {
        window.history.pushState({tab: newTab},'',`#/${newTab}`);
      }
    }
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getTabFromHash();
      setActiveTabState(currentTab);
      localStorage.setItem('school_active_tab', currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    const initialTab = getTabFromHash();
    if (!window.location.hash || window.location.hash ==='#'|| window.location.hash ==='#/') {
      window.history.replaceState({tab: initialTab},'',`#/${initialTab}`);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Global ESC Key Listener: Closes any open modal / sub-page across the entire application
  useEffect(() => {
    const handleGlobalEscape = (e) => {
      if (e.key ==='Escape'|| e.keyCode === 27) {
        // 1. Close mobile sidebar if open
        setIsSidebarOpen(false);

        // 2. Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('app-close-modal'));

        // 3. Find topmost open modal overlay in DOM and trigger its close button
        const overlays = Array.from(document.querySelectorAll('.fixed.inset-0, [role="dialog"]'));
        if (overlays.length > 0) {
          const topOverlay = overlays[overlays.length - 1];
          const buttons = Array.from(topOverlay.querySelectorAll('button'));
          
          // Prioritize direct close'✕'buttons
          const closeBtn = buttons.find(b => {
            const txt = (b.textContent ||'').trim();
            const aria = (b.getAttribute('aria-label') ||'').toLowerCase();
            const title = (b.getAttribute('title') ||'').toLowerCase();
            return txt ==='✕'|| txt ==='X'|| txt ==='x'|| 
                   txt.includes('إغلاق') || txt.includes('إلغاء') ||
                   txt.toLowerCase() ==='close'|| txt.toLowerCase() ==='cancel'||
                   aria.includes('close') || title.includes('close') ||
                   b.classList.contains('modal-close-btn');
          });

          if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            closeBtn.click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalEscape, true);
    return () => window.removeEventListener('keydown', handleGlobalEscape, true);
  }, []);

  // Auto Reset scroll position to top of page on navigation / activeTab switch
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
  }, [activeTab]);

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div
      className={`min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-[#0A5C36] selection:text-white ${
        lang ==='ar'?'lg:pr-72':'lg:pl-72'
      } transition-all duration-300`}
      dir={dir}
    >
      
      {/* Top Header with Sidebar Trigger */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Permanent Dedicated Sidebar Navigation Column (Zero Overlap on Page Content) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Page Content Body inside its own dedicated space */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab ==='dashboard'&& <Dashboard setActiveTab={setActiveTab} />}
        {activeTab ==='idcard'&& (currentRole ==='admin'|| currentRole ==='student'|| currentRole ==='parent'|| currentRole ==='vice_principal') && <StudentCardPage setActiveTab={setActiveTab} />}
        {activeTab ==='classes'&& (currentRole ==='admin'|| currentRole ==='teacher'|| currentRole ==='vice_principal') && <ClassesModule />}
        {activeTab ==='schedule'&& (currentRole ==='admin'|| currentRole ==='teacher'|| currentRole ==='student'|| currentRole ==='parent'|| currentRole ==='vice_principal') && <ClassesModule initialSubTab="timetable"/>}
        {activeTab ==='messages'&& <MessagesModule />}
        {activeTab ==='agenda'&& <AgendaModule />}
        {activeTab ==='exams'&& <ExamsModule />}
        {activeTab ==='documents'&& currentRole ==='admin'&& <DocumentsModule />}
        {activeTab ==='bus'&& <BusModule />}
        {activeTab ==='tuition'&& (currentRole ==='admin'|| currentRole ==='vice_principal') && <TuitionModule />}
        {activeTab ==='finance'&& currentRole ==='admin'&& <FinanceModule />}
        {activeTab ==='tutoring'&& <TutoringModule />}
        {activeTab ==='subjects'&& <SubjectsModule />}
        {activeTab ==='reports'&& <ReportsModule />}
        {activeTab ==='directory'&& (currentRole ==='admin'|| currentRole ==='teacher'|| currentRole ==='vice_principal') && <DirectoryModule initialSubTab="students"/>}
        {activeTab ==='teachers'&& (currentRole ==='admin'|| currentRole ==='teacher'|| currentRole ==='vice_principal') && <DirectoryModule initialSubTab="teachers"/>}
        {activeTab ==='attendance'&& <AttendanceModule />}
        {activeTab ==='behavior'&& <BehaviorModule />}
        {activeTab ==='users'&& currentRole ==='admin'&& <UsersModule />}
        {activeTab ==='settings'&& currentRole ==='admin'&& <SettingsModule setActiveTab={setActiveTab} />}
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#0284C7] dark:bg-[#000000] border-t border-sky-600 dark:border-zinc-800 text-white text-xs py-6 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-300"/>
            <span className="font-bold text-white">{t('appName')}</span>
            <span className="text-sky-100 dark:text-slate-400">© 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
