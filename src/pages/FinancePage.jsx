import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Wallet,
  Receipt,
  Plus,
  Printer,
  Phone,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar
} from 'lucide-react';

export const FinancePage = () => {
  const {
    students,
    payments,
    addPayment,
    setSelectedReceipt,
    schoolInfo
  } = useSchool();

  const [activeSubTab, setActiveSubTab] = useState('tuition'); // 'tuition' | 'payments' | 'payroll'
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // New Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    studentId: students[0]?.id || '',
    amount: 200,
    currency: 'USD',
    paymentMethod: 'نقدي Cash',
    notes: 'دفعة قسط دراسي'
  });

  // Calculate totals
  const totalTuition = students.reduce((acc, s) => acc + (Number(s.tuitionTotal) || 0) - (Number(s.discountAmount) || 0), 0);
  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const totalRemaining = Math.max(0, totalTuition - totalPaid);

  const lbpRate = 89500;

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const student = students.find(s => s.id === paymentForm.studentId);
    if (!student) {
      alert('يرجى اختيار الطالب');
      return;
    }

    const createdPayment = addPayment({
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      amount: Number(paymentForm.amount),
      currency: paymentForm.currency,
      paymentMethod: paymentForm.paymentMethod,
      notes: paymentForm.notes
    });

    setShowAddPaymentModal(false);
    setSelectedReceipt(createdPayment); // Open printable official receipt right away!
  };

  // WhatsApp Reminder Generator
  const sendWhatsAppReminder = (student) => {
    const text = encodeURIComponent(
      `السلام عليكم ورحمة الله وبركاته ولي امر ( ${student.name} ) نود تذكيركم بضرورة تسديد القسط الشهري المستحق يرجى التسديد في اقرب وقت شاكرين تعاونكم الكريم`
    );
    const cleanPhone = (student.parentPhone || student.phone || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600" />
            الشؤون المالية والأقساط وإيصالات القبض
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الأقساط، تسجيل الدفعات الفورية، توليد سندات القبض الرسمية، ومسيرات الرواتب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPaymentModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل دفعة جديدة + إيصال</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>إجمالي الأقساط المستحقة</span>
            <DollarSign className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">${totalTuition.toLocaleString()} USD</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ≈ {(totalTuition * lbpRate).toLocaleString('ar-LB')} LBP
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>إجمالي المقبوضات المسددة</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">${totalPaid.toLocaleString()} USD</div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            نسبة التحصيل: {totalTuition > 0 ? Math.round((totalPaid / totalTuition) * 100) : 0}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>الأقساط المتبقية للتحصيل</span>
            <CreditCard className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">${totalRemaining.toLocaleString()} USD</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            ≈ {(totalRemaining * lbpRate).toLocaleString('ar-LB')} LBP
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 no-print">
        <button
          onClick={() => setActiveSubTab('tuition')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === 'tuition' ? 'bg-sky-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          أقساط وحسابات الطلاب
        </button>
        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeSubTab === 'payments' ? 'bg-sky-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          سجل إيصالات القبض الرسمية ({payments.length})
        </button>
      </div>

      {/* SubTab 1: Students Tuition Accounts */}
      {activeSubTab === 'tuition' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الصف</th>
                  <th className="p-3">ولي الأمر</th>
                  <th className="p-3">القسط الإجمالي</th>
                  <th className="p-3">الخصم الممنوح</th>
                  <th className="p-3">المبلغ المسدد</th>
                  <th className="p-3">المتبقي</th>
                  <th className="p-3 text-center no-print">إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, idx) => (
                  <tr key={student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-bold text-slate-900">{student.name}</td>
                    <td className="p-3 text-slate-600">{student.grade} ({student.section})</td>
                    <td className="p-3 text-slate-700">{student.parentName}</td>
                    <td className="p-3 font-bold">${student.tuitionTotal}</td>
                    <td className="p-3 font-bold text-rose-600">
                      {student.discountAmount > 0 ? `-$${student.discountAmount}` : '$0'}
                    </td>
                    <td className="p-3 font-bold text-emerald-600">${student.paidAmount}</td>
                    <td className="p-3 font-black text-rose-600">${student.remainingAmount}</td>
                    <td className="p-3 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setPaymentForm({ ...paymentForm, studentId: student.id });
                            setShowAddPaymentModal(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition"
                        >
                          + تسجيل دفعة
                        </button>

                        {student.remainingAmount > 0 && (
                          <button
                            onClick={() => sendWhatsAppReminder(student)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                            title="إرسال تذكير مالي عبر واتساب"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 2: Official Receipts Log */}
      {activeSubTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-3">رقم السند الرسمي</th>
                  <th className="p-3">اسم الطالب</th>
                  <th className="p-3">الصف</th>
                  <th className="p-3">المبلغ المقبوض</th>
                  <th className="p-3">التاريخ</th>
                  <th className="p-3">طريقة القبض</th>
                  <th className="p-3">المتبقي بعد الدفعة</th>
                  <th className="p-3 text-center no-print">عرض وطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-mono font-bold text-sky-800">{p.id}</td>
                    <td className="p-3 font-bold text-slate-900">{p.studentName}</td>
                    <td className="p-3 text-slate-600">{p.grade}</td>
                    <td className="p-3 font-black text-emerald-600">${p.amount} {p.currency}</td>
                    <td className="p-3 font-mono text-slate-500">{p.paymentDate}</td>
                    <td className="p-3 text-slate-600">{p.paymentMethod}</td>
                    <td className="p-3 font-bold text-rose-600">${p.remainingAfter ?? 0}</td>
                    <td className="p-3 text-center no-print">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg font-bold text-xs transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>معاينة وطباعة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-fade-in">
            <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              تسجيل دفعة مالية وتوليد سند قبض رسمي
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اختر الطالب المستفيد *</label>
                <select
                  value={paymentForm.studentId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - {s.grade} (المتبقي: ${s.remainingAmount})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المبلغ المقبوض (USD) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-emerald-300 text-emerald-800 font-mono font-bold text-base bg-emerald-50/30"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">طريقة القبض</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="نقدي Cash">نقدي Cash</option>
                  <option value="تحويل مصرفي Bank Transfer">تحويل مصرفي Bank Transfer</option>
                  <option value="شيك بنكي Check">شيك بنكي Check</option>
                  <option value="بطاقة ائتمان POS">بطاقة ائتمان POS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات / بيان الدفعة</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  حفظ وتوليد السند فوراً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
