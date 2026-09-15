import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  UserCheck,
  BookOpen,
  CreditCard,
  ArrowLeft,
  Bell,
  Calendar,
  Trophy,
  Award,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

export const Dashboard = () => {
  const {
    schoolInfo,
    students,
    teachers,
    subjects,
    payments,
    agenda,
    announcements,
    honorRoll,
    setActiveTab
  } = useSchool();

  // Calculate tuition collection rate
  const totalTuition = students.reduce((acc, s) => acc + (Number(s.tuitionTotal) || 0) - (Number(s.discountAmount) || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const collectionRate = totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. Welcome Banner (Matches screenshot exactly) */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-sky-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden text-center sm:text-right">
        <div className="relative z-10 space-y-2">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-black shadow-sm tracking-wide">
            <span>حساب خاص وسري - مدير عام النظام</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm">
            مرحباً بك، إدارة المدرسة العامة
          </h2>

          <p className="text-sky-100 text-xs sm:text-sm font-medium max-w-3xl leading-relaxed opacity-95">
            {schoolInfo.name} - الإدارة الأكاديمية والمالية الشاملة وحافلات الطلاب.
          </p>

        </div>

        {/* Decorative background circle */}
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 2. KPI 4 Metric Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 font-semibold">إجمالي الطلاب</span>
              <div className="text-2xl font-black text-slate-900 mt-1 text-left">{students.length}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold group-hover:text-sky-700">
            <span>حسابات طلاب مستقلة</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>

        {/* Card 2: Teachers */}
        <div
          onClick={() => setActiveTab('teachers')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 font-semibold">المعلمين المعتمدين</span>
              <div className="text-2xl font-black text-slate-900 mt-1 text-left">{teachers.length}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold group-hover:text-sky-700">
            <span>معلمين معتمدين</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>

        {/* Card 3: Subjects */}
        <div
          onClick={() => setActiveTab('subjects')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 font-semibold">المواد الدراسية</span>
              <div className="text-2xl font-black text-slate-900 mt-1 text-left">{subjects.length}</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold group-hover:text-rose-700">
            <span>ألوان مخصصة لكل مادة</span>
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>

        {/* Card 4: Tuition Collection */}
        <div
          onClick={() => setActiveTab('tuition')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 font-semibold">نسبة تحصيل الأقساط</span>
              <div className="text-2xl font-black text-slate-900 mt-1 text-left">
                {collectionRate}% <span className="text-xs font-bold text-slate-500">(${totalPaid.toLocaleString()} USD)</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Two-Column Activity Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Announcements */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-800">التنبيهات والرسائل الأخيرة</h3>
            </div>
            <button
              onClick={() => setActiveTab('announcements')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 transition"
            >
              عرض الكل
            </button>
          </div>

          <div className="py-4">
            {announcements.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-sky-400" />
                <p className="text-xs">لا توجد إشعارات أو تعاميم مضافة حالياً</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {announcements.slice(0, 2).map((ann) => (
                  <div key={ann.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-right">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-800">{ann.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-700">{ann.priority}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-left">
            آخر تحديث اليوم
          </div>
        </div>

        {/* Widget 2: Today's Lessons & Homework */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[180px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-800">جدول دروس اليوم والواجبات</h3>
            </div>
            <button
              onClick={() => setActiveTab('agenda')}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 transition"
            >
              عرض الكل
            </button>
          </div>

          <div className="py-4">
            {agenda.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                <p className="text-xs">لا توجد دروس أو واجبات مسجلة اليوم</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {agenda.slice(0, 2).map((item) => (
                  <div key={item.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-right">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-emerald-900">{item.subject} - {item.grade}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{item.deadline}</span>
                    </div>
                    <p className="text-xs text-slate-600">الدرس: {item.lessonTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">الواجب: {item.homework}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-left">
            محدث مباشرة من كادر المعلمين
          </div>
        </div>

      </div>

      {/* 4. Honor Roll Widget (Matches screenshot) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl p-6 border border-amber-300/60 shadow-sm">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base text-amber-950">
              لوحة شرف الأوائل والطلاب المتفوقين (Honor Roll)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 border border-amber-400/40">
            أوائل الفصل الدراسي
          </span>
        </div>

        {honorRoll.length === 0 ? (
          <div className="bg-slate-800/80 backdrop-blur rounded-xl p-8 text-center text-slate-300 border border-slate-700">
            <Trophy className="w-12 h-12 mx-auto text-amber-400 mb-3 opacity-80" />
            <p className="text-sm font-semibold text-slate-200">
              لا يوجد طلاب مضافون حالياً تتوفر لديهم درجات مرصودة لترشيحهم في لوحة الشرف
            </p>
            <p className="text-xs text-slate-400 mt-1">
              قم بإضافة طلاب ورصد درجاتهم من كادر المعلمين ليتم احتساب الأوائل تلقائياً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {honorRoll.map((student, idx) => (
              <div
                key={student.id}
                className="bg-white rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow transition flex items-center gap-3 relative overflow-hidden"
              >
                <div className="absolute top-2 left-2 text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  المرتبة #{student.rank || idx + 1}
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 flex-shrink-0">
                  <img src={student.avatar} alt={student.studentName} className="w-full h-full object-cover" />
                </div>
                <div className="text-right">
                  <h4 className="font-extrabold text-sm text-slate-900">{student.studentName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{student.grade}</p>
                  <p className="text-xs font-black text-emerald-600 mt-1">المعدل: {student.average}%</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
