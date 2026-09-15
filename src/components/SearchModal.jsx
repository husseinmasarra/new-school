import React, { useState, useEffect } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Search, X, User, GraduationCap, BookOpen, Receipt, ArrowLeft } from 'lucide-react';

export const SearchModal = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    students,
    teachers,
    subjects,
    payments,
    setActiveTab,
    setSelectedReceipt
  } = useSchool();

  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.parentName?.toLowerCase().includes(query.toLowerCase()) ||
    s.grade?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.specialty?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredSubjects = subjects.filter(sub =>
    sub.name.toLowerCase().includes(query.toLowerCase()) ||
    sub.code?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const filteredReceipts = payments.filter(p =>
    p.id.toLowerCase().includes(query.toLowerCase()) ||
    p.studentName.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4 no-print animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-sky-600" />
          <input
            type="text"
            placeholder="ابحث عن طالب، ولي أمر، معلم، مادة، أو رقم إيصال..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none text-base"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          
          {/* Quick Shortcuts if query is empty */}
          {query.trim() === '' && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">روابط سريعة</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setActiveTab('add-student'); setIsSearchOpen(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50 text-right text-sm text-slate-700 font-semibold transition"
                >
                  <span className="p-1.5 rounded-lg bg-sky-100 text-sky-600">➕</span>
                  إضافة طالب جديد
                </button>
                <button
                  onClick={() => { setActiveTab('tuition'); setIsSearchOpen(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-right text-sm text-slate-700 font-semibold transition"
                >
                  <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">💵</span>
                  سجل الأقساط والدفعات
                </button>
                <button
                  onClick={() => { setActiveTab('attendance'); setIsSearchOpen(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50 text-right text-sm text-slate-700 font-semibold transition"
                >
                  <span className="p-1.5 rounded-lg bg-purple-100 text-purple-600">📋</span>
                  رصد الحضور والغياب
                </button>
                <button
                  onClick={() => { setActiveTab('grades'); setIsSearchOpen(false); }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-right text-sm text-slate-700 font-semibold transition"
                >
                  <span className="p-1.5 rounded-lg bg-amber-100 text-amber-600">📝</span>
                  رصد العلامات والشهادات
                </button>
              </div>
            </div>
          )}

          {/* Students Results */}
          {filteredStudents.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>الطلاب ({filteredStudents.length})</span>
              </div>
              <div className="space-y-1">
                {filteredStudents.map(student => (
                  <div
                    key={student.id}
                    onClick={() => {
                      setActiveTab('students');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                        {student.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.grade} - شعبة {student.section} | ولي الأمر: {student.parentName}</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Teachers Results */}
          {filteredTeachers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>المعلمين ({filteredTeachers.length})</span>
              </div>
              <div className="space-y-1">
                {filteredTeachers.map(teacher => (
                  <div
                    key={teacher.id}
                    onClick={() => {
                      setActiveTab('teachers');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                        {teacher.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{teacher.name}</p>
                        <p className="text-xs text-slate-500">{teacher.specialty}</p>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Receipts Results */}
          {filteredReceipts.length > 0 && (
            <div>
              <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>إيصالات القبض ({filteredReceipts.length})</span>
              </div>
              <div className="space-y-1">
                {filteredReceipts.map(payment => (
                  <div
                    key={payment.id}
                    onClick={() => {
                      setSelectedReceipt(payment);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 cursor-pointer transition border border-emerald-100"
                  >
                    <div>
                      <p className="text-xs font-mono font-bold text-emerald-700">{payment.id}</p>
                      <p className="text-xs text-slate-600">{payment.studentName} - المبلغ: ${payment.amount} USD</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">عرض الإيصال</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.trim() !== '' && filteredStudents.length === 0 && filteredTeachers.length === 0 && filteredReceipts.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>لم يتم العثور على نتائج مطابقة لـ "{query}"</p>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-4 py-2 text-xs text-slate-500 flex justify-between items-center border-t border-slate-100">
          <span>اضغط ESC أو انقر في الخارج للإغلاق</span>
          <span className="font-mono">منظومة مدرسة الدعم التعليمي</span>
        </div>

      </div>
    </div>
  );
};
