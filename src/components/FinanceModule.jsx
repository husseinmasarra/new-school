import React, {useState, useEffect} from'react';
import {createPortal} from'react-dom';
import {useApp, defaultAvatars} from'../context/AppContext';
import {
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  UserCheck, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  CreditCard, 
  Users, 
  Edit3, 
  Trash2, 
  Briefcase, 
  Phone, 
  Camera,
  ArrowRight,
  Calendar,
  PieChart,
  Award
} from'lucide-react';

export const FinanceModule = () => {
  const {
    lang, 
    t, 
    currentRole, 
    students = [], 
    teachers = [], 
    staffEmployees = [], 
    expenses = [], 
    addExpense, 
    deleteExpense,
    payTeacherSalary, 
    addStaffEmployee, 
    updateStaffEmployee, 
    deleteStaffEmployee, 
    payStaffSalary,
    updateTeacherSalary,
    resetFinancialAccounts
  } = useApp();

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherNewSalary, setTeacherNewSalary] = useState('');
  const [showResetFinModal, setShowResetFinModal] = useState(false);

  const [activeFinanceTab, setActiveFinanceTab] = useState('payroll');
  const [salaryToast, setSalaryToast] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Reports States
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('monthly'); //'monthly'|'annual'
  const [reportMonth, setReportMonth] = useState(() => (new Date().getMonth() + 1).toString());
  const [reportYear, setReportYear] = useState(() => new Date().getFullYear().toString());
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState({});

  // Interactive Card Modals
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);

  // Add Expense Modal
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState('مستلزمات تعليمية');

  React.useEffect(() => {
    if (showReportModal) {
      try {
        const stored = localStorage.getItem('school_payment_history');
        if (stored) {
          setPaymentHistory(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load payment history:', e);
      }
    }
  }, [showReportModal]);

  // Add Staff Modal
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffJobTitle, setStaffJobTitle] = useState('');
  const [staffDept, setStaffDept] = useState('القسم الإداري والحسابات');
  const [staffSalary, setStaffSalary] = useState('800');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffAvatar, setStaffAvatar] = useState(defaultAvatars[2]);

  // Employee Advances State (persisted in localStorage)
  const [employeeAdvances, setEmployeeAdvances] = useState(() => {
    try {return JSON.parse(localStorage.getItem('school_employee_advances') ||'{}');}
    catch {return {};}
  });
  const [showAdvanceModal, setShowAdvanceModal] = useState(null); // {id, name, salary}
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('سلفة شخصية طارئة');

  // Edit Staff Modal
  const [editingStaff, setEditingStaff] = useState(null);
  const [editName, setEditName] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Calculations with safe default fallback values
  const totalRevenue = (students || []).reduce((sum, s) => sum + (s?.isSpecialCase ? 0 : Number(s?.tuitionPaid || 0)), 0);
  const totalTuitionUSD = (students || []).reduce((sum, s) => {
    if (s?.isSpecialCase) return sum;
    const t = s?.tuitionTotal !== undefined && s?.tuitionTotal !== null && s?.tuitionTotal !==''? Number(s.tuitionTotal) : 700;
    const trans = s?.hasTransport ? Number(s?.transportFee || 0) : 0;
    return sum + t + trans;
  }, 0);
  const totalRemainingUSD = Math.max(0, totalTuitionUSD - totalRevenue);
  
  const totalStaffSalariesPaid = (staffEmployees || []).filter(e => e.salaryPaid).reduce((sum, e) => sum + Number(e.monthlySalary || 0), 0);
  const totalTeacherSalariesPaid = (teachers || []).filter(t => t.salaryPaid).reduce((sum, t) => sum + Number(t.monthlySalary || 0), 0);
  const totalAdvancesGiven = Object.values(employeeAdvances || {}).flat().reduce((sum, a) => sum + Number(a?.amount || 0), 0);
  
  const totalExpenses = (expenses || []).reduce((sum, e) => sum + Number(e?.amount || 0), 0) + 
                        totalStaffSalariesPaid + 
                        totalTeacherSalariesPaid + 
                        totalAdvancesGiven;
                        
  const netProfit = totalRevenue - totalExpenses;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const LBP_RATE = 89500;
  const saveEmployeeAdvances = (updated) => {
    setEmployeeAdvances(updated);
    localStorage.setItem('school_employee_advances', JSON.stringify(updated));
  };

  const handleAddAdvanceSubmit = (e) => {
    e.preventDefault();
    if (!showAdvanceModal || !advanceAmount || Number(advanceAmount) <= 0) return;

    const empId = showAdvanceModal.id;
    const existing = employeeAdvances[empId] || [];
    const newAdv = {
      id:`ADV-${Date.now()}`,
      amount: Number(advanceAmount),
      date: todayStr,
      reason: advanceReason ||'سلفة شخصية',
      deducted: false
    };

    const updated = {
      ...employeeAdvances,
      [empId]: [newAdv, ...existing]
    };

    saveEmployeeAdvances(updated);
    setAdvanceAmount('');
    setAdvanceReason('سلفة شخصية طارئة');
    setShowAdvanceModal(null);

    setSalaryToast(lang ==='ar'
      ?`تم تسجيل سلفة بقيمة $${newAdv.amount} USD للموظف/المعلم (${showAdvanceModal.name}) وخصمها من راتبه القادم تلقائياً!`
      :`Advance of $${newAdv.amount} USD granted to ${showAdvanceModal.name}.`
    );
    setTimeout(() => setSalaryToast(''), 4500);
  };

  const getEmpAdvanceDetails = (empId) => {
    const list = employeeAdvances[empId] || [];
    const activeList = list.filter(a => !a.deducted);
    const totalActiveAdvance = activeList.reduce((sum, a) => sum + Number(a.amount || 0), 0);
    return {list, activeList, totalActiveAdvance};
  };

  const handlePayStaff = (stf) => {
    const baseSalary = Number(stf.monthlySalary || 800);
    const {activeList, totalActiveAdvance} = getEmpAdvanceDetails(stf.id);
    const netSalary = Math.max(0, baseSalary - totalActiveAdvance);

    payStaffSalary({...stf, monthlySalary: netSalary});

    if (activeList.length > 0) {
      const allEmpAdvances = employeeAdvances[stf.id] || [];
      const updatedEmpAdvances = allEmpAdvances.map(a => ({...a, deducted: true, deductedDate: todayStr}));
      saveEmployeeAdvances({...employeeAdvances, [stf.id]: updatedEmpAdvances});
    }

    setSalaryToast(lang ==='ar'
      ?`تم صرف صافي راتب الموظف (${stf.name}) بقيمة $${netSalary} USD (بعد خصم سلفة $${totalActiveAdvance} USD تلقائياً)`
      :`Net salary of $${netSalary} USD paid after deducting $${totalActiveAdvance} USD advance!`
    );
    setTimeout(() => setSalaryToast(''), 5500);
  };

  const handlePayTeacher = (tch, totalDue) => {
    const {activeList, totalActiveAdvance} = getEmpAdvanceDetails(tch.id);
    const netSalary = Math.max(0, totalDue - totalActiveAdvance);

    payTeacherSalary(tch.id, netSalary);

    if (activeList.length > 0) {
      const allEmpAdvances = employeeAdvances[tch.id] || [];
      const updatedEmpAdvances = allEmpAdvances.map(a => ({...a, deducted: true, deductedDate: todayStr}));
      saveEmployeeAdvances({...employeeAdvances, [tch.id]: updatedEmpAdvances});
    }

    setSalaryToast(lang ==='ar'
      ?`تم صرف صافي راتب المعلم (${tch.name}) بقيمة $${netSalary} USD (بعد خصم سلفة $${totalActiveAdvance} USD تلقائياً)`
      :`Net salary of $${netSalary} USD paid after deducting $${totalActiveAdvance} USD advance!`
    );
    setTimeout(() => setSalaryToast(''), 5500);
  };

  const handleAddExpSubmit = (e) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;

    addExpense({
      title: expTitle,
      amount: Number(expAmount),
      category: expCategory,
      date: todayStr
    });

    setExpTitle('');
    setExpAmount('');
    setShowAddExpModal(false);
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!staffName || !staffJobTitle || !staffSalary) return;

    addStaffEmployee({
      name: staffName,
      jobTitle: staffJobTitle,
      department: staffDept,
      monthlySalary: Number(staffSalary),
      phone: staffPhone ||'+961 70 000 000',
      avatar: staffAvatar
    });

    setStaffName('');
    setStaffJobTitle('');
    setStaffSalary('800');
    setStaffPhone('');
    setShowAddStaffModal(false);
  };

  const handleOpenEditStaffModal = (stf) => {
    setEditingStaff(stf);
    setEditName(stf.name);
    setEditJobTitle(stf.jobTitle);
    setEditDept(stf.department);
    setEditSalary(stf.monthlySalary);
    setEditPhone(stf.phone ||'');
  };

  const handleEditStaffSubmit = (e) => {
    e.preventDefault();
    if (!editingStaff || !editName || !editJobTitle) return;

    updateStaffEmployee(editingStaff.id, {
      name: editName,
      jobTitle: editJobTitle,
      department: editDept,
      monthlySalary: Number(editSalary),
      phone: editPhone
    });

    setEditingStaff(null);
  };

  const handleStaffAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaffAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A5C36]/10 text-[#0A5C36] rounded-2xl">
            <DollarSign className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A5C36]">{t('financeTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang ==='ar'
                ?"إدارة رواتب ووظائف المعلمين والعاملين، والإيرادات والمصاريف بالدولار ($ USD)."
                :"Manage staff employees, job roles, monthly salaries & operational expenses ($ USD)."}
            </p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0] flex-wrap">
          <button
            onClick={() => setActiveFinanceTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFinanceTab ==='payroll'
                ?'bg-[#0A5C36] text-white shadow'
                :'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            {lang ==='ar'?'كادر الموظفين والرواتب':'Staff & Payroll'}
          </button>

          <button
            onClick={() => setActiveFinanceTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFinanceTab ==='expenses'
                ?'bg-[#0A5C36] text-white shadow'
                :'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            <span>{lang ==='ar'?'الميزانية والمصاريف':'Budget & Expenses'}</span>
            <span className="px-1.5 py-0.2 bg-red-100 text-red-700 rounded-md text-[10px] font-mono font-bold">
              {expenses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFinanceTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFinanceTab ==='analytics'
                ?'bg-[#0A5C36] text-white shadow'
                :'text-slate-500 hover:text-[#0F172A]'
            }`}
          >
            <span>{lang ==='ar'?'الرسوم البيانية والتحليل':'Analytics & Charts'}</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span> {lang ==='ar'?'التقارير المالية المطبوعة':'Printable Financial Reports'}</span>
          </button>

          {currentRole ==='admin'&& (
            <button
              onClick={() => setShowResetFinModal(true)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition-colors"
              title="تصفير الأقساط والمالية والبدء بسجل نظيف"
            >
              <span> تصفير الحسابات (مرة واحدة)</span>
            </button>
          )}
        </div>
      </div>

      {salaryToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-semibold animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0"/>
            <span>{salaryToast}</span>
          </div>

          <button
            onClick={() => setActiveFinanceTab('expenses')}
            className="px-3 py-1.5 btn-mustard rounded-xl text-xs font-bold shadow flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>عرض في كشف المصاريف </span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180"/>
          </button>
        </div>
      )}

      {/* INTERACTIVE METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1: Total Revenue (INTERACTIVE) */}
        <div
          onClick={() => setShowRevenueModal(true)}
          className="interactive-card glow-card-emerald bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-[#0A5C36] group"
          title="اضغط هنا لمعاينة كشف الإيرادات والأقساط المقبوضة بالتفصيل"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#0A5C36] transition-colors flex items-center gap-1">
              <span>{t('totalRevenue')}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#0A5C36] opacity-0 group-hover:opacity-100 transition-opacity"/>
            </span>
            <div className="p-2 bg-[#0A5C36]/10 text-[#0A5C36] rounded-xl group-hover:bg-[#0A5C36] group-hover:text-white transition-all">
              <TrendingUp className="w-5 h-5"/>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A5C36] font-mono">${(totalRevenue || 0).toLocaleString()} USD</p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span className="font-bold text-[#0A5C36]/75">{lang ==='ar'?'الرسوم المدرسية والرسوم الإدارية':'School tuition & admin fees'}</span>
            <span className="text-[#0A5C36] font-bold hover:underline flex items-center gap-0.5">
              <span>معاينة الإيرادات</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180"/>
            </span>
          </div>
        </div>

        {/* Card 2: Operational Expenses (INTERACTIVE) */}
        <div
          onClick={() => setActiveFinanceTab('expenses')}
          className="interactive-card glow-card-mustard bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-red-500/60 transition-all group"
          title="اضغط هنا لعرض والوصول لكشف المصاريف المدرسية والرواتب"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-red-600 transition-colors flex items-center gap-1">
              <span>{t('totalExpenses')}</span>
              <Sparkles className="w-3.5 h-3.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"/>
            </span>
            <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
              <TrendingDown className="w-5 h-5"/>
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 font-mono">${(totalExpenses || 0).toLocaleString()} USD</p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span className="font-bold text-red-500/75">{lang ==='ar'?'رواتب الكادر والمصاريف العامة':'Staff payroll & general expenses'}</span>
            <span className="text-red-600 font-bold hover:underline flex items-center gap-0.5">
              <span>عرض كشف المصاريف ({expenses.length})</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180"/>
            </span>
          </div>
        </div>

        {/* Card 3: Net Profit (INTERACTIVE) */}
        <div
          onClick={() => setShowProfitModal(true)}
          className="interactive-card glow-card-emerald bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-2 shadow-sm cursor-pointer hover:border-[#0A5C36] transition-all group"
          title="اضغط هنا لمعاينة تحليل الموقف المالي وهامش الربح المتبقي"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 group-hover:text-[#0A5C36] transition-colors flex items-center gap-1">
              <span>{t('netProfit')}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#0A5C36] opacity-0 group-hover:opacity-100 transition-opacity"/>
            </span>
            <div className="p-2 bg-[#0A5C36]/10 text-[#0A5C36] rounded-xl group-hover:bg-[#0A5C36] group-hover:text-white transition-all">
              <Wallet className="w-5 h-5"/>
            </div>
          </div>
          <p className="text-2xl font-black text-[#0A5C36] font-mono">${(netProfit || 0).toLocaleString()} USD</p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            <span className="font-bold text-emerald-600/75">{lang ==='ar'?'صافي هامش الربح التشغيلي':'Net operating profit margin'}</span>
            <span className="text-[#0A5C36] font-bold hover:underline flex items-center gap-0.5">
              <span>تحليل الموقف المالي</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180"/>
            </span>
          </div>
        </div>

      </div>

      {/* Main Tab Content */}
      {activeFinanceTab ==='payroll'? (
        <div className="space-y-6">
          
          {/* 1. كادر العاملين والموظفين الإداريين (Staff Employees & Roles Manager) */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A5C36]"/>
                <span>كادر الموظفين والعاملين والمسميات الوظيفية ({staffEmployees.length})</span>
              </h3>

              {currentRole ==='admin'&& (
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4"/>
                  <span>إضافة موظف/عامل جديد</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                    <th className="p-3 font-semibold">الموظف / العامل</th>
                    <th className="p-3 font-semibold">الوظيفة والقسم</th>
                    <th className="p-3 font-semibold">الراتب الأساسي ($)</th>
                    <th className="p-3 font-semibold">السُلف القائمة ($)</th>
                    <th className="p-3 font-semibold">الصافي المستحق ($)</th>
                    <th className="p-3 font-semibold">حالة الصرف</th>
                    <th className="p-3 font-semibold text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                  {(staffEmployees || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-xs text-slate-400">
                        لا يوجد موظفون مضافون حالياً في النظام.
                      </td>
                    </tr>
                  ) : (
                    (staffEmployees || []).map((stf) => {
                      const baseSalary = Number(stf?.monthlySalary || 800);
                      const {totalActiveAdvance} = getEmpAdvanceDetails(stf.id);
                      const netSalary = Math.max(0, baseSalary - totalActiveAdvance);
                      const isPaid = stf?.salaryStatus ==='paid';
                      const displayPaidDate = stf?.paidDate || todayStr;

                      return (
                        <tr key={stf.id} className="hover:bg-[#F8FAFC] transition-all">
                          <td className="p-3 font-bold flex items-center gap-2">
                            <img src={stf.avatar} alt={stf.name} className="w-9 h-9 rounded-full object-cover border border-[#0A5C36]/40 shadow"/>
                            <div>
                              <div>{lang ==='ar'? stf.name : stf.nameEn || stf.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {stf.id}</div>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-[#0A5C36]/10 text-[#0A5C36] border border-[#0A5C36]/20 rounded-lg text-[10px] font-bold block w-fit">
                               {stf.jobTitle}
                            </span>
                            <span className="text-[10px] text-slate-400 block pt-0.5">{stf.department}</span>
                          </td>

                          <td className="p-3 font-mono font-bold text-slate-700">${baseSalary.toLocaleString()} USD</td>

                          <td className="p-3 font-mono">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${totalActiveAdvance > 0 ?'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse':'text-slate-400'}`}>
                              {totalActiveAdvance > 0 ?`$${totalActiveAdvance} USD`:'$0 USD'}
                            </span>
                          </td>

                          <td className="p-3 font-mono font-black text-[#0A5C36] text-sm">${netSalary.toLocaleString()} USD</td>

                          <td className="p-3 font-mono">
                            {isPaid ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/>
                                <span>صُرِف بتاريخ {displayPaidDate} </span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                                 مستحق للصرف
                              </span>
                            )}
                          </td>

                          <td className="p-3 flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setShowAdvanceModal({id: stf.id, name: stf.name, salary: baseSalary})}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                              title="إعطاء سلفة تقتطع من الراتب القادم"
                            >
                              + سلفة
                            </button>

                            <button
                              onClick={() => handlePayStaff(stf)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] shadow transition-all cursor-pointer flex items-center gap-1 ${
                                isPaid ?'bg-slate-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-50':'btn-mustard'
                              }`}
                              title="صرف صافي راتب الموظف بعد خصم السلفة تلقائياً"
                            >
                              <span>{isPaid ?'إعادة الصرف':'صرف الصافي'}</span>
                            </button>

                            {currentRole ==='admin'&& (
                              <>
                                <button
                                  onClick={() => handleOpenEditStaffModal(stf)}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                                  title="تعديل الوظيفة والراتب"
                                >
                                  <Edit3 className="w-3.5 h-3.5"/>
                                </button>

                                <button
                                  onClick={() => deleteStaffEmployee(stf.id)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                                  title="حذف الموظف"
                                >
                                  <Trash2 className="w-3.5 h-3.5"/>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. كادر المعلمين والرواتب (Teachers Payroll) */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
            <h3 className="text-base font-bold text-[#0A5C36] border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0A5C36]"/>
                <span>رواتب كادر المعلمين المعتمدين ({teachers.length})</span>
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                    <th className="p-3 font-semibold">{t('instructor')}</th>
                    <th className="p-3 font-semibold">{t('monthlySalary')}</th>
                    <th className="p-3 font-semibold">المكافأة ($)</th>
                    <th className="p-3 font-semibold">السُلف القائمة ($)</th>
                    <th className="p-3 font-semibold">الصافي المستحق ($)</th>
                    <th className="p-3 font-semibold">حالة الصرف</th>
                    <th className="p-3 font-semibold text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                  {(teachers || []).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-xs text-slate-400">
                        لا يوجد معلمون مضافون حالياً في النظام.
                      </td>
                    </tr>
                  ) : (
                    (teachers || []).map((tch) => {
                      const salary = Number(tch?.monthlySalary || 1200);
                      const bonus = Number(tch?.dueBonus || 0);
                      const totalDue = salary + bonus;
                      const {totalActiveAdvance} = getEmpAdvanceDetails(tch.id);
                      const netSalary = Math.max(0, totalDue - totalActiveAdvance);
                      const isPaid = tch?.salaryStatus ==='paid';
                      const displayPaidDate = tch?.paidDate || todayStr;

                      return (
                        <tr key={tch.id} className="hover:bg-[#F8FAFC] transition-all">
                          <td className="p-3 font-bold flex items-center gap-2">
                            <img src={tch.avatar} alt={tch.name} className="w-8 h-8 rounded-full object-cover border border-[#0A5C36]"/>
                            <div>{lang ==='ar'? tch.name : tch.nameEn}</div>
                          </td>
                          <td className="p-3 font-mono font-bold">${salary.toLocaleString()} USD</td>
                          <td className="p-3 font-mono text-amber-700 font-bold">${bonus.toLocaleString()} USD</td>

                          <td className="p-3 font-mono">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${totalActiveAdvance > 0 ?'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse':'text-slate-400'}`}>
                              {totalActiveAdvance > 0 ?`$${totalActiveAdvance} USD`:'$0 USD'}
                            </span>
                          </td>

                          <td className="p-3 font-mono text-[#0A5C36] font-black text-sm">${netSalary.toLocaleString()} USD</td>
                          
                          <td className="p-3 font-mono">
                            {isPaid ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-[10px] font-bold flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/>
                                <span>صُرِف بتاريخ {displayPaidDate} </span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                                 مستحق للصرف
                              </span>
                            )}
                          </td>

                          <td className="p-3 flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => setShowAdvanceModal({id: tch.id, name: tch.name, salary: totalDue})}
                              className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                              title="إعطاء سلفة تقتطع من الراتب القادم"
                            >
                              + سلفة
                            </button>

                            <button
                              onClick={() => handlePayTeacher(tch, totalDue)}
                              className={`px-4 py-1.5 rounded-xl font-bold text-[11px] shadow transition-all cursor-pointer flex items-center gap-1 ${
                                isPaid ?'bg-slate-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-50':'btn-mustard'
                              }`}
                              title="صرف صافي راتب المعلم بعد خصم السلفة تلقائياً"
                            >
                              <span>{isPaid ?'إعادة الصرف':'صرف الصافي'}</span>
                            </button>

                            {currentRole ==='admin'&& (
                              <button
                                onClick={() => {
                                  setEditingTeacher(tch);
                                  setTeacherNewSalary(salary.toString());
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                                title="تعديل قيمة الراتب الشهري للمعلم"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#0A5C36]"/>
                                <span className="text-[10px] font-bold hidden sm:inline">تعديل الراتب</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : activeFinanceTab ==='expenses'? (
        /* Expenses Ledger Tab */
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600"/>
              <span>كشف المصاريف التشغيلية والمستلزمات والرواتب ({expenses.length})</span>
            </h3>

            <button
              onClick={() => setShowAddExpModal(true)}
              className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4"/>
              <span>إضافة مصروف جديد</span>
            </button>
          </div>

          {(expenses || []).length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              لا توجد مصاريف أو رواتب مسجلة حالياً.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(expenses || []).map((exp) => (
                <div key={exp.id} className="interactive-card bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2 relative group hover:border-red-500/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200">
                      {exp.category ||'مصروف عام'}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400"/>
                        <span>{exp.date || todayStr}</span>
                      </span>

                      {currentRole ==='admin'&& (
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer transition-all"
                          title="حذف المصروف"
                        >
                          <Trash2 className="w-3.5 h-3.5"/>
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#0F172A]">{exp.title}</h4>
                  <p className="text-sm font-black text-red-600 font-mono">${(exp.amount || 0).toLocaleString()} USD</p>
                  {exp.notes && <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-200">{exp.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Financial Analytics & Profit Charts Tab */
        <div className="space-y-6">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0A5C36]/10 text-[#0A5C36] rounded-2xl">
                  <PieChart className="w-6 h-6 text-[#0A5C36]"/>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0A5C36]"> لوحة تحليل المؤشرات والرسوم البيانية المالية</h3>
                  <p className="text-xs text-slate-500">تحليل الموقف المالي للمدرسة، ونسب تحصيل الأقساط، وصافي هامش الربح.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold">
                التقييم المالي: ممتاز 
              </span>
            </div>

            {/* Financial Bars Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                  <span>نسبة تحصيل أقساط الطلاب المدرسية:</span>
                  <span className="font-mono text-[#0A5C36] font-black">{totalRevenue > 0 && (totalRevenue + totalRemainingUSD) > 0 ? Math.round((totalRevenue / (totalRevenue + totalRemainingUSD || 1)) * 100) : 75}%</span>
                </h4>
                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300">
                  <div 
                    className="bg-[#0A5C36] h-full rounded-full transition-all duration-1000 shadow-inner"
                    style={{width:`${Math.min(100, Math.round((totalRevenue / ((totalRevenue + totalRemainingUSD) || 1)) * 100))}%`}}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>مقبوض: ${totalRevenue.toLocaleString()} USD</span>
                  <span>المستهدف: ${(totalRevenue + totalRemainingUSD).toLocaleString()} USD</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-[#0F172A] flex items-center justify-between">
                  <span>نسبة صافي الربح المتبقي من الميزانية:</span>
                  <span className="font-mono text-emerald-700 font-black">{profitMarginPercent}%</span>
                </h4>
                <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-1000 shadow-inner"
                    style={{width:`${Math.max(0, Math.min(100, profitMarginPercent))}%`}}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>مصاريف: ${totalExpenses.toLocaleString()} USD</span>
                  <span>الصافي: ${netProfit.toLocaleString()} USD</span>
                </div>
              </div>
            </div>

            {/* Monthly Profit Comparison Visual Bars */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-2 border-b border-slate-200 pb-2">
                <TrendingUp className="w-4 h-4 text-[#0A5C36]"/>
                <span>مقارنة الإيرادات والمصاريف الشهرية (Monthly Comparison Chart):</span>
              </h4>

              <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 pb-2 px-2 text-center text-xs font-mono">
                {[
                  {month:'أيلول', rev: 0, exp: 0},
                  {month:'تشرين 1', rev: 0, exp: 0},
                  {month:'تشرين 2', rev: 0, exp: 0},
                  {month:'كانون 1', rev: 0, exp: 0},
                  {month:'كانون 2', rev: 0, exp: 0},
                  {month:'الشهر الحالي', rev: totalRevenue, exp: totalExpenses}
                ].map((m, idx) => {
                  const maxVal = Math.max(100, totalRevenue, totalExpenses);
                  const revHeight = m.rev > 0 ? Math.max(12, Math.min(100, (m.rev / maxVal) * 100)) : 0;
                  const expHeight = m.exp > 0 ? Math.max(12, Math.min(100, (m.exp / maxVal) * 100)) : 0;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                        <div 
                          className="bg-[#0A5C36] hover:bg-[#08482a] w-3 sm:w-5 rounded-t-lg transition-all shadow cursor-pointer relative group/bar"
                          style={{height:`${revHeight}%`}}
                        >
                          <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none z-10 font-bold whitespace-nowrap">
                            ${m.rev.toLocaleString()} USD
                          </span>
                        </div>

                        <div 
                          className="bg-red-500 hover:bg-red-600 w-3 sm:w-5 rounded-t-lg transition-all shadow cursor-pointer relative group/bar"
                          style={{height:`${expHeight}%`}}
                        >
                          <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-red-800 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none z-10 font-bold whitespace-nowrap">
                            ${m.exp.toLocaleString()} USD
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-slate-600">{m.month}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 text-[11px] pt-2 border-t border-slate-200">
                <span className="flex items-center gap-1.5 font-bold text-[#0A5C36]">
                  <span className="w-3 h-3 rounded-full bg-[#0A5C36] inline-block"></span>
                  <span>إجمالي المقبوضات ($ USD)</span>
                </span>
                <span className="flex items-center gap-1.5 font-bold text-red-600">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                  <span>إجمالي المصاريف والرواتب ($ USD)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Interactive Total Revenue Breakdown Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0A5C36]"/>
                <span>كشف إجمالي الإيرادات المقبوضة بالتفصيل</span>
              </h3>
              <button onClick={() => setShowRevenueModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">إجمالي التحصيل المالي المباشر:</span>
                <span className="text-2xl font-black text-[#0A5C36] font-mono">${totalRevenue.toLocaleString()} USD</span>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold">
                {lang ==='ar'?'دولار نقدي':'Fresh USD'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              يمثل هذا الرقم مجموع كافة الدفعات المالية والأقساط التي سددها الطلاب وأولياء الأمور بالكامل بالدولار الأمريكي.
            </p>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowRevenueModal(false)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Interactive Net Profit & Margin Analysis Modal */}
      {showProfitModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-xl w-full space-y-5 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#0A5C36]"/>
                <span>تحليل الموقف المالي وهامش الأرباح المتبقية</span>
              </h3>
              <button onClick={() => setShowProfitModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">الإيرادات المقبوضة</span>
                <span className="text-sm font-bold text-[#0A5C36] font-mono">${totalRevenue.toLocaleString()}</span>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 text-center">
                <span className="text-[11px] text-slate-500 block">المصاريف والرواتب</span>
                <span className="text-sm font-bold text-red-600 font-mono">${totalExpenses.toLocaleString()}</span>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#0A5C36]/30 text-center">
                <span className="text-[11px] text-slate-500 block">صافي الفائض</span>
                <span className="text-sm font-bold text-[#0A5C36] font-mono">${netProfit.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-bold">نسبة هامش الأرباح المتبقية:</span>
                <span className="text-[#0A5C36] font-extrabold font-mono text-sm">{profitMarginPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#0A5C36] h-full rounded-full transition-all duration-500"
                  style={{width:`${Math.max(0, Math.min(100, profitMarginPercent))}%`}}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowProfitModal(false)} className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Employee Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddStaffSubmit}
            className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A5C36]"/>
                <span>إضافة موظف/عامل جديد بالكادر المالي والإداري</span>
              </h3>
              <button type="button"onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
            </div>

            {/* Photo Avatar Upload */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0A5C36]"/>
                <span>رفع صورة الموظف من جهازك:</span>
              </label>

              <div className="flex items-center gap-3">
                <img src={staffAvatar} alt="Avatar"className="w-12 h-12 rounded-full object-cover border-2 border-[#0A5C36]"/>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStaffAvatarUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0A5C36] file:text-white hover:file:bg-[#08492b] cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">اسم الموظف/العامل <span className="text-red-500">*</span></label>
                <input type="text"required value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="اسم الموظف الكامل..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0A5C36]"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">المسمى الوظيفي <span className="text-red-500">*</span></label>
                <input type="text"required value={staffJobTitle} onChange={(e) => setStaffJobTitle(e.target.value)} placeholder="محاسب / أمين مكتبة / حارس..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0A5C36]"/>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">القسم التابع له</label>
                <select value={staffDept} onChange={(e) => setStaffDept(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  <option value="القسم الإداري والحسابات">القسم الإداري والحسابات</option>
                  <option value="قسم الخدمات والصيانة">قسم الخدمات والصيانة</option>
                  <option value="قسم الأمن والنقل المدرسى">قسم الأمن والنقل المدرسي</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">الراتب الشهري ($ USD) <span className="text-red-500">*</span></label>
                <input type="number"required value={staffSalary} onChange={(e) => setStaffSalary(e.target.value)} placeholder="800"className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"/>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">رقم الهاتف</label>
              <input type="text"value={staffPhone} onChange={(e) => setStaffPhone(e.target.value)} placeholder="+961 70XXXXXX"className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"/>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Operational Expense Modal */}
      {showAddExpModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExpSubmit}
            className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0A5C36] flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600"/>
                <span>تسجيل مصروف تشغيلي جديد</span>
              </h3>
              <button type="button"onClick={() => setShowAddExpModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">بيان المصروف <span className="text-red-500">*</span></label>
              <input type="text"required value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="شراء قرطاسية ومستلزمات طابعات..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0A5C36]"/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">المبلغ ($ USD) <span className="text-red-500">*</span></label>
              <input type="number"required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="250"className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">تصنيف المصروف</label>
              <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                <option value="مستلزمات تعليمية">مستلزمات تعليمية وتجهيزات</option>
                <option value="صيانة ومرافق">صيانة ومرافق كهرباء ومولدات</option>
                <option value="وقود حافلات النقل">وقود وصيانة حافلات النقل</option>
                <option value="رواتب ومكافآت">رواتب ومكافآت</option>
                <option value="مصاريف نثرية وأخرى">مصاريف نثرية وأخرى</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowAddExpModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Give Advance Modal Portal ────────────────────────────────────── */}
      {showAdvanceModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddAdvanceSubmit}
            className="bg-white border-2 border-purple-600 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-purple-700 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600"/>
                <span>منح سلفة مادية — {showAdvanceModal.name}</span>
              </h3>
              <button type="button"onClick={() => setShowAdvanceModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">مبلغ السلفة ($ USD) <span className="text-red-500">*</span></label>
              <input type="number"required min="1"max={showAdvanceModal.salary || 3000}
                value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)}
                placeholder="مثال: 150..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-purple-600"/>
              <span className="text-[10px] text-purple-600 font-bold block pt-0.5">
                 سيتم خصم هذه السلفة تلقائياً من صافي الراتب عند الصرف!
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">السبب / بيان السلفة</label>
              <input type="text"value={advanceReason} onChange={e => setAdvanceReason(e.target.value)}
                placeholder="مثال: سلفة شخصية طارئة..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-600"/>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowAdvanceModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button type="submit"className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                منح السلفة وتوثيقها 
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* ── Helper Report Filtration Logic ── */}
      {(() => {
        const getFilteredReportData = () => {
          // 1. Revenues
          const reportPayments = [];
          Object.entries(paymentHistory || {}).forEach(([stuId, historyList]) => {
            const stu = students.find(s => s.id === stuId);
            const name = stu ? (lang ==='ar'? stu.name : stu.nameEn) :`طالب #${stuId}`;
            const grade = stu ? (lang ==='ar'? stu.grade : stu.gradeEn) :'';
            (historyList || []).forEach(h => {
              const dObj = new Date(h.date);
              if (dObj.getFullYear() === Number(reportYear)) {
                if (reportType ==='annual'|| (dObj.getMonth() + 1) === Number(reportMonth)) {
                  reportPayments.push({
                    id: h.id || Math.random().toString(),
                    name,
                    grade,
                    date: h.date,
                    amount: Number(h.amountUSD || 0),
                    method: h.method ||'fresh_cash'
                  });
                }
              }
            });
          });

          // 2. Expenses
          const reportExp = (expenses || []).filter(e => {
            const dObj = new Date(e.date || todayStr);
            const matchYear = dObj.getFullYear() === Number(reportYear);
            if (reportType ==='annual') return matchYear;
            return matchYear && (dObj.getMonth() + 1) === Number(reportMonth);
          });

          // 3. Staff Salaries
          const reportStaff = (staffEmployees || []).filter(s => {
            if (!s.lastSalaryPaidDate) return false;
            const dObj = new Date(s.lastSalaryPaidDate);
            const matchYear = dObj.getFullYear() === Number(reportYear);
            if (reportType ==='annual') return matchYear;
            return matchYear && (dObj.getMonth() + 1) === Number(reportMonth);
          }).map(s => ({
            id: s.id,
            title:`${lang ==='ar'?'صرف راتب للموظف':'Salary Payout:'} ${s.name}`,
            category: lang ==='ar'?'رواتب موظفين':'Staff Salary',
            date: s.lastSalaryPaidDate,
            amount: Number(s.monthlySalary || 800)
          }));

          // 4. Teacher Salaries
          const reportTch = (teachers || []).filter(t => {
            if (!t.lastSalaryPaidDate) return false;
            const dObj = new Date(t.lastSalaryPaidDate);
            const matchYear = dObj.getFullYear() === Number(reportYear);
            if (reportType ==='annual') return matchYear;
            return matchYear && (dObj.getMonth() + 1) === Number(reportMonth);
          }).map(t => ({
            id: t.id,
            title:`${lang ==='ar'?'صرف راتب للمعلم':'Salary Payout:'} ${t.name}`,
            category: lang ==='ar'?'رواتب معلمين':'Teacher Salary',
            date: t.lastSalaryPaidDate,
            amount: Number(t.monthlySalary || 1000)
          }));

          // 5. Advances
          const reportAdv = [];
          Object.entries(employeeAdvances || {}).forEach(([empId, advList]) => {
            const empObj = staffEmployees.find(e => e.id === empId) || teachers.find(t => t.id === empId);
            const name = empObj ? empObj.name :`موظف #${empId}`;
            (advList || []).forEach(a => {
              const dObj = new Date(a.date || todayStr);
              if (dObj.getFullYear() === Number(reportYear)) {
                if (reportType ==='annual'|| (dObj.getMonth() + 1) === Number(reportMonth)) {
                  reportAdv.push({
                    id: a.id || Math.random().toString(),
                    title:`${lang ==='ar'?'سلفة مالية للموظف':'Advance to:'} ${name}`,
                    category: lang ==='ar'?'سلف موظفين':'Employee Advances',
                    date: a.date,
                    amount: Number(a.amount || 0)
                  });
                }
              }
            });
          });

          const allOutgoings = [
            ...reportExp.map(e => ({id: e.id, title: e.title, category: e.category || (lang ==='ar'?'مصروف عام':'General'), date: e.date, amount: Number(e.amount || 0)})),
            ...reportStaff,
            ...reportTch,
            ...reportAdv
          ];

          const sumRevenues = reportPayments.reduce((s, p) => s + p.amount, 0);
          const sumExpenses = allOutgoings.reduce((s, o) => s + o.amount, 0);
          const netProfitLoss = sumRevenues - sumExpenses;
          const margin = sumRevenues > 0 ? Math.round((netProfitLoss / sumRevenues) * 100) : 0;

          return {
            reportPayments,
            allOutgoings,
            sumRevenues,
            sumExpenses,
            netProfitLoss,
            margin
          };
        };

        const {reportPayments, allOutgoings, sumRevenues, sumExpenses, netProfitLoss, margin} = showReportModal ? getFilteredReportData() : {reportPayments: [], allOutgoings: [], sumRevenues: 0, sumExpenses: 0, netProfitLoss: 0, margin: 0};

        return showReportModal && createPortal(
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            <div id="print-financial-report-area"className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 text-[#0F172A] dark:text-white shadow-2xl relative text-right rtl">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xl"></span>
                  <h3 className="text-base font-black text-[#0A5C36] dark:text-[#52b788]">
                    {lang ==='ar'?'التقارير الحسابية والمالية التفصيلية':'Accounting & Financial Reports'}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setIsPrintingReport(false);
                  }} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-black cursor-pointer"
                >
                  ✕ {lang ==='ar'?'إغلاق':'Close'}
                </button>
              </div>

              {/* Print Settings & Filtering Panel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 print:hidden">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lang ==='ar'?'نوع التقرير:':'Report Type:'}</span>
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-300 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setReportType('monthly')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${reportType ==='monthly'?'bg-[#0A5C36] text-white shadow':'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                      >
                        {lang ==='ar'?'تقرير شهري':'Monthly'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportType('annual')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${reportType ==='annual'?'bg-[#0A5C36] text-white shadow':'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                      >
                        {lang ==='ar'?'تقرير سنوي':'Annual'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {reportType ==='monthly'&& (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 block font-bold">{lang ==='ar'?'الشهر':'Month'}</span>
                        <select
                          value={reportMonth}
                          onChange={(e) => setReportMonth(e.target.value)}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer text-right text-[#0F172A]"
                        >
                          {['كانون الثاني (1)','شباط (2)','آذار (3)','نيسان (4)','أيار (5)','حزيران (6)','تموز (7)','آب (8)','أيلول (9)','تشرين الأول (10)','تشرين الثاني (11)','كانون الأول (12)'].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 block font-bold">{lang ==='ar'?'السنة':'Year'}</span>
                      <select
                        value={reportYear}
                        onChange={(e) => setReportYear(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer text-right text-[#0F172A]"
                      >
                        {[2025, 2026, 2027, 2028].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPrintingReport(true);
                      setTimeout(() => {
                        window.print();
                      }, 150);
                    }}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                     {lang ==='ar'?'طباعة هذا التقرير':'Print This Report'}
                  </button>
                </div>
              </div>

              {/* Official Printable Report View */}
              <div className="space-y-6">
                {/* Document Header */}
                <div className="text-center border-b-2 border-slate-900 dark:border-white pb-4 space-y-1">
                  <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">
                    {lang ==='ar'?'مدرسة النور للتعليم والدعم الأكاديمي':'Al-Noor Educational Support School'}
                  </h2>
                  <h1 className="text-xl font-black text-slate-900 dark:text-white underline decoration-double">
                    {reportType ==='monthly'
                      ? (lang ==='ar'?`التقرير المالي والحسابي لشهر: ${['كانون الثاني','شباط','آذار','نيسان','أيار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'][Number(reportMonth) - 1]} لعام ${reportYear}`:`Financial Report for ${['January','February','March','April','May','June','July','August','September','October','November','December'][Number(reportMonth) - 1]} ${reportYear}`)
                      : (lang ==='ar'?`التقرير المالي والحسابي السنوي لعام: ${reportYear}`:`Annual Financial Report for ${reportYear}`)
                    }
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {lang ==='ar'?`تاريخ الإصدار: ${new Date().toLocaleDateString('ar-LB')}`:`Date of Issue: ${new Date().toLocaleDateString()}`} | {lang ==='ar'?'العملة المعتمدة: دولار أمريكي ($ USD)':'Currency: US Dollars ($ USD)'}
                  </p>
                </div>

                {/* Financial Dashboard Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl font-mono text-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">{lang ==='ar'?'إجمالي الإيرادات (المقبوضات)':'Total Revenues'}</span>
                    <span className="text-base font-black text-[#0A5C36] dark:text-emerald-400">${sumRevenues.toLocaleString()} USD</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">{lang ==='ar'?'إجمالي التكاليف (المصاريف)':'Total Expenses'}</span>
                    <span className="text-base font-black text-red-600 dark:text-red-400">${sumExpenses.toLocaleString()} USD</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">{lang ==='ar'?'صافي الربح / الخسارة':'Net Profit / Loss'}</span>
                    <span className={`text-base font-black ${netProfitLoss >= 0 ?'text-emerald-600':'text-red-500'}`}>
                      {netProfitLoss >= 0 ?`+$${netProfitLoss.toLocaleString()}`:`-$${Math.abs(netProfitLoss).toLocaleString()}`} USD
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans block">{lang ==='ar'?'هامش الربح التشغيلي':'Profit Margin'}</span>
                    <span className={`text-base font-black ${netProfitLoss >= 0 ?'text-[#0A5C36] dark:text-[#52b788]':'text-red-500'}`}>{margin}%</span>
                  </div>
                </div>

                {/* Side-by-side Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  
                  {/* 1. Revenues Column */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-[#0A5C36] dark:text-[#52b788] border-b border-[#0A5C36]/20 pb-1 flex justify-between items-center">
                      <span>${sumRevenues.toLocaleString()} USD</span>
                      <span> {lang ==='ar'?'المقبوضات والإيرادات (الأقساط):':'Revenues / Tuition Paid:'}</span>
                    </h4>
                    {reportPayments.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">{lang ==='ar'?'لا توجد دفعات مقبوضة في هذه الفترة.':'No receipts in this period.'}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-slate-700 dark:text-slate-300 border border-collapse border-slate-200 dark:border-slate-800 text-right">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'تاريخ الدفعة':'Date'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'اسم التلميذ / الصف':'Student / Grade'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'طريقة السداد':'Method'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'المبلغ':'Amount'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportPayments.map((p, idx) => (
                              <tr key={p.id + idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{p.date}</td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">
                                  {p.name}
                                  <span className="text-[8px] text-slate-500 font-normal block">{p.grade}</span>
                                </td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">
                                  {p.method ==='fresh_cash'? (lang ==='ar'?'نقدي (دولار)':'Fresh Cash') : (lang ==='ar'?'حوالة (OMT/Whish)':'OMT / Whish')}
                                </td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold font-mono text-[#0A5C36]">${p.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* 2. Expenses Column */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-red-600 dark:text-red-400 border-b border-red-500/20 pb-1 flex justify-between items-center">
                      <span>${sumExpenses.toLocaleString()} USD</span>
                      <span> {lang ==='ar'?'المدفوعات والمصاريف (رواتب/سلف/تشغيل):':'Outgoings / Expenses:'}</span>
                    </h4>
                    {allOutgoings.length === 0 ? (
                      <p className="text-[10px] text-slate-400 text-center py-4">{lang ==='ar'?'لا توجد مصاريف أو رواتب مصروفة في هذه الفترة.':'No expenses in this period.'}</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-[10px] text-slate-700 dark:text-slate-300 border border-collapse border-slate-200 dark:border-slate-800 text-right">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-950 font-bold border-b border-slate-200 dark:border-slate-800">
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'تاريخ الصرف':'Date'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'بيان المصروف / الراتب':'Expense Detail'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'التصنيف':'Category'}</th>
                              <th className="p-2 border border-slate-200 dark:border-slate-800">{lang ==='ar'?'المبلغ':'Amount'}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allOutgoings.map((o, idx) => (
                              <tr key={o.id + idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-mono">{o.date}</td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold">{o.title}</td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800">
                                  <span className="px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 font-semibold text-[8px]">{o.category}</span>
                                </td>
                                <td className="p-2 border border-slate-200 dark:border-slate-800 font-bold font-mono text-red-600">${o.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

                {/* Printed Signatures Section */}
                <div className="pt-10 grid grid-cols-2 gap-10 text-center text-xs font-bold border-t border-dashed border-slate-300 dark:border-slate-800">
                  <div className="space-y-12">
                    <p>{lang ==='ar'?'توقيع وختم محاسب المدرسة':'Accountant Signature & Stamp'}</p>
                    <div className="border-b border-slate-400 w-48 mx-auto"></div>
                  </div>
                  <div className="space-y-12">
                    <p>{lang ==='ar'?'اعتماد المدير العام للمدرسة':'General Manager Approval'}</p>
                    <div className="border-b border-slate-400 w-48 mx-auto"></div>
                  </div>
                </div>
              </div>
              
              {/* Dynamic style for print layout override */}
              {isPrintingReport && (
                <style dangerouslySetInnerHTML={{__html:`
                  @media print {
                    body * {
                      visibility: hidden !important;
                    }
                    #print-financial-report-area, #print-financial-report-area * {
                      visibility: visible !important;
                    }
                    #print-financial-report-area {
                      position: absolute !important;
                      left: 0 !important;
                      top: 0 !important;
                      width: 100% !important;
                      direction: rtl !important;
                      text-align: right !important;
                      background: white !important;
                      color: black !important;
                      border: none !important;
                      padding: 10px !important;
                    }
                    .print\\:hidden {
                      display: none !important;
                    }
                  }
                `}} />
              )}
            </div>
          </div>,
          document.body
        );
      })()}

      {/* EDIT TEACHER SALARY MODAL */}
      {editingTeacher && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scale-up text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-[#0A5C36] dark:text-emerald-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5"/>
                <span>تعديل الراتب الشهري للمعلم: {editingTeacher.name}</span>
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!teacherNewSalary || Number(teacherNewSalary) <= 0) return;
                updateTeacherSalary(editingTeacher.id, teacherNewSalary);
                setSalaryToast(`تم تعديل راتب المعلم (${editingTeacher.name}) إلى $${Number(teacherNewSalary).toLocaleString()} USD بنجاح`);
                setTimeout(() => setSalaryToast(''), 4000);
                setEditingTeacher(null);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">الراتب الشهري الجديد ($ USD):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={teacherNewSalary}
                    onChange={(e) => setTeacherNewSalary(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:border-[#0A5C36]"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 font-mono">$ USD</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A5C36] hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  حفظ تعديل الراتب 
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ONE-TIME FINANCIAL ACCOUNTS RESET MODAL */}
      {showResetFinModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border-2 border-red-500 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-scale-up text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                <span> تصفير كافة الحسابات والمالية (مرة واحدة فقط)</span>
              </h3>
              <button
                onClick={() => setShowResetFinModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900 text-xs">
              <p className="font-extrabold text-red-900 dark:text-red-200 text-sm"> تنبيه هام مخصص لمدير المنظومة:</p>
              <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-300 font-bold leading-relaxed">
                <li>سيتم تصفير جميع المبالغ المدفوعة في الأقساط المدرسية للطلاب إلى ($0 USD).</li>
                <li>سيتم تفريغ كافة سجلات وإيصالات الصرفيات والمصاريف والرواتب السابقة.</li>
                <li>تظل حسابات الموظفين والمعلمين والطلاب موجودة بالكامل دون أي مسح.</li>
                <li>يساعد هذا الخيار على بدء سجل مالي صافٍ جديد للمدرسة.</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetFinModal(false)}
                className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={() => {
                  resetFinancialAccounts();
                  setShowResetFinModal(false);
                  setSalaryToast('تم تصفير وبدء السجلات المالية والأقساط بنجاح!');
                  setTimeout(() => setSalaryToast(''), 4500);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <span>تأكيد وتصفير الحسابات والمالية </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
