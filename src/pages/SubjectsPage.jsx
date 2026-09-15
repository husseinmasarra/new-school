import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { BookOpen, Plus, Palette, Clock, UserCheck, Trash2 } from 'lucide-react';

export const SubjectsPage = () => {
  const { subjects, setSubjects, teachers } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    code: 'SUB-101',
    color: '#0284C7',
    weeklyHours: 4,
    teacher: teachers[0]?.name || 'معلم معتمد'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSubject.name.trim()) return;

    setSubjects(prev => [
      ...prev,
      { ...newSubject, id: `s-${Date.now()}`, weeklyHours: Number(newSubject.weeklyHours) }
    ]);
    setShowAddModal(false);
    setNewSubject({ name: '', code: 'SUB-101', color: '#0284C7', weeklyHours: 4, teacher: teachers[0]?.name || 'معلم معتمد' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-rose-600" />
            قائمة المواد الدراسية والألوان المخصصة
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة المناهج، رموز المواد، نصاب الحصص الأسبوعي والمعلمين المكلفين
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة مادة دراسية</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map(sub => (
          <div
            key={sub.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            style={{ borderTop: `4px solid ${sub.color}` }}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: sub.color }}></span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {sub.code}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{sub.name}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>{sub.teacher}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {sub.weeklyHours} حصص أسبوعياً
              </span>
              <button
                onClick={() => {
                  if (confirm(`حذف المادة ${sub.name}؟`)) {
                    setSubjects(prev => prev.filter(s => s.id !== sub.id));
                  }
                }}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">إضافة مادة دراسية جديدة</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المادة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التربية الفنية"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رمز المادة</label>
                  <input
                    type="text"
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الحصص الأسبوعية</label>
                  <input
                    type="number"
                    min="1"
                    value={newSubject.weeklyHours}
                    onChange={(e) => setNewSubject({ ...newSubject, weeklyHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">لون تمييز المادة</label>
                <input
                  type="color"
                  value={newSubject.color}
                  onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
                  className="w-full h-10 p-1 rounded-xl border border-slate-200 cursor-pointer"
                />
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow transition"
                >
                  إضافة المادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
