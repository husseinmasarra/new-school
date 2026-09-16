import React from'react';
import {useSchool} from'../context/SchoolContext';
import {Printer, X, CheckCircle, ShieldCheck} from'lucide-react';

export const OfficialReceiptModal = () => {
  const {selectedReceipt, setSelectedReceipt, schoolInfo} = useSchool();

  if (!selectedReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const lbpRate = 89500;
  const lbpAmount = (selectedReceipt.amount * lbpRate).toLocaleString('ar-LB');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        
        {/* Action Header (hidden in print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400"/>
            <h3 className="font-bold text-sm">سند قبض مالي رسمي معتمد</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-4 h-4"/>
              <span>طباعة السند الرسمي</span>
            </button>
            <button
              onClick={() => setSelectedReceipt(null)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        {/* Official Receipt Body (Optimized for Screen & Print) */}
        <div className="p-8 space-y-6 text-slate-800 relative bg-amber-50/20 border-8 border-double border-slate-300 m-2 rounded-xl">
          
          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <span className="text-8xl font-extrabold text-slate-900 rotate-[-25deg]">مدرسة الدعم</span>
          </div>

          {/* Header of Receipt */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="text-right">
              <h2 className="text-2xl font-black text-sky-900">{schoolInfo.name}</h2>
              <p className="text-xs text-slate-600 font-semibold">{schoolInfo.subTitle}</p>
              <p className="text-xs text-slate-500">هاتف: {schoolInfo.phone} | {schoolInfo.address}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-sky-800 flex items-center justify-center bg-white shadow">
              <span className="text-3xl"></span>
            </div>
            <div className="text-left font-mono">
              <div className="text-xs text-slate-500">رقم السند:</div>
              <div className="text-base font-extrabold text-rose-600">{selectedReceipt.id}</div>
              <div className="text-xs text-slate-500 mt-1">التاريخ: {selectedReceipt.paymentDate}</div>
            </div>
          </div>

          {/* Title Banner */}
          <div className="text-center">
            <span className="inline-block px-6 py-1 bg-slate-800 text-white font-black text-sm tracking-widest rounded-md uppercase">
              إيصال قبض مالي رسمي (Official Payment Receipt)
            </span>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-slate-500 block text-xs">وصلنا من الطالب/ـة:</span>
              <span className="font-extrabold text-slate-900 text-base">{selectedReceipt.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">الصف والشعبة:</span>
              <span className="font-bold text-slate-800">{selectedReceipt.grade}</span>
            </div>
            <div className="col-span-2 border-t pt-2 mt-1">
              <span className="text-slate-500 block text-xs">مبلغ وقدره:</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-emerald-700">${selectedReceipt.amount} {selectedReceipt.currency ||'USD'}</span>
                <span className="text-xs text-slate-500">({lbpAmount} ل.ل بالسعر المعتمد)</span>
              </div>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">طريقة الدفع:</span>
              <span className="font-semibold text-slate-700">{selectedReceipt.paymentMethod ||'نقدي Cash'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-xs">المبلغ المتبقي على الطالب:</span>
              <span className="font-black text-rose-600">${selectedReceipt.remainingAfter ??'0'} USD</span>
            </div>
            <div className="col-span-2 border-t pt-2">
              <span className="text-slate-500 block text-xs">وذلك لقاء:</span>
              <span className="font-medium text-slate-700">{selectedReceipt.notes ||'أقساط ورسوم مدرسية للعام الدراسي'}</span>
            </div>
          </div>

          {/* Signatures & Stamp */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700 mb-8">توقيع المستلم</p>
              <p className="border-t border-dashed border-slate-400 pt-1 text-slate-500">{selectedReceipt.receivedBy ||'المحاسب المعتمد'}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-rose-400 flex flex-col items-center justify-center text-[10px] text-rose-600 font-bold rotate-[-12deg] p-1">
                <span>ختم الإدارة</span>
                <ShieldCheck className="w-5 h-5 my-0.5 text-rose-600"/>
                <span>معتمد رسمياً</span>
              </div>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-8">اعتماد مدير المدرسة</p>
              <p className="border-t border-dashed border-slate-400 pt-1 text-slate-500">إدارة مدرسة الدعم</p>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200 no-print">
          يعتبر هذا السند ساري المفعول ولا يُعتد بأي إيصال غير ممهور بختم الإدارة.
        </div>

      </div>
    </div>
  );
};
