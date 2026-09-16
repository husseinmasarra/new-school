import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Clock, 
  Users, 
  CheckCircle2, 
  BookOpen, 
  UserPlus,
  Trash2,
  DollarSign,
  Search,
  Filter,
  CreditCard,
  Receipt,
  Plus,
  Edit3,
  AlertCircle,
  Printer,
  Wallet,
  Calendar,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const TutoringModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    tutoringCourses = [], 
    tutoringPayments = [],
    registerTutoring, 
    unregisterTutoring, 
    updateStudentTutoringFee,
    addTutoringCourse,
    deleteTutoringCourse,
    addTutoringPayment,
    deleteTutoringPayment,
    students = [], 
    selectedStudentId,
    systemUsers = []
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeCourses = tutoringCourses || [];
  const safePayments = tutoringPayments || [];

  // Active Tab: 'courses' | 'finance'
  const [activeTab, setActiveTab] = useState('courses');

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourseId, setFilterCourseId] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'paid' | 'partial' | 'unpaid'

  // Quick enroll state on header
  const [quickStudentId, setQuickStudentId] = useState(selectedStudentId || safeStudents[0]?.id || '');
  const [quickCourseId, setQuickCourseId] = useState(safeCourses[0]?.id || '');
  const [quickFee, setQuickFee] = useState('');

  // Modals state
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollTargetCourse, setEnrollTargetCourse] = useState(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollCustomFee, setEnrollCustomFee] = useState('');

  const [showEditFeeModal, setShowEditFeeModal] = useState(false);
  const [editFeeData, setEditFeeData] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    method: 'نقدي (Cash)',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: '',
    titleEn: '',
    subject: 'الرياضيات',
    fee: 50,
    instructor: '',
    days: '',
    maxSeats: 15,
    description: ''
  });

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: calculate financial data per enrolled student in a course
  const getEnrollmentFinancials = (course, studentId) => {
    const student = safeStudents.find(s => s.id === studentId);
    if (!student) return null;

    const feesMap = course.studentFeesMap || {};
    const dedicatedFee = feesMap[studentId] !== undefined ? Number(feesMap[studentId]) : Number(course.fee || 0);

    const studentPayments = safePayments.filter(p => p.studentId === studentId && p.courseId === course.id);
    const paidAmount = studentPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const remaining = Math.max(0, dedicatedFee - paidAmount);

    let status = 'unpaid';
    if (paidAmount >= dedicatedFee && dedicatedFee > 0) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    }

    return {
      student,
      course,
      dedicatedFee,
      paidAmount,
      remaining,
      status,
      paymentsCount: studentPayments.length
    };
  };

  // Aggregated institute totals (Completely isolated from school tuition)
  const instituteStats = useMemo(() => {
    let totalExpected = 0;
    let totalEnrolledCount = 0;
    const enrolledStudentsSet = new Set();

    safeCourses.forEach(course => {
      const enrolled = course.enrolledStudentIds || [];
      const feesMap = course.studentFeesMap || {};
      enrolled.forEach(stuId => {
        enrolledStudentsSet.add(stuId);
        totalEnrolledCount += 1;
        const fee = feesMap[stuId] !== undefined ? Number(feesMap[stuId]) : Number(course.fee || 0);
        totalExpected += fee;
      });
    });

    const totalCollected = safePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalRemaining = Math.max(0, totalExpected - totalCollected);
    const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

    return {
      totalCourses: safeCourses.length,
      distinctStudentsCount: enrolledStudentsSet.size,
      totalEnrollments: totalEnrolledCount,
      totalExpected,
      totalCollected,
      totalRemaining,
      collectionRate
    };
  }, [safeCourses, safePayments]);

  // All student enrollments flat list for the finance table
  const allEnrollments = useMemo(() => {
    const list = [];
    safeCourses.forEach(course => {
      const enrolled = course.enrolledStudentIds || [];
      enrolled.forEach(stuId => {
        const fin = getEnrollmentFinancials(course, stuId);
        if (fin) list.push(fin);
      });
    });
    return list;
  }, [safeCourses, safePayments, safeStudents]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return allEnrollments.filter(item => {
      const matchesCourse = filterCourseId === 'all' || item.course.id === filterCourseId;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        item.student.name?.toLowerCase().includes(q) ||
        item.student.nameEn?.toLowerCase().includes(q) ||
        item.student.id?.toLowerCase().includes(q) ||
        item.course.title?.toLowerCase().includes(q) ||
        item.course.subject?.toLowerCase().includes(q);

      return matchesCourse && matchesStatus && matchesSearch;
    });
  }, [allEnrollments, filterCourseId, filterStatus, searchQuery]);

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return safePayments.filter(p => {
      const matchesCourse = filterCourseId === 'all' || p.courseId === filterCourseId;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        p.studentName?.toLowerCase().includes(q) ||
        p.receiptNo?.toLowerCase().includes(q) ||
        p.courseTitle?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q);

      return matchesCourse && matchesSearch;
    });
  }, [safePayments, filterCourseId, searchQuery]);

  // Handle Quick Enroll
  const handleQuickEnroll = (e) => {
    e.preventDefault();
    if (!quickStudentId || !quickCourseId) return;

    registerTutoring(quickCourseId, quickStudentId, quickFee);
    const stu = safeStudents.find(s => s.id === quickStudentId);
    showToast(isAr ? `تم تسجيل التلميذ (${stu?.name || quickStudentId}) في الدورة بنجاح! 🟢` : 'Student enrolled successfully!');
    setQuickFee('');
  };

  // Open modal to enroll in a specific course
  const handleOpenEnrollModal = (course) => {
    setEnrollTargetCourse(course);
    setEnrollStudentId(safeStudents[0]?.id || '');
    setEnrollCustomFee(course.fee ? String(course.fee) : '');
    setShowEnrollModal(true);
  };

  const handleConfirmEnrollModal = (e) => {
    e.preventDefault();
    if (!enrollTargetCourse || !enrollStudentId) return;

    registerTutoring(enrollTargetCourse.id, enrollStudentId, enrollCustomFee);
    const stu = safeStudents.find(s => s.id === enrollStudentId);
    showToast(isAr ? `تم تسجيل التلميذ (${stu?.name || enrollStudentId}) بقسط مخصص $${enrollCustomFee || enrollTargetCourse.fee} بنجاح! 🎉` : 'Enrolled successfully!');
    setShowEnrollModal(false);
  };

  // Remove student from course
  const handleRemoveStudent = (courseId, studentId, studentName) => {
    const confirmMsg = isAr 
      ? `هل أنت متأكد من إزالة التلميذ (${studentName}) من هذه الدورة في معهد التقوية؟`
      : `Are you sure you want to remove (${studentName}) from this course?`;
    
    if (window.confirm(confirmMsg)) {
      unregisterTutoring(courseId, studentId);
      showToast(isAr ? `تم إزالة التلميذ (${studentName}) من الدورة بنجاح! 🗑️` : 'Student removed from course.');
    }
  };

  // Open Edit Fee Modal
  const handleOpenEditFeeModal = (course, student) => {
    const fin = getEnrollmentFinancials(course, student.id);
    setEditFeeData({
      courseId: course.id,
      courseTitle: course.title,
      studentId: student.id,
      studentName: student.name,
      currentFee: fin?.dedicatedFee || course.fee,
      newFee: String(fin?.dedicatedFee || course.fee),
      adminPassword: '',
      passwordError: ''
    });
    setShowEditFeeModal(true);
  };

  const handleSaveCustomFee = (e) => {
    e.preventDefault();
    if (!editFeeData) return;

    const adminUser = systemUsers.find(u => u.role === 'admin');
    const currentAdminPass = adminUser?.password || '12345678';

    if (currentRole !== 'admin') {
      if (!editFeeData.adminPassword || editFeeData.adminPassword !== currentAdminPass) {
        setEditFeeData(prev => ({ ...prev, passwordError: isAr ? '🔒 كلمة سر المدير غير صحيحة! تعديل الرسوم يتطلب صلاحية المدير.' : 'Incorrect admin password!' }));
        return;
      }
    }

    const numericFee = Number(editFeeData.newFee);
    if (isNaN(numericFee) || numericFee < 0) {
      alert(isAr ? 'يرجى إدخال مبلغ صحيح' : 'Please enter a valid amount');
      return;
    }

    updateStudentTutoringFee(editFeeData.courseId, editFeeData.studentId, numericFee);
    showToast(isAr ? `تم تعديل قسط دورة التقوية للتلميذ (${editFeeData.studentName}) إلى $${numericFee} بنجاح! ✏️` : 'Tutoring fee updated!');
    setShowEditFeeModal(false);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (courseId = '', studentId = '') => {
    const cId = courseId || safeCourses[0]?.id || '';
    const sId = studentId || safeStudents[0]?.id || '';
    
    let targetCourse = safeCourses.find(c => c.id === cId);
    let rem = 0;
    if (targetCourse && sId) {
      const fin = getEnrollmentFinancials(targetCourse, sId);
      rem = fin?.remaining || targetCourse.fee;
    }

    setPaymentData({
      studentId: sId,
      courseId: cId,
      amount: rem > 0 ? String(rem) : '',
      method: 'نقدي (Cash)',
      date: new Date().toISOString().split('T')[0],
      notes: isAr ? 'تسديد قسط معهد التقوية' : 'Tutoring fee payment'
    });
    setShowPaymentModal(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amountNum = Number(paymentData.amount);
    if (!amountNum || amountNum <= 0) {
      alert(isAr ? 'يرجى إدخال مبلغ صالح للدفع' : 'Please enter a valid payment amount');
      return;
    }

    const targetStudent = safeStudents.find(s => s.id === paymentData.studentId);
    const targetCourse = safeCourses.find(c => c.id === paymentData.courseId);

    if (!targetStudent || !targetCourse) {
      alert(isAr ? 'يرجى اختيار التلميذ ودورة التقوية' : 'Please select a student and course');
      return;
    }

    const newPayment = addTutoringPayment({
      studentId: targetStudent.id,
      studentName: isAr ? targetStudent.name : targetStudent.nameEn || targetStudent.name,
      courseId: targetCourse.id,
      courseTitle: isAr ? targetCourse.title : targetCourse.titleEn || targetCourse.title,
      amount: amountNum,
      currency: 'USD',
      date: paymentData.date,
      method: paymentData.method,
      notes: paymentData.notes
    });

    setShowPaymentModal(false);
    showToast(isAr ? `تم تسجيل دفعة معهد التقوية بمبلغ $${amountNum} وإصدار السند بنجاح! 💵` : 'Payment recorded!');
    setSelectedReceipt(newPayment);
    setShowReceiptModal(true);
  };

  // Add new course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseForm.title || !newCourseForm.subject) {
      alert(isAr ? 'يرجى إدخال اسم الدورة والمادة' : 'Please enter course title and subject');
      return;
    }

    addTutoringCourse({
      title: newCourseForm.title,
      titleEn: newCourseForm.titleEn,
      subject: newCourseForm.subject,
      fee: Number(newCourseForm.fee) || 0,
      instructor: newCourseForm.instructor || 'أ. مدرس المعهد',
      days: newCourseForm.days || 'يحدد لاحقاً',
      maxSeats: Number(newCourseForm.maxSeats) || 15,
      description: newCourseForm.description
    });

    setShowAddCourseModal(false);
    setNewCourseForm({
      title: '',
      titleEn: '',
      subject: 'الرياضيات',
      fee: 50,
      instructor: '',
      days: '',
      maxSeats: 15,
      description: ''
    });
    showToast(isAr ? 'تم إنشاء دورة التقوية الجديدة بنجاح! 🎓' : 'New tutoring course created!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A] pb-12">
      
      {/* ─── Top Banner ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-gradient-to-br from-[#0284C7] to-sky-700 text-white rounded-2xl shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#0284C7]">
                  {isAr ? 'معهد التقوية والدورات التعليمية الخاصة' : t('tutoringTitle')}
                </h2>
                <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? 'حسابات مالية مستقلة 🛡️' : 'Separate Accounts'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {isAr 
                  ? 'تسجيل وإدارة تلاميذ معهد التقوية، تخصيص القسط الدراسي لكل تلميذ، وفصل كامل للمقبوضات والذمم وسندات القبض عن الحسابات المدرسية العامة.'
                  : 'Manage tutoring courses, enroll/remove students, assign custom fees, and manage isolated accounting & receipts.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {currentRole === 'admin' && (
              <button
                type="button"
                onClick={() => setShowAddCourseModal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة دورة تقوية جديدة' : 'Add Course'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenPaymentModal()}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isAr ? 'تسجيل دفعة للمعهد' : 'Record Payment'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPrintReportModal(true)}
              className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
              title="طباعة كشف حسابات معهد التقوية"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{isAr ? 'كشف الحسابات' : 'Report'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Switches */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-[#032541] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>{isAr ? 'دورات المعهد والتلاميذ المسجلين' : 'Courses & Enrolled Students'}</span>
            <span className="text-[10px] bg-sky-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
              {safeCourses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'finance'
                ? 'bg-[#032541] text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>{isAr ? 'حسابات ومالية معهد التقوية (مستقلة)' : 'Tutoring Finance & Ledger'}</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-700 font-mono font-bold px-2 py-0.5 rounded-full">
              ${instituteStats.totalCollected}
            </span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-fade-in text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white font-black text-sm">✕</button>
        </div>
      )}

      {/* ─── TAB 1: COURSES & ENROLLMENT ────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">{isAr ? 'عدد الدورات النشطة' : 'Active Courses'}</span>
              <span className="text-xl font-mono font-black text-[#032541] mt-1 block">{safeCourses.length}</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">{isAr ? 'إجمالي المقاعد المحجوزة' : 'Enrolled Students'}</span>
              <span className="text-xl font-mono font-black text-[#0284C7] mt-1 block">{instituteStats.totalEnrollments}</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">{isAr ? 'إجمالي أقساط الدورات' : 'Total Course Fees'}</span>
              <span className="text-xl font-mono font-black text-emerald-700 mt-1 block">${instituteStats.totalExpected}</span>
            </div>
            <div className="bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 block">{isAr ? 'المقبوضات المحصلة للمعهد' : 'Tutoring Collected'}</span>
              <span className="text-xl font-mono font-black text-emerald-600 mt-1 block">${instituteStats.totalCollected}</span>
            </div>
          </div>

          {/* Quick Enroll Bar */}
          <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-200 p-4 rounded-3xl shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span className="text-xs font-bold text-[#032541]">
                  {isAr ? 'تسجيل سريع لتلميذ في دورة مع تحديد القسط:' : 'Quick Student Enrollment:'}
                </span>
              </div>

              <form onSubmit={handleQuickEnroll} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={quickStudentId}
                  onChange={(e) => setQuickStudentId(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-bold text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none focus:border-[#0284C7] max-w-xs"
                >
                  {safeStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} - {s.section || 'أ'})
                    </option>
                  ))}
                </select>

                <select
                  value={quickCourseId}
                  onChange={(e) => setQuickCourseId(e.target.value)}
                  className="bg-white border border-slate-300 text-xs font-bold text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none focus:border-[#0284C7] max-w-xs"
                >
                  {safeCourses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title} (${c.fee})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1.5 rounded-xl">
                  <span className="text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    placeholder={isAr ? 'قسط مخصص' : 'Custom Fee'}
                    value={quickFee}
                    onChange={(e) => setQuickFee(e.target.value)}
                    className="w-20 text-xs font-bold bg-transparent focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تسجيل الآن' : 'Enroll'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCourses.length === 0 ? (
              <div className="col-span-full bg-white border border-dashed border-slate-300 p-12 rounded-3xl text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">{isAr ? 'لا توجد دورات تقوية مضافة حالياً' : 'No tutoring courses yet'}</h3>
                <p className="text-xs text-slate-500">{isAr ? 'يمكن للمدير إضافة دورات تقوية جديدة من الزر أعلاه.' : 'Admin can add tutoring courses.'}</p>
              </div>
            ) : (
              safeCourses.map((course) => {
                const enrolledIds = course.enrolledStudentIds || [];
                const seatsLeft = Math.max(0, (course.maxSeats || 15) - enrolledIds.length);
                const feesMap = course.studentFeesMap || {};

                return (
                  <div
                    key={course.id}
                    className="bg-white border border-[#E2E8F0] hover:border-sky-300 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all text-[#0F172A]"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                          {course.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ${course.fee} USD
                          </span>
                          {currentRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(isAr ? `هل أنت متأكد من حذف دورة (${course.title})؟` : 'Delete course?')) {
                                  deleteTutoringCourse(course.id);
                                  showToast(isAr ? 'تم حذف الدورة بنجاح' : 'Course deleted');
                                }
                              }}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                              title="حذف الدورة"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Course Title */}
                      <h3 className="text-base font-bold text-[#032541] leading-snug">
                        {isAr ? course.title : course.titleEn || course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
                        {course.description || (isAr ? 'دورة تقوية متخصصة لبناء المهارات الأساسية والمتقدمة.' : 'Specialized tutoring course.')}
                      </p>

                      {/* Schedule & Teacher */}
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
                          <span>
                            {isAr ? 'المقاعد الشاغرة:' : 'Available Seats:'}{' '}
                            <strong className="text-[#0284C7]">{seatsLeft} / {course.maxSeats}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Enrolled Students Roster Section */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-sky-600" />
                            <span>{isAr ? `التلاميذ المسجلون بالمعهد (${enrolledIds.length}):` : `Enrolled Students (${enrolledIds.length}):`}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEnrollModal(course)}
                            className="text-[11px] font-bold text-[#0284C7] hover:text-[#0369A1] bg-sky-50 hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isAr ? 'إضافة تلميذ' : 'Add Student'}</span>
                          </button>
                        </div>

                        {enrolledIds.length === 0 ? (
                          <div className="p-3 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
                            <span className="text-[11px] text-slate-400 italic block">
                              {isAr ? 'لا يوجد تلاميذ مسجلون في هذه الدورة حتى الآن.' : 'No students enrolled yet.'}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-56 overflow-y-auto p-1">
                            {enrolledIds.map(stuId => {
                              const fin = getEnrollmentFinancials(course, stuId);
                              if (!fin) return null;
                              const { student, dedicatedFee, paidAmount, remaining, status } = fin;

                              return (
                                <div 
                                  key={student.id} 
                                  className="flex items-center justify-between gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs hover:bg-white hover:border-sky-300 transition-all shadow-2xs"
                                >
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-[#0F172A]">{student.name}</span>
                                      <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                                        {student.grade}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-mono">
                                      <span className="text-slate-600">
                                        {isAr ? 'القسط:' : 'Fee:'}{' '}
                                        <strong className="text-emerald-700">${dedicatedFee}</strong>
                                      </span>
                                      <span className="text-slate-400">•</span>
                                      <span className="text-emerald-600">
                                        {isAr ? 'مسدد:' : 'Paid:'} ${paidAmount}
                                      </span>
                                      {remaining > 0 && (
                                        <>
                                          <span className="text-slate-400">•</span>
                                          <span className="text-red-500 font-bold">
                                            {isAr ? 'متبقي:' : 'Rem:'} ${remaining}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Buttons for this enrolled student */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenPaymentModal(course.id, student.id)}
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 cursor-pointer"
                                      title="تسجيل دفعة لمعهد التقوية"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditFeeModal(course, student)}
                                      className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-lg border border-sky-200 cursor-pointer"
                                      title="تعديل القسط المخصص"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>

                                    {(currentRole === 'admin' || currentRole === 'vice_principal') && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveStudent(course.id, student.id, student.name)}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 cursor-pointer"
                                        title="إزالة التلميذ من الدورة"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Action */}
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleOpenEnrollModal(course)}
                        disabled={seatsLeft <= 0}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                          seatsLeft <= 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#0284C7] to-sky-600 hover:from-[#0369A1] hover:to-sky-700 text-white'
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isAr ? 'تسجيل تلميذ في هذه الدورة' : 'Enroll Student'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: INDEPENDENT TUTORING FINANCE & LEDGER ──────────────────────── */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Important Notice Banner on Financial Separation */}
          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-3xl flex items-center gap-3 text-emerald-900 text-xs">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black block text-emerald-800">
                {isAr ? '🛡️ منظومة مالية مستقلة تماماً لمعهد التقوية:' : 'Completely Independent Financial Ledger:'}
              </span>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                {isAr 
                  ? 'تم عزل حسابات معهد التقوية وفصلها كلياً عن أقساط المدرسة العادية. الأقساط المخصصة، المقبوضات، وسندات القبض هنا تخص المعهد حصراً ولا تؤثر إطلاقاً على ذمم التعليم الأساسي.'
                  : 'Tutoring institute finances are isolated from regular school tuition. Course fees and receipts belong strictly to the tutoring institute.'}
              </p>
            </div>
          </div>

          {/* Financial KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-slate-500 block">{isAr ? 'إجمالي رسوم المعهد المقررة' : 'Total Expected Fees'}</span>
              <span className="text-2xl font-mono font-black text-[#032541] mt-2 block">${instituteStats.totalExpected} <span className="text-xs font-sans font-normal text-slate-400">USD</span></span>
              <span className="text-[10px] text-slate-400 mt-1 block">{isAr ? `عن ${instituteStats.totalEnrollments} اشتراك تلميذ` : `For ${instituteStats.totalEnrollments} enrollments`}</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-emerald-600 block">{isAr ? 'إجمالي المقبوضات المحصلة' : 'Total Tutoring Collected'}</span>
              <span className="text-2xl font-mono font-black text-emerald-600 mt-2 block">${instituteStats.totalCollected} <span className="text-xs font-sans font-normal text-slate-400">USD</span></span>
              <span className="text-[10px] text-emerald-600/80 mt-1 block">{isAr ? `إجمالي ${safePayments.length} سند قبض صادر` : `${safePayments.length} receipts issued`}</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-red-500 block">{isAr ? 'المتبقي والذمم لمعهد التقوية' : 'Outstanding Tutoring Debt'}</span>
              <span className="text-2xl font-mono font-black text-red-600 mt-2 block">${instituteStats.totalRemaining} <span className="text-xs font-sans font-normal text-slate-400">USD</span></span>
              <span className="text-[10px] text-red-400 mt-1 block">{isAr ? 'مستحقات واجبة التحصيل' : 'Due for collection'}</span>
            </div>

            <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-[#0284C7] block">{isAr ? 'نسبة التحصيل المالي' : 'Collection Rate'}</span>
              <span className="text-2xl font-mono font-black text-[#0284C7] mt-2 block">{instituteStats.collectionRate}%</span>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div 
                  className="bg-[#0284C7] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, instituteStats.collectionRate)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Filter and Search Toolbar */}
          <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isAr ? 'بحث عن تلميذ أو دورة أو سند...' : 'Search student or receipt...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] rounded-xl pr-9 pl-3 py-2 focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Course Filter */}
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
                className="bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="all">{isAr ? 'جميع الدورات' : 'All Courses'}</option>
                {safeCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="all">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="paid">{isAr ? 'مسدد بالكامل' : 'Fully Paid'}</option>
                <option value="partial">{isAr ? 'سداد جزئي' : 'Partial Paid'}</option>
                <option value="unpaid">{isAr ? 'غير مسدد' : 'Unpaid'}</option>
              </select>

              <button
                type="button"
                onClick={() => handleOpenPaymentModal()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل دفعة' : 'Record Payment'}</span>
              </button>
            </div>
          </div>

          {/* Section 1: Students Tutoring Financial Ledger Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-sm font-bold text-[#032541]">
                  {isAr ? 'جدول حسابات وذمم التلاميذ بمعهد التقوية' : 'Student Tutoring Accounts & Balances'}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                {isAr ? `إجمالي المسجلين: ${filteredEnrollments.length}` : `Enrolled: ${filteredEnrollments.length}`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">{isAr ? 'التلميذ' : 'Student'}</th>
                    <th className="p-3.5">{isAr ? 'الصف والشعبة' : 'Grade'}</th>
                    <th className="p-3.5">{isAr ? 'دورة التقوية' : 'Course'}</th>
                    <th className="p-3.5">{isAr ? 'القسط المخصص' : 'Dedicated Fee'}</th>
                    <th className="p-3.5">{isAr ? 'المسدد للمعهد' : 'Paid'}</th>
                    <th className="p-3.5">{isAr ? 'المتبقي' : 'Remaining'}</th>
                    <th className="p-3.5 text-center">{isAr ? 'حالة السداد' : 'Status'}</th>
                    <th className="p-3.5 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        {isAr ? 'لا توجد سجلات مطابقة للبحث' : 'No records found'}
                      </td>
                    </tr>
                  ) : (
                    filteredEnrollments.map(({ student, course, dedicatedFee, paidAmount, remaining, status }) => (
                      <tr key={`${course.id}-${student.id}`} className="hover:bg-sky-50/40 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-[#0F172A] block">{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{student.id}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {student.grade} - {student.section || 'أ'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-[#0284C7] block">{course.title}</span>
                          <span className="text-[10px] text-slate-400">{course.subject}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>${dedicatedFee}</span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditFeeModal(course, student)}
                              className="text-slate-400 hover:text-[#0284C7] p-0.5 cursor-pointer"
                              title="تعديل القسط المخصص"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-emerald-600">
                          ${paidAmount}
                        </td>
                        <td className="p-3.5 font-mono font-bold">
                          {remaining > 0 ? (
                            <span className="text-red-600">${remaining}</span>
                          ) : (
                            <span className="text-slate-400">$0</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {status === 'paid' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {isAr ? 'مسدد بالكامل 🟢' : 'Fully Paid'}
                            </span>
                          )}
                          {status === 'partial' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              {isAr ? 'سداد جزئي 🟡' : 'Partial'}
                            </span>
                          )}
                          {status === 'unpaid' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              {isAr ? 'غير مسدد 🔴' : 'Unpaid'}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(course.id, student.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                              title="تسجيل دفعة للمعهد"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>{isAr ? 'دفعة' : 'Pay'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditFeeModal(course, student)}
                              className="bg-sky-50 hover:bg-sky-100 text-[#0284C7] p-1.5 rounded-lg border border-sky-200 cursor-pointer"
                              title="تعديل القسط المخصص"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {(currentRole === 'admin' || currentRole === 'vice_principal') && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(course.id, student.id, student.name)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-red-200 cursor-pointer"
                                title="إزالة التلميذ من الدورة"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Tutoring Payment Receipts History */}
          <div className="bg-white border border-[#E2E8F0] rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#032541]">
                  {isAr ? 'سجل مقبوضات وسندات قبض معهد التقوية' : 'Tutoring Receipts & Payment History'}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                {isAr ? `إجمالي السندات: ${filteredPayments.length}` : `Receipts: ${filteredPayments.length}`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#F8FAFC] text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">{isAr ? 'رقم السند' : 'Receipt #'}</th>
                    <th className="p-3.5">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3.5">{isAr ? 'التلميذ' : 'Student'}</th>
                    <th className="p-3.5">{isAr ? 'دورة التقوية' : 'Course'}</th>
                    <th className="p-3.5">{isAr ? 'المبلغ المسدد' : 'Amount'}</th>
                    <th className="p-3.5">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                    <th className="p-3.5">{isAr ? 'البيان / الملاحظات' : 'Notes'}</th>
                    <th className="p-3.5 text-center">{isAr ? 'سند القبض' : 'Receipt'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        {isAr ? 'لا توجد دفعات مسجلة لمعهد التقوية حتى الآن' : 'No tutoring payments recorded yet'}
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-slate-700">
                          {p.receiptNo}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">
                          {p.date}
                        </td>
                        <td className="p-3.5 font-bold text-[#0F172A]">
                          {p.studentName}
                        </td>
                        <td className="p-3.5 text-[#0284C7] font-bold">
                          {p.courseTitle}
                        </td>
                        <td className="p-3.5 font-mono font-black text-emerald-600">
                          ${p.amount} USD
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {p.method}
                        </td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">
                          {p.notes || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReceipt(p);
                                setShowReceiptModal(true);
                              }}
                              className="bg-sky-50 hover:bg-sky-100 text-[#0284C7] px-2.5 py-1 rounded-lg border border-sky-200 text-[11px] font-bold cursor-pointer flex items-center gap-1"
                              title="معاينة وطباعة سند القبض"
                            >
                              <Printer className="w-3 h-3" />
                              <span>{isAr ? 'طباعة' : 'Print'}</span>
                            </button>

                            {currentRole === 'admin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(isAr ? `هل أنت متأكد من حذف سند القبض (${p.receiptNo})؟` : 'Delete receipt?')) {
                                    deleteTutoringPayment(p.id);
                                    showToast(isAr ? 'تم حذف السند بنجاح' : 'Receipt deleted');
                                  }
                                }}
                                className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                title="حذف السند"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ─── MODAL 1: ENROLL STUDENT IN COURSE ─────────────────────────────────── */}
      {showEnrollModal && enrollTargetCourse && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-sky-300 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'تسجيل تلميذ في دورة التقوية' : 'Enroll Student'}</span>
              </h3>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-[#032541] block">{enrollTargetCourse.title}</span>
              <div className="flex items-center justify-between text-slate-600 text-[11px]">
                <span>{isAr ? 'المادة:' : 'Subject:'} <strong>{enrollTargetCourse.subject}</strong></span>
                <span>{isAr ? 'القسط الافتراضي:' : 'Default Fee:'} <strong className="text-emerald-700">${enrollTargetCourse.fee} USD</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmEnrollModal} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'اختر التلميذ من قائمة المدرسة:' : 'Select Student:'}
                </label>
                <select
                  value={enrollStudentId}
                  onChange={(e) => setEnrollStudentId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0284C7]"
                  required
                >
                  {safeStudents.map(s => {
                    const isAlready = (enrollTargetCourse.enrolledStudentIds || []).includes(s.id);
                    return (
                      <option key={s.id} value={s.id} disabled={isAlready}>
                        {s.name} ({s.grade} - {s.section || 'أ'}) {isAlready ? (isAr ? ' - [مسجل بالفعل]' : ' - [Enrolled]') : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'القسط المخصص لهذا التلميذ ($ USD):' : 'Dedicated Course Fee ($ USD):'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">$</span>
                  <input
                    type="number"
                    value={enrollCustomFee}
                    onChange={(e) => setEnrollCustomFee(e.target.value)}
                    placeholder={String(enrollTargetCourse.fee)}
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#0284C7]"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isAr ? 'يمكنك ترك القسط كما هو أو تخصيص مبلغ مخفض/محدد لهذا التلميذ بشكل مستقل.' : 'Set custom fee for this student.'}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد التسجيل وتثبيت القسط' : 'Confirm Enrollment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL 2: EDIT CUSTOM FEE FOR STUDENT ──────────────────────────────── */}
      {showEditFeeModal && editFeeData && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'تعديل القسط المخصص للتلميذ' : 'Edit Custom Fee'}</span>
              </h3>
              <button 
                onClick={() => setShowEditFeeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">{editFeeData.studentName}</span>
                <span className="text-[11px] text-amber-800 font-mono">{editFeeData.courseTitle}</span>
              </div>
              <span className="text-[11px] text-slate-600 block">
                {isAr ? 'القسط الحالي:' : 'Current Fee:'} <strong className="text-emerald-700">${editFeeData.currentFee} USD</strong>
              </span>
            </div>

            <form onSubmit={handleSaveCustomFee} className="space-y-4 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'القسط المخصص الجديد ($ USD):' : 'New Dedicated Fee ($ USD):'}
                </label>
                <input
                  type="number"
                  value={editFeeData.newFee}
                  onChange={(e) => setEditFeeData(prev => ({ ...prev, newFee: e.target.value }))}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Security check: If not logged as admin, require admin password */}
              {currentRole !== 'admin' && (
                <div className="space-y-1.5 p-3 bg-red-50 border border-red-200 rounded-2xl">
                  <label className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    <span>{isAr ? 'كلمة سر المدير للموافقة على تعديل الحسابات:' : 'Admin Password Required:'}</span>
                  </label>
                  <input
                    type="password"
                    value={editFeeData.adminPassword || ''}
                    onChange={(e) => setEditFeeData(prev => ({ ...prev, adminPassword: e.target.value, passwordError: '' }))}
                    placeholder="••••••••"
                    className="w-full bg-white border border-red-300 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
                    required
                  />
                  {editFeeData.passwordError && (
                    <span className="text-[11px] font-bold text-red-600 block">{editFeeData.passwordError}</span>
                  )}
                  <p className="text-[10px] text-slate-500">
                    {isAr ? 'تعديل الحسابات حصراً للمدير أو بموافقته عبر كلمة سر المدير.' : 'Admin authorization required.'}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditFeeModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 rounded-xl text-xs font-black shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'حفظ القسط المخصص' : 'Save Fee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL 3: RECORD TUTORING PAYMENT ──────────────────────────────────── */}
      {showPaymentModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>{isAr ? 'تسجيل دفعة لمعهد التقوية وإصدار سند' : 'Record Tutoring Payment'}</span>
              </h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'دورة التقوية:' : 'Course:'}
                </label>
                <select
                  value={paymentData.courseId}
                  onChange={(e) => {
                    const newCourseId = e.target.value;
                    const c = safeCourses.find(item => item.id === newCourseId);
                    let rem = c?.fee || 0;
                    if (c && paymentData.studentId) {
                      const fin = getEnrollmentFinancials(c, paymentData.studentId);
                      rem = fin?.remaining || c.fee;
                    }
                    setPaymentData(prev => ({ ...prev, courseId: newCourseId, amount: rem > 0 ? String(rem) : '' }));
                  }}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                >
                  {safeCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.title} (${c.fee})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'التلميذ المشترك:' : 'Enrolled Student:'}
                </label>
                <select
                  value={paymentData.studentId}
                  onChange={(e) => {
                    const newStuId = e.target.value;
                    const c = safeCourses.find(item => item.id === paymentData.courseId);
                    let rem = 0;
                    if (c) {
                      const fin = getEnrollmentFinancials(c, newStuId);
                      rem = fin?.remaining || c.fee;
                    }
                    setPaymentData(prev => ({ ...prev, studentId: newStuId, amount: rem > 0 ? String(rem) : '' }));
                  }}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  required
                >
                  {safeStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} - {s.section || 'أ'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'مبلغ الدفعة ($ USD):' : 'Amount ($ USD):'}
                  </label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'طريقة الدفع:' : 'Method:'}
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="نقدي (Cash)">نقدي (Cash)</option>
                    <option value="تحويل بنكي (Bank)">تحويل بنكي (Bank)</option>
                    <option value="بطاقة ائتمان (Card)">بطاقة ائتمان (Card)</option>
                    <option value="شيك (Check)">شيك (Check)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'تاريخ السداد:' : 'Payment Date:'}
                </label>
                <input
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'البيان / ملاحظات السند:' : 'Notes / Statement:'}
                </label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={isAr ? 'مثال: تسديد القسط كاملاً عن شهر تموز' : 'e.g. Full fee payment'}
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isAr ? 'حفظ الدفعة وإصدار السند' : 'Record & Issue Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL 4: ADD NEW TUTORING COURSE ──────────────────────────────────── */}
      {showAddCourseModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-sky-400 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة دورة تقوية جديدة للمعهد' : 'Add New Tutoring Course'}</span>
              </h3>
              <button 
                onClick={() => setShowAddCourseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'اسم دورة التقوية بالعربية:' : 'Course Title (Ar):'}
                  </label>
                  <input
                    type="text"
                    value={newCourseForm.title}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="مثال: دورة تقوية الرياضيات المتقدمة"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'اسم الدورة بالإنجليزية (اختياري):' : 'Course Title (En):'}
                  </label>
                  <input
                    type="text"
                    value={newCourseForm.titleEn}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="e.g. Advanced Math Tutoring"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'المادة الدراسية:' : 'Subject:'}
                  </label>
                  <input
                    type="text"
                    value={newCourseForm.subject}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="الرياضيات"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'القسط الافتراضي ($):' : 'Default Fee ($):'}
                  </label>
                  <input
                    type="number"
                    value={newCourseForm.fee}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, fee: e.target.value }))}
                    placeholder="50"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'الحد الأقصى للمقاعد:' : 'Max Seats:'}
                  </label>
                  <input
                    type="number"
                    value={newCourseForm.maxSeats}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, maxSeats: e.target.value }))}
                    placeholder="15"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold font-mono text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'المعلم / المحاضر:' : 'Instructor:'}
                  </label>
                  <input
                    type="text"
                    value={newCourseForm.instructor}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, instructor: e.target.value }))}
                    placeholder="أ. طارق خوري"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {isAr ? 'أيام ومواعيد الدوام:' : 'Days & Schedule:'}
                  </label>
                  <input
                    type="text"
                    value={newCourseForm.days}
                    onChange={(e) => setNewCourseForm(prev => ({ ...prev, days: e.target.value }))}
                    placeholder="الإثنين والأربعاء (04:00 - 05:30 م)"
                    className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ? 'وصف الدورة والأهداف:' : 'Course Description:'}
                </label>
                <textarea
                  rows="2"
                  value={newCourseForm.description}
                  onChange={(e) => setNewCourseForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="وصف مختصر لمحتوى دورة التقوية والمهارات المستهدفة..."
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-medium text-[#0F172A] rounded-xl p-2.5 focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء الدورة' : 'Create Course'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL 5: PRINTABLE OFFICIAL TUTORING RECEIPT ──────────────────────── */}
      {showReceiptModal && selectedReceipt && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 receipt-print-backdrop print-container">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <span>{isAr ? 'سند قبض مالي لمعهد التقوية' : 'Tutoring Payment Voucher'}</span>
              </h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div id="tutoring-receipt-printable" className="p-6 bg-amber-50/30 border-2 border-dashed border-amber-300 rounded-2xl space-y-4 text-xs font-serif">
              <div className="flex items-start justify-between border-b border-amber-200 pb-3">
                <div>
                  <h4 className="font-bold text-base text-[#032541]">معهد التقوية والدورات التعليمية الخاصة</h4>
                  <p className="text-[10px] text-slate-500">حسابات مالية مستقلة تابعة لمدرسة الدعم والتميز</p>
                </div>
                <div className="text-left font-mono font-bold">
                  <span className="text-red-700 block text-sm">{selectedReceipt.receiptNo}</span>
                  <span className="text-[10px] text-slate-500">{selectedReceipt.date}</span>
                </div>
              </div>

              <div className="space-y-2 py-2">
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-slate-600">وصلنا من التلميذ / ولي أمره:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.studentName}</span>
                </div>
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-slate-600">دورة التقوية:</span>
                  <span className="font-bold text-[#0284C7]">{selectedReceipt.courseTitle}</span>
                </div>
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-slate-600">مبلغ وقدره:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">${selectedReceipt.amount} USD</span>
                </div>
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-slate-600">طريقة الدفع:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.method}</span>
                </div>
                <div className="flex justify-between border-b border-amber-100 pb-1">
                  <span className="text-slate-600">البيان:</span>
                  <span className="text-slate-700">{selectedReceipt.notes || 'تسديد قسط دورة التقوية'}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between text-center text-[10px] text-slate-500">
                <div className="space-y-4">
                  <span>المحاسب / المستلم</span>
                  <p className="font-mono font-bold text-slate-700">{selectedReceipt.recordedBy}</p>
                </div>
                <div className="space-y-4">
                  <span>إدارة المعهد</span>
                  <p className="font-bold text-slate-700">معهد التقوية المعتمد</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة سند القبض' : 'Print Voucher'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL 6: PRINTABLE COMPLETE FINANCIAL STATEMENT ───────────────────── */}
      {showPrintReportModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'كشف حسابات معهد التقوية المالي (مستقل)' : 'Tutoring Financial Statement'}</span>
              </h3>
              <button 
                onClick={() => setShowPrintReportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-serif p-4 border border-slate-200 rounded-2xl bg-[#F8FAFC]">
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="text-base font-bold text-[#032541]">معهد التقوية والدورات التعليمية الخاصة</h4>
                <p className="text-[11px] text-slate-500">كشف مالي تفصيلي مستقل للأقساط والمقبوضات والمتبقيات</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">تاريخ التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
              </div>

              {/* Summary KPIs in report */}
              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-white p-3 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">إجمالي الرسوم</span>
                  <strong className="text-slate-900">${instituteStats.totalExpected}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block">إجمالي المحصل</span>
                  <strong className="text-emerald-700">${instituteStats.totalCollected}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-red-600 block">إجمالي المتبقي</span>
                  <strong className="text-red-600">${instituteStats.totalRemaining}</strong>
                </div>
              </div>

              {/* Detailed roster */}
              <table className="w-full text-right text-[11px] bg-white border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">التلميذ</th>
                    <th className="p-2">الدورة</th>
                    <th className="p-2">القسط ($)</th>
                    <th className="p-2">المسدد ($)</th>
                    <th className="p-2">المتبقي ($)</th>
                    <th className="p-2 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {allEnrollments.map(({ student, course, dedicatedFee, paidAmount, remaining, status }) => (
                    <tr key={`${course.id}-${student.id}`}>
                      <td className="p-2 font-sans font-bold">{student.name}</td>
                      <td className="p-2 font-sans">{course.title}</td>
                      <td className="p-2">${dedicatedFee}</td>
                      <td className="p-2 text-emerald-700">${paidAmount}</td>
                      <td className="p-2 text-red-600">${remaining}</td>
                      <td className="p-2 text-center font-sans text-[10px]">
                        {status === 'paid' ? 'مسدد' : status === 'partial' ? 'جزئي' : 'غير مسدد'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPrintReportModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة الكشف' : 'Print Statement'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
