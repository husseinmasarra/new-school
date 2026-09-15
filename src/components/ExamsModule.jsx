import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  FileSpreadsheet, 
  Award, 
  Plus, 
  CheckCircle2, 
  Trophy 
} from 'lucide-react';

export const ExamsModule = () => {
  const { lang, t, currentRole, currentUser, exams = [], subjects = [], students = [], addExam, gradeExamResult } = useApp();

  const isAr = lang === 'ar';
  const safeExams = exams || [];
  const safeSubjects = subjects || [];
  const safeStudents = students || [];

  // For Student or Parent: Show ONLY their own exam results
  if (currentRole === 'student' || currentRole === 'parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || { id: 'STU-101', name: currentUser?.name || 'طالب متميز' };
    const myExams = safeExams.filter(ex => ex.results && ex.results.some(r => r.studentId === studentUser.id));

    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-600">لوحة التقييم والنتائج الدراسية</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? `النتائج والعلامات الرسمية للتلميذ: ${studentUser.name}` : `Academic exam grades for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">كشف العلامات والامتحانات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-indigo-600 border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">الامتحان</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3">العلامة</th>
                  <th className="p-3 text-left">ملاحظات وتقييم المعلم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myExams.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-6 text-slate-400 font-bold">لم تصدر أي نتائج امتحانات رسمية بعد. 📅</td>
                  </tr>
                ) : (
                  myExams.map((ex) => {
                    const myResult = ex.results.find(r => r.studentId === studentUser.id);
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="p-3 text-right font-bold">{ex.title}</td>
                        <td className="p-3 font-bold text-slate-500">{ex.subject}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            myResult.score >= 90 ? 'bg-emerald-100 text-emerald-800' :
                            myResult.score >= 60 ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {myResult.score} / 100
                          </span>
                        </td>
                        <td className="p-3 text-left text-slate-500 font-bold">{myResult.evaluation || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  const [selectedExamId, setSelectedExamId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Exam state
  const [examTitle, setExamTitle] = useState('');
  const [examTitleEn, setExamTitleEn] = useState('');
  const [subjectId, setSubjectId] = useState(safeSubjects[0]?.id || 'SUB-01');
  const [grade, setGrade] = useState('الصف السادس');
  const [classRoom, setClassRoom] = useState('أ');

  // Grading state
  const [gradingMarks, setGradingMarks] = useState({});
  const [gradingEvals, setGradingEvals] = useState({});
  const [savedToast, setSavedToast] = useState(false);

  // Safely resolve selected exam or fallback to first available
  const selectedExam = (safeExams.length > 0 && selectedExamId)
    ? safeExams.find((e) => e.id === selectedExamId) || safeExams[0]
    : safeExams[0] || null;

  const handleAddExamSubmit = (e) => {
    e.preventDefault();
    if (!examTitle) return;

    const finalSubId = subjectId && safeSubjects.some(s => s.id === subjectId) 
      ? subjectId 
      : (safeSubjects[0]?.id || '');
    const sub = safeSubjects.find((s) => s.id === finalSubId) || safeSubjects[0];

    const newEx = addExam({
      title: examTitle,
      titleEn: examTitleEn || examTitle,
      subjectId: sub ? sub.id : 'SUB-01',
      subject: sub ? sub.name : 'مادة دراسية',
      grade,
      classRoom
    });

    if (newEx?.id) {
      setSelectedExamId(newEx.id);
    }

    setExamTitle('');
    setExamTitleEn('');
    setSubjectId('');
    setShowAddModal(false);
  };

  const handleSaveGrading = (studentId) => {
    const mark = gradingMarks[studentId];
    const evalText = gradingEvals[studentId] || (isAr ? 'ممتاز واصل التقدم!' : 'Excellent keep it up!');
    if (!selectedExam || mark === undefined || mark === '') return;

    gradeExamResult(selectedExam.id, studentId, Number(mark), evalText);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  // Sort Top Performing Roster
  const topStudentsRoster = [...safeStudents].sort((a, b) => (b.gpa || 0) - (a.gpa || 0));

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('examsTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "رصد درجات اختبارات الطلاب، تصنيف الأوائل، وإصدار التقييمات الشاملة."
                : "Record student test marks, class rankings, and view top performing roster."}
            </p>
          </div>
        </div>

        {/* Add Exam Action for Admin/Teacher */}
        {(currentRole === 'admin' || currentRole === 'teacher') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة اختبار جديد +" : "Add New Exam +"}</span>
          </button>
        )}
      </div>

      {savedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{isAr ? 'تم حفظ رصد درجة الطالب وتحديث الترتيب بنجاح!' : 'Exam mark and ranking updated successfully!'}</span>
        </div>
      )}

      {/* Top Performing Honor Roll Roster */}
      {safeStudents.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>{isAr ? 'لوحة شرف الأوائل المتفوقين (Top Ranked Roster)' : 'Top Academic Honor Roll'}</span>
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStudentsRoster.slice(0, 3).map((stu, index) => (
              <div key={stu.id} className="interactive-card bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] flex items-center gap-3 shadow-sm hover:border-[#0284C7]/50">
                <div className="relative">
                  <img src={stu.avatar} alt={stu.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-white">
                    #{index + 1}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</h4>
                  <p className="text-[11px] text-[#0284C7] font-semibold">{isAr ? stu.grade : stu.gradeEn} ({stu.classRoom})</p>
                  <span className="text-[10px] font-mono font-bold text-slate-500">GPA: {stu.gpa || 95}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Exam Grading Sheet */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#0284C7]" />
            <span>{isAr ? 'دفتر رصد درجات الاختبار' : 'Exam Grading Sheet'}</span>
          </h3>

          {safeExams.length > 0 && (
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl">
              <span className="text-xs text-slate-500">{isAr ? 'اختر الاختبار:' : 'Select Exam:'}</span>
              <select
                value={selectedExam?.id || ''}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
              >
                {safeExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {isAr ? ex.title : ex.titleEn || ex.title} ({ex.subject})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!selectedExam ? (
          <div className="text-center py-10 space-y-3 bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-300">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-[#0284C7]">{isAr ? 'لا يوجد اختبارات مضافة حالياً 📝' : 'No Exams Created Yet'}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isAr ? 'اضغط على زر (إضافة اختبار جديد +) للبدء بإضافة اختبارات ورصد علامات الطلاب.' : 'Click Add New Exam to create an exam and grade students.'}
            </p>
            {(currentRole === 'admin' || currentRole === 'teacher') && (
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-mustard px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                {isAr ? 'إضافة اختبار جديد +' : 'Add New Exam +'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                  <th className="p-3 font-semibold">{t('studentName')}</th>
                  <th className="p-3 font-semibold">{t('grade')}</th>
                  <th className="p-3 font-semibold">{t('marks')} (/100)</th>
                  <th className="p-3 font-semibold">{t('evaluation')}</th>
                  <th className="p-3 font-semibold text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400 text-xs">
                      {isAr ? 'لا يوجد طلاب مسجلون رصد العلامات حالياً. أضف طلاب من دليل المدرسة للبدء!' : 'No students added yet.'}
                    </td>
                  </tr>
                ) : (
                  safeStudents.map((stu) => {
                    const existingRes = (selectedExam?.results || []).find((r) => r.studentId === stu.id);
                    const currentMark = gradingMarks[stu.id] ?? (existingRes ? existingRes.score : '');

                    return (
                      <tr key={stu.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover border border-[#0284C7]" />
                          <span>{isAr ? stu.name : stu.nameEn}</span>
                        </td>
                        <td className="p-3 text-slate-600">{isAr ? stu.grade : stu.gradeEn} ({stu.classRoom})</td>
                        <td className="p-3 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={currentMark}
                            onChange={(e) => setGradingMarks({ ...gradingMarks, [stu.id]: e.target.value })}
                            placeholder="مثال: 95"
                            className="w-20 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-1 text-xs font-bold text-center focus:outline-none focus:border-[#0284C7]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={gradingEvals[stu.id] ?? (existingRes ? existingRes.evaluation : '')}
                            onChange={(e) => setGradingEvals({ ...gradingEvals, [stu.id]: e.target.value })}
                            placeholder="أداء متميز وجيد جداً..."
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleSaveGrading(stu.id)}
                            className="btn-mustard px-3 py-1 rounded-xl text-[11px] font-bold shadow cursor-pointer"
                          >
                            {t('save')}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Exam Modal - Teleported to document.body */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddExamSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة اختبار دراسي جديد' : 'Add New Exam'}</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'عنوان الاختبار (عربي)' : 'Exam Title (Arabic)'} <span className="text-red-500">*</span></label>
              <input type="text" required value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="اختبار الشهر الأول للفيزياء..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المادة' : 'Subject'}</label>
              <select value={subjectId || safeSubjects[0]?.id || ''} onChange={(e) => setSubjectId(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                {safeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
