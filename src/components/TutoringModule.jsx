import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  UserPlus,
  Trash2,
  DollarSign
} from 'lucide-react';

export const TutoringModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    tutoringCourses = [], 
    registerTutoring, 
    unregisterTutoring, 
    students = [], 
    selectedStudentId 
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeCourses = tutoringCourses || [];

  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState(selectedStudentId);
  const [customFeeInput, setCustomFeeInput] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  const currentStudent = safeStudents.find((s) => s.id === selectedStudentForEnroll) || safeStudents[0];

  const handleEnroll = (courseId) => {
    if (!currentStudent) return;

    registerTutoring(courseId, currentStudent.id, customFeeInput);
    setSuccessToast(true);
    setCustomFeeInput('');
    setTimeout(() => setSuccessToast(false), 3000);
  };

  const handleRemoveStudentFromCourse = (courseId, studentId) => {
    if (unregisterTutoring) {
      unregisterTutoring(courseId, studentId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ? 'معهد التقوية والدورات التعليمية الخاصة' : t('tutoringTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr ? 'تسجيل التلاميذ وإدارتهم في دورات التقوية وتحديد القسط المالي المخصص لكل تلميذ.' : t('tutoringSubtitle')}
            </p>
          </div>
        </div>

        {/* Student Selector for Enrollment */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-xl">
          <span className="text-xs text-slate-500 font-medium">{t('studentName')}:</span>
          <select
            value={selectedStudentForEnroll}
            onChange={(e) => setSelectedStudentForEnroll(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
          >
            {safeStudents.map((s) => (
              <option key={s.id} value={s.id} className="bg-white text-[#0F172A]">
                {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
              </option>
            ))}
          </select>

          {currentRole === 'admin' && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg ml-2">
              <span className="text-[11px] font-bold text-slate-500">$</span>
              <input
                type="number"
                placeholder={isAr ? 'قسط مخصص' : 'Fee $'}
                value={customFeeInput}
                onChange={(e) => setCustomFeeInput(e.target.value)}
                className="w-20 text-xs font-bold bg-transparent focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Success Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{isAr ? 'تم تسجيل التلميذ في معهد التقوية وتثبيت القسط المالي بنجاح! 🟢' : t('registrationSuccess')}</span>
        </div>
      )}

      {/* Interactive Courses Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeCourses.map((course) => {
          const enrolledIds = course.enrolledStudentIds || [];
          const isEnrolled = enrolledIds.includes(currentStudent?.id);
          const seatsLeft = course.maxSeats - enrolledIds.length;
          const feesMap = course.studentFeesMap || {};

          // Enrolled Students list objects
          const enrolledStudentsList = safeStudents.filter(s => enrolledIds.includes(s.id));

          return (
            <div
              key={course.id}
              className="interactive-card bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#0284C7]/50 text-[#0F172A]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                    {course.subject}
                  </span>
                  <span className="text-xs font-mono font-black text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                    ${course.fee} USD
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0284C7] leading-snug">
                  {isAr ? course.title : course.titleEn || course.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                  {course.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{isAr ? course.days : course.daysEn || course.days}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{t('instructor')}: <strong className="text-[#0F172A]">{course.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0284C7] shrink-0" />
                    <span>{t('availableSeats')}: <strong className="text-[#0284C7]">{seatsLeft} / {course.maxSeats}</strong></span>
                  </div>
                </div>

                {/* Registered Students Roster Section */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-[#0F172A] block">
                    {isAr ? `التلاميذ المسجلون بالمعهد (${enrolledStudentsList.length}):` : `Enrolled Students (${enrolledStudentsList.length}):`}
                  </span>

                  {enrolledStudentsList.length === 0 ? (
                    <span className="text-[10px] text-slate-400 italic block">لا يوجد تلاميذ مسجلون في هذه الدورة حتى الآن.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                      {enrolledStudentsList.map(stu => {
                        const studentCustomFee = feesMap[stu.id] !== undefined ? feesMap[stu.id] : course.fee;
                        return (
                          <div key={stu.id} className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-1 rounded-xl text-[10px] shadow-xs">
                            <span className="font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</span>
                            <span className="text-emerald-700 font-mono font-black bg-emerald-50 px-1 rounded border border-emerald-200">${studentCustomFee}</span>
                            {currentRole === 'admin' && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudentFromCourse(course.id, stu.id)}
                                className="text-red-500 hover:text-red-700 font-bold ml-1 text-xs cursor-pointer"
                                title="إزالة التلميذ من الدورة"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100">
                {isEnrolled ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('registeredAlready')}</span>
                    </div>
                    {currentRole === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStudentFromCourse(course.id, currentStudent.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer"
                        title="إلغاء تسجيل التلميذ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={seatsLeft <= 0}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                      seatsLeft <= 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'btn-mustard'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAr ? "تسجيل التلميذ في الدورة الآن" : "Register Student Now"}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
