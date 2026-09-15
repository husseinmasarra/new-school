import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ShieldCheck, Plus, User, KeyRound, Check } from 'lucide-react';

export const UsersPage = () => {
  const { userRole, setUserRole } = useSchool();
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'إدارة المدرسة العامة', username: 'admin', role: 'مدير عام النظام', status: 'نشط' },
    { id: 'u-2', name: 'أ. أحمد منصور', username: 'ahmad.m', role: 'معلم', status: 'نشط' },
    { id: 'u-3', name: 'يوسف العلي (ولي أمر)', username: 'parent_ali', role: 'ولي أمر', status: 'نشط' },
    { id: 'u-4', name: 'أبو خالد سليم', username: 'driver_salim', role: 'سائق حافلة', status: 'نشط' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            إدارة المستخدمين والأدوار والصلاحيات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة حسابات الدخول، تعيين الصلاحيات (مدير، معلم، ولي أمر، سائق)، والتبديل السريع للتجربة
          </p>
        </div>

        {/* Quick Role Switcher for live testing */}
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 p-1.5 rounded-xl text-xs">
          <span className="font-bold text-purple-900">الدور النشط الحالي:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-white p-1 rounded-lg border border-purple-300 font-bold text-purple-900 focus:outline-none"
          >
            <option value="مدير عام النظام">مدير عام النظام (Admin)</option>
            <option value="معلم">معلم (Teacher)</option>
            <option value="ولي أمر">ولي أمر (Parent)</option>
            <option value="طالب">طالب (Student)</option>
            <option value="سائق حافلة">سائق حافلة (Driver)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3">اسم المستخدم</th>
                <th className="p-3">اسم الدخول (Username)</th>
                <th className="p-3">الدور / الصلاحية</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u, idx) => (
                <tr key={u.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {u.name[0]}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600">{u.username}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        setUserRole(u.role);
                        alert(`تم التبديل إلى دور: ${u.role}`);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      تسجيل الدخول بهذا الحساب
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
