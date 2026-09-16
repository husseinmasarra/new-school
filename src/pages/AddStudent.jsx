import React, {useState} from'react';
import {useSchool} from'../context/SchoolContext';
import {UserPlus, Save, ArrowRight, ShieldCheck, CheckCircle2} from'lucide-react';

export const AddStudent = () => {
  const {addStudent, classes, buses, setActiveTab} = useSchool();

  const [formData, setFormData] = useState({
    name:'',
    familyName:'',
    familyId:'',
    grade: classes[0]?.name ||'الأول الأساسي',
    section:'أ',
    gender:'ذكر',
    dob:'2018-01-01',
    parentName:'',
    parentPhone:'',
    busRoute:'بدون نقل (خاص)',
    tuitionTotal: 700,
    discountAmount: 0,
    discountReason:'',
    paidAmount: 0,
    notes:''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.parentName.trim()) {
      alert('يرجى كتابة اسم الطالب واسم ولي الأمر بشكل صحيح');
      return;
    }

    const created = addStudent(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setActiveTab('students');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5"/>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">تسجيل وإضافة طالب جديد</h2>
            <p className="text-xs text-slate-500">إدخال البيانات الشخصية، ربط العائلة، الشؤون المالية والحافلة</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('students')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
        >
          <ArrowRight className="w-4 h-4"/>
          <span>العودة للدليل</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600"/>
          <div>
            <h4 className="font-bold text-sm">تم تسجيل الطالب بنجاح!</h4>
            <p className="text-xs">تم حفظ القيد وتحديث الملف المالي، جارٍ الانتقال إلى دليل الطلاب...</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        {/* Section 1: Basic Info */}
        <div>
          <h3 className="text-sm font-black text-sky-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <span> البيانات الأساسية للطالب</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي *</label>
              <input
                type="text"
                required
                placeholder="مثال: يوسف أحمد العلي"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم العائلة / اللقب *</label>
              <input
                type="text"
                required
                placeholder="مثال: عائلة العلي"
                value={formData.familyName}
                onChange={(e) => setFormData({...formData, familyName: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الجنس</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-semibold"
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تاريخ الميلاد</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف الدراسي *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-semibold"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الشعبة الدراسية</label>
              <select
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-semibold"
              >
                <option value="أ">الشعبة أ</option>
                <option value="ب">الشعبة ب</option>
                <option value="ج">الشعبة ج</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Parent & Transport */}
        <div>
          <h3 className="text-sm font-black text-sky-900 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <span> بيانات ولي الأمر والمواصلات</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم ولي الأمر / المعيل *</label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد العلي"
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم هاتف ولي الأمر (واتساب) *</label>
              <input
                type="tel"
                required
                placeholder="+961 70 123 456"
                value={formData.parentPhone}
                onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">خدمة النقل المدرسي (الباص)</label>
              <select
                value={formData.busRoute}
                onChange={(e) => setFormData({...formData, busRoute: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-semibold"
              >
                <option value="بدون نقل (خاص)">بدون نقل (خاص)</option>
                {buses.map(b => (
                  <option key={b.id} value={b.route}>{b.route} ({b.busNumber})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Financial Setup */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-black text-sky-900 pb-2 border-b border-slate-200 mb-4 flex items-center gap-2">
            <span> الشؤون المالية والأقساط والخصومات الممنوحة</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">إجمالي القسط السنوي (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.tuitionTotal}
                onChange={(e) => setFormData({...formData, tuitionTotal: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">قيمة الخصم الممنوح (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.discountAmount}
                onChange={(e) => setFormData({...formData, discountAmount: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm font-mono font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">سبب الخصم (إن وجد)</label>
              <input
                type="text"
                placeholder="مثال: خصم إخوة 20% أو تفوق"
                value={formData.discountReason}
                onChange={(e) => setFormData({...formData, discountReason: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الدفعة الأولى المدفوعة حالياً (USD)</label>
              <input
                type="number"
                min="0"
                value={formData.paidAmount}
                onChange={(e) => setFormData({...formData, paidAmount: e.target.value})}
                className="w-full p-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:border-emerald-500 text-sm font-mono font-bold text-emerald-700 bg-white"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <span>
              صافي القسط المستحق بعد الخصم: <strong className="text-slate-900">${Math.max(0, formData.tuitionTotal - formData.discountAmount)} USD</strong>
            </span>
            <span>
              المتبقي بعد الدفعة الأولى: <strong className="text-rose-600 font-bold">${Math.max(0, (formData.tuitionTotal - formData.discountAmount) - formData.paidAmount)} USD</strong>
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition active:scale-95"
          >
            <Save className="w-4 h-4"/>
            <span>حفظ وتسجيل الطالب</span>
          </button>
        </div>

      </form>

    </div>
  );
};
