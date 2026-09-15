import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { GraduationCap, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const { schoolInfo, userRole } = useSchool();

  return (
    <footer className="bg-sky-700 text-white text-xs py-2 px-6 flex items-center justify-between shadow-inner no-print">
      <div className="flex items-center gap-2">
        <GraduationCap className="w-4 h-4 text-sky-200" />
        <span className="font-semibold">{schoolInfo.name} 2026</span>
        <span className="text-sky-300 hidden sm:inline">| كافة الحقوق محفوظة</span>
      </div>
      <div className="flex items-center gap-2 text-sky-100">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
        <span className="font-bold">{userRole}</span>
      </div>
    </footer>
  );
};
