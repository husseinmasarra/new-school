import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Settings, Save, Download, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SettingsPage = () => {
  const { schoolInfo, setSchoolInfo, resetToFactoryDefaults } = useSchool();
  const [formData, setFormData] = useState({ ...schoolInfo });
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSchoolInfo(formData);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  // Export Data as JSON
  const handleExportJSON = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">إعدادات المنظومة والنسخ الاحتياطي</h2>
            <p className="text-xs text-slate-500">تخصيص هوية المدرسة، أرقام التواصل، وحفظ واسترجاع البيانات</p>
          </div>
        </div>

        {savedMsg && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            تم حفظ التعديلات
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
          الهوية والبيانات الرسمية للمدرسة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم المدرسة بالعربي *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الوصف الفرعي للمنظومة</label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">العام الدراسي المعتمد</label>
            <input
              type="text"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">عملة المعاملات الأساسية</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            >
              <option value="USD">الدولار الأمريكي (USD)</option>
              <option value="LBP">الليرة اللبنانية (LBP)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رقم هاتف الإدارة</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div className="col-span-2">
            <label className="block font-bold text-slate-700 mb-1">عنوان المدرسة ومقر الإدارة</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>
      </form>

      {/* Backup & System Reset Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 pb-2 border-b border-slate-100">
          💾 النسخ الاحتياطي وإعادة الضبط
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800">تصدير نسخة احتياطية كاملة</h4>
            <p className="text-[11px] text-slate-500">حفظ كافة بيانات الطلاب، الإيصالات، والعلامات في ملف JSON آمن على جهازك</p>
          </div>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل النسخة الاحتياطية (JSON)</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-rose-700">إعادة ضبط البيانات إلى الوضع النموذجي</h4>
            <p className="text-[11px] text-slate-500">استرجاع البيانات الافتراضية الأولية ومسح التعديلات المحلية</p>
          </div>
          <button
            onClick={() => {
              if (confirm('هل أنت متأكد من رغبتك في استعادة ضبط المصنع؟ سيتم مسح أي بيانات غير محفوظة محلياً.')) {
                resetToFactoryDefaults();
                alert('تمت استعادة البيانات الافتراضية بنجاح!');
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة ضبط البيانات الافتراضية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
