import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { FileCheck2, Upload, FileText, CheckCircle2, Search, Trash2, Eye } from 'lucide-react';

export const DocumentArchive = () => {
  const { students } = useSchool();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [docs, setDocs] = useState([
    { id: 'd-1', studentId: 'stu-1001', studentName: 'كريم يوسف العلي', docType: 'إخراج قيد إفرادي / بطاقة هوية', uploadDate: '2025-09-01', status: 'معتمد' },
    { id: 'd-2', studentId: 'stu-1001', studentName: 'كريم يوسف العلي', docType: 'شهادة التطعيم والسجل الصحي', uploadDate: '2025-09-01', status: 'معتمد' },
    { id: 'd-3', studentId: 'stu-1002', studentName: 'سارة يوسف العلي', docType: 'إفادة مدرسية مصدقة لعام 2024', uploadDate: '2025-09-02', status: 'معتمد' },
    { id: 'd-4', studentId: 'stu-1003', studentName: 'جاد عمر الرفاعي', docType: 'صورة جواز السفر وإثبات الإقامة', uploadDate: '2025-09-03', status: 'معتمد' }
  ]);

  const [newDocType, setNewDocType] = useState('إخراج قيد إفرادي / بطاقة هوية');

  const handleUploadMock = (e) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    if (!st) return;

    setDocs(prev => [
      {
        id: `d-${Date.now()}`,
        studentId: st.id,
        studentName: st.name,
        docType: newDocType,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'معتمد'
      },
      ...prev
    ]);

    alert(`تمت أرشفة وثيقة [${newDocType}] للطالب ${st.name} بنجاح!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-amber-600" />
            أرشفة الوثائق الثبوتية للطلاب
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أرشفة الهويات، إفادات السكن، شهادات الميلاد والملفات الصحية إلكترونياً
          </p>
        </div>
      </div>

      {/* Upload Form Box */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100 mb-4">
          أرشفة مستند جديد للطالب
        </h3>

        <form onSubmit={handleUploadMock} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم الطالب المستفيد *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع الوثيقة الثبوتية *</label>
            <select
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
            >
              <option value="إخراج قيد إفرادي / بطاقة هوية">إخراج قيد إفرادي / بطاقة هوية</option>
              <option value="شهادة الميلاد الرسمية">شهادة الميلاد الرسمية</option>
              <option value="شهادة التطعيم والسجل الصحي">شهادة التطعيم والسجل الصحي</option>
              <option value="إفادة علامات من المدرسة السابقة">إفادة علامات من المدرسة السابقة</option>
              <option value="صورة شخصية رسمية">صورة شخصية رسمية</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 p-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow transition"
            >
              <Upload className="w-4 h-4" />
              <span>أرشفة الوثيقة الآن</span>
            </button>
          </div>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">اسم الطالب</th>
                <th className="p-3">نوع الوثيقة المؤرشفة</th>
                <th className="p-3">تاريخ الأرشفة</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">معاينة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((d, idx) => (
                <tr key={d.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 font-bold text-slate-900">{d.studentName}</td>
                  <td className="p-3 flex items-center gap-2 text-slate-700">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>{d.docType}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-500">{d.uploadDate}</td>
                  <td className="p-3">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => alert(`عرض الوثيقة المؤرشفة: ${d.docType} للطالب ${d.studentName}`)}
                      className="p-1 text-sky-600 hover:bg-sky-50 rounded"
                      title="معاينة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
