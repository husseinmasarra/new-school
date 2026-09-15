import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  CheckCircle2, 
  Zap, 
  Share2, 
  Globe, 
  Copy,
  Check,
  ShieldCheck, 
  X 
} from 'lucide-react';

export const DownloadAppModal = ({ isOpen, onClose }) => {
  const { lang, t, siteSettings } = useApp();
  const isAr = lang === 'ar';

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState('android'); // 'android' or 'ios'
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  // High contrast black & white QR code URL with margin 10 for 100% instant camera detection
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(currentUrl)}&color=000000&bgcolor=ffffff&margin=10`;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert(isAr 
        ? '💡 لتثبيت التطبيق مباشرة على هاتفك:\n1. افتح المنظومة عبر متصفح الهاتف (Chrome / Safari)\n2. انقر خيارات المتصفح (⋮)\n3. اختر (إضافة إلى الشاشة الرئيسية / Install App)\n4. سيعمل كـ تطبيق APK رسمي مرتبط بالمنظومة!' 
        : 'To install app on phone:\n1. Open site in phone browser (Chrome/Safari)\n2. Tap browser options (⋮)\n3. Tap Add to Home Screen / Install App');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center font-bold shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0284C7]">
                {isAr ? 'تنزيل وتثبيت تطبيق المدرسة (Android APK & PWA)' : 'Download Mobile Application'}
              </h3>
              <span className="text-[11px] text-slate-500 font-bold block">
                تطبيق تفاعلي ذكي مرتبط بالمنظومة الحية مباشرة ⚡
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Sync Feature Badge */}
        <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-emerald-50 border border-emerald-300 p-3.5 rounded-2xl flex items-center gap-3 text-xs shrink-0">
          <Zap className="w-6 h-6 text-emerald-600 shrink-0 animate-pulse" />
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-emerald-950">ميزة التحديث الفوري المباشر (Live Sync):</h4>
            <p className="text-[11px] text-emerald-800 leading-snug">
              التطبيق مرتبط بالخادم مباشرة! أي علامة، غياب، أو إعلان يُضيفه المدير أو المعلم يظهر فوراً داخل التطبيق بدون الحاجة لتحديثه.
            </p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center gap-2 bg-[#F8FAFC] p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveDeviceTab('android')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeDeviceTab === 'android' ? 'bg-[#0284C7] text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            🤖 أجهزة أندرويد (Android APK)
          </button>
          <button
            onClick={() => setActiveDeviceTab('ios')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeDeviceTab === 'ios' ? 'bg-[#0284C7] text-white shadow' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            🍎 أجهزة أبل (iPhone & iPad)
          </button>
        </div>

        {/* Tab Content: QR & Install Guide */}
        <div className="overflow-y-auto space-y-4 pe-1">
          {activeDeviceTab === 'android' && (
            <div className="space-y-4 text-center">
              {/* High Contrast QR Code Container */}
              <div className="bg-white border-4 border-[#0284C7] p-3 rounded-3xl inline-block shadow-xl mx-auto space-y-2">
                <img 
                  src={qrCodeUrl} 
                  alt="App QR Code" 
                  className="w-44 h-44 mx-auto rounded-xl object-contain bg-white" 
                />
                <span className="text-[11px] font-black text-[#0284C7] block">
                  📲 امسح الرمز بكاميرا الهاتف للفتح والتحميل المباشر
                </span>
              </div>

              {/* Install Button & Copy URL */}
              <div className="space-y-2">
                <a
                  href="/school-portal.apk"
                  download="school-portal.apk"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer no-underline block"
                >
                  <Download className="w-4 h-4" />
                  <span>{isAr ? 'تحميل ملف التطبيق مباشرة (Download APK) 📥' : 'Download Application (APK) 📥'}</span>
                </a>

                <button
                  onClick={handleInstallClick}
                  className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-2xl text-xs font-bold shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isAr ? 'تثبيت التطبيق على الشاشة الرئيسية (PWA) 📲' : 'Install on Home Screen (PWA) 📲'}</span>
                </button>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    value={currentUrl}
                    className="flex-1 bg-[#F8FAFC] border border-slate-200 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeDeviceTab === 'ios' && (
            <div className="space-y-3 bg-[#F8FAFC] border border-slate-200 p-4 rounded-2xl text-xs text-right">
              <h4 className="font-extrabold text-[#0284C7] flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-[#0284C7]" />
                <span>خطوات تثبيت التطبيق على آيفون (Safari):</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 font-semibold text-slate-700 leading-relaxed text-[11px]">
                <li>افتح رابط المنظومة عبر متصفح <b>Safari</b> على الآيفون.</li>
                <li>اضغط على زر المشاركة <b>(Share Button 📤)</b> أسفل الشاشة.</li>
                <li>اختر <b>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)</b>.</li>
                <li>سيظهر تطبيق مدرسة الدعم على شاشتك الرئيسية ويعمل بتزامن فوري!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Close Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-mustard px-6 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            إغلاق النافذة ✖
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
