import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { MessageSquareShare, Plus, Bell, Trash2, Calendar, Users } from 'lucide-react';

export const AnnouncementsPage = () => {
  const { announcements, addAnnouncement, deleteAnnouncement } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'عادي',
    target: 'الجميع'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newAnn.title.trim() || !newAnn.content.trim()) return;

    addAnnouncement(newAnn);
    setShowAddModal(false);
    setNewAnn({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'عادي',
      target: 'الجميع'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquareShare className="w-6 h-6 text-sky-600" />
            التواصل والتعاميم المدرسية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إرسال ونشر الإعلانات المدرسية، التعاميم العاجلة، ورسائل أولياء الأمور
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>نشر تعميم جديد</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    ann.priority === 'عاجل' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {ann.priority}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    الموجه إليهم: {ann.target}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.date}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 mt-2">{ann.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{ann.content}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => deleteAnnouncement(ann.id)}
                className="text-slate-400 hover:text-rose-600 p-1 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف التعميم</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">نشر تعميم أو إعلان مدرسي</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان التعميم *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عطلة رسمية بمناسبة عيد المعلم"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نص التعميم / الرسالة *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="نص الإعلان الرسمي..."
                  value={newAnn.content}
                  onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الأولوية</label>
                  <select
                    value={newAnn.priority}
                    onChange={(e) => setNewAnn({ ...newAnn, priority: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="عادي">عادي</option>
                    <option value="هام">هام</option>
                    <option value="عاجل">عاجل جداً</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفئة المستهدفة</label>
                  <select
                    value={newAnn.target}
                    onChange={(e) => setNewAnn({ ...newAnn, target: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="الجميع">كافة أولياء الأمور والطلاب</option>
                    <option value="أولياء الأمور فقط">أولياء الأمور فقط</option>
                    <option value="كادر المعلمين">كادر المعلمين</option>
                  </select>
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
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow"
                >
                  نشر الآن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
