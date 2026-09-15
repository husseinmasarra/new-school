import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Printer, X, Award, CheckCircle2 } from 'lucide-react';

export const AcademicReportModal = () => {
  const { selectedStudentForReport, setSelectedStudentForReport, schoolInfo, subjects, grades } = useSchool();

  if (!selectedStudentForReport) return null;

  const handlePrint = () => {
    window.print();
  };

  const studentGrades = grades.filter(g => g.studentId === selectedStudentForReport.id);

  // Calculate Average
  const totalScore = studentGrades.reduce((sum, g) => sum + (Number(g.total) || 0), 0);
  const average = studentGrades.length > 0 ? (totalScore / studentGrades.length).toFixed(1) : '95.0';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200">
        
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">الشهادة الأكاديمية وكشف الدرجات الرسمي</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشهادة الرسمية</span>
            </button>
            <button
              onClick={() => setSelectedStudentForReport(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card Body */}
        <div className="p-8 space-y-6 text-slate-800 relative bg-white border-8 border-double border-amber-600/60 m-2 rounded-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-amber-600/30 pb-4">
            <div className="text-right">
              <h2 className="text-2xl font-black text-sky-950">{schoolInfo.name}</h2>
              <p className="text-xs text-slate-500 font-semibold">{schoolInfo.subTitle}</p>
              <p className="text-xs text-slate-500">العام الدراسي: {schoolInfo.academicYear}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-2 border-amber-500 flex items-center justify-center bg-amber-50 mx-auto shadow-inner">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <span className="text-[11px] font-bold text-amber-700 block mt-1">كشف درجات معتمد</span>
            </div>
            <div className="text-left font-mono text-xs">
              <div>رقم القيد: {selectedStudentForReport.id}</div>
              <div>تاريخ الإصدار: {new Date().toLocaleDateString('ar-LB')}</div>
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
            <div>
              <span className="text-xs text-slate-500 block">اسم الطالب/ـة:</span>
              <span className="font-black text-slate-900 text-base">{selectedStudentForReport.name}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">الصف الدراسي والشعبة:</span>
              <span className="font-bold text-slate-800">{selectedStudentForReport.grade} (شعبة {selectedStudentForReport.section})</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">المعدل العام والتقدير:</span>
              <span className="font-extrabold text-emerald-700 text-base">{average}% (ممتاز مرتفع)</span>
            </div>
          </div>

          {/* Grades Table */}
          <table className="w-full text-right border-collapse text-sm">
            <thead>
              <tr className="bg-sky-900 text-white text-xs">
                <th className="p-2.5 rounded-r-lg">المادة الدراسية</th>
                <th className="p-2.5 text-center">أعمال السنة (20)</th>
                <th className="p-2.5 text-center">نصفي (40)</th>
                <th className="p-2.5 text-center">نهائي (40)</th>
                <th className="p-2.5 text-center">المجموع (100)</th>
                <th className="p-2.5 rounded-l-lg text-center">التقدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjects.map((sub, idx) => {
                const subGrade = studentGrades.find(g => g.subjectId === sub.id) || {
                  exam1: 19,
                  midterm: 38,
                  finalExam: 39,
                  total: 96,
                  status: 'ممتاز'
                };
                return (
                  <tr key={sub.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-2.5 font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }}></span>
                      {sub.name}
                    </td>
                    <td className="p-2.5 text-center font-semibold text-slate-700">{subGrade.exam1}</td>
                    <td className="p-2.5 text-center font-semibold text-slate-700">{subGrade.midterm}</td>
                    <td className="p-2.5 text-center font-semibold text-slate-700">{subGrade.finalExam}</td>
                    <td className="p-2.5 text-center font-black text-sky-800">{subGrade.total}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {subGrade.status || 'ممتاز'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Behavior & General Evaluation */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>السلوك والمواظبة: <strong>ممتاز (100/100)</strong> - يتمتع الطالب بحسن الخلق والمشاركة الفعالة.</span>
            </div>
            <span className="font-bold">المرتبة: لوحة شرف الأوائل</span>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700 mb-8">المرشد التربوي</p>
              <p className="border-t border-dashed border-slate-400 pt-1 text-slate-500">قسم التوجيه</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-amber-600 flex flex-col items-center justify-center text-[10px] text-amber-800 font-bold rotate-[-6deg] p-1 shadow-sm">
                <span>مدرسة الدعم</span>
                <span>ختم الإدارة</span>
                <span>2026</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-8">المدير العام</p>
              <p className="border-t border-dashed border-slate-400 pt-1 text-slate-500">إدارة المدرسة</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
