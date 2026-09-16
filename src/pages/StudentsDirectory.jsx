import React, {useState} from'react';
import {useSchool} from'../context/SchoolContext';
import {
  Users,
  Search,
  Plus,
  Printer,
  Download,
  Award,
  Trash2,
  Phone,
  Bus,
  CreditCard,
  Building2,
  Sparkles
} from'lucide-react';

export const StudentsDirectory = () => {
  const {
    students,
    deleteStudent,
    setActiveTab,
    setSelectedStudentForReport
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [viewMode, setViewMode] = useState('family'); //'family'or'table'

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.familyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade ==='ALL'|| s.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // Group by Family for Unified Family Cards
  const familyGroups = filteredStudents.reduce((acc, student) => {
    const famKey = student.familyId || student.familyName || student.parentName ||'عائلة عامة';
    if (!acc[famKey]) {
      acc[famKey] = {
        familyName: student.familyName ||`عائلة ${student.parentName ||'المدرسة'}`,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        children: []
      };
    }
    acc[famKey].children.push(student);
    return acc;
  }, {});

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['رقم القيد','الاسم','العائلة','الصف','الشعبة','ولي الأمر','رقم الهاتف','القسط الإجمالي','الخصم','المسدد','المتبقي'];
    const rows = filteredStudents.map(s => [
      s.id,
      s.name,
      s.familyName ||'',
      s.grade,
      s.section,
      s.parentName,
      s.parentPhone,
      s.tuitionTotal,
      s.discountAmount,
      s.paidAmount,
      s.remainingAmount
    ]);

    const csvContent ='data:text/csv;charset=utf-8,\uFEFF'+
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download',`دليل_طلاب_المدرسة_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600"/>
            دليل الطلاب وكروت العائلات الموحدة
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الطلاب، تجميع الإخوة تحت كارت عائلي موحد، وتصدير الكشوفات الرسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('add-student')}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4"/>
            <span>إضافة طالب جديد</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4"/>
            <span>تصدير Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4"/>
            <span>طباعة الكشف</span>
          </button>
        </div>
      </div>

      {/* Filters and View Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute top-3 right-3"/>
          <input
            type="text"
            placeholder="ابحث بالاسم، العائلة، ولي الأمر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 focus:outline-none font-semibold text-slate-700"
          >
            <option value="ALL">جميع الصفوف الدراسية</option>
            <option value="الأول الأساسي">الأول الأساسي</option>
            <option value="الثاني الأساسي">الثاني الأساسي</option>
            <option value="الثالث الأساسي">الثالث الأساسي</option>
            <option value="الرابع الأساسي">الرابع الأساسي</option>
          </select>

          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('family')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode ==='family'?'bg-white shadow text-sky-700':'text-slate-600'}`}
            >
              كروت العائلات
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode ==='table'?'bg-white shadow text-sky-700':'text-slate-600'}`}
            >
              جدول تفصيلي
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Unified Family Cards */}
      {viewMode ==='family'&& (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(familyGroups).map(([famKey, group]) => {
            const familyTotalTuition = group.children.reduce((s, c) => s + (Number(c.tuitionTotal) || 0) - (Number(c.discountAmount) || 0), 0);
            const familyTotalPaid = group.children.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
            const familyRemaining = familyTotalTuition - familyTotalPaid;

            return (
              <div key={famKey} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                
                {/* Family Header */}
                <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center font-bold text-sky-300">
                        
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-white">{group.familyName}</h3>
                        <p className="text-[11px] text-sky-200">ولي الأمر: {group.parentName} ({group.children.length} أبناء مسجلين)</p>
                      </div>
                    </div>
                    <div className="text-left font-mono">
                      <a
                        href={`https://wa.me/${group.parentPhone?.replace(/[^0-9]/g,'')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition"
                      >
                        <Phone className="w-3 h-3"/>
                        <span>واتساب</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Children List in this family */}
                <div className="p-4 divide-y divide-slate-100">
                  {group.children.map(child => (
                    <div key={child.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                          {child.name[0]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">{child.name}</h4>
                          <p className="text-xs text-slate-500">{child.grade} (شعبة {child.section}) | {child.busRoute}</p>
                          {child.discountAmount > 0 && (
                            <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-bold border border-rose-200">
                              خصم: ${child.discountAmount} ({child.discountReason})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 no-print">
                        <button
                          onClick={() => setSelectedStudentForReport(child)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold flex items-center gap-1"
                          title="عرض الشهادة الأكاديمية"
                        >
                          <Award className="w-3.5 h-3.5"/>
                          <span className="hidden sm:inline">الشهادة</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الطالب ${child.name}؟`)) {
                              deleteStudent(child.id);
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                          title="حذف الطالب"
                        >
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Family Financial Summary Bar */}
                <div className="bg-slate-50 p-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    إجمالي الرسوم: <strong className="text-slate-800">${familyTotalTuition}</strong>
                  </div>
                  <div className="text-emerald-700">
                    المدفوع: <strong>${familyTotalPaid}</strong>
                  </div>
                  <div className="text-rose-600 font-bold">
                    المتبقي: ${familyRemaining} USD
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Full Detailed Table */}
      {viewMode ==='table'&& (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3">رقم القيد</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الصف والشعبة</th>
                  <th className="p-3">ولي الأمر</th>
                  <th className="p-3">رقم الهاتف</th>
                  <th className="p-3">القسط الإجمالي</th>
                  <th className="p-3">الخصم الممنوح</th>
                  <th className="p-3">المسدد</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3 text-center no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ?'bg-white':'bg-slate-50/50'}>
                    <td className="p-3 font-mono font-bold text-slate-500">{s.id}</td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 text-slate-600">{s.grade} - {s.section}</td>
                    <td className="p-3 text-slate-700">{s.parentName}</td>
                    <td className="p-3 font-mono text-slate-600">{s.parentPhone}</td>
                    <td className="p-3 font-bold">${s.tuitionTotal}</td>
                    <td className="p-3 text-rose-600 font-bold">
                      {s.discountAmount > 0 ?`-$${s.discountAmount}`:'$0'}
                    </td>
                    <td className="p-3 text-emerald-600 font-bold">${s.paidAmount}</td>
                    <td className="p-3 font-black text-rose-600">${s.remainingAmount}</td>
                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForReport(s)}
                          className="p-1 rounded hover:bg-amber-100 text-amber-700"
                          title="الشهادة الأكاديمية"
                        >
                          <Award className="w-4 h-4"/>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`حذف الطالب ${s.name}؟`)) {
                              deleteStudent(s.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-rose-100 text-rose-600"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
