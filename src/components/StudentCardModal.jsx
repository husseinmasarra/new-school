import React from 'react';
import { useApp } from '../context/AppContext';
import { getRealQRCodeURL } from '../services/dbService';
import { GraduationCap, Printer, ShieldCheck, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const StudentCardModal = ({ student, onClose }) => {
  const { lang, t, siteSettings, currentRole } = useApp();

  if (!student) return null;

  const realQrCodeUrl = getRealQRCodeURL(student);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in printable-card-container">
      <div className="bg-slate-900 border border-blue-500/50 rounded-3xl p-5 sm:p-7 max-w-md w-full space-y-5 shadow-2xl animate-scale-up text-white relative my-auto max-h-[95vh] overflow-y-auto scrollbar-none">
        
        {/* Modal Top Control Header (Hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{t('studentCardTitle')} (قياس البطاقة الشخصية)</h3>
              <span className="text-[10px] text-blue-300 font-semibold block">مناسبة لحافظات المنتديات والبطاقات</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all shadow"
            title={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 🪪 Physical-Style Digital Pocket Student ID Card (Standard CR80 ID Card Ratio) */}
        <div className="w-full">
          <div
            id="printable-student-card"
            className="printable-card relative z-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border-2 border-blue-500/70 shadow-2xl overflow-hidden ring-1 ring-white/10"
            style={{ aspectRatio: '1.586 / 1' }}
          >
            
            {/* Top Compact Brand Header Bar */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 px-3.5 py-2 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-950/80 border border-white/30 flex items-center justify-center shadow shrink-0 overflow-hidden">
                  <img src="/emblem.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black leading-tight text-white">{siteSettings?.schoolName || t('schoolName')}</h4>
                  <span className="text-[9px] text-blue-100 font-bold block">بطاقة طالب معتمدة • OFFICIAL ID</span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-[8px] font-black bg-slate-950/70 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40 shadow">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" /> ACTIVE
              </span>
            </div>

            {/* Main Compact Card Body (Raised bottom spacing pb-9 & mb-3 for clean frame alignment) */}
            <div className="p-3.5 pb-9 space-y-2 flex flex-col justify-between h-[calc(100%-34px)]">
              
              {/* Photo & Main Details */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black text-xl flex items-center justify-center border-2 border-blue-400 shadow-md shrink-0">
                  {(student.name || 'ط')[0]}
                </div>

                <div className="space-y-0.5 flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-white truncate leading-tight">
                    {lang === 'ar' ? student.name : student.nameEn}
                  </h3>

                  <div className="text-[10px] font-extrabold text-blue-300 flex items-center gap-1.5">
                    <span className="bg-slate-950/90 px-2 py-0.5 rounded-md border border-slate-800">
                      {lang === 'ar' ? student.grade : student.gradeEn} ({student.classRoom})
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">ID: {student.id}</span>
                  </div>

                  <div className="text-[9px] text-slate-300 font-semibold truncate pt-0.5">
                    ولي الأمر: <span className="text-white font-bold">{student.parentName}</span>
                  </div>
                </div>
              </div>

              {/* Raised Scannable Code Frame & Contacts (Clean mb-3 margin above bottom line) */}
              <div className="bg-slate-950 p-2 rounded-xl border border-blue-500/40 flex items-center justify-between gap-2 shadow-inner mb-3">
                <div className="space-y-0.5 text-[9px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {t('qrCodeLabel')}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold block dir-ltr">
                    📞 {student.phone}
                  </span>
                </div>

                {/* Professional Fixed Size QR Code Box */}
                <div 
                  className="p-1 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
                >
                  <img
                    src={realQrCodeUrl}
                    alt="Scannable QR Code"
                    style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                  />
                </div>
              </div>

            </div>

            {/* Bottom Pocket Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-slate-950 px-3 py-1 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-400 font-mono z-10">
              <span>العام الدراسي: {siteSettings?.academicYear || "2026/2027"}</span>
              <span className="text-blue-400 font-bold">ALNOOR-SMART-PORTAL</span>
            </div>

          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="no-print flex items-center justify-between pt-2 border-t border-slate-800 relative z-10 gap-3">
          {currentRole !== 'student' && (
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Printer className="w-4.5 h-4.5" />
              <span>{t('printReceipt')}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
