import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { CalendarCheck2, Plus, Calendar, BookOpen, Trash2, Printer } from 'lucide-react';

export const AgendaPage = () => {
  const { agenda, addAgendaItem, deleteAgendaItem, classes, subjects } = useSchool();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');

  const [newItem, setNewItem] = useState({
    date: new Date().toISOString().split('T')[0],
    grade: classes[0]?.name || 'الأول الأساسي',
    section: 'أ',
    subject: subjects[0]?.name || 'اللغة العربية',
    lessonTitle: '',
    homework: '',
    deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    teacher: 'كادر المعلمين'
  });

  const filteredAgenda = agenda.filter(a => {
    const matchGrade = selectedGrade === 'ALL' || a.grade === selectedGrade;
    const itemSec = a.section || a.classRoom || 'أ';
    const matchSec = selectedSection === 'ALL' || itemSec === selectedSection;
    return matchGrade && matchSec;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.lessonTitle.trim()) return;

    addAgendaItem({ ...newItem, classRoom: newItem.section });
    setShowAddModal(false);
    setNewItem({
      date: new Date().toISOString().split('T')[0],
      grade: classes[0]?.name || 'الأول الأساسي',
      section: 'أ',
      subject: subjects[0]?.name || 'اللغة العربية',
      lessonTitle: '',
      homework: '',
      deadline: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      teacher: 'كادر المعلمين'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-600" />
            الأجندة والدروس والواجبات اليومية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            متابعة الدروس المعطاة، الواجبات المدرسية ومواعيد التسليم لجميع المراحل والشُعب
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">جميع المراحل والصفوف</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
          >
            <option value="ALL">جميع الشُعب</option>
            <option value="أ">الشعبة (أ)</option>
            <option value="ب">الشعبة (ب)</option>
            <option value="ج">الشعبة (ج)</option>
            <option value="د">الشعبة (د)</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة واجب / درس</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الأجندة</span>
          </button>
        </div>
      </div>

      {/* Agenda Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAgenda.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800">
                  {item.grade} (شعبة {item.section})
                </span>
                <span className="text-xs font-mono text-slate-500">{item.date}</span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 mt-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{item.subject}: {item.lessonTitle}</span>
              </h3>

              <div className="mt-3 p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block mb-1">الواجب المطلوب:</span>
                <p className="text-slate-700">{item.homework || 'لا يوجد واجب كتابي'}</p>
                <div className="mt-2 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                  <span>تاريخ التسليم: {item.deadline}</span>
                  <span>المعلم: {item.teacher}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end no-print">
              <button
                onClick={() => deleteAgendaItem(item.id)}
                className="text-slate-400 hover:text-rose-600 p-1 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-4">إضافة درس وواجب للأجندة</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصف الدراسي</label>
                  <select
                    value={newItem.grade}
                    onChange={(e) => setNewItem({ ...newItem, grade: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المادة</label>
                  <select
                    value={newItem.subject}
                    onChange={(e) => setNewItem({ ...newItem, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">عنوان الدرس المعطى *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سورة الفلق وتفسير معانيها"
                  value={newItem.lessonTitle}
                  onChange={(e) => setNewItem({ ...newItem, lessonTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الواجب المنزلي المطلوب</label>
                <textarea
                  rows="3"
                  placeholder="حفظ الآيات وحل تمارين الصفحة 12"
                  value={newItem.homework}
                  onChange={(e) => setNewItem({ ...newItem, homework: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تاريخ اليوم</label>
                  <input
                    type="date"
                    value={newItem.date}
                    onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">موعد التسليم</label>
                  <input
                    type="date"
                    value={newItem.deadline}
                    onChange={(e) => setNewItem({ ...newItem, deadline: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow"
                >
                  نشر في الأجندة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
