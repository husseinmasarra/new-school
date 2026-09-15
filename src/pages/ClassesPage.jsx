import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Layers, Plus, Users, School, Trash2 } from 'lucide-react';

export const ClassesPage = () => {
  const { classes, setClasses, students, setActiveTab } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    sections: 'أ, ب',
    capacity: 25,
    stage: 'الابتدائية'
  });

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.name.trim()) return;

    const sectionsArray = newClass.sections.split(',').map(s => s.trim()).filter(Boolean);
    const created = {
      id: `c-${Date.now()}`,
      name: newClass.name,
      sections: sectionsArray.length > 0 ? sectionsArray : ['أ'],
      capacity: Number(newClass.capacity) || 25,
      stage: newClass.stage
    };

    setClasses(prev => [...prev, created]);
    setShowAddModal(false);
    setNewClass({ name: '', sections: 'أ, ب', capacity: 25, stage: 'الابتدائية' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-600" />
            الصفوف والشعب الدراسية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المراحل التعليمية، الشعب، وسعة الفصول مع إحصائيات الطلاب
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة صف دراسي جديد</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classes.map(c => {
          const classStudents = students.filter(s => s.grade === c.name);
          const fillPercentage = Math.round((classStudents.length / (c.capacity * c.sections.length)) * 100);

          return (
            <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <School className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                    {c.stage}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{c.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.sections.map(sec => {
                    const secCount = classStudents.filter(s => s.section === sec).length;
                    return (
                      <span key={sec} className="text-xs px-2.5 py-1 rounded-lg bg-sky-100/70 text-sky-800 font-bold border border-sky-200">
                        شعبة {sec} ({secCount} طالب)
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    الطلاب المسجلين: <strong className="text-slate-900">{classStudents.length}</strong>
                  </span>
                  <span>السعة: {c.capacity * c.sections.length}</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                  ></div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => setActiveTab('students')}
                    className="text-sky-600 font-bold hover:underline"
                  >
                    عرض قائمة الطلاب
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`حذف الصف ${c.name}؟`)) {
                        setClasses(prev => prev.filter(item => item.id !== c.id));
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">إضافة صف دراسي جديد</h3>
            <form onSubmit={handleAddClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الصف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: السابع الأساسي"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الشعب (مفصولة بفواصل) *</label>
                <input
                  type="text"
                  value={newClass.sections}
                  onChange={(e) => setNewClass({ ...newClass, sections: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المرحلة الدراسية</label>
                <select
                  value={newClass.stage}
                  onChange={(e) => setNewClass({ ...newClass, stage: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="الروضة">الروضة (KG)</option>
                  <option value="الابتدائية">المرحلة الابتدائية</option>
                  <option value="المتوسطة">المرحلة المتوسطة</option>
                  <option value="الثانوية">المرحلة الثانوية</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow transition"
                >
                  إضافة الصف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
