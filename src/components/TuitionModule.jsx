import React, { useState, useMemo, useEffect } from 'react';
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
  const { lang, t, currentRole, students = [], payTuition, batchPayTuition, updateStudent, selectedStudentId, addMessage, siteSettings, verifyAdminPassword } = useApp();

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
  const [distributionMode, setDistributionMode] = useState('equal'); // 'equal' (default) | 'waterfall' | 'custom'
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

  // ESC Key listener to exit open modals / sub-pages in TuitionModule
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (showReceiptModal) {
          setShowReceiptModal(null);
          return;
        }
        if (selectedFamilyForPay) {
          setSelectedFamilyForPay(null);
          return;
        }
        if (selectedStudentForEditPayment) {
          setSelectedStudentForEditPayment(null);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReceiptModal, selectedFamilyForPay, selectedStudentForEditPayment]);

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

    // 2. Fallback: match by parentPhone if available (clean non-empty numbers >= 8 digits)
    const phone = String(student.parentPhone || student.phone || '')
      .replace(/[^0-9]/g, '');
    const parentName = String(student.parentName || student.guardianName || '')
      .trim().toLowerCase();

    const isGenericParent = !parentName || parentName.length < 3 || ['ولي امر', 'ولي أمر', 'غير محدد', 'اب', 'أم', 'أب'].includes(parentName);

    if (phone.length >= 8) {
      if (!isGenericParent) {
        return `family_${parentName}_${phone}`;
      }
      return `phone_${phone}`;
    }

    // 3. Independent individual student
    return `stu_${student.id}`;
  };

  // Group all students into unified Family Units
  const allFamilies = useMemo(() => {
    const map = new Map();

    safeStudents.forEach(stu => {
      const key = getStudentFamilyKey(stu);
      if (!map.has(key)) {
        map.set(key, {
          key: key,
          familyName: stu.parentName || (isAr ? `عائلة ${stu.name}` : `${stu.name}'s Family`),
          parentName: stu.parentName || stu.guardianName || (isAr ? 'ولي الأمر' : 'Parent'),
          parentPhone: stu.parentPhone || stu.phone || '',
          members: [],
          isSpecialCase: true, // will be flipped to false if any member is non-special
          hasFrozen: false
        });
      }

      const fam = map.get(key);
      fam.members.push(stu);
      if (!stu.isSpecialCase) fam.isSpecialCase = false;
      if (stu.frozen) fam.hasFrozen = true;
    });

    return Array.from(map.values());
  }, [safeStudents, isAr]);

  // Filtered Families based on search term
  const filteredFamilies = useMemo(() => {
    if (!searchTerm.trim()) return allFamilies;
    const term = searchTerm.trim().toLowerCase();

    return allFamilies.filter(fam => {
      const matchFamily = (
        (fam.familyName || '').toLowerCase().includes(term) ||
        (fam.parentName || '').toLowerCase().includes(term) ||
        (fam.parentPhone || '').includes(term)
      );

      const matchMember = fam.members.some(m =>
        (m.name || '').toLowerCase().includes(term) ||
        (m.nameEn || '').toLowerCase().includes(term) ||
        (m.grade || '').toLowerCase().includes(term) ||
        (m.classRoom || '').toLowerCase().includes(term) ||
        (m.id || '').toLowerCase().includes(term)
      );
      return matchFamily || matchMember;
    });
  }, [allFamilies, searchTerm]);

  // Recalculate automatic deduction per sibling (Exact, real distribution without any missing amounts)
  const updateFamilyDeductions = (amount, mode = 'equal', currentFam) => {
    const fam = currentFam || selectedFamilyForPay;
    if (!fam) return;
    const totalAmount = Math.max(0, Number(amount) || 0);
    const eligibleMembers = (fam.members || []).filter(m => !m.isSpecialCase);

    if (eligibleMembers.length === 0) {
      setMemberDeductions({});
      return;
    }

    const deductions = {};
    eligibleMembers.forEach(m => { deductions[m.id] = 0; });

    if (totalAmount <= 0) {
      setMemberDeductions(deductions);
      return;
    }

    if (mode === 'equal' || !mode) {
      // 100% Real, exact equal distribution:
      // Splits equally among siblings with remaining dues.
      // If a sibling's remaining debt is smaller than the equal share, cap it at that debt
      // and redistribute the excess to the remaining siblings with balance until all dollars are allocated.
      const membersData = eligibleMembers.map(m => ({
        id: m.id,
        debt: getStudentRemaining(m),
        allocated: 0
      }));

      const hasDebtors = membersData.some(m => m.debt > 0);

      if (!hasDebtors) {
        // If no one has recorded debt, split purely equally among all siblings
        const count = membersData.length;
        const share = Math.floor(totalAmount / count);
        const rem = totalAmount % count;
        membersData.forEach((m, idx) => {
          deductions[m.id] = share + (idx === 0 ? rem : 0);
        });
        setMemberDeductions(deductions);
        return;
      }

      let unallocated = totalAmount;

      while (unallocated > 0) {
        const activeDebtors = membersData.filter(m => m.debt - m.allocated > 0);
        if (activeDebtors.length === 0) {
          // All debt is 100% covered! Place any remaining surplus onto the first sibling
          membersData[0].allocated += unallocated;
          unallocated = 0;
          break;
        }

        const share = Math.floor(unallocated / activeDebtors.length);
        const rem = unallocated % activeDebtors.length;

        if (share === 0) {
          // Distribute the remaining small amount (e.g. 1-2 dollars) 1 dollar at a time
          let left = unallocated;
          for (let i = 0; i < activeDebtors.length && left > 0; i++) {
            activeDebtors[i].allocated += 1;
            left -= 1;
          }
          if (left > 0) {
            membersData[0].allocated += left;
          }
          unallocated = 0;
          break;
        }

        let allocatedThisRound = 0;
        let anyCapped = false;

        for (let i = 0; i < activeDebtors.length; i++) {
          const debtor = activeDebtors[i];
          const target = share + (i === 0 ? rem : 0);
          const maxCanTake = debtor.debt - debtor.allocated;

          if (target >= maxCanTake) {
            debtor.allocated += maxCanTake;
            allocatedThisRound += maxCanTake;
            anyCapped = true;
          } else {
            debtor.allocated += target;
            allocatedThisRound += target;
          }
        }

        unallocated -= allocatedThisRound;

        if (!anyCapped || allocatedThisRound === 0) {
          if (unallocated > 0) {
            membersData[0].allocated += unallocated;
            unallocated = 0;
          }
          break;
        }
      }

      membersData.forEach(m => {
        deductions[m.id] = m.allocated;
      });

      // Strict integrity check: ensure sum of deductions === totalAmount
      const allocatedSum = Object.values(deductions).reduce((sum, v) => sum + Number(v || 0), 0);
      const diff = totalAmount - allocatedSum;
      if (diff !== 0 && membersData.length > 0) {
        deductions[membersData[0].id] = Math.max(0, (deductions[membersData[0].id] || 0) + diff);
      }

      setMemberDeductions(deductions);
    } else if (mode === 'waterfall') {
      let remToDistribute = totalAmount;
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
    setDistributionMode('equal');
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

    // 1. Batch pay tuition across all siblings in ONE atomic operation
    batchPayTuition(deductions, payMethod);

    let newHistory = { ...paymentHistory };
    const receiptMembers = [];

    (selectedFamilyForPay.members || []).forEach(m => {
      const allocated = Number(deductions[m.id] || 0);
      if (allocated > 0) {
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
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
            {/* Header & Live Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#0284C7]" />
                  <span>{isAr ? 'كشف كافة أقساط الطلاب والدفعات المباشرة (كروت العائلة الموحدة)' : 'Family Tuition Roster & Direct Payments'}</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
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
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pr-9 pl-8 py-2 text-xs font-bold focus:outline-none focus:border-[#0284C7] focus:bg-white text-right"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
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
                    className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3.5 shadow-xs hover:border-[#0284C7]/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Family Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-[#0284C7]/10 text-[#0284C7] font-black text-sm flex items-center justify-center shrink-0 border border-[#0284C7]/30">
                            {hasMultipleSiblings ? '👨‍👩‍👧‍👦' : '🎓'}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black text-[#0F172A] truncate">
                                {fam.familyName}
                              </h4>
                              {hasMultipleSiblings && (
                                <span className="bg-sky-100 text-[#0284C7] text-[10px] font-black px-1.5 py-0.2 rounded-md border border-sky-300 shrink-0">
                                  {fam.members.length} {isAr ? 'إخوة' : 'siblings'}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {fam.parentName} {fam.parentPhone ? `• ${fam.parentPhone}` : ''}
                            </span>
                          </div>
                        </div>

                        <div>
                          {isSpecial ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs">
                              ⭐ {isAr ? 'معفى (حالة خاصة)' : 'Special Case (Exempt)'}
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 block text-center ${
                              famRemainingUSD === 0 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                                : 'bg-red-50 text-red-700 border border-red-300 font-mono font-bold'
                            }`}>
                              {famRemainingUSD === 0 ? (isAr ? '✅ مسدد بالكامل' : '✅ Paid') : `$${famRemainingUSD} USD`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SIBLINGS BREAKDOWN INSIDE THE FAMILY CARD */}
                      <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">
                          {isAr ? 'الأبناء المسجلون في هذه العائلة:' : 'Students in family:'}
                        </span>
                        <div className="space-y-1.5">
                          {fam.members.map((m) => {
                            const mRem = getStudentRemaining(m);
                            const mPaid = getStudentPaid(m);
                            return (
                              <div key={m.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="w-5 h-5 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-[10px] shrink-0">
                                    {(m.name || 'ط')[0]}
                                  </span>
                                  <div className="truncate">
                                    <span className="font-bold text-[#0F172A] block text-[11px] truncate">{m.name}</span>
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
                      <div className="text-xs space-y-1 bg-white p-3 rounded-xl border border-slate-100 font-mono text-right">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">{isAr ? 'إجمالي الأقساط:' : 'Total Tuition:'}</span>
                          <span className="font-bold text-[#0F172A]">${famTotalUSD} USD</span>
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
                        <div className="flex justify-between border-t border-slate-100 pt-1.5">
                          <span className="text-red-500 font-sans font-bold">{isAr ? 'صافي المتبقي على العائلة:' : 'Total Remaining:'}</span>
                          <span className={`font-black text-sm ${isSpecial ? 'text-amber-700' : 'text-red-600'}`}>
                            {isSpecial ? (isAr ? '⭐ معفى ($0)' : '⭐ Exempt ($0)') : `$${famRemainingUSD} USD`}
                          </span>
                        </div>
                      </div>

                      {/* Payment History Log for the family */}
                      {famHistory.length > 0 && (
                        <div className="bg-white border border-slate-100 rounded-xl p-2.5 space-y-1.5 max-h-32 overflow-y-auto">
                          <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {isAr ? `سجل دفعات العائلة (${famHistory.length})` : `Payment History (${famHistory.length})`}
                          </p>
                          {famHistory.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                              <div>
                                <span className="font-bold block">{entry.studentName ? `[${entry.studentName}]: ` : ''}{entry.desc} — ${entry.amount}$ USD</span>
                                <span className="text-[9px] text-emerald-600">{entry.date} • {entry.method === 'fresh_cash' ? 'نقداً' : 'تحويل'}</span>
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
                    <div className="flex items-center justify-between pt-2 gap-1.5 flex-wrap border-t border-slate-100">
                      <button 
                        onClick={() => handleSendFamilyWhatsAppReceipt(fam)}
                        className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="إرسال إشعار استلام مالي رسمي للعائلة بالواتساب"
                      >
                        <span>واتساب إيصال 📲</span>
                      </button>

                      <button 
                        onClick={() => handleSendFamilyWhatsAppReminder(fam)}
                        className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                        title="إرسال رسالة تذكير بالأقساط للعائلة بالواتساب"
                      >
                        <span>واتساب تذكير 📲</span>
                      </button>

                      <button 
                        onClick={() => handleOpenFamilyReceiptView(fam)}
                        className="py-1.5 px-2.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFamilyPaySubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto text-right">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <button type="button" onClick={() => setSelectedFamilyForPay(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors">✕</button>
              <h3 className="text-base font-black text-[#0284C7] flex items-center gap-2">
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
            <div className="bg-sky-50 p-3.5 rounded-2xl border border-sky-200 flex items-center justify-between text-xs">
              <div className="font-mono text-left">
                <span className="text-slate-500 text-[10px] font-bold block">{isAr ? 'إجمالي المتبقي على العائلة:' : 'Total Family Remaining:'}</span>
                <span className="text-base font-black text-red-600 font-mono">
                  ${selectedFamilyForPay.members.reduce((sum, m) => sum + getStudentRemaining(m), 0)} USD
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-800 text-sm block">{selectedFamilyForPay.parentName}</span>
                <span className="text-[11px] text-slate-500 font-medium">{isAr ? `عدد الأبناء: ${selectedFamilyForPay.members.length} طلاب` : `${selectedFamilyForPay.members.length} students`}</span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  {isAr ? 'المبلغ الإجمالي المدفوع ($ USD)' : 'Total Paid Amount ($ USD)'} <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-[#0284C7] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  {isAr ? '⚖️ يُقسم بالتساوي على الإخوة' : '⚖️ Split equally'}
                </span>
              </div>
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
                className="w-full bg-[#F8FAFC] border-2 border-sky-300 focus:border-[#0284C7] focus:bg-white text-[#0F172A] rounded-2xl px-4 py-2.5 text-base font-mono font-black focus:outline-none text-center shadow-inner transition-colors" 
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
                        setDistributionMode('equal');
                        updateFamilyDeductions(payAmount, 'equal');
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${distributionMode === 'equal' ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
                    >
                      ⚖️ {isAr ? 'توزيع بالتساوي' : 'Equal Split'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDistributionMode('waterfall');
                        updateFamilyDeductions(payAmount, 'waterfall');
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${distributionMode === 'waterfall' ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
                    >
                      ⚡ {isAr ? 'توزيع حسب الأقدمية' : 'Waterfall'}
                    </button>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {isAr ? 'تفاصيل الخصم لكل تلميذ:' : 'Deduction per sibling:'}
                  </span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-xs text-right">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-600 font-bold">
                        <th className="p-2.5">{isAr ? 'التلميذ' : 'Student'}</th>
                        <th className="p-2.5">{isAr ? 'المتبقي الحالي' : 'Current Debt'}</th>
                        <th className="p-2.5 text-center">{isAr ? 'الخصم من الدفعة ($)' : 'Deduction ($)'}</th>
                        <th className="p-2.5">{isAr ? 'المتبقي بعد السداد' : 'New Remaining'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {selectedFamilyForPay.members.map((m) => {
                        const mRem = getStudentRemaining(m);
                        const allocated = Number(memberDeductions[m.id] || 0);
                        const newRem = Math.max(0, mRem - allocated);

                        return (
                          <tr key={m.id} className="hover:bg-sky-50/40 transition-colors">
                            <td className="p-2 font-sans font-bold text-slate-800">
                              <div>
                                <span>{m.name}</span>
                                <span className="text-[10px] text-slate-400 block font-normal">{m.grade} ({m.classRoom || 'أ'})</span>
                              </div>
                            </td>
                            <td className="p-2 text-red-600 font-bold">
                              {m.isSpecialCase ? '⭐ 0$' : `$${mRem}`}
                            </td>
                            <td className="p-2 text-center">
                              {m.isSpecialCase ? (
                                <span className="text-[10px] text-amber-600 font-bold">معفى</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  value={memberDeductions[m.id] ?? 0}
                                  onChange={(e) => handleIndividualDeductionChange(m.id, e.target.value)}
                                  className="w-24 bg-[#F8FAFC] border border-sky-300 focus:border-[#0284C7] focus:bg-white text-emerald-600 font-black rounded-lg px-2 py-1 text-xs text-center focus:outline-none transition-colors"
                                />
                              )}
                            </td>
                            <td className="p-2 font-bold">
                              <span className={newRem === 0 ? 'text-emerald-600' : 'text-slate-700'}>
                                {m.isSpecialCase ? '0$' : `$${newRem}`}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] text-[#0284C7] font-bold flex items-center justify-between px-1">
                  <span>⚡ يخصم المبلغ تلقائياً من حسابات الإخوة بالتساوي!</span>
                  <span className="font-mono bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">إجمالي الموزع: ${Object.values(memberDeductions).reduce((sum, v) => sum + Number(v || 0), 0)} USD</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'بيان / وصف الدفعة' : 'Payment Note / Description'}</label>
              <input type="text" value={payDesc} onChange={(e) => setPayDesc(e.target.value)}
                placeholder={isAr ? 'مثال: دفعة قسط شهرية...' : 'e.g. Monthly tuition payment...'}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] focus:bg-white text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none font-medium transition-colors" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</label>
              <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0284C7] focus:bg-white text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold transition-colors">
                <option value="fresh_cash">💵 Fresh Cash USD (نقداً بالمدرسة)</option>
                <option value="omt">📲 OMT / Whish Money (تحويل مالي)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setSelectedFamilyForPay(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">{t('cancel')}</button>
              <button type="submit" className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5 transition-all">
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

      {/* ── Receipt Modal (Single Receipt Sized at Exactly Half A4 Sheet) ─────────────────────────── */}
      {showReceiptModal && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto receipt-print-backdrop print-container">
          <div className="max-w-2xl w-full my-auto space-y-3">
            
            {/* Action Bar (Screen Only) */}
            <div className="no-print bg-white border border-[#E2E8F0] p-3 rounded-2xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  📄 {isAr ? 'معاينة إيصال الاستلام المالي (نصف صفحة A4):' : 'Payment Receipt Preview (Half A4 Sheet):'}
                </span>
                <span className="text-[10px] font-mono bg-sky-50 text-[#0284C7] font-bold px-2 py-0.5 rounded-md border border-sky-200">
                  {showReceiptModal.receiptNo}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'طباعة الإيصال 🖨️' : 'Print Receipt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(null)}
                  title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Container holding ONE Single Receipt Sized to Half of A4 */}
            <div className="receipt-print-wrapper">
              <style>{`
                /* Screen Mode Styles */
                @media screen {
                  .receipt-printable-card {
                    background-color: #ffffff;
                    color: #0f172a;
                    border: 2px solid #0284C7;
                    border-radius: 1.25rem;
                    padding: 1.25rem 1.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                  }
                  .receipt-details-box {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                  }
                }

                /* Print Mode Styles: Exactly 1 single receipt taking the top half of A4 */
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 8mm 12mm 0 12mm;
                  }

                  html, html.dark, body, html.dark body, 
                  .receipt-print-backdrop, .receipt-print-wrapper, .receipt-printable-card, .receipt-printable-card * {
                    color-scheme: light !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  body > #root, #root {
                    display: none !important;
                  }

                  body {
                    background-color: #ffffff !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: 100% !important;
                  }

                  .receipt-print-backdrop, html.dark .receipt-print-backdrop {
                    position: static !important;
                    inset: auto !important;
                    width: 100% !important;
                    height: auto !important;
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    backdrop-filter: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    display: block !important;
                    z-index: 999999 !important;
                    box-shadow: none !important;
                    overflow: visible !important;
                  }

                  .receipt-print-wrapper {
                    display: block !important;
                    width: 100% !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    page-break-inside: avoid !important;
                    page-break-after: avoid !important;
                  }

                  .receipt-printable-card, html.dark .receipt-printable-card {
                    border: 1.5px solid #000000 !important;
                    box-shadow: none !important;
                    margin: 0 auto !important;
                    padding: 8px 12px !important;
                    background: #ffffff !important;
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    width: 100% !important;
                    max-width: 186mm !important;
                    /* Strictly Half of A4 Sheet height (130mm to 134mm max) */
                    height: 130mm !important;
                    max-height: 134mm !important;
                    border-radius: 6px !important;
                    box-sizing: border-box !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: space-between !important;
                    page-break-inside: avoid !important;
                    page-break-after: avoid !important;
                    overflow: hidden !important;
                  }

                  .receipt-details-box {
                    background: transparent !important;
                    background-color: transparent !important;
                    border: 1px solid #cbd5e1 !important;
                    padding: 4px 8px !important;
                  }

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

              {/* Single Receipt Card (Half A4 Sheet) */}
              <div className="receipt-printable-card relative text-right text-[#0F172A] space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white p-0.5 flex items-center justify-center border border-[#0284C7] shadow-xs overflow-hidden shrink-0">
                      <img src="/emblem.png" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#0284C7] leading-tight">
                        {isAr ? (siteSettings?.schoolName || 'مدرسة الدعم التعليمي') : (siteSettings?.schoolNameEn || 'Educational Support School')}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-bold block">
                        إيصال استلام مالي رسمي • Official Payment Receipt
                      </span>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black border border-[#0284C7] bg-sky-50 text-[#0284C7]">
                      {isAr ? 'إيصال سداد رسمي 🧾' : 'Official Receipt'}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 font-bold">
                      {showReceiptModal.receiptNo}
                    </div>
                  </div>
                </div>

                {/* Metadata summary bar */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">{isAr ? 'تاريخ الاستلام:' : 'Date:'}</span>
                    <span className="font-bold text-slate-800">{showReceiptModal.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">{isAr ? 'عائلة / ولي الأمر:' : 'Family / Guardian:'}</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {showReceiptModal.familyName || showReceiptModal.parentName || showReceiptModal.studentName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block font-sans">{isAr ? 'طريقة الدفع:' : 'Method:'}</span>
                    <span className="font-bold text-slate-800">
                      {showReceiptModal.method === 'fresh_cash' ? 'Fresh Cash USD (نقداً)' : 'OMT / Whish (تحويل)'}
                    </span>
                  </div>
                </div>

                {/* Sibling Table or Single Student Breakdown */}
                {showReceiptModal.isFamilyReceipt ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-center border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                          <th className="py-1.5 px-3 text-right">{isAr ? 'اسم التلميذ' : 'Student'}</th>
                          <th className="py-1.5 px-2">{isAr ? 'الصف / الشعبة' : 'Grade'}</th>
                          <th className="py-1.5 px-2">{isAr ? 'الدفعة المخصومة' : 'Deducted'}</th>
                          <th className="py-1.5 px-2">{isAr ? 'المتبقي عليه' : 'Remaining'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {(showReceiptModal.membersList || []).map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-3 text-right font-bold text-slate-800 font-sans">{m.name}</td>
                            <td className="py-1.5 px-2 text-slate-500 text-[10px]">{m.grade} ({m.classRoom || 'أ'})</td>
                            <td className="py-1.5 px-2 font-black text-emerald-600">${m.allocated}</td>
                            <td className="py-1.5 px-2 font-bold text-red-600">${m.remaining}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'اسم الطالب:' : 'Student:'}</span>
                      <span className="font-bold text-slate-800 text-sm">{showReceiptModal.studentName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{isAr ? 'الصف:' : 'Grade:'}</span>
                      <span className="font-bold text-slate-700">{showReceiptModal.grade}</span>
                    </div>
                  </div>
                )}

                {/* Financial Totals Row */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-center justify-between">
                    <span className="text-emerald-800 font-bold text-[11px] font-sans">
                      {isAr ? (showReceiptModal.isFamilyReceipt ? 'إجمالي المدفوع للعائلة:' : 'المبلغ المدفوع بالدولار:') : 'Total Paid:'}
                    </span>
                    <span className="font-black text-emerald-600 text-base">
                      ${showReceiptModal.amountUSD} USD
                    </span>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-2 rounded-xl flex items-center justify-between">
                    <span className="text-red-800 font-bold text-[11px] font-sans">
                      {isAr ? (showReceiptModal.isFamilyReceipt ? 'صافي المتبقي على العائلة:' : 'القسط المتبقي:') : 'Total Remaining:'}
                    </span>
                    <span className="font-black text-red-600 text-base">
                      ${showReceiptModal.remainingUSD} USD
                    </span>
                  </div>
                </div>

                {/* Signature & Stamp Row */}
                <div className="flex justify-between items-end pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <div>
                    <span className="font-bold text-[11px]">{isAr ? 'توقيع المحاسب / الإدارة:' : 'Accountant Signature:'}</span>
                    <div className="h-6 border-b border-slate-300 w-32 mt-1" />
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full receipt-stamp-badge font-black text-[10px] border border-[#0284C7]/20 text-[#0284C7]">
                      {isAr ? 'ختم المدرسة الرسمي 💮' : 'Official School Stamp'}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {isAr ? 'يعتبر هذا السند إشعاراً رسمياً بالسداد' : 'Official Tuition Payment Receipt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scissor Cut Line (Half A4 Sheet Border Indicator) */}
              <div className="hidden print:flex items-center justify-center gap-3 pt-3 text-[10px] text-slate-400 font-mono select-none">
                <span className="tracking-widest opacity-60">----------------------------------------------------</span>
                <span className="font-bold shrink-0">✂️ {isAr ? 'قص الورقة هنا (نصف ورقة A4)' : 'Cut paper here (Half A4)'}</span>
                <span className="tracking-widest opacity-60">----------------------------------------------------</span>
              </div>
            </div>

            {/* Screen Close Button Footer */}
            <div className="no-print flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReceiptModal(null)}
                className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
              >
                <span>{t('close')}</span>
                <span className="text-[10px] opacity-70 font-mono">(Esc)</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
