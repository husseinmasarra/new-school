import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { CalendarDays, Printer } from 'lucide-react';

export const TimetablePage = () => {
  const { classes, subjects } = useSchool();
  const [selectedClass, setSelectedClass] = useState(classes[0]?.name || 'الأول الأساسي');

  const days = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const periods = [
    'الحصة 1 (08:00 - 08:45)',
    'الحصة 2 (08:50 - 09:35)',
    'الحصة 3 (09:40 - 10:25)',
    'استراحة الفسحة (10:25 - 10:55)',
    'الحصة 4 (11:00 - 11:45)',
    'الحصة 5 (11:50 - 12:35)',
    'الحصة 6 (12:40 - 01:25)',
    'الحصة 7 (01:30 - 02:15)'
  ];

  // Default sample distribution for timetable
  const sampleSchedule = {
    'الاثنين': ['اللغة العربية', 'الرياضيات', 'العلوم العامة', 'استراحة', 'اللغة الإنكليزية', 'تربية بدنية', 'فنون'],
    'الثلاثاء': ['الرياضيات', 'اللغة العربية', 'اللغة الإنكليزية', 'استراحة', 'العلوم العامة', 'حاسوب', 'أنشطة'],
    'الأربعاء': ['العلوم العامة', 'الرياضيات', 'اللغة العربية', 'استراحة', 'تاريخ وجغرافيا', 'اللغة الإنكليزية', 'موسيقى'],
    'الخميس': ['اللغة الإنكليزية', 'اللغة العربية', 'الرياضيات', 'استراحة', 'العلوم العامة', 'تربية بدنية', 'مطالعة'],
    'الجمعة': ['اللغة العربية', 'الرياضيات', 'تربية دينية', 'استراحة', 'أنشطة لاصفية', 'إرشاد وتوجيه', 'ختام الأسبوع']
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-600" />
            جدول وتوزيع الحصص الأسبوعية (Master Timetable)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            جدول الحصص من الحصة الأولى حتى السابعة لجميع الصفوف والشعب المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs p-2.5 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none"
          >
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الجدول</span>
          </button>
        </div>
      </div>

      {/* Timetable Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4">
        <div className="text-center py-2 mb-4 border-b border-slate-100">
          <h3 className="font-extrabold text-base text-slate-900">جدول الحصص الأسبوعي - {selectedClass}</h3>
          <p className="text-xs text-slate-500">العام الدراسي 2025 - 2026</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 border border-slate-800">اليوم / الحصة</th>
                <th className="p-3 border border-slate-800">الحصة 1</th>
                <th className="p-3 border border-slate-800">الحصة 2</th>
                <th className="p-3 border border-slate-800">الحصة 3</th>
                <th className="p-3 bg-amber-500/20 text-amber-300 border border-slate-800">الفسحة</th>
                <th className="p-3 border border-slate-800">الحصة 4</th>
                <th className="p-3 border border-slate-800">الحصة 5</th>
                <th className="p-3 border border-slate-800">الحصة 6</th>
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-bold bg-slate-100 border border-slate-200 text-slate-800">{day}</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][0]}</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][1]}</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][2]}</td>
                  <td className="p-3 font-bold bg-amber-50 border border-amber-200 text-amber-800">فسحة طعام</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][4]}</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][5]}</td>
                  <td className="p-3 font-semibold border border-slate-200 text-slate-700">{sampleSchedule[day][6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
