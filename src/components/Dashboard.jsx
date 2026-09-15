import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Bell, 
  Calendar, 
  ArrowRight, 
  Lock, 
  Palette, 
  CheckCircle2, 
  FileText,
  GraduationCap,
  BookOpen,
  Award,
  Trophy,
  Wallet,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { SubjectBadge } from './SubjectBadge';

export const Dashboard = ({ setActiveTab }) => {
  const { 
    lang, 
    t, 
    currentUser, 
    currentRole, 
    students = [], 
    teachers = [], 
    subjects = [], 
    messages = [], 
    agenda = [],
    selectedStudentId,
    getHonorRollStudents,
    masterTimetable = [],
    getStudentOverallGpa,
    attendance = []
  } = useApp();

  const isAr = lang === 'ar';

  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeSubjects = subjects || [];
  const safeMessages = messages || [];
  const safeAgenda = agenda || [];
  const safeMasterTimetable = masterTimetable || [];

  // Active student for Student / Parent Role
  const activeStudent = safeStudents.find((s) => s.id === selectedStudentId || s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || {
    id: "STU-101",
    name: currentUser?.name || "طالب متميز",
    nameEn: currentUser?.nameEn || "Student",
    grade: "الصف السادس الابتدائي",
    gradeEn: "Grade 6 Elementary",
    classRoom: "أ",
    tuitionTotal: 700,
    tuitionPaid: 500,
    parentName: "ولي الأمر",
    parentPhone: "+961 70 000 000"
  };

  const studentTuitionTotal = Number(activeStudent?.tuitionTotal || 700);
  const studentAdminFees    = Number(activeStudent?.adminFees || 0);
  const studentTransportFee = activeStudent?.hasTransport ? (Number(activeStudent?.transportFee) || 0) : 0;
  const studentDiscount     = Number(activeStudent?.tuitionDiscount || activeStudent?.discount || 0);
  const studentTuitionPaid  = Number(activeStudent?.tuitionPaid || 0);

  const studentGrandTotal   = Math.max(0, studentTuitionTotal + studentAdminFees + studentTransportFee);
  const studentNetTuition   = Math.max(0, studentGrandTotal - studentDiscount);
  const studentRemainingUSD = Math.max(0, studentNetTuition - studentTuitionPaid);

  const totalTuitionExpectedUSD = safeStudents.reduce((sum, s) => {
    const tot = Number(s?.tuitionTotal) || 0;
    const adm = Number(s?.adminFees) || 0;
    const trs = s?.hasTransport ? (Number(s?.transportFee) || 0) : 0;
    const disc = Number(s?.tuitionDiscount || s?.discount) || 0;
    return sum + Math.max(0, tot + adm + trs - disc);
  }, 0);
  const totalTuitionCollectedUSD = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionPaid) || 0), 0);
  const tuitionRate = totalTuitionExpectedUSD > 0 ? Math.round((totalTuitionCollectedUSD / totalTuitionExpectedUSD) * 100) : 0;

  // Active teacher for Teacher Role & Data Isolation
  const activeTeacher = safeTeachers.find((t) => t.id === currentUser?.id || t.username === currentUser?.username || t.name === currentUser?.name) || safeTeachers[0] || {
    id: "TCH-101",
    name: currentUser?.name || "أ. معلم المادة",
    nameEn: currentUser?.nameEn || "Prof. Subject Teacher",
    subject: "العلوم والفيزياء",
    subjects: ["العلوم والفيزياء"],
    assignedClassrooms: ["الصف السادس الابتدائي (أ)", "الصف الخامس الابتدائي (أ)"],
    monthlySalary: 1400,
    phone: "+961 70 112 233"
  };

  const teacherSubjects = activeTeacher.subjects || [activeTeacher.subject || 'العلوم والفيزياء'];

  // Teacher Data Isolation Collections
  const isolatedTeacherSubjects = safeSubjects.filter(s => 
    teacherSubjects.includes(s.name) || s.name === activeTeacher.subject
  );

  const isolatedTeacherAgenda = safeAgenda.filter(a => 
    teacherSubjects.includes(a.subject) || a.subject === activeTeacher.subject
  );

  const getSectionLetter = (str) => {
    if (!str) return '';
    const m = str.match(/[\(\s\-\_]([أبجدA-Z])[\)\s\-\_]?$/) || str.match(/([أبجدA-Z])/g);
    return m ? m[m.length - 1] : '';
  };

  const normGradeStr = (str) => (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الصف', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\-\_\s]/g, '');

  const teacherAssignedClasses = activeTeacher.assignedClassrooms || [];
  const isolatedTeacherStudents = safeStudents.filter(s => {
    if (teacherAssignedClasses.length === 0) return true;
    const sGrade = normGradeStr(s.grade);
    const sSec = getSectionLetter(s.classRoom || s.classroom);

    return teacherAssignedClasses.some((assignedItem) => {
      const aGrade = normGradeStr(assignedItem);
      const aSec = getSectionLetter(assignedItem);
      const gradeMatches = !sGrade || !aGrade || aGrade.includes(sGrade) || sGrade.includes(aGrade.replace(/[أبجدA-Z]/g, ''));
      const secMatches = !sSec || !aSec || sSec === aSec;
      return gradeMatches && secMatches;
    });
  });

  // Submissions state for teacher grading
  const [submittedTasks, setSubmittedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_homework_submissions') || '{}'); }
    catch { return {}; }
  });
  const [gradingModalItem, setGradingModalItem] = useState(null);
  const [gradeInputScore, setGradeInputScore] = useState('');
  const [gradeInputFeedback, setGradeInputFeedback] = useState('');

  // Isolate homework submissions for this teacher's subjects
  const submissionsList = Object.values(submittedTasks).filter(sub =>
    teacherSubjects.includes(sub.subject) || sub.subject === activeTeacher.subject
  );
  const pendingSubmissionsCount = submissionsList.filter(s => !s.gradeScore).length;

  const handleSaveTeacherGrade = (e) => {
    e.preventDefault();
    if (!gradingModalItem) return;
    const updatedRecord = {
      ...gradingModalItem,
      gradeScore: gradeInputScore || '10/10 - ممتاز',
      teacherFeedback: gradeInputFeedback || 'أحسنت! إجابة دقيقة وعمل رائع.',
      gradedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toISOString().split('T')[0]
    };
    const updatedTasks = { ...submittedTasks, [gradingModalItem.taskId]: updatedRecord };
    setSubmittedTasks(updatedTasks);
    localStorage.setItem('school_homework_submissions', JSON.stringify(updatedTasks));
    setGradingModalItem(null);
    setGradeInputScore('');
    setGradeInputFeedback('');
  };

  // 📊 Teacher Digital Gradebook State
  const [gradebookScores, setGradebookScores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('school_teacher_gradebook') || '{}');
    } catch {
      return {
        "STU-101": { hw: 18, quiz: 19, midterm: 18, final: 36 },
        "STU-102": { hw: 20, quiz: 20, midterm: 19, final: 38 }
      };
    }
  });

  const [gradebookSavedToast, setGradebookSavedToast] = useState(false);

  const handleScoreChange = (stuId, field, value) => {
    const maxVal = field === 'final' ? 40 : 20;
    const num = Math.max(0, Math.min(maxVal, Number(value) || 0));
    setGradebookScores((prev) => {
      const currentStu = prev[stuId] || { hw: 16, quiz: 16, midterm: 16, final: 32 };
      const updatedStu = { ...currentStu, [field]: num };
      const updatedBook = { ...prev, [stuId]: updatedStu };
      localStorage.setItem('school_teacher_gradebook', JSON.stringify(updatedBook));
      return updatedBook;
    });
  };

  const handleSaveGradebook = () => {
    localStorage.setItem('school_teacher_gradebook', JSON.stringify(gradebookScores));
    setGradebookSavedToast(true);
    setTimeout(() => setGradebookSavedToast(false), 3000);
  };

  // 📢 Direct Parent Notice Modal State
  const [parentNoticeModalStudent, setParentNoticeModalStudent] = useState(null);
  const [noticeCategory, setNoticeCategory] = useState('إشادة وتميز دراسي 🌟');
  const [noticeMessageText, setNoticeMessageText] = useState('');
  const [noticeSentToast, setNoticeSentToast] = useState('');

  const { addMessage, sendPushNotification } = useApp();

  const handleSendParentNotice = (e) => {
    e.preventDefault();
    if (!parentNoticeModalStudent || !noticeMessageText) return;

    const stuName = parentNoticeModalStudent.name;

    addMessage && addMessage({
      senderRole: 'teacher',
      senderName: activeTeacher.name,
      recipientName: parentNoticeModalStudent.parentName || `ولي أمر الطالب (${stuName})`,
      studentName: stuName,
      studentId: parentNoticeModalStudent.id,
      category: noticeCategory,
      text: noticeMessageText,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    sendPushNotification && sendPushNotification({
      title: `🔔 إشعار معلم المادة: ${activeTeacher.name}`,
      body: `ملاحظة خاصة بحق الطالب (${stuName}): ${noticeMessageText}`,
      recipient: parentNoticeModalStudent.id
    });

    setParentNoticeModalStudent(null);
    setNoticeMessageText('');
    setNoticeSentToast(`📢 تم إرسال التنبيه والملاحظة لولي أمر الطالب (${stuName}) بنجاح!`);
    setTimeout(() => setNoticeSentToast(''), 4000);
  };

  // Render Teacher Customized View
  if (currentRole === 'teacher') {
    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Teacher Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-800 to-[#032541] border border-purple-500/30 p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444] text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {isAr ? `🔒 بوابة المعلم الخاصة - المادة: ${activeTeacher.subject || 'المادة الموكلة'}` : `🔒 Private Teacher Portal - ${activeTeacher.subject}`}
              </span>
              <h2 className="text-2xl font-black text-white">
                {isAr ? `مرحباً بك، ${activeTeacher.name}` : `Welcome, ${activeTeacher.nameEn || activeTeacher.name}`}
              </h2>
              <p className="text-purple-100 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                {isAr 
                  ? `بوابة مستقلة خاصة بك لمتابعة المواد الموكلة إليك (${teacherSubjects.join('، ')})، نشر الأجندة، وتصحيح واجبات طلابك.`
                  : "Private isolated portal for your assigned subjects, daily agenda, and student homework grading."}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right sm:text-left shrink-0 space-y-1">
              <span className="text-[11px] text-purple-200 block font-bold">{isAr ? 'الصف والشعبة الموكلة' : 'Assigned Section'}</span>
              <span className="text-sm font-black text-white font-mono">{activeTeacher.assignedClassrooms?.[0] || 'الصف السادس الابتدائي (أ)'}</span>
              <span className="text-[10px] text-emerald-300 block font-bold">{isAr ? `المواد: ${teacherSubjects.join('، ')} 🟢` : `Subjects: ${teacherSubjects.join(', ')} 🟢`}</span>
            </div>
          </div>
        </div>

        {/* 4 Teacher Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: My Students */}
          <div
            onClick={() => setActiveTab('directory')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-purple-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'طلاّبي بالشُعب الموكلة' : 'My Students'}</span>
              <div className="p-2 bg-purple-100 text-purple-700 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-700 mt-3 font-mono">
              {isolatedTeacherStudents.length} {isAr ? 'طالباً' : 'Students'}
            </p>
            <div className="text-xs mt-2 flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                {isAr ? 'طلاب صفوفك فقط' : 'Your Classes Only'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600 rtl:rotate-180" />
            </div>
          </div>

          {/* Card 2: Posted Agenda Lessons */}
          <div
            onClick={() => setActiveTab('agenda')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'دروسي وواجباتي المنشورة' : 'My Posted Lessons'}</span>
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0284C7] mt-3 font-mono">{isolatedTeacherAgenda.length}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between font-bold">
              <span>{isAr ? 'إضافة درس بمادتك 🪄' : 'Post New Lesson'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7] rtl:rotate-180" />
            </p>
          </div>

          {/* Card 3: Homework Submissions to Grade */}
          <div
            onClick={() => setActiveTab('agenda')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-amber-500 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'تسليمات الواجبات الإلكترونية' : 'Homework Submissions'}</span>
              <div className="p-2 bg-amber-100 text-amber-700 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700 mt-3 font-mono">{submissionsList.length}</p>
            <div className="text-xs mt-2 flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${pendingSubmissionsCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {pendingSubmissionsCount > 0 ? (isAr ? `${pendingSubmissionsCount} بانتظار التصحيح ⏳` : 'Pending Grade') : (isAr ? 'تم تصحيح الكل 🟢' : 'All Graded')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 rtl:rotate-180" />
            </div>
          </div>

          {/* Card 4: Master Timetable & Class Schedule Matrix */}
          <div
            onClick={() => setActiveTab('schedule')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-emerald-600 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'الصفوف والحصص الأسبوعية' : 'Classrooms & Timetable'}</span>
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-3 font-mono">{activeTeacher.assignedClassrooms?.length || 2} {isAr ? 'شُعب موكلة' : 'Sections'}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between font-bold">
              <span>{isAr ? 'جدول توزيع الحصص الشامل ⏱️' : 'Master Weekly Timetable'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 rtl:rotate-180" />
            </p>
          </div>

        </div>

        {/* 📥 Teacher Homework Submissions Review & Grading Panel */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span>{isAr ? 'تصحيح ومراجعة إجابات الواجبات الإلكترونية المرفوعة من الطلاب 📥' : 'Review & Grade Student Homework Submissions'}</span>
            </h3>
            <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              {submissionsList.length} {isAr ? 'إجابات مسلّمة' : 'Submissions'}
            </span>
          </div>

          {submissionsList.length === 0 ? (
            <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-slate-200 text-slate-500 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold">{isAr ? 'لا توجد إجابات واجبات إلكترونية مسلّمة حالياً.' : 'No student homework submissions yet.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submissionsList.map((sub, idx) => (
                <div key={idx} className="bg-[#F8FAFC] dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-2xl space-y-3 shadow-sm hover:border-purple-400 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-2">
                      <SubjectBadge subjectName={sub.subject} />
                      <span className="text-xs font-black text-[#0F172A] dark:text-white">{sub.taskTitle}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{sub.submittedAt}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-500 font-bold block">{isAr ? 'إجابة الطالب المكتوبة:' : 'Student Answer:'}</span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-zinc-800 p-3 rounded-xl border border-slate-200 dark:border-zinc-700 leading-relaxed font-medium">
                      {sub.text || (isAr ? 'لا يوجد نص مكتوب (تم رفع صورة مرفقة)' : 'No written text')}
                    </p>
                  </div>

                  {sub.image && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-sky-600 font-bold flex items-center gap-1">
                        📸 {isAr ? 'صورة الإجابة المرفقة بكاميرا الطالب:' : 'Attached Answer Photo:'}
                      </span>
                      <img src={sub.image} alt="Student Solution" className="w-full h-40 object-cover rounded-xl border border-sky-300 shadow-sm" />
                    </div>
                  )}

                  {sub.gradeScore ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">⭐ {isAr ? `علامة المعلم: ${sub.gradeScore}` : `Mark: ${sub.gradeScore}`}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">تم التصحيح 🟢</span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">💬 {sub.teacherFeedback}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setGradingModalItem(sub);
                        setGradeInputScore('10/10');
                        setGradeInputFeedback('ممتاز! إجابة دقيقة وصحيحة.');
                      }}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4" /> {isAr ? 'رصد العلامة وكتابة تقييم المعلم ✍️' : 'Grade Homework'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ⏱️ Teacher Weekly Schedule */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0284C7]" />
              <span>{isAr ? `جدول الحصص التدريسية للمعلم (${activeTeacher.name})` : 'Teacher Weekly Schedule'}</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">22 {isAr ? 'حصة أسبوعياً' : 'Hours/Week'}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-zinc-800 text-[11px] font-black text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-zinc-700">
                  <th className="p-3">{isAr ? 'اليوم / الحصة' : 'Day / Period'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 1 (08:00)' : 'Period 1'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 2 (09:00)' : 'Period 2'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 3 (10:30)' : 'Period 3'}</th>
                  <th className="p-3 text-center">{isAr ? 'الحصة 4 (11:30)' : 'Period 4'}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold divide-y divide-slate-100 dark:divide-zinc-800">
                <tr>
                  <td className="p-3 font-extrabold text-[#0284C7]">{isAr ? 'الإثنين' : 'Monday'}</td>
                  <td className="p-2 text-center"><span className="bg-[#0284C7]/10 text-[#0284C7] px-2 py-1 rounded-lg block">{activeTeacher.subject || 'العلوم'} - سادس أ</span></td>
                  <td className="p-2 text-center"><span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg block font-normal">{isAr ? 'استراحة / تحضير' : 'Prep'}</span></td>
                  <td className="p-2 text-center"><span className="bg-[#0284C7]/10 text-[#0284C7] px-2 py-1 rounded-lg block">{activeTeacher.subject || 'العلوم'} - خامس أ</span></td>
                  <td className="p-2 text-center"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg block">{isAr ? 'نشاط المبتكرين' : 'Coding Club'}</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-extrabold text-[#0284C7]">{isAr ? 'الثلاثاء' : 'Tuesday'}</td>
                  <td className="p-2 text-center"><span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-lg block font-normal">{isAr ? 'تحضير دراسي' : 'Prep'}</span></td>
                  <td className="p-2 text-center"><span className="bg-[#0284C7]/10 text-[#0284C7] px-2 py-1 rounded-lg block">{activeTeacher.subject || 'العلوم'} - سادس أ</span></td>
                  <td className="p-2 text-center"><span className="bg-[#0284C7]/10 text-[#0284C7] px-2 py-1 rounded-lg block">{activeTeacher.subject || 'العلوم'} - سادس ب</span></td>
                  <td className="p-2 text-center"><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg block">{isAr ? 'مختبر عملي 🔬' : 'Lab Work'}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {noticeSentToast && (
          <div className="bg-purple-50 border border-purple-300 text-purple-900 p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 animate-fade-in shadow-lg">
            <Bell className="w-5 h-5 text-purple-600 animate-bounce" />
            <span>{noticeSentToast}</span>
          </div>
        )}

        {/* 📊 Digital Gradebook & Marks Sheet for Teacher */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? `دفتر رصد درجات المادة والاختبارات الفصلية (${activeTeacher.subject || 'المادة الموكلة'})` : 'Digital Class Gradebook'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ? 'رصد درجات أعمال السنة، الاختبارات القصيرة، امتحان منتصف الفصل، والامتحان النهائي لطلابك.' : 'Record classwork, quizzes, midterm, and final exam marks for your students.'}
              </p>
            </div>
            <button
              onClick={handleSaveGradebook}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'حفظ ورصد درجات الصف 💾' : 'Save Gradebook'}</span>
            </button>
          </div>

          {gradebookSavedToast && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? '✅ تم حفظ واعتماد درجات الطلاب وتأكيدها بنجاح!' : 'Gradebook saved successfully!'}</span>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-black text-slate-600 border-b border-slate-200">
                  <th className="p-3">{isAr ? 'اسم الطالب / الشعبة' : 'Student Name'}</th>
                  <th className="p-3 text-center">{isAr ? 'أعمال السنة (20)' : 'Classwork (20)'}</th>
                  <th className="p-3 text-center">{isAr ? 'الاختبارات (20)' : 'Quizzes (20)'}</th>
                  <th className="p-3 text-center">{isAr ? 'منتصف الفصل (20)' : 'Midterm (20)'}</th>
                  <th className="p-3 text-center">{isAr ? 'النهائي (40)' : 'Final (40)'}</th>
                  <th className="p-3 text-center">{isAr ? 'المجموع (100)' : 'Total (100)'}</th>
                  <th className="p-3 text-center">{isAr ? 'التقدير والإشعارات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="text-xs font-bold divide-y divide-slate-100">
                {isolatedTeacherStudents.map((stu) => {
                  const scores = gradebookScores[stu.id] || { hw: 18, quiz: 18, midterm: 18, final: 36 };
                  const total = (Number(scores.hw) || 0) + (Number(scores.quiz) || 0) + (Number(scores.midterm) || 0) + (Number(scores.final) || 0);

                  const evalBadge = total >= 90
                    ? { label: 'ممتاز 🌟', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
                    : total >= 75
                    ? { label: 'جيد جداً 👍', color: 'bg-sky-100 text-sky-800 border-sky-300' }
                    : total >= 50
                    ? { label: 'مقبول 🟡', color: 'bg-amber-100 text-amber-800 border-amber-300' }
                    : { label: 'ضعيف 🔴', color: 'bg-red-100 text-red-800 border-red-300' };

                  return (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img src={stu.avatar} alt={stu.name} className="w-8 h-8 rounded-full object-cover border border-[#0284C7]" />
                          <div>
                            <span className="font-extrabold text-[#0F172A] block">{stu.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{stu.grade} ({stu.classRoom || 'أ'})</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={scores.hw}
                          onChange={(e) => handleScoreChange(stu.id, 'hw', e.target.value)}
                          className="w-16 bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={scores.quiz}
                          onChange={(e) => handleScoreChange(stu.id, 'quiz', e.target.value)}
                          className="w-16 bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          max={20}
                          min={0}
                          value={scores.midterm}
                          onChange={(e) => handleScoreChange(stu.id, 'midterm', e.target.value)}
                          className="w-16 bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          max={40}
                          min={0}
                          value={scores.final}
                          onChange={(e) => handleScoreChange(stu.id, 'final', e.target.value)}
                          className="w-16 bg-[#F8FAFC] border border-slate-200 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                        />
                      </td>

                      <td className="p-2 text-center font-mono font-black text-sm text-purple-700">
                        {total} / 100
                      </td>

                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${evalBadge.color}`}>
                            {evalBadge.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => setParentNoticeModalStudent(stu)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 border border-purple-200"
                            title="إرسال إشعار وملاحظة لولي الأمر"
                          >
                            <Bell className="w-3 h-3" />
                            <span>إشعار ولي الأمر 📢</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Teacher Grading Modal */}
        {gradingModalItem && createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-[#0F172A] border-2 border-purple-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-white relative my-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>رصد العلامة وتقييم المعلم ✍️</span>
                </h3>
                <button onClick={() => setGradingModalItem(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-200 font-bold flex items-center justify-center">✕</button>
              </div>

              <div className="bg-[#F8FAFC] dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-1">
                <span className="text-[10px] text-purple-600 font-bold block">{gradingModalItem.subject}</span>
                <h4 className="text-xs font-black text-[#0F172A] dark:text-white">{gradingModalItem.taskTitle}</h4>
              </div>

              <form onSubmit={handleSaveTeacherGrade} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">الدرجة / العلامة المستحقة (مثال: 10/10)</label>
                  <input
                    type="text"
                    required
                    value={gradeInputScore}
                    onChange={(e) => setGradeInputScore(e.target.value)}
                    placeholder="مثال: 10/10 أو 95%"
                    className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">ملاحظات وتشجيع المعلم للطالب</label>
                  <textarea
                    rows={3}
                    value={gradeInputFeedback}
                    onChange={(e) => setGradeInputFeedback(e.target.value)}
                    placeholder="اكتب ملاحظة تشجيعية للطالب..."
                    className="w-full bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setGradingModalItem(null)} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold">إلغاء</button>
                  <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer">
                    <CheckCircle2 className="w-4 h-4" /> حفظ وإرسال التقييم 🌟
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

        {/* Modal: Send Direct Notice to Parent */}
        {parentNoticeModalStudent && createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <form
              onSubmit={handleSendParentNotice}
              className="bg-white border-2 border-purple-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-purple-700 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  <span>إرسال ملاحظة لولي أمر الطالب 📢</span>
                </h3>
                <button type="button" onClick={() => setParentNoticeModalStudent(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center cursor-pointer">✕</button>
              </div>

              <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-xs space-y-1">
                <span className="font-extrabold text-purple-900 block text-sm">الطالب: {parentNoticeModalStudent.name}</span>
                <span className="text-purple-700 block font-semibold">ولي الأمر: {parentNoticeModalStudent.parentName || 'ولي الأمر'} ({parentNoticeModalStudent.parentPhone || '+961 70 123 456'})</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نوع الملاحظة والإشعار</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="إشادة وتميز دراسي 🌟">🌟 إشادة وتميز دراسي</option>
                  <option value="تنبيه متابعة واجبات 📚">📚 تنبيه متابعة واجبات</option>
                  <option value="ملاحظة حول مستوى الطالب 📊">📊 ملاحظة حول المستوى الدراسي</option>
                  <option value="تنبيه غياب أو تأخير ⏱️">⏱️ تنبيه غياب أو تأخير</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نص الملاحظة الموجهة لولي الأمر <span className="text-red-500">*</span></label>
                <textarea
                  rows={3}
                  required
                  value={noticeMessageText}
                  onChange={(e) => setNoticeMessageText(e.target.value)}
                  placeholder="اكتب ملاحظتك المباشرة لولي الأمر لتصل له فوراً..."
                  className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-xs leading-relaxed focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setParentNoticeModalStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer">
                  <CheckCircle2 className="w-4 h-4" /> إرسال الإشعار لولي الأمر 📤
                </button>
              </div>
            </form>
          </div>,
          document.body
        )}
      </div>
    );
  }

  // Render Student / Parent Customized View
  if (currentRole === 'student' || currentRole === 'parent') {
    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Student Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#02182B] border border-[#0EA5E9]/20 p-6 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444] text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                {isAr ? `🔒 بوابة الطالب الخاصة - ${activeStudent.grade || 'الصف الدراسي'}` : `🔒 Private Student Portal - ${activeStudent.gradeEn || 'Grade'}`}
              </span>
              <h2 className="text-2xl font-black text-white">
                {isAr ? `أهلاً بك، ${activeStudent.name}` : `Welcome back, ${activeStudent.nameEn || activeStudent.name}`}
              </h2>
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
                {isAr 
                  ? "متابعة المواد والدروس، القسط المدرسي المتبقي، جدول الاختبارات والتعاميم الإدارية الخاصة بك."
                  : "View your enrolled subjects, remaining tuition balance, exam schedule, and official announcements."}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-right sm:text-left shrink-0 space-y-1">
              <span className="text-[11px] text-sky-200 block font-bold">{isAr ? 'معرف الطالب' : 'Student ID'}</span>
              <span className="text-base font-black text-white font-mono">{activeStudent.id}</span>
              <span className="text-[10px] text-emerald-300 block font-bold">{isAr ? `الشعبة: ${activeStudent.classRoom}` : `Section: ${activeStudent.classRoom}`}</span>
            </div>
          </div>
        </div>

        {/* 4 Student Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Remaining Tuition Balance */}
          <div
            className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm text-[#0F172A]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'القسط المتبقي ($ USD)' : 'Remaining Balance'}</span>
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-red-600 mt-2 font-mono">
              ${studentRemainingUSD.toLocaleString()} USD
            </p>
            {/* Display total, discount, and paid tuition details */}
            <div className="text-[10px] text-slate-500 font-bold space-y-1 border-t border-slate-100 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span>{isAr ? 'إجمالي القسط الأكاديمي:' : 'Total Tuition:'}</span>
                <span className="font-mono font-black text-slate-700">${studentGrandTotal.toLocaleString()}</span>
              </div>

              {studentDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  <span className="font-extrabold flex items-center gap-1">🏷️ {isAr ? 'خصم وتخفيض القسط:' : 'Tuition Discount:'}</span>
                  <span className="font-mono font-black">-${studentDiscount.toLocaleString()} USD</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>{isAr ? 'المدفوع الواصل:' : 'Paid Amount:'}</span>
                <span className="font-mono font-black text-emerald-600">${studentTuitionPaid.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-xs mt-3 flex items-center justify-between">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${studentRemainingUSD === 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                {studentRemainingUSD === 0 ? (isAr ? 'مسدد بالكامل 🟢' : 'Paid in Full 🟢') : (isAr ? 'يوجد قسط متبقي ⚠️' : 'Balance Pending ⚠️')}
              </span>
              {studentDiscount > 0 && (
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  تخفيض مكتسب 🎉
                </span>
              )}
            </div>
          </div>

          {/* Card 2: Enrolled Subjects */}
          <div
            onClick={() => setActiveTab('subjects')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'المواد والدروس المطلوبة' : 'Enrolled Subjects'}</span>
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0F172A] mt-3 font-mono">{safeSubjects.length}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span className="font-semibold">{isAr ? 'دروس ومرفقات جاهزة' : 'Lessons Ready'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7] rtl:rotate-180" />
            </p>
          </div>

          {/* Card 3: Daily Agenda & Lessons */}
          <div
            onClick={() => setActiveTab('agenda')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-purple-500 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'الأجندة والدروس اليومية' : 'Daily Agenda & Lessons'}</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-600 mt-3 font-mono">{safeAgenda.length}</p>
            <p className="text-xs text-slate-600 font-bold mt-2 flex items-center justify-between">
              <span>📅 {isAr ? 'دروس وأرشيف كامل' : 'Full Lesson Archive'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600 rtl:rotate-180" />
            </p>
          </div>

          {/* Card 4: Announcements & Messages */}
          <div
            onClick={() => setActiveTab('messages')}
            className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isAr ? 'رسائل الإدارة والتعاميم' : 'Announcements'}</span>
              <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#0284C7] mt-3 font-mono">{safeMessages.length}</p>
            <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span className="font-semibold">{isAr ? 'تنبيهات مخصصة لك' : 'Direct Alerts'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0284C7] rtl:rotate-180" />
            </p>
          </div>

        </div>

        {/* 🏆 Ultra-Modern Student Honor Board & Motivation Wall */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-[#0284C7]/10 border border-amber-400/30 rounded-3xl p-6 space-y-5 shadow-sm text-[#0F172A]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-300/40 pb-3">
            <h3 className="text-sm font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
              <span>{isAr ? 'لوحة الشرف وتكريم المتفوقين الأوائل لكل صف وشعبة 🏆' : 'Classroom Honor Roll'}</span>
            </h3>
            <span className="text-[11px] font-extrabold px-3 py-1 bg-amber-500 text-white rounded-full shadow">
              أوائل الصفوف والشُعب 🌟
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(() => {
              const groups = {};
              safeStudents.forEach(s => {
                const key = `${s.grade || 'الصف السادس'} (${s.classRoom || 'أ'})`;
                if (!groups[key]) groups[key] = [];
                groups[key].push(s);
              });

              return Object.entries(groups).map(([groupName, groupStudents]) => {
                const sorted = [...groupStudents].sort((a, b) => {
                  const gpaA = Number(getStudentOverallGpa ? getStudentOverallGpa(a.id) : 90);
                  const gpaB = Number(getStudentOverallGpa ? getStudentOverallGpa(b.id) : 90);
                  return gpaB - gpaA;
                });
                const topStudent = sorted[0];
                const topGpa = topStudent ? (getStudentOverallGpa ? getStudentOverallGpa(topStudent.id) : 95) : 95;

                return (
                  <div key={groupName} className="bg-white/95 dark:bg-zinc-900 border border-amber-300/50 p-4 rounded-2xl space-y-3 shadow-md relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-2">
                      <span className="text-xs font-black text-amber-900 dark:text-amber-400">{groupName}</span>
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">المركز الأول 🥇</span>
                    </div>

                    {topStudent && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400 text-amber-600 flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                          🏆
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#0F172A] dark:text-white">{topStudent.name}</h4>
                          <span className="text-[10px] font-mono font-bold text-emerald-600 block">المعدل الممتاز: {topGpa}% 🌟</span>
                        </div>
                      </div>
                    )}

                    {(currentRole === 'admin' || currentRole === 'teacher') && topStudent && (
                      <button
                        onClick={() => {
                          addNotification({
                            recipientId: topStudent.id,
                            title: '🏆 تهنئة وتكريم في لوحة الشرف!',
                            message: `نهنئك بحصولك على المركز الأول في لوحة الشرف لـ ${groupName}! نتمنى لك دوام التوفيق والنجاح.`,
                            type: 'honor'
                          });
                          alert(isAr ? `تم إرسال تهنئة مخصصة لحساب التلميذ (${topStudent.name}) بنجاح! 💌` : 'Encouragement message sent!');
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white py-1.5 px-3 rounded-xl text-[11px] font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>إرسال تهنئة لحساب التلميذ 💌</span>
                      </button>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* 📊 Student Personal Attendance & Compliance Analytics */}
        {(() => {
          const studentAttendanceRecords = (attendance || []).filter(a => a.studentId === activeStudent?.id);
          const studentPresentDays = studentAttendanceRecords.filter(r => r.status === 'حاضر').length;
          const studentExcusedDays = studentAttendanceRecords.filter(r => r.status === 'بعذر').length;
          const studentUnexcusedDays = studentAttendanceRecords.filter(r => r.status === 'غائب').length;
          const studentTotalRecorded = studentPresentDays + studentExcusedDays + studentUnexcusedDays;
          const studentComplianceRate = studentTotalRecorded > 0 
            ? Math.round(((studentPresentDays + studentExcusedDays) / studentTotalRecorded) * 100) 
            : 100;

          return (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#0284C7]" />
                  <span>{isAr ? 'كشف الحضور والغياب والانضباط الفردي للتلميذ' : 'Personal Attendance Log'}</span>
                </h3>
                <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 font-mono">
                  {studentComplianceRate}% {isAr ? 'نسبة الانضباط' : 'Compliance'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
                  <span className="text-slate-500 block text-[11px]">{isAr ? 'أيام الحضور الفعلية:' : 'Days Present:'}</span>
                  <span className="text-lg font-black text-emerald-600">{studentPresentDays} {isAr ? 'يوم 🟢' : 'Days 🟢'}</span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
                  <span className="text-slate-500 block text-[11px]">{isAr ? 'غياب بعذر مقبول:' : 'Excused Absences:'}</span>
                  <span className="text-lg font-black text-[#0284C7]">{studentExcusedDays} {isAr ? 'يوم 🔵' : 'Days 🔵'}</span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
                  <span className="text-slate-500 block text-[11px]">{isAr ? 'غياب بدون عذر:' : 'Unexcused Absences:'}</span>
                  <span className="text-lg font-black text-red-600">{studentUnexcusedDays} {isAr ? 'يوم 🔴' : 'Days 🔴'}</span>
                </div>

                <div className="bg-[#F8FAFC] p-3.5 rounded-2xl border border-[#E2E8F0] space-y-1">
                  <span className="text-slate-500 block text-[11px]">{isAr ? 'حالة السلوك والأخلاق:' : 'Behavior Grade:'}</span>
                  <span className="text-lg font-black text-amber-600">{isAr ? 'ممتاز مرتفع ⭐' : 'Excellent ⭐'}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ⏱️ Student Weekly Timetable Schedule */}
        {(() => {
          const studentDbSlots = safeMasterTimetable.filter(
            (s) => s.grade === activeStudent.grade && s.section === (activeStudent.classRoom || 'أ')
          );

          const getSubjectForPeriod = (dayName, periodNum) => {
            const slot = studentDbSlots.find(s => s.day === dayName && Number(s.period) === periodNum);
            return slot ? slot.subject : null;
          };

          const timetableRows = [
            { day: 'الإثنين', p1: getSubjectForPeriod('الإثنين', 1), p2: getSubjectForPeriod('الإثنين', 2), p3: getSubjectForPeriod('الإثنين', 3), p4: getSubjectForPeriod('الإثنين', 4), p5: getSubjectForPeriod('الإثنين', 5) },
            { day: 'الثلاثاء', p1: getSubjectForPeriod('الثلاثاء', 1), p2: getSubjectForPeriod('الثلاثاء', 2), p3: getSubjectForPeriod('الثلاثاء', 3), p4: getSubjectForPeriod('الثلاثاء', 4), p5: getSubjectForPeriod('الثلاثاء', 5) },
            { day: 'الأربعاء', p1: getSubjectForPeriod('الأربعاء', 1), p2: getSubjectForPeriod('الأربعاء', 2), p3: getSubjectForPeriod('الأربعاء', 3), p4: getSubjectForPeriod('الأربعاء', 4), p5: getSubjectForPeriod('الأربعاء', 5) },
            { day: 'الخميس', p1: getSubjectForPeriod('الخميس', 1), p2: getSubjectForPeriod('الخميس', 2), p3: getSubjectForPeriod('الخميس', 3), p4: getSubjectForPeriod('الخميس', 4), p5: getSubjectForPeriod('الخميس', 5) },
          ];

          return (
            <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
                <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#0284C7]" />
                  <span>{isAr ? `جدول الحصص الأسبوعي للطالب (${activeStudent.grade} - الشعبة ${activeStudent.classRoom || 'أ'}) ⏱️` : `Weekly Student Timetable (${activeStudent.grade} - Section ${activeStudent.classRoom || 'A'}) ⏱️`}</span>
                </h3>
                {studentDbSlots.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {isAr ? `مستمد من الخطة الدراسية (${studentDbSlots.length} حصة مضافة) 🟢` : `Loaded from Master Timetable 🟢`}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
                    {isAr ? 'جدول فارغ (في انتظار توزيع الحصص من قبل المدير) 📌' : 'Empty Timetable (Awaiting Admin) 📌'}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[#0284C7] border-b border-[#E2E8F0] font-bold">
                      <th className="p-3 text-right">{isAr ? 'اليوم / الحصة' : 'Day / Period'}</th>
                      <th className="p-3">{isAr ? 'الحصة 1 (07:30 - 08:20)' : 'Period 1'}</th>
                      <th className="p-3">{isAr ? 'الحصة 2 (08:20 - 09:10)' : 'Period 2'}</th>
                      <th className="p-3">{isAr ? 'الحصة 3 (09:30 - 10:20)' : 'Period 3'}</th>
                      <th className="p-3">{isAr ? 'الحصة 4 (10:20 - 11:10)' : 'Period 4'}</th>
                      <th className="p-3">{isAr ? 'الحصة 5 (11:10 - 12:00)' : 'Period 5'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {timetableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/50 transition-colors">
                        <td className="p-3 font-bold text-[#0284C7] text-right bg-[#F8FAFC]">{row.day}</td>
                        <td className="p-3">{row.p1 ? <SubjectBadge subjectName={row.p1} /> : <span className="text-[11px] text-slate-300 font-bold block py-1">-</span>}</td>
                        <td className="p-3">{row.p2 ? <SubjectBadge subjectName={row.p2} /> : <span className="text-[11px] text-slate-300 font-bold block py-1">-</span>}</td>
                        <td className="p-3">{row.p3 ? <SubjectBadge subjectName={row.p3} /> : <span className="text-[11px] text-slate-300 font-bold block py-1">-</span>}</td>
                        <td className="p-3">{row.p4 ? <SubjectBadge subjectName={row.p4} /> : <span className="text-[11px] text-slate-300 font-bold block py-1">-</span>}</td>
                        <td className="p-3">{row.p5 ? <SubjectBadge subjectName={row.p5} /> : <span className="text-[11px] text-slate-300 font-bold block py-1">-</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {/* Subjects List & Announcements Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* My Subjects List */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0284C7]" />
                {isAr ? 'المواد الدراسية المقررة لك' : 'Enrolled Subjects'}
              </h3>
              <button onClick={() => setActiveTab('subjects')} className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer">
                {isAr ? 'عرض الفهرس الكامل' : 'Full Index'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {safeSubjects.map((sub) => (
                <div 
                  key={sub.id} 
                  onClick={() => setActiveTab('subjects')}
                  className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between hover:border-[#0284C7] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{sub.icon || '📚'}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0F172A] group-hover:text-[#0284C7] transition-colors">{isAr ? sub.name : sub.nameEn}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{isAr ? 'تحميل الدروس والمرفقات' : 'Download Lessons'}</span>
                    </div>
                  </div>
                  <SubjectBadge subjectName={sub.name} />
                </div>
              ))}
            </div>
          </div>

          {/* School Announcements */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0284C7]" />
                {isAr ? 'رسائل الإدارة والتعاميم الرسمية' : 'Official Announcements'}
              </h3>
              <button onClick={() => setActiveTab('messages')} className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer">
                {isAr ? 'عرض الرسائل' : 'View All'}
              </button>
            </div>

            <div className="space-y-3">
              {safeMessages.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                  <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                  <p>{isAr ? 'لا يوجد تعاميم مخصصة حالياً.' : 'No announcements.'}</p>
                </div>
              ) : (
                safeMessages.slice(0, 3).map((msg) => (
                  <div key={msg.id} className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1 hover:border-[#0284C7]/50 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7]">
                        {msg.category || 'إعلان عام'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-[#0F172A]">{msg.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Admin & Default Role View
  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Welcome Banner in Sky Blue #0284C7 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#02182B] border border-[#0EA5E9]/20 p-6 text-white shadow-xl">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444] text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {isAr ? `🔒 حساب خاص ومحمي - ${currentUser?.roleTitle || t('roleAdmin')}` : `🔒 Protected Private Account - ${currentUser?.roleTitle || t('roleAdmin')}`}
          </span>
          <h2 className="text-2xl font-black text-white">
            {isAr ? `مرحباً بك، ${currentUser?.name || ''}` : `Welcome back, ${currentUser?.nameEn || currentUser?.name || ''}`}
          </h2>
          <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            {isAr 
              ? "منظومة مدرسة الدعم التعليمي - الإدارة الأكاديمية والمالية الشاملة وحافظات الطلاب."
              : "Educational Support School Portal - Complete Management Ecosystem for Academics and Finance."}
          </p>
        </div>
      </div>

      {/* Interactive Metric Cards Grid in White Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Students */}
        <div
          onClick={() => setActiveTab('directory')}
          className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('totalStudents')}</span>
            <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0284C7] mt-3 font-mono">{safeStudents.length}</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
              {isAr ? 'حسابات طلاب مستقلة' : 'Enrolled Students'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0284C7] rtl:rotate-180" />
          </p>
        </div>

        {/* Card 2: Teaching Staff */}
        <div
          onClick={() => setActiveTab('directory')}
          className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('totalTeachers')}</span>
            <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0284C7] mt-3 font-mono">{safeTeachers.length}</p>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
              {isAr ? 'معلمين معتمدين' : 'Certified Teachers'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0284C7] rtl:rotate-180" />
          </p>
        </div>

        {/* Card 3: Subjects & Custom Colors */}
        <div
          onClick={() => setActiveTab('subjects')}
          className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#EF4444] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('totalSubjects')}</span>
            <div className="p-2 bg-[#EF4444]/10 text-[#EF4444] rounded-2xl group-hover:bg-[#EF4444] group-hover:text-white transition-all">
              <Palette className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0F172A] mt-3 font-mono">{safeSubjects.length}</p>
          <p className="text-xs text-slate-600 font-bold mt-2 flex items-center justify-between">
            <span>🎨 {isAr ? 'ألوان مخصصة لكل مادة' : 'Custom Badge Colors'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#EF4444] rtl:rotate-180" />
          </p>
        </div>

        {/* Card 4: Tuition Collection */}
        <div
          onClick={() => setActiveTab('tuition')}
          className="interactive-card bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm cursor-pointer hover:border-[#0284C7] group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('tuitionPaidRate')}</span>
            <div className="p-2 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl group-hover:bg-[#0284C7] group-hover:text-white transition-all">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-2xl font-black text-[#0284C7] font-mono">{tuitionRate}%</span>
            <span className="text-xs text-slate-500 font-mono">
              (${totalTuitionCollectedUSD.toLocaleString()} USD)
            </span>
          </div>
          <div className="w-full bg-[#E2E8F0] h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#0284C7] h-full rounded-full transition-all duration-500"
              style={{ width: `${tuitionRate}%` }}
            />
          </div>
        </div>

      </div>

      {/* Recent Announcements & Today Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Messages Feed */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0284C7]" />
              {t('recentMessages')}
            </h3>
            <button onClick={() => setActiveTab('messages')} className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer">
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="space-y-3">
            {safeMessages.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                <p>{isAr ? 'لا يوجد إشعارات أو تعاميم مضاف حالياً.' : 'No announcements.'}</p>
              </div>
            ) : (
              safeMessages.slice(0, 4).map((msg) => (
                <div key={msg.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1 hover:border-[#0284C7]/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0284C7]/10 text-[#0284C7]">
                      {msg.category || 'إعلان عام'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{msg.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{msg.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0284C7]" />
              {t('todaySchedule')}
            </h3>
            <button onClick={() => setActiveTab('agenda')} className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer">
              {isAr ? 'عرض الكل' : 'View All'}
            </button>
          </div>

          <div className="space-y-3">
            {safeAgenda.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                <FileText className="w-6 h-6 text-slate-300 mx-auto" />
                <p>{isAr ? 'لا توجد دروس أو واجبات مسجلة اليوم.' : 'No homework registered today.'}</p>
              </div>
            ) : (
              safeAgenda.slice(0, 4).map((item) => (
                <div key={item.id} className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-between hover:border-[#0284C7]/50 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SubjectBadge subjectName={item.subject} />
                      <span className="text-xs font-bold text-[#0F172A]">{item.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                    {item.dueDate}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 🏆 Honor Roll Leaderboard Card */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-2 border-amber-400/30 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
            <h3 className="text-base font-black text-amber-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 fill-amber-500" />
              <span>لوحة شرف الأوائل والطلاب المتفوقين (Honor Roll) 🏆</span>
            </h3>
            <span className="px-3 py-1 bg-amber-500 text-white font-extrabold text-[10px] rounded-full shadow-xs">
              أوائل الفصل الدراسي 🌟
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(getHonorRollStudents ? getHonorRollStudents(3) : []).length === 0 ? (
              <div className="col-span-full py-8 text-center bg-white/60 dark:bg-zinc-900/60 border border-dashed border-amber-300/40 rounded-2xl text-slate-500 text-xs font-bold space-y-1">
                <Trophy className="w-8 h-8 text-amber-500 mx-auto opacity-50" />
                <p>{isAr ? 'لا يوجد طلاب مضافون حالياً لديهم درجات مرصودة لعرضهم في لوحة الشرف 🏆' : 'No students with recorded grades to display in the Honor Roll yet.'}</p>
                <p className="text-[10px] text-slate-400 font-normal">{isAr ? 'قم بإضافة طلاب ورصد درجاتهم من كادر المعلمين ليتم احتساب الأوائل تلقائياً.' : 'Add students and record grades in the gradebook to auto-calculate top students.'}</p>
              </div>
            ) : (
              (getHonorRollStudents ? getHonorRollStudents(3) : []).map((stu, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';

                return (
                  <div
                    key={stu.id}
                    className="bg-white border-2 border-amber-200 p-4.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-amber-500 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                        {medal}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#0F172A]">{stu.name}</h4>
                        <span className="text-[10px] text-amber-800 font-bold block">{stu.grade || 'الصف السادس'}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-amber-600 font-mono block">
                        {stu.gpa || 98.5}%
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md text-[9px] font-black inline-block">
                        تفوق ممتاز 🌟
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

