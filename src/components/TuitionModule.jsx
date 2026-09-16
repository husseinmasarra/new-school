import React, { useState, useMemo } from 'react';
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
  AlertTriangle,
  Search,
  Users
} from 'lucide-react';

export const TuitionModule = () => {
  const { lang, t, currentRole, students = [], payTuition, updateStudent, selectedStudentId, addMessage, siteSettings, verifyAdminPassword } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];

  // Read exchange rate from settings, fallback 89500
  const LBP_RATE = Number(siteSettings?.exchangeRate) || 89500;

  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Payment History Log State (stored in localStorage)
  const [paymentHistory, setPaymentHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school_payment_history') || '{}'); }
    catch { return {}; }
  });

  // Family Payment Modal States
  const [selectedFamilyForPay, setSelectedFamilyForPay] = useState(null); // family obj for direct payment
  const [memberDeductions, setMemberDeductions] = useState({}); // { [studentId]: amount }
  const [distributionMode, setDistributionMode] = useState('waterfall'); // 'waterfall' | 'equal' | 'custom'
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc]     = useState('دفعة من القسط المدرسي');
  const [payMethod, setPayMethod] = useState('fresh_cash');

  // Edit/Correct Payment States
  const [selectedStudentForEditPayment, setSelectedStudentForEditPayment] = useState(null);
  const [editPaidAmount, setEditPaidAmount] = useState('');
  const [editPaidReason, setEditPaidReason] = useState('تصحيح خطأ في تسجيل الدفعة');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  const [showReceiptModal, setShowReceiptModal] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Active student for Parent / Student View
  const currentStudent = safeStudents.find((s) => s.id === selectedStudentId) || safeStudents[0];
  const isOverduePeriod = new Date().getDate() > 5;

  // Helpers to strictly enforce 0 account balance for special cases
  const getStudentTuitionTotal = (s) => (s?.isSpecialCase ? 0 : (s?.tuitionTotal !== undefined && s?.tuitionTotal !== null && s?.tuitionTotal !== '' ? Number(s.tuitionTotal) : 600));
  const getStudentAdminFees = (s) => (s?.isSpecialCase ? 0 : Number(s?.adminFees || 0));
  const getStudentTransportFee = (s) => (s?.isSpecialCase ? 0 : (s?.hasTransport ? Number(s?.transportFee || 0) : 0));
  const getStudentDiscount = (s) => (s?.isSpecialCase ? 0 : Number(s?.tuitionDiscount || 0));
  const getStudentPaid = (s) => (s?.isSpecialCase ? 0 : Number(s?.tuitionPaid || 0));
  const getStudentRemaining = (s) => {
    if (s?.isSpecialCase) return 0;
    const tot = getStudentTuitionTotal(s);
    const adm = getStudentAdminFees(s);
    const trs = getStudentTransportFee(s);
    const disc = getStudentDiscount(s);
    const paid = getStudentPaid(s);
    return Math.max(0, tot + adm + trs - disc - paid);
  };

  // Admin Financial Metrics in USD (Frozen accounts and special cases are excluded from active overdue dues)
  const activeStudents = safeStudents.filter((s) => !s?.frozen && !s?.isSpecialCase);
  const totalTuitionUSD   = safeStudents.reduce((sum, s) => sum + getStudentTuitionTotal(s), 0);
  const totalAdminFeesUSD = safeStudents.reduce((sum, s) => sum + getStudentAdminFees(s), 0);
  const totalTransportFeesUSD = safeStudents.reduce((sum, s) => sum + getStudentTransportFee(s), 0);
  const totalDiscountUSD  = safeStudents.reduce((sum, s) => sum + getStudentDiscount(s), 0);
  const totalPaidUSD      = safeStudents.reduce((sum, s) => sum + getStudentPaid(s), 0);
  
  // Total overdue dues only includes active non-frozen students
  const totalRemainingUSD = activeStudents.reduce((sum, s) => sum + getStudentRemaining(s), 0);

  const savePaymentHistory = (updated) => {
    setPaymentHistory(updated);
    localStorage.setItem('school_payment_history', JSON.stringify(updated));
  };

  // Helper to extract a normalized family key (linking siblings under one family)
  const getStudentFamilyKey = (student) => {
    // 1. If student has explicit familyId, group strictly by that familyId
    if (student.familyId && String(student.familyId).trim()) {
      return `fam_${String(student.familyId).trim()}`;
    }

    // 2. Never merge students into old cards by generic/dummy phone or generic parent name!
    const rawPhone = (student.parentPhone || student.phone || '').replace(/[^0-9]/g, '');
    const isGenericPhone = !rawPhone || rawPhone === '96103123456' || rawPhone === '123456' || rawPhone.length < 8;
    
    const pName = (student.parentName || '').trim().toLowerCase();
    const isGenericParent = !pName || pName.startsWith('والد الطالب') || pName.startsWith('parent of');

    // Only group if BOTH a specific custom phone AND an identical parent name exist AND familyName matches
    if (!isGenericPhone && !isGenericParent && student.familyName) {
      return `family_${student.familyName.trim().toLowerCase()}_${rawPhone}`;
    }

    // 3. Otherwise, each student has their own distinct separate card!
    return `stu_${student.id}`;
  };

  // Group unique families across all students
  const allFamilies = useMemo(() => {
    const map = {};
    (safeStudents || []).forEach(stu => {
      const fKey = getStudentFamilyKey(stu);
      if (!map[fKey]) {
        map[fKey] = {
          key: fKey,
          familyId: stu.familyId || fKey,
          familyName: stu.familyName || (stu.parentName ? `عائلة ${stu.parentName.split(' ').slice(-1)[0] || stu.parentName}` : `عائلة الطالب ${stu.name}`),
          parentName: stu.parentName || `والد الطالب ${stu.name}`,
          parentPhone: (stu.parentPhone || stu.phone || '').trim(),
          motherPhone: stu.motherPhone || '',
          isSpecialCase: Boolean(stu.isSpecialCase),
          members: []
        };
      }
      if (stu.isSpecialCase) {
        map[fKey].isSpecialCase = true;
      }
      map[fKey].members.push(stu);
    });
    return Object.values(map);
  }, [safeStudents]);

  // Filtered families based on search term
  const filteredFamilies = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allFamilies;
    return allFamilies.filter(fam => {
      const matchFamily = (fam.familyName || '').toLowerCase().includes(term) ||
                          (fam.parentName || '').toLowerCase().includes(term) ||
                          (fam.parentPhone || '').toLowerCase().includes(term) ||
                          (fam.motherPhone || '').toLowerCase().includes(term);
      const matchMember = (fam.members || []).some(m => 
        (m.name || '').toLowerCase().includes(term) ||
        (m.nameEn || '').toLowerCase().includes(term) ||
        (m.grade || '').toLowerCase().includes(term) ||
        (m.classRoom || '').toLowerCase().includes(term) ||
        (m.id || '').toLowerCase().includes(term)
      );
      return matchFamily || matchMember;
    });
  }, [allFamilies, searchTerm]);

  // Recalculate automatic deduction per sibling
  const updateFamilyDeductions = (amount, mode, currentFam) => {
    const fam = currentFam || selectedFamilyForPay;
    if (!fam) return;
    const totalAmount = Math.max(0, Number(amount) || 0);
    const eligibleMembers = (fam.members || []).filter(m => !m.isSpecialCase);

    if (eligibleMembers.length === 0) {
      setMemberDeductions({});
      return;
    }

    if (mode === 'waterfall') {
      let remToDistribute = totalAmount;
      const deductions = {};
      eligibleMembers.forEach(m => {
        const debt = getStudentRemaining(m);
        if (debt > 0 && remToDistribute > 0) {
          const alloc = Math.min(debt, remToDistribute);
          deductions[m.id] = alloc;
          remToDistribute -= alloc;
        } else {
          deductions[m.id] = 0;
        }
      });
      if (remToDistribute > 0 && eligibleMembers.length > 0) {
        deductions[eligibleMembers[0].id] = (deductions[eligibleMembers[0].id] || 0) + remToDistribute;
      }
      setMemberDeductions(deductions);
    } else if (mode === 'equal') {
      const withDebt = eligibleMembers.filter(m => getStudentRemaining(m) > 0);
      const targetList = withDebt.length > 0 ? withDebt : eligibleMembers;
      const splitAmount = Math.floor(totalAmount / targetList.length);
      const remainder = totalAmount % targetList.length;

      const deductions = {};
      eligibleMembers.forEach(m => { deductions[m.id] = 0; });
      targetList.forEach((m, idx) => {
        deductions[m.id] = splitAmount + (idx === 0 ? remainder : 0);
      });
      setMemberDeductions(deductions);
    }
  };

  const handleIndividualDeductionChange = (stuId, val) => {
    setDistributionMode('custom');
    const updated = {
      ...memberDeductions,
      [stuId]: Math.max(0, Number(val) || 0)
    };
    setMemberDeductions(updated);
    const newTotal = Object.values(updated).reduce((sum, v) => sum + Number(v || 0), 0);
    setPayAmount(newTotal.toString());
  };

  // Open Family Direct Payment Modal
  const handleOpenFamilyPayModal = (fam) => {
    if (fam.isSpecialCase) {
      alert(isAr ? '⭐ هذه العائلة مصنفة ضمن «الحالات الخاصة» وحساباتها معفية بالكامل (0$)!' : 'This family is exempt from tuition ($0)!');
      return;
    }
    const famRem = fam.members.reduce((sum, m) => sum + getStudentRemaining(m), 0);
    if (famRem <= 0) {
      alert(isAr ? '✅ هذه العائلة مسددة لكافة الأقساط بالكامل وليس عليها أي مبالغ مستحقة!' : 'This family has no remaining dues!');
      return;
    }
    setSelectedFamilyForPay(fam);
    setPayAmount('');
    setPayDesc(isAr ? `دفعة من القسط المدرسي لعائلة ${fam.familyName}` : `Tuition payment for ${fam.familyName}`);
    setPayMethod('fresh_cash');
    setDistributionMode('waterfall');
    setMemberDeductions({});
  };

  // Submit Family Payment with deduction distributed across all siblings
  const handleFamilyPaySubmit = (e) => {
    e.preventDefault();
    if (!selectedFamilyForPay || !payAmount || Number(payAmount) <= 0) return;

    const totalPaidUSD = Number(payAmount);
    const deductions = memberDeductions;
    const paymentDate = new Date().toISOString().split('T')[0];
    const receiptNo = `REC-FAM-${Date.now().toString().slice(-6)}`;

    let newHistory = { ...paymentHistory };
    const receiptMembers = [];

    (selectedFamilyForPay.members || []).forEach(m => {
      const allocated = Number(deductions[m.id] || 0);
      if (allocated > 0) {
        payTuition(m.id, allocated, payMethod);

        const stuHistory = newHistory[m.id] || [];
        const newEntry = {
          id: `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          amount: allocated,
          date: paymentDate,
          desc: `دفعة عائلية موحدة ($${totalPaidUSD}) — حصة التلميذ: $${allocated} USD [${payDesc || 'دفعة قسط'}]`,
          method: payMethod,
          familyReceiptNo: receiptNo
        };
        newHistory[m.id] = [newEntry, ...stuHistory];
      }

      const oldRem = getStudentRemaining(m);
      const newRem = Math.max(0, oldRem - allocated);
      receiptMembers.push({
        id: m.id,
        name: isAr ? m.name : m.nameEn,
        grade: isAr ? m.grade : m.gradeEn,
        classRoom: m.classRoom || 'أ',
        allocated: allocated,
        remaining: m.isSpecialCase ? 0 : newRem
      });
    });

    savePaymentHistory(newHistory);

    const familyRemUSD = receiptMembers.reduce((sum, rm) => sum + rm.remaining, 0);
    const familyReceipt = {
      receiptNo: receiptNo,
      date: paymentDate,
      isFamilyReceipt: true,
      familyName: selectedFamilyForPay.familyName,
      parentName: selectedFamilyForPay.parentName,
      parentPhone: selectedFamilyForPay.parentPhone,
      amountUSD: totalPaidUSD,
      amountLBP: 0,
      method: payMethod,
      remainingUSD: familyRemUSD,
      membersList: receiptMembers
    };

    setPayAmount('');
    setPayDesc('دفعة من القسط المدرسي للعائلة');
    setSelectedFamilyForPay(null);
    setMemberDeductions({});
    setShowReceiptModal(familyReceipt);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  const handleOpenFamilyReceiptView = (fam) => {
    const famPaidUSD = fam.members.reduce((sum, m) => sum + getStudentPaid(m), 0);
    const famRemUSD = fam.isSpecialCase ? 0 : fam.members.reduce((sum, m) => sum + getStudentRemaining(m), 0);
    const receiptMembers = fam.members.map(m => ({
      id: m.id,
      name: isAr ? m.name : m.nameEn,
      grade: isAr ? m.grade : m.gradeEn,
      classRoom: m.classRoom || 'أ',
      allocated: getStudentPaid(m),
      remaining: m.isSpecialCase ? 0 : getStudentRemaining(m)
    }));

    const receipt = {
      receiptNo: `REC-FAM-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      isFamilyReceipt: true,
      familyName: fam.familyName,
      parentName: fam.parentName,
      parentPhone: fam.parentPhone,
      amountUSD: famPaidUSD,
      amountLBP: 0,
      method: 'fresh_cash',
      remainingUSD: famRemUSD,
      membersList: receiptMembers
    };
    setShowReceiptModal(receipt);
  };

  const handleSendFamilyWhatsAppReminder = (fam) => {
    if (fam.isSpecialCase) {
      alert(isAr ? '⭐ هذه العائلة من الحالات الخاصة ومعفاة من الأقساط بالكامل (حسابها 0)!' : 'This family is exempt from tuition!');
      return;
    }
    const parentPhone = fam.parentPhone || fam.members[0]?.parentPhone || fam.members[0]?.phone || '+961 70 000 000';
    const famRemUSD = fam.members.reduce((sum, m) => sum + getStudentRemaining(m), 0);
    if (famRemUSD <= 0) {
      alert(isAr ? '✅ هذه العائلة مسددة لكافة الأقساط بالكامل وليس عليها أي مبالغ متبقية!' : 'This family has settled all dues!');
      return;
    }
    const breakdown = fam.members.map(m => `- ${m.name} (${m.grade}): المتبقي $${getStudentRemaining(m)} USD`).join('\n');
    const msg = `السلام عليكم ورحمة الله وبركاته، ولي أمر الطلاب في (${fam.familyName}):\nنود تذكيركم بضرورة تسديد الأقساط المدرسية المستحقة:\n${breakdown}\nإجمالي المبلغ المتبقي على العائلة: $${famRemUSD.toLocaleString()} USD.\nشاكرين تعاونكم الكريم — مدرسة الدعم التعليمي.`;
    openWhatsAppMessage(parentPhone, msg);
  };

  const handleSendFamilyWhatsAppReceipt = (fam) => {
    const parentPhone = fam.parentPhone || fam.members[0]?.parentPhone || fam.members[0]?.phone || '+961 70 000 000';
    const famPaidUSD = fam.members.reduce((sum, m) => sum + getStudentPaid(m), 0);
    const famRemUSD = fam.isSpecialCase ? 0 : fam.members.reduce((sum, m) => sum + getStudentRemaining(m), 0);
    const breakdown = fam.members.map(m => `- ${m.name} (${m.grade}): المسدد $${getStudentPaid(m)} USD | المتبقي: $${getStudentRemaining(m)} USD`).join('\n');
    const msg = `إشعار استلام مالي رسمي 🧾\nمدرسة الدعم التعليمي الخاصة\nإلى ولي أمر الطلاب في (${fam.familyName}):\nتم توثيق المدفوعات المسددة لأبنائكم الطلبة:\n${breakdown}\nإجمالي المقبوض: $${famPaidUSD.toLocaleString()} USD\nإجمالي المتبقي: $${famRemUSD.toLocaleString()} USD\nشاكرين التزامكم الدائم.`;
    openWhatsAppMessage(parentPhone, msg);
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

    // Security Check: If current user is not logged in as admin, require Admin Password!
    if (currentRole !== 'admin') {
      if (!verifyAdminPassword || !verifyAdminPassword(adminPasswordInput)) {
        setAdminPasswordError(isAr ? 'عذراً! كلمة سر المدير غير صحيحة. تعديل الحسابات حصراً للمدير العام.' : 'Incorrect Admin Password. Account modification is strictly reserved for the Administrator.');
        return;
      }
    }
    setAdminPasswordError('');

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
    if (stu.isSpecialCase) {
      alert(isAr ? 'هذا التلميذ من الحالات الخاصة ومعفى من الأقساط بالكامل (حسابه 0)!' : 'This student is a special case and exempt from tuition (balance 0)!');
      return;
    }
    const totalUSD = getStudentTuitionTotal(stu);
    const adminUSD = getStudentAdminFees(stu);
    const transportUSD = getStudentTransportFee(stu);
    const discountUSD = getStudentDiscount(stu);
    const paidUSD = getStudentPaid(stu);
    const remUSD = getStudentRemaining(stu);

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
    if (stu.isSpecialCase) {
      alert(isAr ? 'هذا التلميذ من الحالات الخاصة ومعفى من الأقساط بالكامل (حسابه 0)!' : 'This student is a special case and exempt from tuition (balance 0)!');
      return;
    }
    const parentPhone = stu.parentPhone || stu.phone || '+961 70 000 000';
    const remUSD = getStudentRemaining(stu);

    let msg = '';
    if (isAr) {
      const template = siteSettings?.tuitionReminderText || 'السلام عليكم ورحمة الله وبركاته ولي امر ( {اسم_التلميذ} ) نود تذكيركم بضرورة تسديد القسط الشهري المستحق يرجى التسديد في اقرب وقت شاكرين تعاونكم الكريم';
      msg = template
        .replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}|\( اسم التلميذ \)/g, stu.name)
        .replace(/\{المبلغ_المستحق\}|\{المبلغ\}/g, `$${remUSD.toLocaleString()}`)
        .replace(/\{الصف\}/g, stu.grade || '');
    } else {
      msg = `Peace be upon you. Dear guardian of student (${stu.nameEn || stu.name}), we kindly remind you to settle the due monthly tuition payment ($${remUSD.toLocaleString()}) at your earliest convenience. Thank you for your cooperation!`;
    }
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
      const isSpec = Boolean(s.isSpecialCase);
      const total = getStudentTuitionTotal(s);
      const adminFees = getStudentAdminFees(s);
      const discount = getStudentDiscount(s);
      const paid = getStudentPaid(s);
      const remaining = getStudentRemaining(s);
      const status = isSpec ? 'حالة خاصة (معفى - 0$)' : remaining === 0 ? 'مسدد بالكامل' : 'يوجد قسط متبقي';
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
                    const receipt = {
                      receiptNo: `REC-LB-${Date.now().toString().slice(-6)}`,
                      date: new Date().toISOString().split('T')[0],
                      studentName: isAr ? currentStudent.name : currentStudent.nameEn,
                      grade: isAr ? currentStudent.grade : currentStudent.gradeEn,
                      amountUSD: getStudentPaid(currentStudent),
                      amountLBP: 0,
                      method: 'fresh_cash',
                      remainingUSD: getStudentRemaining(currentStudent)
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
              <span className="text-xl font-black text-[#0F172A] mt-1 block font-mono">${getStudentTuitionTotal(currentStudent).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'رسوم النقل' : 'Bus Fee'}</span>
              <span className="text-xl font-black text-sky-600 mt-1 block font-mono">${getStudentTransportFee(currentStudent).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'المصاريف الإدارية' : 'Admin Fees'}</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">+${getStudentAdminFees(currentStudent).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{isAr ? 'الخصومات والمنح' : 'Discounts'}</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">-${getStudentDiscount(currentStudent).toLocaleString()} USD</span>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <span className="text-xs text-slate-500 block">{t('paidAmount')}</span>
              <span className="text-xl font-black text-[#0284C7] mt-1 block font-mono">${getStudentPaid(currentStudent).toLocaleString()} USD</span>
            </div>
            <div className={`p-4 rounded-2xl border ${currentStudent?.isSpecialCase ? 'bg-amber-50/60 border-amber-300' : 'bg-[#F8FAFC] border-red-300'}`}>
              <span className={`text-xs block font-bold ${currentStudent?.isSpecialCase ? 'text-amber-800' : 'text-red-600'}`}>
                {currentStudent?.isSpecialCase ? (isAr ? 'حالة الحساب:' : 'Account Status:') : t('remainingAmount')}
              </span>
              <span className={`text-xl font-black mt-1 block font-mono ${currentStudent?.isSpecialCase ? 'text-amber-900 text-sm' : 'text-red-600'}`}>
                {currentStudent?.isSpecialCase ? (isAr ? '⭐ معفى (حالة خاصة)' : '⭐ Special Case') : `$${getStudentRemaining(currentStudent).toLocaleString()} USD`}
              </span>
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
                  <p className="text-[10px] text-slate-500 font-bold">{isAr ? 'تظهر هذه القائمة تلقائياً لوجود مستحقات مالية غير مسددة بعد تاريخ 5 من الشهر الجاري.' : 'List of families with remaining tuition due after the 5th of this month.'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredFamilies.filter(fam => {
                  if (fam.isSpecialCase) return false;
                  return fam.members.some(s => !s.frozen && getStudentRemaining(s) > 0);
                }).map(fam => {
                  const overdueMembers = fam.members.filter(s => !s.frozen && getStudentRemaining(s) > 0);
                  const famOverdueRemaining = overdueMembers.reduce((sum, s) => sum + getStudentRemaining(s), 0);

                  return (
                    <div key={fam.key} className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/50 p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 font-black text-xs flex items-center justify-center shrink-0 border border-red-300">
                          {fam.members.length > 1 ? '👨‍👩‍👧‍👦' : '🎓'}
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{fam.familyName}</h4>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {overdueMembers.map(m => m.name).join('، ')}
                          </span>
                          <span className="text-[11px] text-red-600 font-black block font-mono">
                            ${famOverdueRemaining} USD
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFamilyWhatsAppReminder(fam)}
                        className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                        title="إرسال تذكير مالي بالواتساب لولي الأمر"
                      >
                        <span>تذكير 📲</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unified Family Cards Roster Section */}
          <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A] dark:text-slate-100">
            {/* Header & Live Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0284C7]" />
                  <span>{isAr ? 'كشف كافة أقساط الطلاب والدفعات المباشرة (كروت العائلة الموحدة)' : 'Family Tuition Roster & Direct Payments'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isAr 
                    ? 'يتم تجميع الإخوة معاً في كرت عائلة موحد، وعند إدخال أي دفعة يتم خصمها من كافة الإخوة مباشرة' 
                    : 'Siblings are unified in family cards with direct multi-student payment deduction'}
                </p>
              </div>

              {/* LIVE SEARCH INPUT */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={isAr ? 'بحث باسم التلميذ، ولي الأمر، الهاتف...' : 'Search student, parent, phone...'}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl pr-9 pl-8 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7] text-right"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
              <span>{isAr ? `إجمالي العائلات: ${filteredFamilies.length}` : `Families: ${filteredFamilies.length}`}</span>
              <span>{isAr ? `إجمالي الطلاب: ${filteredFamilies.reduce((sum, f) => sum + f.members.length, 0)} طالب` : `Total students: ${filteredFamilies.reduce((sum, f) => sum + f.members.length, 0)}`}</span>
            </div>

            {filteredFamilies.length === 0 && (
              <div className="text-center py-10 text-slate-400">
                <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">{isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No matching results found'}</p>
              </div>
            )}

            {/* Grid of Unified Family Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredFamilies.map((fam) => {
                const isSpecial = fam.isSpecialCase;
                const famTotalUSD = fam.members.reduce((sum, m) => sum + getStudentTuitionTotal(m), 0);
                const famAdminUSD = fam.members.reduce((sum, m) => sum + getStudentAdminFees(m), 0);
                const famTransportUSD = fam.members.reduce((sum, m) => sum + getStudentTransportFee(m), 0);
                const famDiscountUSD = fam.members.reduce((sum, m) => sum + getStudentDiscount(m), 0);
                const famPaidUSD = fam.members.reduce((sum, m) => sum + getStudentPaid(m), 0);
                const famRemainingUSD = isSpecial ? 0 : Math.max(0, famTotalUSD + famAdminUSD + famTransportUSD - famDiscountUSD - famPaidUSD);

                const hasMultipleSiblings = fam.members.length > 1;

                // Collect payment history for this family across all siblings
                const famHistory = fam.members.flatMap(m => 
                  (paymentHistory[m.id] || []).map(entry => ({ ...entry, studentName: m.name, studentId: m.id }))
                ).sort((a, b) => (b.id > a.id ? 1 : -1));

                return (
                  <div 
                    key={fam.key} 
                    className="bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-xs hover:border-[#0284C7]/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Family Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-[#0284C7]/10 dark:bg-sky-950/50 text-[#0284C7] dark:text-sky-400 font-black text-sm flex items-center justify-center shrink-0 border border-[#0284C7]/30">
                            {hasMultipleSiblings ? '👨‍👩‍👧‍👦' : '🎓'}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-[#0F172A] dark:text-white truncate">
                                {fam.familyName}
                              </h4>
                              {hasMultipleSiblings && (
                                <span className="bg-sky-100 dark:bg-sky-950 text-[#0284C7] dark:text-sky-400 text-[10px] font-black px-1.5 py-0.2 rounded-md border border-sky-300 dark:border-sky-800 shrink-0">
                                  {fam.members.length} {isAr ? 'إخوة' : 'siblings'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {fam.parentName} {fam.parentPhone ? `• ${fam.parentPhone}` : ''}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isSpecial ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1 shadow-2xs">
                              ⭐ {isAr ? 'معفى (حالة خاصة)' : 'Special Case (Exempt)'}
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 block text-center ${
                              famRemainingUSD === 0 
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800' 
                                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800 font-mono font-bold'
                            }`}>
                              {famRemainingUSD === 0 ? (isAr ? '✅ مسدد بالكامل' : '✅ Paid') : `$${famRemainingUSD} USD`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SIBLINGS BREAKDOWN INSIDE THE FAMILY CARD */}
                      <div className="space-y-1.5 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          {isAr ? 'الأبناء المسجلون في هذه العائلة:' : 'Students in family:'}
                        </span>
                        <div className="space-y-1.5">
                          {fam.members.map((m) => {
                            const mRem = getStudentRemaining(m);
                            const mPaid = getStudentPaid(m);
                            return (
                              <div key={m.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-[#0284C7] dark:text-sky-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {(m.name || 'ط')[0]}
                                  </span>
                                  <div className="truncate">
                                    <span className="font-bold text-[#0F172A] dark:text-slate-100 block text-[11px] truncate">{m.name}</span>
                                    <span className="text-[9px] text-slate-400 block">{m.grade} ({m.classRoom || 'أ'})</span>
                                  </div>
                                </div>

                                <div className="text-left font-mono text-[10px] shrink-0">
                                  {m.isSpecialCase ? (
                                    <span className="text-amber-600 font-bold">⭐ 0$</span>
                                  ) : (
                                    <div>
                                      <span className="text-slate-400">مدفوع: ${mPaid}</span>
                                      <span className="mx-1">•</span>
                                      <span className={`font-bold ${mRem === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {mRem === 0 ? 'مسدد ✓' : `متبقي: $${mRem}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Financial Figures Box for Family */}
                      <div className="text-xs space-y-1 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-right">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">{isAr ? 'إجمالي الأقساط:' : 'Total Tuition:'}</span>
                          <span className="font-bold text-[#0F172A] dark:text-slate-200">${famTotalUSD} USD</span>
                        </div>
                        {famAdminUSD > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">{isAr ? 'المصاريف الإدارية:' : 'Admin Fees:'}</span>
                            <span className="font-bold text-amber-600">+${famAdminUSD} USD</span>
                          </div>
                        )}
                        {famTransportUSD > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">{isAr ? 'رسوم النقل (الباص):' : 'Bus Fees:'}</span>
                            <span className="font-bold text-sky-600">+${famTransportUSD} USD</span>
                          </div>
                        )}
                        {famDiscountUSD > 0 && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-sans">{isAr ? 'الخصومات الممنوحة:' : 'Discounts:'}</span>
                            <span className="font-bold text-emerald-600">-${famDiscountUSD} USD</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-sans">{isAr ? 'المبلغ المقبوض:' : 'Total Paid:'}</span>
                          <span className="font-extrabold text-[#0284C7]">${famPaidUSD} USD</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5">
                          <span className="text-red-500 font-sans font-bold">{isAr ? 'صافي المتبقي على العائلة:' : 'Total Remaining:'}</span>
                          <span className={`font-black text-sm ${isSpecial ? 'text-amber-700 dark:text-amber-400' : 'text-red-600'}`}>
                            {isSpecial ? (isAr ? '⭐ معفى ($0)' : '⭐ Exempt ($0)') : `$${famRemainingUSD} USD`}
                          </span>
                        </div>
                      </div>

                      {/* Payment History Log for the family */}
                      {famHistory.length > 0 && (
                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 space-y-1.5 max-h-32 overflow-y-auto">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {isAr ? `سجل دفعات العائلة (${famHistory.length})` : `Payment History (${famHistory.length})`}
                          </p>
                          {famHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30">
                              <div>
                                <span className="font-bold block">{entry.studentName ? `[${entry.studentName}]: ` : ''}{entry.desc} — ${entry.amount}$ USD</span>
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400">{entry.date} • {entry.method === 'fresh_cash' ? 'نقداً' : 'تحويل'}</span>
                              </div>
                              {currentRole === 'admin' && (
                                <button onClick={() => handleDeleteHistoryEntry(entry.studentId, entry.id, entry.amount)}
                                  className="text-emerald-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="حذف القيد وخصمه من المدفوع">
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons for Family Card */}
                    <div className="flex items-center justify-between pt-2 gap-1.5 flex-wrap border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={() => handleSendFamilyWhatsAppReceipt(fam)}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="إرسال إشعار استلام مالي رسمي للعائلة بالواتساب"
                      >
                        <span>واتساب إيصال 📲</span>
                      </button>

                      <button 
                        onClick={() => handleSendFamilyWhatsAppReminder(fam)}
                        className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="إرسال رسالة تذكير بالأقساط للعائلة بالواتساب"
                      >
                        <span>واتساب تذكير 📲</span>
                      </button>

                      <button 
                        onClick={() => handleOpenFamilyReceiptView(fam)}
                        className="py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>الإيصال 🖨️</span>
                      </button>

                      {currentRole === 'admin' && fam.members.length === 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForEditPayment(fam.members[0]);
                            setEditPaidAmount((fam.members[0].tuitionPaid || 0).toString());
                            setEditPaidReason('تصحيح خطأ في تسجيل الدفعة');
                          }}
                          className="py-1.5 px-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          title="تعديل أو تصحيح الدفعة"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                      )}

                      <button 
                        disabled={isSpecial || famRemainingUSD === 0}
                        onClick={() => handleOpenFamilyPayModal(fam)}
                        className="btn-mustard disabled:opacity-50 disabled:cursor-not-allowed py-1.5 px-3 rounded-xl text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{hasMultipleSiblings ? (isAr ? 'دفعة للعائلة 💰' : 'Family Pay') : (isAr ? 'إدخال دفعة 💰' : 'Pay')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Family Direct Payment Modal (Deducts across all siblings) ──────────────── */}
      {selectedFamilyForPay && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFamilyPaySubmit}
            className="bg-white dark:bg-[#1E293B] border-2 border-[#0284C7] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-slate-100 relative my-auto text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <button type="button" onClick={() => setSelectedFamilyForPay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
              <h3 className="text-base font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0284C7]" />
                <span>
                  {selectedFamilyForPay.members.length > 1
                    ? (isAr ? `إدخال دفعة وسداد مباشر — ${selectedFamilyForPay.familyName}` : `Family Payment — ${selectedFamilyForPay.familyName}`)
                    : (isAr ? `إدخال دفعة وتسديد مباشر — ${selectedFamilyForPay.members[0]?.name}` : `Direct Payment — ${selectedFamilyForPay.members[0]?.name}`)
                  }
                </span>
              </h3>
            </div>

            {/* Total Family Debt Info */}
            <div className="bg-sky-50 dark:bg-sky-950/30 p-3 rounded-2xl border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs">
              <div className="font-mono text-left">
                <span className="text-slate-500 text-[10px] block">{isAr ? 'إجمالي المتبقي على العائلة:' : 'Total Family Remaining:'}</span>
                <span className="text-sm font-black text-red-600 font-mono">
                  ${selectedFamilyForPay.members.reduce((sum, m) => sum + getStudentRemaining(m), 0)} USD
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{selectedFamilyForPay.parentName}</span>
                <span className="text-[10px] text-slate-500">{isAr ? `عدد الأبناء: ${selectedFamilyForPay.members.length} طلاب` : `${selectedFamilyForPay.members.length} students`}</span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {isAr ? 'المبلغ الإجمالي المدفوع ($ USD)' : 'Total Paid Amount ($ USD)'} <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                required 
                min="1"
                value={payAmount} 
                onChange={(e) => {
                  const val = e.target.value;
                  setPayAmount(val);
                  updateFamilyDeductions(val, distributionMode);
                }}
                placeholder="مثال: 100 أو 300 أو 500..."
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2.5 text-base font-mono font-black focus:outline-none focus:border-[#0284C7] text-center" 
                autoFocus
              />
            </div>

            {/* SIBLINGS DEDUCTION ALLOCATION TABLE */}
            {selectedFamilyForPay.members.length > 1 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDistributionMode('waterfall');
                        updateFamilyDeductions(payAmount, 'waterfall');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${distributionMode === 'waterfall' ? 'bg-[#0284C7] text-white border-[#0284C7]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      ⚡ {isAr ? 'توزيع تلقائي (حسب الأقدمية)' : 'Waterfall'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDistributionMode('equal');
                        updateFamilyDeductions(payAmount, 'equal');
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${distributionMode === 'equal' ? 'bg-[#0284C7] text-white border-[#0284C7]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                    >
                      ⚖️ {isAr ? 'توزيع بالتساوي' : 'Equal Split'}
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? 'توزيع الخصم على الإخوة:' : 'Deduction per sibling:'}
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold">
                        <th className="p-2.5">{isAr ? 'التلميذ' : 'Student'}</th>
                        <th className="p-2.5">{isAr ? 'المتبقي الحالي' : 'Current Debt'}</th>
                        <th className="p-2.5">{isAr ? 'الخصم من الدفعة ($)' : 'Deduction ($)'}</th>
                        <th className="p-2.5">{isAr ? 'المتبقي بعد السداد' : 'New Remaining'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {selectedFamilyForPay.members.map((m) => {
                        const mRem = getStudentRemaining(m);
                        const allocated = Number(memberDeductions[m.id] || 0);
                        const newRem = Math.max(0, mRem - allocated);

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                            <td className="p-2 font-sans font-bold text-slate-800 dark:text-slate-200">
                              <div>
                                <span>{m.name}</span>
                                <span className="text-[9px] text-slate-400 block font-normal">{m.grade} ({m.classRoom || 'أ'})</span>
                              </div>
                            </td>
                            <td className="p-2 text-red-600 font-bold">
                              {m.isSpecialCase ? '⭐ 0$' : `$${mRem}`}
                            </td>
                            <td className="p-2">
                              {m.isSpecialCase ? (
                                <span className="text-[10px] text-amber-600 font-bold">معفى</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  value={memberDeductions[m.id] ?? 0}
                                  onChange={(e) => handleIndividualDeductionChange(m.id, e.target.value)}
                                  className="w-20 bg-white dark:bg-slate-950 border border-sky-300 text-emerald-600 font-bold rounded-lg px-2 py-1 text-xs text-right focus:outline-none"
                                />
                              )}
                            </td>
                            <td className="p-2 font-bold">
                              <span className={newRem === 0 ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}>
                                {m.isSpecialCase ? '0$' : `$${newRem}`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-[#0284C7] dark:text-sky-400 font-bold flex items-center justify-between px-1">
                  <span>⚡ سيتم خصم المبالغ فوراً وبشكل متزامن من حسابات جميع الإخوة!</span>
                  <span>إجمالي المخصص: ${Object.values(memberDeductions).reduce((sum, v) => sum + Number(v || 0), 0)} USD</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ? 'بيان / وصف الدفعة' : 'Payment Note / Description'}</label>
              <input type="text" value={payDesc} onChange={(e) => setPayDesc(e.target.value)}
                placeholder={isAr ? 'مثال: دفعة قسط شهرية...' : 'e.g. Monthly tuition payment...'}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('paymentMethod')}</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold">
                <option value="fresh_cash">💵 Fresh Cash USD (نقداً بالمدرسة)</option>
                <option value="omt">📲 OMT / Whish Money (تحويل مالي)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setSelectedFamilyForPay(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit" className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {isAr ? 'تأكيد خصم الدفعة من الإخوة وإصدار الإيصال 🧾' : 'Confirm & Deduct Payment'}
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

            {/* Security Check: If current user is not admin, require admin password */}
            {currentRole !== 'admin' && (
              <div className="bg-red-50 border-2 border-red-300 p-3.5 rounded-2xl space-y-2 animate-shake">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-black">
                    🔒 تعديل الحسابات حصراً للمدير العام
                  </span>
                </div>
                <p className="text-[10px] text-red-600 font-semibold">
                  أنت مسجل حالياً بحساب غير حساب المدير العام. للمتابعة وتعديل هذا الحساب، يرجى إدخال كلمة سر المدير العام:
                </p>
                <div className="space-y-1">
                  <input
                    type="password"
                    required
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    placeholder="أدخل كلمة سر المدير العام..."
                    className="w-full bg-white border border-red-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                  {adminPasswordError && (
                    <span className="text-[10px] text-red-700 font-bold block">
                      ⚠️ {adminPasswordError}
                    </span>
                  )}
                </div>
              </div>
            )}

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
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">{isAr ? 'رقم الإيصال:' : 'Receipt No:'}</span>
                <span className="font-bold text-[#0284C7]">{showReceiptModal.receiptNo}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">{isAr ? 'تاريخ الاستلام:' : 'Payment Date:'}</span>
                <span className="font-bold text-slate-700">{showReceiptModal.date}</span>
              </div>

              {showReceiptModal.isFamilyReceipt ? (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">{isAr ? 'عائلة / ولي أمر:' : 'Family / Guardian:'}</span>
                    <span className="font-bold text-[#0F172A] text-sm">{showReceiptModal.familyName || showReceiptModal.parentName}</span>
                  </div>
                  {showReceiptModal.parentPhone && (
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                      <span className="font-bold text-slate-700" dir="ltr">{showReceiptModal.parentPhone}</span>
                    </div>
                  )}

                  {/* Sibling deductions breakdown table */}
                  <div className="my-2 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-black text-[#0284C7] mb-1.5 flex items-center justify-between">
                      <span>{isAr ? '📋 تفاصيل توزيع الدفعة على الإخوة:' : 'Sibling Allocations:'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">({showReceiptModal.membersList?.length || 0} {isAr ? 'أبناء' : 'children'})</span>
                    </p>
                    <table className="w-full text-center border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-300 text-slate-600 bg-slate-50 font-bold">
                          <th className="py-1 px-1 text-right">{isAr ? 'التلميذ' : 'Student'}</th>
                          <th className="py-1 px-1">{isAr ? 'الصف' : 'Grade'}</th>
                          <th className="py-1 px-1">{isAr ? 'المخصوم' : 'Deducted'}</th>
                          <th className="py-1 px-1">{isAr ? 'المتبقي' : 'Remaining'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(showReceiptModal.membersList || []).map((m, idx) => (
                          <tr key={idx} className="py-1">
                            <td className="py-1 px-1 text-right font-bold text-slate-800">{m.name}</td>
                            <td className="py-1 px-1 text-slate-500 text-[10px]">{m.grade} ({m.classRoom})</td>
                            <td className="py-1 px-1 font-black text-emerald-600">${m.allocated}</td>
                            <td className="py-1 px-1 font-bold text-red-600">${m.remaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">{isAr ? 'اسم الطالب:' : 'Student Name:'}</span>
                    <span className="font-bold text-[#0F172A] text-sm">{showReceiptModal.studentName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">{isAr ? 'الصف / الشعبة:' : 'Grade:'}</span>
                    <span className="font-bold text-slate-700">{showReceiptModal.grade}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <span className="font-bold text-slate-800">{showReceiptModal.method === 'fresh_cash' ? 'Fresh Cash USD' : 'OMT / Whish Transfer'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5 bg-emerald-50/60 p-1.5 rounded-lg">
                <span className="text-emerald-800 font-bold">{isAr ? (showReceiptModal.isFamilyReceipt ? 'إجمالي المدفوع للعائلة:' : 'المبلغ المدفوع بالدولار:') : 'Total Paid (USD):'}</span>
                <span className="font-black text-emerald-600 text-sm">${showReceiptModal.amountUSD} USD</span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-red-50/60">
                <span className="text-red-800 font-bold">{isAr ? (showReceiptModal.isFamilyReceipt ? 'صافي المتبقي على العائلة:' : 'القسط المتبقي:') : 'Remaining Balance:'}</span>
                <span className="font-black text-red-600">${showReceiptModal.remainingUSD} USD</span>
              </div>
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
