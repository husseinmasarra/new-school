import React, { useState } from 'react';
import { Trophy, Plus, Users, Calendar, Award } from 'lucide-react';

export const ActivitiesPage = () => {
  const [activities, setActivities] = useState([
    {
      id: 'act-1',
      title: 'بطولة دوري كرة القدم المدرسي',
      category: 'رياضي',
      supervisor: 'أ. سامر خوري',
      date: 'كل يوم سبت 10:00 ص',
      membersCount: 24,
      status: 'نشط'
    },
    {
      id: 'act-2',
      title: 'نادي الروبوت والذكاء الاصطناعي',
      category: 'علمي وتكنولوجي',
      supervisor: 'أ. أحمد منصور',
      date: 'الثلاثاء والخميس 02:30 م',
      membersCount: 16,
      status: 'نشط'
    },
    {
      id: 'act-3',
      title: 'مسابقة الخط العربي والخطابة',
      category: 'ثقافي وفني',
      supervisor: 'أ. فاطمة الزهراء',
      date: 'الأربعاء 01:30 م',
      membersCount: 20,
      status: 'تسجيل مفتوح'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            الأنشطة اللاصفية والدورات التدريبية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            الأندية المدرسية، المسابقات، البطولات الرياضية والبرامج الإثرائية للطلاب
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {activities.map(act => (
          <div key={act.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                  {act.category}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {act.status}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900">{act.title}</h3>
              <p className="text-xs text-slate-500 mt-1">المشرف: <strong className="text-slate-700">{act.supervisor}</strong></p>

              <div className="mt-4 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{act.date}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>المشتركون: {act.membersCount} طالباً</span>
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => alert(`تم فتح نافذة تسجيل الطلاب في ${act.title}`)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                تسجيل طالب
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
