import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { exportToExcelCSV, openWhatsAppMessage } from '../utils/exportUtils';
import { 
  CreditCard, 
  Receipt, 
  CheckCircle2, 
  Printer, 
  DollarSign, 
  Send,
  Plus,
  Calendar,
  Trash2,
  Check,
  X,
  Edit3,
  AlertTriangle
} from 'lucide-react';

export const TuitionModule = () => {
  const { lang, t, currentRole, students = [], payTuition, updateStudent, selectedStudentId, addMessage, siteSettings } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];

  // Read exchange rate from settings, fallback 89500
  const LBP_RATE = Number(siteSettings?.exchangeRate) || 89500;

  // Payment History Log State (stored in localStorage)
  const [paymentHistory, setPaymentHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_payment_history') || '{}'); }
    catch { return {}; }
  });

  // Modal States
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null); // student obj for direct payment
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc]     = useState('دفعة من القسط المدرسي');
  const [payMethod, setPayMethod] = useState('fresh_cash');

  // Edit/Correct Payment States
  const [selectedStudentForEditPayment, setSelectedStudentForEditPayment] = useState(null);
  const [editPaidAmount, setEditPaidAmount] = useState('');
  const [editPaidReason, setEditPaidReason] = useState('تصحيح خطأ في تسجيل الدفعة');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Active student for Parent / Student View
  const currentStudent = safeStudents.find((s) => s.id === selectedStudentId) || safeStudents[0];
  const isOverduePeriod = new Date().getDate() > 5;

  // Admin Financial Metrics in USD (Frozen accounts are excluded from active overdue dues)
  const activeStudents = safeStudents.filter((s) => !s?.frozen);
  const totalTuitionUSD   = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionTotal) || 600), 0);
  const totalAdminFeesUSD = safeStudents.reduce((sum, s) => sum + (Number(s?.adminFees) || 0), 0);
  const totalTransportFeesUSD = safeStudents.reduce((sum, s) => sum + (s?.hasTransport ? (Number(s?.transportFee) || 0) : 0), 0);
  const totalDiscountUSD  = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionDiscount) || 0), 0);
  const totalPaidUSD      = safeStudents.reduce((sum, s) => sum + (Number(s?.tuitionPaid) || 0), 0);
  
  // Total overdue dues only includes active non-frozen students
  const totalRemainingUSD = activeStudents.reduce((sum, s) => {
    const tot = Number(s.tuitionTotal) || 600;
    const adm = Number(s.adminFees) || 0;
    const trs = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
    const disc = Number(s.tuitionDiscount) || 0;
    const paid = Number(s.tuitionPaid) || 0;
    return sum + Math.max(0, tot + adm + trs - disc - paid);
  }, 0);

  const savePaymentHistory = (updated) => {
    setPaymentHistory(updated);
    localStorage.setItem('school_payment_history', JSON.stringify(updated));
  };

  // ── Direct Payment Handler (Immediate Deduction) ──────────────────────
  const handleDirectPaySubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentForPay || !payAmount || Number(payAmount) <= 0) return;

    const amountUSD = Number(payAmount);
    const stuId = selectedStudentForPay.id;

    // 1. Deduct immediately in AppContext (updates tuitionPaid and persists)
    payTuition(stuId, amountUSD, payMethod);

    // 2. Save entry to payment history log for this student
    const existingHistory = paymentHistory[stuId] || [];
    const newEntry = {
      id: `PAY-${Date.now()}`,
      amount: amountUSD,
      date: new Date().toISOString().split('T')[0],
      desc: payDesc || 'دفعة مالية',
      method: payMethod
    };
    const updatedHistory = {
      ...paymentHistory,
      [stuId]: [newEntry, ...existingHistory]
    };
    savePaymentHistory(updatedHistory);

    // 3. Compute new remaining amount for the receipt
    const totalTuition = Number(selectedStudentForPay.tuitionTotal) || 600;
    const adminFees = Number(selectedStudentForPay.adminFees) || 0;
    const transportFee = selectedStudentForPay.hasTransport ? (Number(selectedStudentForPay.transportFee) || 0) : 0;
    const discount = Number(selectedStudentForPay.tuitionDiscount) || 0;
    const oldPaid = Number(selectedStudentForPay.tuitionPaid) || 0;
    const newPaid = oldPaid + amountUSD;
    const remainingUSD = Math.max(0, totalTuition + adminFees + transportFee - discount - newPaid);

    // 4. Open official receipt modal
    const receipt = {
      receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      studentName: isAr ? selectedStudentForPay.name : selectedStudentForPay.nameEn,
      grade: isAr ? selectedStudentForPay.grade : selectedStudentForPay.gradeEn,
      amountUSD: amountUSD,
      amountLBP: 0,
      method: payMethod,
      remainingUSD: remainingUSD
    };

    setPayAmount('');
    setPayDesc('دفعة من القسط المدرسي');
    setSelectedStudentForPay(null);
    setShowReceiptModal(receipt);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleDeleteHistoryEntry = (stuId, entryId, amount) => {
    const existingHistory = paymentHistory[stuId] || [];
    const updatedHistory = {
      ...paymentHistory,
      [stuId]: existingHistory.filter(e => e.id !== entryId)
    };
    savePaymentHistory(updatedHistory);

    // Synchronize deduction from tuitionPaid in database!
    const targetStu = safeStudents.find(s => s.id === stuId);
    if (targetStu && updateStudent) {
      const currentPaid = Number(targetStu.tuitionPaid) || 0;
      const newPaid = Math.max(0, currentPaid - (Number(amount) || 0));
      updateStudent(stuId, { tuitionPaid: newPaid });
      setEditSuccessMsg(isAr ? `تم حذف القيد وخصم $${amount} من المدفوع بنجاح!` : `Payment record deleted and $${amount} deducted!`);
      setTimeout(() => setEditSuccessMsg(''), 4000);
    }
  };

  // ── Correct / Edit Payment Handler (Fixing mistakes) ─────────────────────
  const handleEditPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentForEditPayment) return;

    const newAmount = Math.max(0, Number(editPaidAmount) || 0);
    const stuId = selectedStudentForEditPayment.id;
    const oldPaid = Number(selectedStudentForEditPayment.tuitionPaid) || 0;

    // 1. Update tuitionPaid in AppContext and database
    if (updateStudent) {
      updateStudent(stuId, { tuitionPaid: newAmount });
    }

    // 2. Add correction entry to payment history
    const existingHistory = paymentHistory[stuId] || [];
    const diff = newAmount - oldPaid;
    const diffText = diff > 0 ? `+${diff}` : `${diff}`;
    const correctionEntry = {
      id: `CORR-${Date.now()}`,
      amount: newAmount,
      diff: diff,
      date: new Date().toISOString().split('T')[0],
      desc: `✏️ تصحيح دفعة: ${editPaidReason.trim() || 'تصحيح خطأ مالي'} (السابق: $${oldPaid} ← الجديد: $${newAmount} USD [${diffText}])`,
      method: 'adjustment',
      isCorrection: true
    };
    const updatedHistory = {
      ...paymentHistory,
      [stuId]: [correctionEntry, ...existingHistory]
    };
    savePaymentHistory(updatedHistory);

    // 3. Reset and show feedback
    setSelectedStudentForEditPayment(null);
    setEditPaidAmount('');
    setEditPaidReason('تصحيح خطأ في تسجيل الدفعة');
    setEditSuccessMsg(isAr ? `تم تعديل وتصحيح الدفعة للطالب بنجاح! المبلغ المدفوع الحالي: $${newAmount} USD` : `Payment corrected successfully! Current paid: $${newAmount} USD`);
    setTimeout(() => setEditSuccessMsg(''), 4000);
  };

  const handleSendIndividualReminder = (stu) => {
    const totalUSD = Number(stu.tuitionTotal) || 600;
    const adminUSD = Number(stu.adminFees) || 0;
    const transportUSD = stu.hasTransport ? (Number(stu.transportFee) || 0) : 0;
    const discountUSD = Number(stu.tuitionDiscount) || 0;
    const paidUSD = Number(stu.tuitionPaid) || 0;
    const remUSD = Math.max(0, totalUSD + adminUSD + transportUSD - discountUSD - paidUSD);

    addMessage({
      title: `تذكير مالي - قسط الطالب ${stu.name} ($ USD)`,
      titleEn: `Financial Reminder - Tuition for ${stu.nameEn} ($ USD)`,
      content: `نود تذكيركم بوجود قسط متبقي بقيمة $${remUSD.toLocaleString()} USD. نرجو السداد عبر Fresh USD أو OMT / Whish.`,
      contentEn: `Reminder: Student remaining tuition balance is $${remUSD.toLocaleString()} USD. Please settle via Fresh USD or OMT / Whish.`,
      targetType: 'student',
      targetValue: stu.name,
      category: 'financial',
      priority: 'urgent'
    });
    alert(isAr ? 'تم إرسال مطالبة مالية خاصة بالدولار لولي الأمر!' : 'Sent individual USD tuition reminder!');
  };

  const handleSendWhatsAppReminder = (stu) => {
    const parentPhone = stu.parentPhone || stu.phone || '+961 70 000 000';
    const msg = isAr
      ? `الى ولي امر التلميذ ( ${stu.name} ) نود تذكيركم بضرورة تسديد القسط الشهري المستحق يرجى التسديد في اقرب وقت شاكرين تعاونكم الكريم`
      : `To the parent of student (${stu.nameEn || stu.name}), we kindly remind you to settle the due monthly tuition payment at your earliest convenience. Thank you for your cooperation!`;
    openWhatsAppMessage(parentPhone, msg);
  };

  const handleExportTuitionExcel = () => {
    const headers = [
      'معرف الطالب',
      'اسم الطالب',
      'الصف والدراسة',
      'القسط الأساسي ($ USD)',
      'الخصومات ($ USD)',
      'المصاريف الإدارية ($ USD)',
      'المبلغ المقبوض ($ USD)',
      'المتبقي المستحق ($ USD)',
      'اسم ولي الأمر',
      'هاتف ولي الأمر',
      'حالة القسط'
    ];

    const dataRows = safeStudents.map(s => {
      const total = Number(s.tuitionTotal || 600);
      const adminFees = Number(s.adminFees || 0);
      const transportFee = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
      const discount = Number(s.tuitionDiscount || 0);
      const paid = Number(s.tuitionPaid || 0);
      const remaining = Math.max(0, total + adminFees + transportFee - discount - paid);
      const status = remaining === 0 ? 'مسدد بالكامل' : 'يوجد قسط متبقي';
      return [
        s.id,
        isAr ? s.name : s.nameEn,
        `${isAr ? s.grade : s.gradeEn} (${s.classRoom})`,
        total,
        discount,
        paid,
        remaining,
        s.parentName || 'غير مححدد',
        s.parentPhone || 'غير محدد',
        status
      ];
    });

    exportToExcelCSV(`kashf-aqsat-${new Date().toISOString().slice(0,10)}.csv`, headers, dataRows);
  };

  const handleSendWhatsAppReceipt = (stuName, parentPhone, amountPaid, remainingUSD) => {
    const msg = isAr
      ? `مرحباً ولي أمر الطالب (${stuName}) 🌸\nنود إعلامكم باستلام دفعة مالية بقيمة $${amountPaid} USD من القسط المدرسي.\nالمتبقي المستحق: $${remainingUSD} USD.\nشكراً لتعاونكم مع مدرسة الدعم التعليمي.`
      : `Dear parent of ${stuName}, we received tuition payment of $${amountPaid} USD. Remaining balance: $${remainingUSD} USD. Thank you!`;
    
    openWhatsAppMessage(parentPhone || '+961 70 000 000', msg);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">

      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('tuitionTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إدخال الدفعات وسداد الأقساط بالدولار مع الخصم المباشر والإصدار الآلي للإيصالات الرسمية."
                : "Record student tuition payments with instant balance deduction & official receipt generation."}
            </p>
          </div>
        </div>

        {/* Financial Metrics + Exchange Rate Banner */}
        {currentRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportTuitionExcel}
              className="btn-mustard px-4 py-2 rounded-2xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
              title="تصدير جدول كافة الأقساط كملف اكسل"
            >
              <span>تصدير كشف الأقساط Excel 📊</span>
            </button>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 rounded-2xl">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">{t('remainingAmount')} الإجمالي</span>
                  <span className="text-sm font-extrabold text-[#0284C7] font-mono">${totalRemainingUSD.toLocaleString()} USD</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Notification Toast */}
      {(successToast || editSuccessMsg) && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{editSuccessMsg || `${t('paymentSuccess')} — تم خصم الدفعة من المتبقي فوراً!`}</span>
        </div>
      )}

      {/* Student View: Current Student Tuition Card */}
      {(currentRole === 'student' || currentRole === 'parent') && currentStudent && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm text-[#0F172A] relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#0284C7]">
                {isAr ? currentStudent.name : currentStudent.nameEn}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? currentStudent.grade : currentStudent.gradeEn} | ID: {currentStudent.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentRole !== 'student' && (
                <button
                  onClick={() => {
                    const transportFee = currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0;
                    const receipt = {
                      receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
                      date: new Date().toISOString().split('T')[0],
                      studentName: isAr ? currentStudent.name : currentStudent.nameEn,
                      grade: isAr ? currentStudent.grade : currentStudent.gradeEn,
                      amountUSD: currentStudent.tuitionPaid,
                      amountLBP: 0,
                      method: 'fresh_cash',
                      remainingUSD: Math.max(0, (currentStudent.tuitionTotal || 600) + (currentStudent.adminFees || 0) + transportFee - (currentStudent.tuitionDiscount || 0) - (currentStudent.tuitionPaid || 0))
                    };
                    setShowReceiptModal(receipt);
                  }}
                  className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#0284C7]" />
                  <span>طباعة الإيصال 🖨️</span>
                </button>
              )}

              <button
                onClick={() => setSelectedStudentForPay(currentStudent)}
                className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>تسديد دفعة مالية 💰</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{t('totalTuition')}</span>
              <span className="text-xl font-black text-[#0F172A] mt-1 block font-mono">${(currentStudent.tuitionTotal || 600).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'رسوم النقل' : 'Bus Fee'}</span>
              <span className="text-xl font-black text-sky-600 mt-1 block font-mono">${(currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'المصاريف الإدارية' : 'Admin Fees'}</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">+${(currentStudent.adminFees || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'الخصومات والمنح' : 'Discounts'}</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">-${(currentStudent.tuitionDiscount || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{t('paidAmount')}</span>
              <span className="text-xl font-black text-[#0284C7] mt-1 block font-mono">${(currentStudent.tuitionPaid || 0).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-red-300">
              <span className="text-xs text-red-600 block font-bold">{t('remainingAmount')}</span>
              <span className="text-xl font-black text-red-600 mt-1 block font-mono">${Math.max(0, (currentStudent.tuitionTotal || 600) + (currentStudent.adminFees || 0) + (currentStudent.hasTransport ? (Number(currentStudent.transportFee) || 0) : 0) - (currentStudent.tuitionDiscount || 0) - (currentStudent.tuitionPaid || 0)).toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin View: All Students Tuition Roster Grid */}
      {currentRole === 'admin' && (
        <div className="space-y-6">
          {/* Overdue Tuition Warning Block (Visible after the 5th of the month) */}
          {isOverduePeriod && (
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800/40 p-5 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="text-sm font-black">{isAr ? 'قائمة الذمم والأقساط المتأخرة المستحقة (مستحقة بعد تاريخ 5)' : 'Overdue Tuition Dues List (Due after the 5th of the month)'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold">{isAr ? 'تظهر هذه القائمة تلقائياً لوجود مستحقات مالية غير مسددة بعد تاريخ 5 من الشهر الجاري.' : 'List of students with remaining tuition due after the 5th of this month.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {safeStudents.filter(s => {
                  if (s.frozen) return false; // Frozen accounts are excluded from overdue reminders & dues list
                  const total = Number(s.tuitionTotal) || 600;
                  const discount = Number(s.tuitionDiscount) || 0;
                  const paid = Number(s.tuitionPaid) || 0;
                  return (total - discount - paid) > 0;
                }).map(stu => {
                  const totalUSD = Number(stu.tuitionTotal) || 600;
                  const discountUSD = Number(stu.tuitionDiscount) || 0;
                  const paidUSD = Number(stu.tuitionPaid) || 0;
                  const remUSD = Math.max(0, totalUSD - discountUSD - paidUSD);

                  return (
                    <div key={stu.id} className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/50 p-3 rounded-2xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0 border border-red-300">
                          {(stu.name || 'ط')[0]}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{isAr ? stu.name : stu.nameEn}</h4>
                          <span className="text-[10px] text-red-500 font-extrabold block font-mono">
                            ${remUSD} USD
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendWhatsAppReminder(stu)}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="إرسال تذكير مالي بالواتساب"
                      >
                        <span>تذكير 📲</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
            <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3">
              {isAr ? 'كشف كافة أقساط الطلاب والدفعات المباشرة' : 'Student Tuition Roster & Direct Payments'}
            </h3>

          {safeStudents.length === 0 && (
            <div className="text-center py-10 text-slate-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد طلاب مسجلون بعد</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeStudents.map((stu) => {
              const totalUSD    = Number(stu.tuitionTotal) || 600;
              const adminUSD    = Number(stu.adminFees) || 0;
              const discountUSD = Number(stu.tuitionDiscount) || 0;
              const paidUSD     = Number(stu.tuitionPaid) || 0;
              const remUSD      = Math.max(0, totalUSD + adminUSD - discountUSD - paidUSD);
              const history     = paymentHistory[stu.id] || [];

              return (
                <div key={stu.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3 shadow-sm hover:border-[#0284C7]/50 transition-all">
                  {/* Student Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#0284C7]/10 text-[#0284C7] font-black text-xs flex items-center justify-center shrink-0 border border-[#0284C7]">
                        {(stu.name || 'ط')[0]}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-[#0F172A] truncate">{isAr ? stu.name : stu.nameEn}</h4>
                        <span className="text-[10px] text-slate-500 block">{isAr ? stu.grade : stu.gradeEn}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      stu.frozen 
                        ? 'bg-cyan-50 text-cyan-800 border border-cyan-300 font-black' 
                        : remUSD === 0 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                        : 'bg-red-50 text-red-700 border border-red-300'
                    }`}>
                      {stu.frozen ? (isAr ? '❄️ حساب مجمد (موقوف عن المتأخرات)' : '❄️ Frozen Account') : remUSD === 0 ? (isAr ? '✅ مسدد' : '✅ Paid') : `$${remUSD} USD`}
                    </span>
                  </div>

                  {/* Financial Figures */}
                  <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100 font-mono text-right">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">{t('totalTuition')}:</span>
                      <span className="font-bold text-[#0F172A]">${totalUSD} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">{isAr ? 'المصاريف الإدارية:' : 'Admin Fees:'}</span>
                      <span className="font-bold text-amber-600">+${adminUSD} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">{isAr ? 'الخصومات الممنوحة:' : 'Discount:'}</span>
                      <span className="font-bold text-emerald-600">-${discountUSD} USD</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{t('paidAmount')}:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#0284C7]">${paidUSD} USD</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForEditPayment(stu);
                            setEditPaidAmount((stu.tuitionPaid || 0).toString());
                            setEditPaidReason('تصحيح خطأ في تسجيل الدفعة');
                          }}
                          className="text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200 cursor-pointer font-bold transition-colors flex items-center gap-0.5"
                          title="تعديل أو تصحيح الدفعة في حال حدوث خطأ"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>تعديل</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span className="text-red-500 font-sans font-bold">{t('remainingAmount')}:</span>
                      <span className="font-black text-red-600 text-sm">${remUSD} USD</span>
                    </div>
                  </div>

                  {/* Payment History Log */}
                  {history.length > 0 && (
                    <div className="bg-white border border-slate-100 rounded-xl p-2.5 space-y-1.5 max-h-36 overflow-y-auto">
                      <p className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> سجل الدفعات المسددة ({history.length})
                      </p>
                      {history.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <div>
                            <span className="font-bold block">{entry.desc} — ${entry.amount} USD</span>
                            <span className="text-[9px] text-emerald-600">{entry.date} • {entry.method === 'fresh_cash' ? 'نقداً' : 'تحويل'}</span>
                          </div>
                          <button onClick={() => handleDeleteHistoryEntry(stu.id, entry.id, entry.amount)}
                            className="text-emerald-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="حذف القيد وخصمه من المدفوع">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-1.5 flex-wrap">
                    <button onClick={() => handleSendWhatsAppReceipt(isAr ? stu.name : stu.nameEn, stu.parentPhone, paidUSD, remUSD)}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="إرسال إشعار استلام مالي بالواتساب">
                      <span>واتساب إيصال 📲</span>
                    </button>

                    <button onClick={() => handleSendWhatsAppReminder(stu)}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="إرسال رسالة تذكير مالي بالواتساب">
                      <span>واتساب تذكير 📲</span>
                    </button>

                    <button onClick={() => {
                      const receipt = {
                        receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
                        date: new Date().toISOString().split('T')[0],
                        studentName: isAr ? stu.name : stu.nameEn,
                        grade: isAr ? stu.grade : stu.gradeEn,
                        amountUSD: paidUSD,
                        amountLBP: 0,
                        method: 'fresh_cash',
                        remainingUSD: remUSD
                      };
                      setShowReceiptModal(receipt);
                    }}
                      className="py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-sm">
                      <Printer className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>الإيصال 🖨️</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForEditPayment(stu);
                        setEditPaidAmount((stu.tuitionPaid || 0).toString());
                        setEditPaidReason('تصحيح خطأ في تسجيل الدفعة');
                      }}
                      className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow"
                      title="تعديل أو تصحيح الدفعة في حال حدوث خطأ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل الدفعة ✏️</span>
                    </button>

                    <button onClick={() => setSelectedStudentForPay(stu)}
                      className="btn-mustard py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>إدخال دفعة 💰</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {/* ── Direct Payment Modal (Immediate Deduction) ─────────────────────────── */}
      {selectedStudentForPay && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleDirectPaySubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0284C7]" />
                <span>إدخال دفعة وتسديد مباشر — {isAr ? selectedStudentForPay.name : selectedStudentForPay.nameEn}</span>
              </h3>
              <button type="button" onClick={() => setSelectedStudentForPay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">المبلغ المدفوع ($ USD) <span className="text-red-500">*</span></label>
              <input type="number" required min="1"
                max={Math.max(1, (selectedStudentForPay.tuitionTotal || 600) - (selectedStudentForPay.tuitionPaid || 0))}
                value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                placeholder="مثال: 100 أو 200..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]" />
              {payAmount && (
                <span className="text-[10px] text-[#0284C7] font-mono font-bold block pt-0.5">
                  ⚡ سيتم الخصم مباشرة من المبلغ المتبقي المستحق!
                </span>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">بيان / وصف الدفعة</label>
              <input type="text" value={payDesc} onChange={(e) => setPayDesc(e.target.value)}
                placeholder="مثال: الدفعة الأولى - قسط شهر 7..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t('paymentMethod')}</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold">
                <option value="fresh_cash">💵 Fresh Cash USD (نقداً بالمدرسة)</option>
                <option value="omt">📲 OMT / Whish Money (تحويل مالي)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedStudentForPay(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <Check className="w-4 h-4" /> تأكيد خصم الدفعة والإيصال 🧾
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Edit / Correct Payment Modal (Fixing Errors) ────────────────────── */}
      {selectedStudentForEditPayment && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleEditPaymentSubmit}
            className="bg-white border-2 border-amber-500 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto text-right">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button 
                type="button" 
                onClick={() => setSelectedStudentForEditPayment(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-xs">
                  ✏️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                    <span>تعديل الدفعة وتصحيح الخطأ المالي</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {isAr ? selectedStudentForEditPayment.name : selectedStudentForEditPayment.nameEn} ({selectedStudentForEditPayment.grade})
                  </p>
                </div>
              </div>
            </div>

            {/* Error correction notice */}
            <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl text-[11px] text-amber-900 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>نافذة تصحيح الأخطاء المالية:</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                في حال تم إدخال دفعة لطالب بالخطأ، أو تم تسجيل مبلغ غير صحيح، يمكنك تصحيح إجمالي المبلغ المقبوض فوراً، وسيتم إعادة احتساب الرصيد المتبقي تلقائياً.
              </p>
            </div>

            {/* Current Financial State Display */}
            {(() => {
              const trans = selectedStudentForEditPayment.hasTransport ? (Number(selectedStudentForEditPayment.transportFee) || 0) : 0;
              const stuTuitionVal = selectedStudentForEditPayment.isSpecialCase ? 0 : (selectedStudentForEditPayment.tuitionTotal ?? 700);
              const adminVal = Number(selectedStudentForEditPayment.adminFees) || 0;
              const discVal = Number(selectedStudentForEditPayment.tuitionDiscount) || 0;
              const totalRequired = Math.max(0, Number(stuTuitionVal) + trans + adminVal - discVal);
              const currentPaid = Number(selectedStudentForEditPayment.tuitionPaid) || 0;
              const parsedNewPaid = Number(editPaidAmount) || 0;
              const newRemaining = Math.max(0, totalRequired - parsedNewPaid);

              // Find last payment entry for quick undo
              const stuHistory = paymentHistory[selectedStudentForEditPayment.id] || [];
              const lastPayment = stuHistory.length > 0 ? stuHistory[0] : null;

              return (
                <>
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-sans block text-[9px]">الصافي المطلوب:</span>
                      <span className="font-black text-[#0F172A]">${totalRequired}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-slate-400 font-sans block text-[9px]">المقبوض الحالي:</span>
                      <span className="font-black text-[#0284C7]">${currentPaid}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <span className="text-red-500 font-sans block text-[9px] font-bold">المتبقي بعد التعديل:</span>
                      <span className="font-black text-red-600">${newRemaining}</span>
                    </div>
                  </div>

                  {/* Input for the corrected paid amount */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">
                        المبلغ المقبوض الصحيح ($ USD) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-amber-700 font-mono font-bold">
                        {parsedNewPaid !== currentPaid && `الفارق: ${parsedNewPaid - currentPaid > 0 ? `+${parsedNewPaid - currentPaid}` : `${parsedNewPaid - currentPaid}`} $`}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editPaidAmount}
                      onChange={(e) => setEditPaidAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 border-2 border-amber-400 text-[#0F172A] rounded-xl px-4 py-2.5 text-base font-mono font-black focus:outline-none focus:border-amber-600 text-center"
                      autoFocus
                    />
                  </div>

                  {/* Quick Shortcut / Correction Buttons */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 block">إجراءات سريعة لتصحيح الخطأ بنقرة واحدة:</span>
                    <div className="grid grid-cols-3 gap-2 text-xs font-sans">
                      <button
                        type="button"
                        onClick={() => setEditPaidAmount('0')}
                        className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold cursor-pointer transition-colors text-center text-[10px]"
                        title="إلغاء المبلغ المقبوض بالكامل وجعله 0$ في حال تم إدخاله لطالب خاطئ"
                      >
                        🚫 تصفير المدفوع (0$)
                      </button>

                      {lastPayment && (
                        <button
                          type="button"
                          onClick={() => {
                            const withoutLast = Math.max(0, currentPaid - (Number(lastPayment.amount) || 0));
                            setEditPaidAmount(withoutLast.toString());
                            setEditPaidReason(`تراجع عن آخر دفعة (${lastPayment.amount}$) بسبب الخطأ`);
                          }}
                          className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold cursor-pointer transition-colors text-center text-[10px]"
                          title="خصم آخر دفعة تم تسجيلها"
                        >
                          ↩️ إلغاء آخر دفعة (-${lastPayment.amount}$)
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setEditPaidAmount(totalRequired.toString())}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold cursor-pointer transition-colors text-center text-[10px]"
                        title="تسديد كامل القسط الصافي"
                      >
                        ✅ تسديد كامل (${totalRequired})
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Reason / Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">سبب التعديل / ملاحظات التصحيح</label>
              <input
                type="text"
                value={editPaidReason}
                onChange={(e) => setEditPaidReason(e.target.value)}
                placeholder="مثال: تصحيح خطأ إدخال دفعة 50$ بدلاً من 100$..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStudentForEditPayment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>حفظ التعديل وتصحيح الرصيد 💾</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Receipt Modal (Guaranteed 1 Page Print) ─────────────────────────── */}
      {showReceiptModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto receipt-print-backdrop">
          <div className="receipt-printable-card border-2 border-[#0284C7] rounded-3xl p-5 sm:p-7 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up relative my-auto">
            
            <style>{`
              /* On Screen Styles (Normal Light/Dark Mode) */
              @media screen {
                .receipt-printable-card {
                  background-color: #ffffff;
                  color: #0f172a;
                }
                html.dark .receipt-printable-card {
                  background-color: #1e293b !important;
                  color: #f8fafc !important;
                  border-color: #38bdf8 !important;
                }
                
                .receipt-details-box {
                  background-color: #f8fafc;
                }
                html.dark .receipt-details-box {
                  background-color: #0f172a !important;
                }

                .receipt-stamp-badge {
                  background-color: rgba(2, 132, 199, 0.1);
                  color: #0284c7;
                }
                html.dark .receipt-stamp-badge {
                  background-color: rgba(56, 189, 248, 0.15) !important;
                  color: #38bdf8 !important;
                }
              }

              /* On Print Styles (Forces absolute black/white receipt look) */
              @media print {
                html, html.dark, body, html.dark body, 
                .receipt-print-backdrop, .receipt-printable-card, .receipt-printable-card * {
                  color-scheme: light !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                body > #root {
                  display: none !important;
                }

                body {
                  background-color: #ffffff !important;
                  background: #ffffff !important;
                  color: #000000 !important;
                }

                .receipt-print-backdrop, html.dark .receipt-print-backdrop {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  background: #ffffff !important;
                  background-color: #ffffff !important;
                  backdrop-filter: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  z-index: 999999 !important;
                  box-shadow: none !important;
                }

                .receipt-printable-card, html.dark .receipt-printable-card {
                  border: 1px solid #000000 !important;
                  box-shadow: none !important;
                  margin: auto !important;
                  padding: 24px !important;
                  background: #ffffff !important;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  width: 100% !important;
                  max-width: 480px !important;
                  border-radius: 0px !important;
                }

                .receipt-details-box {
                  background: transparent !important;
                  background-color: transparent !important;
                  border: 1px solid #cbd5e1 !important;
                }

                /* Force absolute black text and transparent background on all inner elements */
                .receipt-printable-card div,
                .receipt-printable-card span,
                .receipt-printable-card p,
                .receipt-printable-card h3,
                .receipt-printable-card img {
                  color: #000000 !important;
                  background: transparent !important;
                  background-color: transparent !important;
                }
                
                .receipt-printable-card div, .receipt-printable-card span {
                  border-color: #000000 !important;
                }

                .receipt-stamp-badge {
                  background: transparent !important;
                  background-color: transparent !important;
                  color: #000000 !important;
                  border-color: #000000 !important;
                }

                .no-print {
                  display: none !important;
                }
              }
            `}</style>
            
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-[#0284C7] shadow-sm overflow-hidden shrink-0">
                  <img src="/emblem.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0284C7] leading-tight">
                    {isAr ? (siteSettings?.schoolName || 'مدرسة الدعم التعليمي') : (siteSettings?.schoolNameEn || 'Educational Support School')}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold block">إيصال استلام مالي رسمي • Official Payment Receipt</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => window.print()}
                  className="no-print bg-[#0284C7] hover:bg-[#0369A1] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer">
                  <Printer className="w-3.5 h-3.5" /> طباعة 🖨️
                </button>
                <button onClick={() => setShowReceiptModal(null)}
                  className="no-print w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer">✕</button>
              </div>
            </div>

            <div className="receipt-details-box p-4 rounded-2xl border border-[#E2E8F0] space-y-2.5 text-xs font-mono">
              {[
                [isAr ? 'رقم الإيصال:' : 'Receipt No:', showReceiptModal.receiptNo, 'text-[#0284C7]'],
                [isAr ? 'تاريخ الاستلام:' : 'Payment Date:', showReceiptModal.date, 'text-slate-700'],
                [isAr ? 'اسم الطالب:' : 'Student Name:', showReceiptModal.studentName, 'text-[#0F172A] text-sm'],
                [isAr ? 'الصف / الشعبة:' : 'Grade:', showReceiptModal.grade, 'text-slate-700'],
                [isAr ? 'طريقة الدفع:' : 'Payment Method:', showReceiptModal.method === 'fresh_cash' ? 'Fresh Cash USD' : 'OMT / Whish Transfer', 'text-slate-800'],
                [isAr ? 'المبلغ المدفوع بالدولار:' : 'Paid (USD):', `$${showReceiptModal.amountUSD} USD`, 'text-emerald-600 text-sm'],
                [isAr ? 'القسط المتبقي:' : 'Remaining Balance:', `$${showReceiptModal.remainingUSD} USD`, 'text-red-600'],
              ].map(([label, val, cls], i) => (
                <div key={i} className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-500">{label}</span>
                  <span className={`font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              <div>
                <p className="font-bold">{isAr ? 'توقيع المحاسب / الإدارة:' : 'Accountant Signature:'}</p>
                <div className="h-7 border-b border-slate-300 w-32 mt-1" />
              </div>
              <span className="px-3 py-1 rounded-full receipt-stamp-badge font-black text-[10px] border border-[#0284C7]/20">
                {isAr ? 'ختم المدرسة الرسمي 💮' : 'Official School Stamp'}
              </span>
            </div>

            <div className="no-print flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => setShowReceiptModal(null)} className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer">{t('close')}</button>
              <button onClick={() => window.print()} className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md transition-all">
                <Printer className="w-4 h-4 text-white" /> طباعة الإيصال 🖨️
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
