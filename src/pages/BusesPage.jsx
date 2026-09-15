import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Bus, Phone, Users, Plus, Trash2 } from 'lucide-react';

export const BusesPage = () => {
  const { buses, setBuses, students } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBus, setNewBus] = useState({
    busNumber: 'حافلة رقم 20 (سعة 25)',
    route: '',
    driverName: '',
    driverPhone: '',
    studentsCount: 0
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newBus.route.trim() || !newBus.driverName.trim()) return;

    setBuses(prev => [...prev, { ...newBus, id: `bus-${Date.now()}` }]);
    setShowAddModal(false);
    setNewBus({ busNumber: 'حافلة رقم 20 (سعة 25)', route: '', driverName: '', driverPhone: '', studentsCount: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bus className="w-6 h-6 text-teal-600" />
            النقل المدرسي والحافلات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة مسارات وخطوط الحافلات، أرقام السائقين، والطلاب المشتركين بخدمة النقل
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خط حافلة جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {buses.map(b => {
          const busStudents = students.filter(s => s.busRoute && s.busRoute.includes(b.route.split(' ')[0]));

          return (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Bus className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-800">
                    {b.busNumber}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900">{b.route}</h3>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p>السائق المسؤول: <strong className="text-slate-800">{b.driverName}</strong></p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{b.driverPhone}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  الطلاب المشتركين: <strong>{busStudents.length || b.studentsCount}</strong>
                </span>

                <button
                  onClick={() => {
                    if (confirm(`حذف الحافلة ${b.busNumber}؟`)) {
                      setBuses(prev => prev.filter(item => item.id !== b.id));
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">إضافة خط حافلة</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الحافلة والسعة</label>
                <input
                  type="text"
                  required
                  value={newBus.busNumber}
                  onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">مسار الخط (المناطق المشمولة) *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خط صيدا - الهلالية - مجدليون"
                  value={newBus.route}
                  onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم السائق *</label>
                  <input
                    type="text"
                    required
                    placeholder="أبو سامي"
                    value={newBus.driverName}
                    onChange={(e) => setNewBus({ ...newBus, driverName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف السائق</label>
                  <input
                    type="tel"
                    placeholder="+961 70 ..."
                    value={newBus.driverPhone}
                    onChange={(e) => setNewBus({ ...newBus, driverPhone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow"
                >
                  حفظ الحافلة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
