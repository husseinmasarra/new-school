import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Lock, 
  User, 
  ShieldCheck, 
  KeyRound, 
  LogIn, 
  Globe, 
  UserCheck, 
  Users 
} from 'lucide-react';

export const LoginView = () => {
  const { lang, switchLang, t, login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(username, password);
    if (!res.success) {
      setError(res.message || res.error || (lang === 'ar' ? 'خطأ في اسم المستخدم أو كلمة المرور' : 'Invalid login credentials'));
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
    login(u, p);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F172A] flex flex-col justify-between p-4 sm:p-6 font-sans">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-0.5 shadow-md flex items-center justify-center overflow-hidden border border-[#E2E8F0]">
            <img src="/emblem.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-lg text-[#0284C7]">
            {t('appName')}
          </span>
        </div>

        <button
          onClick={() => switchLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 border border-[#E2E8F0] text-[#0F172A] px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Globe className="w-4 h-4 text-[#0284C7]" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      {/* Main Login Center Container */}
      <div className="max-w-md w-full mx-auto my-8 space-y-6">
        
        {/* Login Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden text-[#0F172A]">
          
          <div className="text-center space-y-2 relative z-10">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl mx-auto flex items-center justify-center shadow-md overflow-hidden p-1">
              <img src="/emblem.png" alt="School Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0284C7]">{t('loginTitle')}</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {t('loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-2xl text-xs font-semibold text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0284C7]" />
                {t('username')}
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="اسم المستخدم (e.g. admin)"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#0284C7] transition-all font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0284C7]" />
                {t('password')}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-[#0284C7] transition-all font-mono"
              />
            </div>

            {/* 10% Accent Red CTA Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 btn-mustard rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('loginBtn')}</span>
            </button>

          </form>



        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 font-semibold">
        {t('appName')} © 2026 - جميع الحقوق محفوظة
      </div>

    </div>
  );
};
