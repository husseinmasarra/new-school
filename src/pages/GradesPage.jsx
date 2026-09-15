import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Award, Printer, CheckCircle, Search, Save } from 'lucide-react';

export const GradesPage = () => {
  const { students, subjects, grades, setGrades, setSelectedStudentForReport } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');

  const currentStudent = students.find(s => s.id === selectedStudentId);
  const currentSubject = subjects.find(s => s.id === selectedSubjectId);

  // Grade inputs
  const existingGrade = grades.find(g => g.studentId === selectedStudentId && g.subjectId === selectedSubjectId) || {
    exam1: 18,
    midterm: 36,
    finalExam: 38
  };

  const [formMarks, setFormMarks] = useState({
    exam1: existingGrade.exam1 ?? 18,
    midterm: existingGrade.midterm ?? 36,
    finalExam: existingGrade.finalExam ?? 38
  });

  const totalScore = Number(formMarks.exam1 || 0) + Number(formMarks.midterm || 0) + Number(formMarks.finalExam || 0);

  const getStatus = (score) => {
    if (score >= 90) return 'ممتاز';
    if (score >= 80) return 'جيد جداً';
    if (score >= 70) return 'جيد';
    if (score >= 60) return 'مقبول';
    return 'يحتاج لتحسين';
  };

  const handleSaveMarks = (e) => {
    e.preventDefault();
    if (!currentStudent || !currentSubject) return;

    const newGrade = {
      id: `grd-${currentStudent.id}-${currentSubject.id}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      grade: currentStudent.grade,
      subjectId: currentSubject.id,
      subjectName: currentSubject.name,
      exam1: Number(formMarks.exam1),
      midterm: Number(formMarks.midterm),
      finalExam: Number(formMarks.finalExam),
      total: totalScore,
      maxTotal: 100,
      status: getStatus(totalScore)
    };

    setGrades(prev => {
      const filtered = prev.filter(g => !(g.studentId === currentStudent.id && g.subjectId === currentSubject.id));
      return [...filtered, newGrade];
    });

    alert(`تم رصد درجات الطالب ${currentStudent.name} في مادة ${currentSubject.name} بنجاح! المجموع: ${totalScore}/100`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            رصد العلامات والشهادات الأكاديمية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدخال درجات أعمال السنة، الاختبارات النصفية والنهائية، وتوليد الشهادات الرسمية
          </p>
        </div>

        {currentStudent && (
          <button
            onClick={() => setSelectedStudentForReport(currentStudent)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة شهادة {currentStudent.name}</span>
          </button>
        )}
      </div>

      {/* Grade Entry Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student & Subject Selection */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
            1. تحديد الطالب والمادة
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اختر الطالب:</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اختر المادة الدراسية:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Score Inputs Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 mb-4 flex items-center justify-between">
            <span>2. رصد الدرجات لـ: {currentStudent?.name} - {currentSubject?.name}</span>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-sky-100 text-sky-800">
              الحد الأقصى 100
            </span>
          </h3>

          <form onSubmit={handleSaveMarks} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">أعمال السنة والمشاركة (من 20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formMarks.exam1}
                  onChange={(e) => setFormMarks({ ...formMarks, exam1: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">امتحان منتصف الفصل (من 40)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formMarks.midterm}
                  onChange={(e) => setFormMarks({ ...formMarks, midterm: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الامتحان النهائي (من 40)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={formMarks.finalExam}
                  onChange={(e) => setFormMarks({ ...formMarks, finalExam: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">المجموع الكلي والتقدير المحسوب:</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-black text-sky-900 font-mono">{totalScore} / 100</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                    {getStatus(totalScore)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow transition"
              >
                <Save className="w-4 h-4" />
                <span>حفظ ورصد العلامة</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
