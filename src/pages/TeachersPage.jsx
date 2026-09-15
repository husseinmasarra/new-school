import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Users, Plus, Phone, Mail, Award, Trash2 } from 'lucide-react';

export const TeachersPage = () => {
  const { teachers, setTeachers } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: '',
    salary: 800,
    classes: 'الأول الأساسي (أ)'
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTeacher.name.trim()) return;

    setTeachers(prev => [
      ...prev,
      {
        id: `t-${Date.now()}`,
        name: newTeacher.name,
        specialty: newTeacher.specialty,
        phone: newTeacher.phone,
        email: newTeacher.email,
        salary: Number(newTeacher.salary),
        classes: newTeacher.classes.split(',').map(s => s.trim()),
        status: 'معتمد'
      }
    ]);
    setShowAddModal(false);
    setNewTeacher({ name: '', specialty: '', phone: '', email: '', salary: 800, classes: 'الأول الأساسي (أ)' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            دليل المعلمين المعتمدين
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة أعضاء الهيئة التدريسية، التخصصات، الصفوف الموكلة وبيانات الاتصال
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة معلم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {teachers.map(teacher => (
          <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-lg shadow-inner">
                  {teacher.name[0]}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {teacher.status || 'معتمد'}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{teacher.name}</h3>
              <p className="text-xs font-semibold text-sky-700 mt-0.5">{teacher.specialty}</p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{teacher.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{teacher.email}</span>
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {teacher.classes?.map((cl, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                    {cl}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">الراتب الشهري: <strong className="text-slate-800">${teacher.salary} USD</strong></span>
              <button
                onClick={() => {
                  if (confirm(`حذف المعلم ${teacher.name}؟`)) {
                    setTeachers(prev => prev.filter(t => t.id !== teacher.id));
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
            <h3 className="text-base font-black text-slate-900 mb-4">إضافة معلم جديد</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المعلم *</label>
                <input
                  type="text"
                  required
                  placeholder="أ. سامر خوري"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">التخصص الدراسي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: لغة فرنسية / كيمياء"
                  value={newTeacher.specialty}
                  onChange={(e) => setNewTeacher({ ...newTeacher, specialty: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input
                    type="tel"
                    value={newTeacher.phone}
                    onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الراتب الشهري (USD)</label>
                  <input
                    type="number"
                    value={newTeacher.salary}
                    onChange={(e) => setNewTeacher({ ...newTeacher, salary: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
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
                  حفظ المعلم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
