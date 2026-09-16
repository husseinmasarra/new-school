import React, {useState} from'react';
import {useApp} from'../context/AppContext';
import {getRealQRCodeURL} from'../services/dbService';
import {GraduationCap, Printer, ShieldCheck, User, AlertCircle, CreditCard} from'lucide-react';

export const StudentCardPage = () => {
  const {lang, t, siteSettings, students, selectedStudentId, setSelectedStudentId, currentRole} = useApp();

  const isAr = lang ==='ar';
  const safeStudents = students || [];
  const [currentStuId, setCurrentStuId] = useState(selectedStudentId || safeStudents[0]?.id);

  const student = safeStudents.find((s) => s.id === currentStuId) || safeStudents[0];

  if (!student) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-10 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-12 animate-fade-in shadow-sm text-[#0F172A]">
        <div className="w-16 h-16 bg-[#0284C7]/10 text-[#0284C7] rounded-3xl flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8"/>
        </div>
        <h3 className="text-lg font-bold text-[#0284C7]">{isAr ?'لا يوجد طلاب مضافون حالياً':'No Students Available'}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isAr ?'يمكنك إضافة طالب جديد عبر قسم (دليل المدرسة) لطباعة بطاقته الرقمية المعتمدة.':'Add a student from Directory to preview student ID card.'}
        </p>
      </div>
    );
  }

  const isSpecial = Boolean(student?.isSpecialCase);
  const baseTuition = isSpecial ? 0 : Number(student?.tuitionTotal ?? 700);
  const adminFees = isSpecial ? 0 : Number(student?.adminFees || 0);
  const transportFee = isSpecial ? 0 : (student?.hasTransport ? (Number(student?.transportFee) || 0) : 0);
  const totalTuition = isSpecial ? 0 : Math.max(0, baseTuition + adminFees + transportFee);
  const discountTuition = isSpecial ? 0 : Number(student?.tuitionDiscount || student?.discount || 0);
  const paidTuition = isSpecial ? 0 : Number(student?.tuitionPaid || 0);
  const netTuition = isSpecial ? 0 : Math.max(0, totalTuition - discountTuition);
  const remainingTuition = isSpecial ? 0 : Math.max(0, netTuition - paidTuition);

  return (
    <div className="space-y-6 animate-fade-in printable-card-container text-[#0F172A]">
      
      {/* Top Navigation Bar & Student Selector */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <GraduationCap className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('studentCardTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ?"بطاقة هوية طالب رقمية بقياس البطاقة الشخصية (CR80) الجاهزة للطباعة."
                :"Standard pocket ID badge card format (CR80 ratio) for printing."}
            </p>
          </div>
        </div>

        {/* Student Dropdown Selector & Print Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {currentRole !=='student'&& (
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2 rounded-xl">
              <User className="w-4 h-4 text-[#0284C7]"/>
              <select
                value={currentStuId ||''}
                onChange={(e) => {
                  setCurrentStuId(e.target.value);
                  if (setSelectedStudentId) setSelectedStudentId(e.target.value);
                }}
                className="bg-transparent text-xs font-bold text-[#0F172A] focus:outline-none cursor-pointer"
              >
                {safeStudents.map((s) => (
                  <option key={s.id} value={s.id} className="bg-white text-[#0F172A]">
                    {isAr ? s.name : s.nameEn} ({isAr ? s.grade : s.gradeEn})
                  </option>
                ))}
              </select>
            </div>
          )}

          {currentRole !=='student'&& (
            <button
              onClick={() => window.print()}
              className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4"/>
              <span>{isAr ?"طباعة البطاقة":"Print Student ID Card"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Prominent Remaining Unpaid Tuition Banner */}
      <div className="no-print bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-3 shadow-sm text-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#0284C7]"/>
            <span>{isAr ?`كشف القسط المالي وتفاصيل المبالغ المتبقية للطالب (${student.name})`:`Financial Tuition Summary for (${student.nameEn})`}</span>
          </h3>

          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isSpecial
              ?'bg-amber-100 text-amber-900 border border-amber-300'
              : remainingTuition === 0
              ?'bg-emerald-50 text-emerald-800 border border-emerald-300'
              :'bg-red-50 text-red-800 border border-red-300'
          }`}>
            {isSpecial ? (isAr ?'حالة خاصة (معفى بالكامل - 0$)':'Special Case (Exempt - $0)') : remainingTuition === 0 ? (isAr ?'مسدد بالكامل':'Fully Paid') : (isAr ?'يوجد قسط متبقي':'Pending Balance')}
          </span>
        </div>

        <div className={`grid grid-cols-1 ${discountTuition > 0 ?'sm:grid-cols-4':'sm:grid-cols-3'} gap-4 text-xs font-mono`}>
          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
            <span className="text-slate-500 block text-[11px]">{t('totalTuition')} ($ USD):</span>
            <span className="text-base font-extrabold text-[#0F172A]">${totalTuition.toLocaleString()} USD</span>
          </div>

          {discountTuition > 0 && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 space-y-1 shadow-xs">
              <span className="text-emerald-800 font-extrabold block text-[11px]"> {isAr ?'الخصم والتخفيض':'Tuition Discount'}:</span>
              <span className="text-base font-black text-emerald-700">-${discountTuition.toLocaleString()} USD</span>
            </div>
          )}

          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
            <span className="text-slate-500 block text-[11px]">{t('paidAmount')} ($ USD):</span>
            <span className="text-base font-extrabold text-[#0284C7]">${paidTuition.toLocaleString()} USD</span>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-red-300 space-y-1 shadow-sm">
            <span className="text-red-700 block text-[11px] font-black flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-600"/>
              <span>{t('remainingAmount')} ($ USD):</span>
            </span>
            <span className="text-lg font-black text-red-700 block">${remainingTuition.toLocaleString()} USD</span>
            <span className="text-[10px] text-slate-500 font-sans block">{student.monthlyInstallmentPlan || (isAr ?'نظام الأقساط الشهرية':'Monthly Installments')}</span>
          </div>
        </div>
      </div>

      {/* Main Stage: DIGITAL POCKET STUDENT ID CARD */}
      <div className="flex justify-center items-center py-4">
        <div className="w-full max-w-[420px] relative group">
          
          {/* Direct Print Button on the card */}
          <button
            onClick={() => window.print()}
            className="no-print absolute -top-3 -right-3 z-30 bg-[#EF4444] hover:bg-[#DC2626] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 transition-all cursor-pointer"
            title="طباعة هذه البطاقة مباشرة"
          >
            <Printer className="w-3.5 h-3.5"/>
            <span>{isAr ?'طباعة':'Print'}</span>
          </button>

          <div
            id="printable-student-card"
            className="printable-card relative bg-[#0284C7] rounded-2xl border-2 border-[#EF4444] shadow-2xl overflow-hidden ring-1 ring-black/10 text-white"
            style={{aspectRatio:'1.586 / 1'}}
          >
            
            {/* Top Compact Brand Header Bar */}
            <div className="bg-[#032541] px-3.5 py-2 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white p-0.5 flex items-center justify-center shadow shrink-0 overflow-hidden">
                  <img src="/emblem.png"alt="Logo"className="w-full h-full object-contain"/>
                </div>
                <div>
                  <h3 className="text-[11px] font-black leading-tight text-white">{isAr ? (siteSettings?.schoolName || t('schoolName')) : (siteSettings?.schoolNameEn || t('schoolName'))}</h3>
                  <span className="text-[9px] text-[#EF4444] font-bold block">{isAr ?'بطاقة طالب معتمدة • OFFICIAL ID':'Official Student ID Card'}</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[8px] font-black bg-[#EF4444] text-white px-2 py-0.5 rounded-full shadow">
                <ShieldCheck className="w-2.5 h-2.5"/>
                <span>{siteSettings?.academicYear ||'2026/2027'}</span>
              </span>
            </div>

            {/* Card Body */}
            <div className="p-3.5 flex items-center justify-between gap-3 relative z-10">
              
              {/* Photo & Identity Details */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white text-[#0284C7] font-black text-xl flex items-center justify-center border-2 border-[#EF4444] shadow-lg shrink-0">
                  {(student.name ||'ط')[0]}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-white">{isAr ? student.name : student.nameEn}</h4>
                  <p className="text-[10px] text-sky-100 font-bold">{isAr ? student.grade : student.gradeEn} ({student.classRoom})</p>
                  <p className="text-[9px] font-mono text-slate-200">ID: {student.id}</p>
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="bg-white p-1.5 rounded-xl border border-[#EF4444] text-center shadow-md shrink-0">
                <img src={realQrCodeUrl} alt="QR Code"className="w-14 h-14 object-contain"/>
                <span className="text-[7px] font-bold text-[#032541] block mt-0.5">{t('qrCodeLabel')}</span>
              </div>

            </div>

            {/* Card Footer Bar */}
            <div className="bg-[#032541] px-3 py-1 text-[9px] text-white font-bold flex justify-between items-center border-t border-[#0284C7]">
              <span>{isAr ?'مدرسة الدعم التعليمي - لبنان':'Educational Support School - Lebanon'}</span>
              <div className="flex items-center gap-2">
                <span>GPA: {student.gpa || 95}%</span>
                <button
                  onClick={(e) => {e.stopPropagation(); window.print();}}
                  className="no-print bg-[#EF4444] text-white px-1.5 py-0.5 rounded text-[8px] font-black hover:bg-[#DC2626] cursor-pointer"
                >
                  {isAr ?'طباعة':'Print'}
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
