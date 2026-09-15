import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  BookOpenCheck, 
  Bus, 
  CreditCard, 
  GraduationCap, 
  Users, 
  Palette, 
  Award, 
  FolderArchive, 
  DollarSign, 
  Printer, 
  Smartphone, 
  IdCard 
} from 'lucide-react';

export const Navigation = ({ activeTab, setActiveTab }) => {
  const { t, lang, activePillar } = useApp();

  const academicItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard, color: 'text-purple-400' },
    { id: 'messages', label: t('navMessages'), icon: MessageSquareText, color: 'text-rose-400' },
    { id: 'agenda', label: t('navAgenda'), icon: BookOpenCheck, color: 'text-emerald-400' },
    { id: 'exams', label: t('navExams'), icon: Award, color: 'text-amber-400' },
    { id: 'documents', label: t('navDocuments'), icon: FolderArchive, color: 'text-indigo-400' },
    { id: 'tutoring', label: t('navTutoring'), icon: GraduationCap, color: 'text-purple-400' },
    { id: 'subjects', label: t('navSubjects'), icon: Palette, color: 'text-orange-400' },
    { id: 'reports', label: t('navReports'), icon: Printer, color: 'text-cyan-400' },
  ];

  const financialItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard, color: 'text-purple-400' },
    { id: 'finance', label: t('navFinance'), icon: DollarSign, color: 'text-amber-400' },
    { id: 'bus', label: isAr ? 'قسم النقل والحافلات' : 'School Bus Fleet', icon: Bus, color: 'text-cyan-400' },
    { id: 'reports', label: t('navReports'), icon: Printer, color: 'text-indigo-400' },
    { id: 'directory', label: t('navDirectory'), icon: Users, color: 'text-rose-400' },
  ];

  const navItems = activePillar === 'financial' ? financialItems : academicItems;

  return (
    <nav className="bg-slate-950 border-b border-slate-800/80 sticky top-[69px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-950/80 to-indigo-950/80 text-white border border-purple-500/50 shadow-lg ring-1 ring-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.color} ${isActive ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
