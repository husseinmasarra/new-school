import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp, defaultAvatars, systemPermissionOptions } from '../context/AppContext';
import { dbFactoryReset } from '../services/dbService';
import { NEON_POSTGRES_SCHEMA_SQL, getNeonConnectionUrl, saveNeonConnectionUrl } from '../services/neonDbService';
import { 
  Settings, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Save, 
  Camera, 
  UserPlus, 
  KeyRound, 
  Trash2, 
  Edit 
} from 'lucide-react';

export const SettingsModule = () => {
  const { 
    lang, 
    t, 
    siteSettings, 
    updateSiteSettings,
    systemUsers,
    addSystemUser,
    updateSystemUserPermissions,
    deleteSystemUser,
    generateStrong8CharPassword,
    clearDemoData,
    startNewAcademicYear,
    academicYearsArchive = []
  } = useApp();

  const isAr = lang === 'ar';

  const [showNewYearModal, setShowNewYearModal] = useState(false);
  const [newYearNameInput, setNewYearNameInput] = useState('2027/2028');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showArchivesModal, setShowArchivesModal] = useState(false);

  const [showClearDemoModal, setShowClearDemoModal] = useState(false);
  const [clearDemoPasswordInput, setClearDemoPasswordInput] = useState('');
  const [clearDemoPasswordError, setClearDemoPasswordError] = useState('');

  // Dynamically resolve current Admin password
  const adminAccount = (systemUsers || []).find(u => u.role === 'admin' || u.username === 'admin');
  const currentAdminPassword = adminAccount?.password || '123123123';

  const [schoolName, setSchoolName] = useState(siteSettings?.schoolName || 'مدرسة الدعم التعليمي');
  const [schoolNameEn, setSchoolNameEn] = useState(siteSettings?.schoolNameEn || 'Educational Support School');
  const [schoolLogo, setSchoolLogo] = useState(siteSettings?.schoolLogo || null);
  const [academicYear, setAcademicYear] = useState(siteSettings?.academicYear || '2026/2027');
  const [schoolStartTime, setSchoolStartTime] = useState(siteSettings?.schoolStartTime || '07:30');
  const [schoolEndTime, setSchoolEndTime] = useState(siteSettings?.schoolEndTime || '12:00');
  const [recessStartTime, setRecessStartTime] = useState(siteSettings?.recessStartTime || '09:10');
  const [recessEndTime, setRecessEndTime] = useState(siteSettings?.recessEndTime || '09:30');
  const [recessLabel, setRecessLabel] = useState(siteSettings?.recessLabel || 'استراحة ووجبة فطور');
  const [recessKG, setRecessKG] = useState(siteSettings?.recessKG || '09:00 - 09:20');
  const [recessCycle1, setRecessCycle1] = useState(siteSettings?.recessCycle1 || '09:30 - 09:50');
  const [recessCycle2, setRecessCycle2] = useState(siteSettings?.recessCycle2 || '10:00 - 10:20');
  const [currency, setCurrency] = useState(siteSettings?.currency || 'USD ($)');
  const [exchangeRate, setExchangeRate] = useState(siteSettings?.exchangeRate || 89500);
  const [schoolPhone, setSchoolPhone] = useState(siteSettings?.schoolPhone || '+961 01 888 999');
  const [schoolEmail, setSchoolEmail] = useState(siteSettings?.schoolEmail || 'info@alnoorschool.edu.lb');
  const [schoolAddress, setSchoolAddress] = useState(siteSettings?.schoolAddress || 'بيروت - لبنان');
  const [neonUrl, setNeonUrl] = useState(() => getNeonConnectionUrl());
  const [isNeonLocked, setIsNeonLocked] = useState(true);

  const [enableParentApp, setEnableParentApp] = useState(true);
  const [enableOnlinePayments, setEnableOnlinePayments] = useState(true);

  const [toastMessage, setToastMessage] = useState('');

  // Add User State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserNameEn, setNewUserNameEn] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(() => generateStrong8CharPassword());
  const [newUserRole, setNewUserRole] = useState('teacher'); // admin, teacher, driver
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('مدرس معتمد');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState(defaultAvatars[1]);
  const [newUserPermissions, setNewUserPermissions] = useState(['send_lessons', 'manage_grades', 'send_messages']);

  // Edit Permissions State
  const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);
  const [editPermissionsList, setEditPermissionsList] = useState([]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewUserAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUserAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (role) => {
    setNewUserRole(role);
    if (role === 'admin') {
      setNewUserRoleTitle('مدير عام النظام');
      setNewUserPermissions(['manage_all', 'manage_finance', 'manage_users', 'print_cards']);
    } else if (role === 'teacher') {
      setNewUserRoleTitle('مدرس معتمد');
      setNewUserPermissions(['send_lessons', 'manage_grades', 'send_messages', 'print_cards']);
    } else if (role === 'driver') {
      setNewUserRoleTitle('سائق حافلة مدرسية');
      setNewUserPermissions(['manage_bus', 'contact_parents']);
    }
  };

  const togglePermissionCheckbox = (permId) => {
    setNewUserPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const toggleEditPermissionCheckbox = (permId) => {
    setEditPermissionsList((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserPassword) return;

    addSystemUser({
      name: newUserName,
      nameEn: newUserNameEn || newUserName,
      username: newUserUsername,
      password: newUserPassword,
      role: newUserRole,
      roleTitle: newUserRoleTitle,
      phone: newUserPhone || '+961 70 000 000',
      avatar: newUserAvatar,
      permissions: newUserPermissions
    });

    setNewUserName('');
    setNewUserNameEn('');
    setNewUserUsername('');
    setNewUserPhone('');
    setShowAddUserModal(false);
    setToastMessage(isAr ? 'تم إضافة المستخدم الجديد ومنحه الصلاحيات بنجاح 🟢' : 'User added successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleOpenEditPermissions = (usr) => {
    setEditingPermissionsUser(usr);
    setEditPermissionsList(usr.permissions || []);
  };

  const handleSaveEditPermissions = () => {
    if (!editingPermissionsUser) return;
    updateSystemUserPermissions(editingPermissionsUser.id, editPermissionsList);
    setEditingPermissionsUser(null);
    setToastMessage(isAr ? 'تم تحديث صلاحيات المستخدم بنجاح 🟢' : 'Permissions updated successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSiteSettings({
      schoolName,
      schoolNameEn,
      schoolLogo,
      academicYear,
      schoolStartTime,
      schoolEndTime,
      recessStartTime,
      recessEndTime,
      recessLabel,
      recessKG,
      recessCycle1,
      recessCycle2,
      currency,
      exchangeRate,
      schoolPhone,
      schoolEmail,
      schoolAddress,
      enableParentApp,
      enableOnlinePayments
    });

    setToastMessage(isAr ? 'تم حفظ وإعتماد كافة إعدادات الموقع بنجاح 🟢' : 'Settings saved successfully!');
    alert(isAr ? 'تم حفظ وإعتماد كافة إعدادات المنظومة بنجاح 🟢' : 'Settings saved successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRestoreFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
          alert(isAr ? 'تم استرجاع قاعدة البيانات بنجاح! سيتم تحديث الصفحة الآن.' : 'Database restored successfully!');
          window.location.reload();
        } catch {
          alert(isAr ? 'فشل استيراد الملف. يرجى التأكد من أن الملف بصيغة JSON صحيحة.' : 'Import failed!');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-[#0F172A]">
      
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('settingsTitle')} وإدارة الحسابات والصلاحيات</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إدارة إعدادات المدرسة، الشعار، قاعدة البيانات، وتحديد صلاحيات المستخدمين."
                : "Manage school identity, database, and user role permission access matrix."}
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* 🔐 USERS & ROLE PERMISSIONS MANAGEMENT */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm text-[#0F172A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0284C7]">إدارة حسابات المستخدمين ومنح الصلاحيات</h3>
              <p className="text-xs text-slate-500">إضافة مدراء ومدرسين وسائقين وتحديد صلاحيات الوصول الدقيقة لكل مستخدم في النظام.</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddUserModal(true)}
            className="btn-mustard flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد وتحديد الصلاحيات</span>
          </button>
        </div>

        {/* Users & Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                <th className="p-3 font-semibold">المستخدم والرمز</th>
                <th className="p-3 font-semibold">اسم الدخول (Username)</th>
                <th className="p-3 font-semibold">كلمة السر (8 خانات)</th>
                <th className="p-3 font-semibold">الدور والمسمى الوظيفي</th>
                <th className="p-3 font-semibold">الصلاحيات الممنوحة</th>
                <th className="p-3 font-semibold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#0F172A]">
              {systemUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-[#F8FAFC] transition-all">
                  <td className="p-3 font-bold flex items-center gap-2">
                    <img src={usr.avatar} alt={usr.name} className="w-8 h-8 rounded-full object-cover border border-[#0284C7]" />
                    <span>{isAr ? usr.name : usr.nameEn}</span>
                  </td>
                  <td className="p-3 font-mono text-[#0284C7] font-bold">{usr.username}</td>
                  <td className="p-3 font-mono text-red-600 font-extrabold">{usr.password}</td>
                  <td className="p-3 font-semibold text-slate-700">
                    <span className="px-2 py-0.5 rounded-md bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
                      {usr.roleTitle || usr.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {(usr.permissions || []).map((permId) => {
                        const opt = systemPermissionOptions.find((p) => p.id === permId);
                        return (
                          <span key={permId} className="px-2 py-0.5 rounded-md bg-[#0284C7]/10 border border-[#0284C7]/20 text-[11px] font-bold text-[#0284C7]">
                            {opt ? (isAr ? opt.name : (opt.nameEn || opt.name)) : permId}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditPermissions(usr)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#0284C7] rounded-lg cursor-pointer"
                        title="تعديل الصلاحيات"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {usr.id !== 'USER-ADMIN-01' && (
                        <button
                          onClick={() => deleteSystemUser(usr.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                          title="حذف المستخدم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-6 shadow-sm text-[#0F172A]">
        <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#0284C7]" />
          <span>الهوية الرسمية وبيانات التواصل للمدرسة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">اسم المدرسة الرسمي (عربي)</label>
            <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">School Name (English)</label>
            <input type="text" value={schoolNameEn} onChange={(e) => setSchoolNameEn(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
          </div>
        </div>

        <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#0284C7]" />
            <span>شعار المدرسة الرسمي (School Logo):</span>
          </label>
          <div className="flex items-center gap-3">
            <img src={schoolLogo} alt="Logo" className="w-12 h-12 rounded-xl object-cover border-2 border-[#0284C7]" />
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#0284C7]" /> هاتف المدرسة</label>
            <input type="text" value={schoolPhone} onChange={(e) => setSchoolPhone(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#0284C7]" /> البريد الإلكتروني</label>
            <input type="email" value={schoolEmail} onChange={(e) => setSchoolEmail(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#0284C7]" /> العنوان الرئيسي</label>
            <input type="text" value={schoolAddress} onChange={(e) => setSchoolAddress(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none" />
          </div>
        </div>

        {/* ⏰ School Operational Hours Card */}
        <div className="bg-sky-50 border border-sky-200 p-4.5 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-[#0284C7] flex items-center gap-2">
            ⏰ مواعيد وساعات الدوام المدرسي الرسمي (School Operational Schedule):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">بداية الدوام الصباحي (School Start):</span>
              <input 
                type="text" 
                value={schoolStartTime} 
                onChange={(e) => setSchoolStartTime(e.target.value)} 
                className="w-full bg-white border border-sky-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">نهاية الدوام والانصراف (Dismissal):</span>
              <input 
                type="text" 
                value={schoolEndTime} 
                onChange={(e) => setSchoolEndTime(e.target.value)} 
                className="w-full bg-white border border-sky-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]" 
              />
            </div>
          </div>
          <div className="text-[11px] text-sky-800 font-extrabold bg-sky-100/60 p-2.5 rounded-xl flex items-center justify-between border border-sky-200">
            <span>الجدول الرسمي المعين حالياً: من الساعة {schoolStartTime} صباحاً حتى {schoolEndTime} ظهراً ☀️</span>
            <span className="px-2 py-0.5 bg-[#0284C7] text-white rounded-md text-[10px] font-black">4.5 ساعات دوام يومي</span>
          </div>
        </div>

        {/* ☕ Recess & Break Configuration Card */}
        <div className="bg-amber-50/70 border border-amber-200 p-4.5 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-amber-800 flex items-center gap-2">
            ☕ إعدادات الفسحة واستراحة الفطور الرسمية (تحديد وتعديل المدير):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">مسمى وتسمية الاستراحة:</span>
              <input 
                type="text" 
                value={recessLabel} 
                onChange={(e) => setRecessLabel(e.target.value)} 
                placeholder="استراحة ووجبة فطور..."
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">توقيت بداية الفسحة:</span>
              <input 
                type="text" 
                value={recessStartTime} 
                onChange={(e) => setRecessStartTime(e.target.value)} 
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">توقيت نهاية الفسحة:</span>
              <input 
                type="text" 
                value={recessEndTime} 
                onChange={(e) => setRecessEndTime(e.target.value)} 
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500" 
              />
            </div>
          </div>
          <div className="text-[11px] text-amber-900 font-extrabold bg-amber-100/70 p-2.5 rounded-xl flex items-center justify-between border border-amber-200">
            <span>توقيت ومسمى الفسحة المعتمد في الجدول العام: {recessLabel} ({recessStartTime} - {recessEndTime}) ☕</span>
            <span className="px-2 py-0.5 bg-amber-600 text-white rounded-md text-[10px] font-black">محددة بواسطة المدير 👑</span>
          </div>
        </div>

        {/* ☕ Three Stages Breakfast Timings */}
        <div className="bg-amber-50/70 border border-amber-200 p-4.5 rounded-2xl space-y-3">
          <label className="text-xs font-bold text-amber-800 flex items-center gap-2">
            ☕ أوقات الفطور لثلاث مراحل (Breakfast Recess Schedule):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">أ) مرحلة الروضات (KG):</span>
              <input 
                type="text" 
                value={recessKG} 
                onChange={(e) => setRecessKG(e.target.value)} 
                placeholder="مثال: 09:00 - 09:20..."
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">ب) حلقة أولى (الصف 1 - 3):</span>
              <input 
                type="text" 
                value={recessCycle1} 
                onChange={(e) => setRecessCycle1(e.target.value)} 
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-700 block">ج) حلقة ثانية (الصف 4 - 6):</span>
              <input 
                type="text" 
                value={recessCycle2} 
                onChange={(e) => setRecessCycle2(e.target.value)} 
                className="w-full bg-white border border-amber-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right" 
              />
            </div>
          </div>
        </div>



        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button 
            type="button" 
            onClick={handleSaveSettings} 
            className="btn-mustard flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>حفظ واعتماد التغييرات 💾</span>
          </button>
        </div>
      </form>

      {/* 🎓 Academic Years Management & Clean Data Tool */}
      <div className="bg-[#032541] border border-sky-800 p-6 rounded-3xl space-y-4 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-sky-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-300 rounded-2xl border border-amber-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>إدارة الأعوام الدراسية وأرشفة السجلات 🎓</span>
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-black">
                  العام الحالي: {siteSettings?.academicYear || '2026/2027'}
                </span>
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">بدء عام دراسي جديد، أرشفة السجلات القديمة تلقائياً، أو تفريغ البيانات التجريبية للمنتج النهائي.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Action 1: Start New Academic Year */}
          <div className="bg-sky-950/60 border border-sky-700/60 p-4 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-sky-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>بدء عام دراسي جديد وتجهيز السجلات 🎓</span>
            </h4>
            <p className="text-xs text-slate-300">يتم أرشفة وحفظ العام السابق تلقائياً بالكامل في سجلات الأرشيف، وتصفير الأقساط والسجلات اليومية وتأهيل الطلاب للعام الجديد.</p>
            <button
              type="button"
              onClick={() => setShowNewYearModal(true)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>بدء عام دراسي جديد 🚀</span>
            </button>
          </div>

          {/* Action 2: Clear Demo Data */}
          <div className="bg-red-950/40 border border-red-800/50 p-4 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-red-200 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>تفريغ البيانات التجريبية (إعادة ضبط نظيفة) 🧹</span>
            </h4>
            <p className="text-xs text-slate-300">يمسح كافة الطلاب والدروس والرسائل التجريبية لتنظيف المنظومة كلياً قبل تسليمها النهائي للعميل مع الحفاظ على الهيكل الإداري.</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('هل أنت تأكد من تفريغ كافة البيانات التجريبية والتسجيلات للبدء بسجل مدرسة نظيف بالكامل؟')) {
                  clearDemoData();
                  alert('تم تفريغ وتنظيف كافة البيانات التجريبية بنجاح! المنظومة جاهزة للبدء بسجل جديد.');
                }
              }}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-500"
            >
              <Trash2 className="w-4 h-4" />
              <span>تفريغ كافة البيانات التجريبية 🧹</span>
            </button>
          </div>
        </div>

        {/* View Archives Button */}
        {(academicYearsArchive || []).length > 0 && (
          <div className="pt-2 border-t border-sky-800/60 flex items-center justify-between">
            <span className="text-xs text-sky-200 font-bold">يوجد {(academicYearsArchive || []).length} أعوام دراسية مؤرشفة ومحفوظة بالسيرفر 📁</span>
            <button
              type="button"
              onClick={() => setShowArchivesModal(true)}
              className="px-4 py-2 bg-sky-800/60 hover:bg-sky-800 text-sky-100 rounded-xl text-xs font-bold transition-all cursor-pointer border border-sky-700"
            >
              استعراض أرشيف الأعوام السابقة 📁
            </button>
          </div>
        )}
      </div>

      {/* Database Backup & Restore Section */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#0284C7]" />
          <span>النسخ الاحتياطي واسترجاع قاعدة البيانات (Database Backup & Restore)</span>
        </h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              // Export all localStorage data as a JSON backup file
              const backup = {};
              const keys = ['school_subjects','school_grades','school_classrooms','school_students','school_teachers','school_staff','school_exams','school_expenses','school_buses','school_messages','school_agenda','school_tutoring','school_push_notifs','school_system_users','school_settings','school_academic_years_archive','school_db_init','school_db_version'];
              keys.forEach(k => { const v = localStorage.getItem(k); if (v) backup[k] = JSON.parse(v); });
              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `school-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل نسخة احتياطية (Export Backup JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>استرجاع ملف بيانات (Import Restore JSON)</span>
            <input type="file" accept=".json" onChange={handleRestoreFileSelect} className="hidden" />
          </label>

          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold ms-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🔒 قاعدة البيانات محمية ومؤمنة بالكامل — غير قابلة للمسح أو الضبط التلقائي</span>
          </div>
        </div>
      </div>

      {/* 🐘 NEON POSTGRESQL CLOUD DATABASE INTEGRATION */}
      <div className="bg-white border-2 border-[#0284C7] p-6 rounded-3xl space-y-4 shadow-md text-[#0F172A]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0284C7]">🐘 الربط السحابي مع قاعدة بيانات Neon PostgreSQL</h3>
              <p className="text-xs text-slate-500">ربط النظام بقاعدة بيانات PostgreSQL سحابية مجانية وسريعة عبر منصة Neon.tech.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold">
            Serverless PostgreSQL Ready 🟢
          </span>
        </div>

        {/* Connection String Input (PROTECTED BY DEFAULT) */}
        <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>رابط الاتصال بقاعدة البيانات (Neon Connection String):</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>محمي ومقفل ضد التعديل 🔒</span>
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                if (isNeonLocked) {
                  const inputPass = window.prompt(isAr 
                    ? '🔑 يرجى إدخال كلمة السر لفتح تعديل رابط الاتصال:' 
                    : 'Enter password to unlock connection string:'
                  );
                  if (inputPass === '4786395') {
                    setIsNeonLocked(false);
                    setToastMessage(isAr ? 'تمت المصادقة بنجاح! يمكنك الآن تعديل رابط الاتصال 🔓' : 'Unlocked successfully!');
                    setTimeout(() => setToastMessage(''), 3500);
                  } else if (inputPass !== null) {
                    alert(isAr ? '❌ كلمة السر غير صحيحة! تم منع فك التعديل ⛔' : 'Incorrect password!');
                  }
                } else {
                  setIsNeonLocked(true);
                }
              }}
              className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isNeonLocked ? 'تعديل الرابط 🔓' : 'قفل التعديل 🔒'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly={isNeonLocked}
              value={neonUrl}
              onChange={(e) => setNeonUrl(e.target.value)}
              placeholder="postgresql://user:password@ep-cool-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none transition-all ${
                isNeonLocked
                  ? 'bg-slate-100/80 border-slate-300 text-slate-700 cursor-not-allowed select-all'
                  : 'bg-white border-2 border-[#0284C7] text-[#0F172A] shadow-inner'
              }`}
            />
            
            <button
              disabled={isNeonLocked}
              onClick={() => {
                saveNeonConnectionUrl(neonUrl);
                setIsNeonLocked(true);
                setToastMessage(isAr ? 'تم حفظ وقفل رابط اتصال Neon PostgreSQL بنجاح 🔒🟢' : 'Neon URL saved and locked!');
                setTimeout(() => setToastMessage(''), 3500);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold shadow transition-all shrink-0 ${
                isNeonLocked
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  : 'btn-mustard cursor-pointer'
              }`}
            >
              <span>{isNeonLocked ? 'الرابط محمي 🔒' : 'حفظ وقفل الاتصال 💾🔒'}</span>
            </button>
          </div>
        </div>

        {/* SQL Migration Script Button */}
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <h4 className="font-extrabold text-[#0284C7] flex items-center gap-1.5 text-sm">
              <span>📋 سكربت إنشاء الجداول (Neon SQL Migration Script)</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
              يمكنك نسخ السكربت المعتمد لإعادة تطبيقه داخل نافذة <b>SQL Editor</b> في أي وقت لإنشاء جميع الجداول آلياً.
            </p>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(NEON_POSTGRES_SCHEMA_SQL);
              alert(isAr ? 'تم نسخ سكربت SQL الخاص بقاعدة بيانات Neon للحافظة بنجاح! 📋' : 'SQL Schema copied to clipboard!');
            }}
            className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold shadow transition-all cursor-pointer inline-flex items-center gap-1.5 shrink-0"
          >
            <span>نسخ سكربت الجداول SQL 📋</span>
          </button>
        </div>
      </div>

      {/* ── Add User Modal ──────────────────────────────────── */}
      {showAddUserModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleAddUserSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                إضافة مستخدم جديد وتحديد صلاحياته
              </h3>
              <button type="button" onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
              <img src={newUserAvatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]" />
              <div className="flex flex-wrap gap-1">
                {defaultAvatars.slice(0, 6).map((av, i) => (
                  <button key={i} type="button" onClick={() => setNewUserAvatar(av)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${newUserAvatar === av ? 'border-[#0284C7] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={av} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                <label className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 border-2 border-transparent">
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <input type="file" accept="image/*" onChange={handleNewUserAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">الاسم (عربي) <span className="text-red-500">*</span></label>
                <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)}
                  placeholder="أ.حسين علي"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Name (English)</label>
                <input type="text" value={newUserNameEn} onChange={e => setNewUserNameEn(e.target.value)}
                  placeholder="Hussein Ali"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">اسم الدخول (Username) <span className="text-red-500">*</span></label>
                <input type="text" required value={newUserUsername} onChange={e => setNewUserUsername(e.target.value)}
                  placeholder="hussein.ali"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">كلمة السر <span className="text-red-500">*</span></label>
                <input type="text" required value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold text-red-600 focus:outline-none focus:border-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">رقم الهاتف</label>
                <input type="text" value={newUserPhone} onChange={e => setNewUserPhone(e.target.value)}
                  placeholder="+961 70 000 000"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">الدور</label>
                <select value={newUserRole} onChange={e => handleRoleChange(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer">
                  <option value="admin">🛡️ مدير عام (Admin)</option>
                  <option value="teacher">📚 مدرس (Teacher)</option>
                  <option value="driver">🚌 سائق (Driver)</option>
                </select>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-2">
              <p className="text-xs font-extrabold text-[#0284C7] flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" /> الصلاحيات الممنوحة للمستخدم:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {systemPermissionOptions.map(perm => (
                  <label key={perm.id} className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer hover:text-[#0284C7] p-2 rounded-xl bg-white border border-slate-100 hover:border-[#0284C7]/40 shadow-sm transition-all">
                    <input type="checkbox" checked={newUserPermissions.includes(perm.id)}
                      onChange={() => togglePermissionCheckbox(perm.id)}
                      className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer" />
                    <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button type="submit"
                className="btn-mustard px-6 py-2 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> إضافة المستخدم وحفظ الصلاحيات ✅
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Permissions Modal */}
      {editingPermissionsUser && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                تعديل صلاحيات: {isAr ? editingPermissionsUser.name : editingPermissionsUser.nameEn}
              </h3>
              <button onClick={() => setEditingPermissionsUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-2 pt-1">
              {systemPermissionOptions.map(perm => (
                <label key={perm.id} className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer hover:text-[#0284C7] p-2 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-[#0284C7]/40 transition-all">
                  <input type="checkbox" checked={editPermissionsList.includes(perm.id)}
                    onChange={() => toggleEditPermissionCheckbox(perm.id)}
                    className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer" />
                  <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button onClick={handleSaveEditPermissions}
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer">حفظ الصلاحيات ✅</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Start New Academic Year Modal */}
      {showNewYearModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-500 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#032541] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span>بدء وتفعيل عام دراسي جديد 🎓</span>
              </h3>
              <button onClick={() => { setShowNewYearModal(false); setAdminPasswordConfirm(''); setPasswordError(''); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-amber-900 font-bold space-y-1">
                <p>⚠️ عند بدء العام الجديد:</p>
                <ul className="list-disc pe-4 space-y-0.5 text-[11px] text-amber-800">
                  <li>سيتم أرشفة السجلات والحضور والدرجات الحالية وحفظها في السيرفر بالأرشيف.</li>
                  <li>تصفير مدفوعات الأقساط لتجهيز دفعات العام الجديد.</li>
                  <li>تصفير السجلات اليومية والواجبات المخصصة للعام الجديد.</li>
                </ul>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">اسم المسمى للعام الدراسي الجديد:</label>
                <input
                  type="text"
                  value={newYearNameInput}
                  onChange={(e) => setNewYearNameInput(e.target.value)}
                  placeholder="مثال: 2027/2028"
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 🔑 Admin Security Password Confirmation */}
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl space-y-1.5">
                <label className="text-xs font-bold text-[#032541] flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-500" />
                  <span>أدخل كلمة سر المدير المعتمدة لتأكيد البدء: <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="password"
                  value={adminPasswordConfirm}
                  onChange={(e) => { setAdminPasswordConfirm(e.target.value); setPasswordError(''); }}
                  placeholder="أدخل كلمة سر المدير هنا..."
                  className="w-full bg-white border border-sky-300 text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-slate-500 font-bold">كلمة السر المطلوبة هي نفس كلمة سر حساب المدير الحالية وتتحدث تلقائياً عند تغييرها.</p>
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-300 p-2.5 rounded-xl text-red-700 text-xs font-bold animate-shake text-center">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button onClick={() => { setShowNewYearModal(false); setAdminPasswordConfirm(''); setPasswordError(''); }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button
                onClick={() => {
                  if (!newYearNameInput) {
                    setPasswordError('يرجى إدخال مسمى العام الدراسي الجديد');
                    return;
                  }
                  if (adminPasswordConfirm !== currentAdminPassword) {
                    setPasswordError('🔒 كلمة سر المدير غير صحيحة! يرجى إدخال كلمة سر المدير المعتمدة.');
                    return;
                  }

                  // Password matches!
                  startNewAcademicYear(newYearNameInput);
                  setShowNewYearModal(false);
                  setAdminPasswordConfirm('');
                  setPasswordError('');
                  alert(`تم إدخال كلمة السر بنجاح وبدء العام الدراسي الجديد (${newYearNameInput}) وأرشفة العام السالف! 🚀`);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-2 rounded-xl text-xs font-black shadow cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                تأكيد وبدء العام الدراسي الجديد 🎓
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Archives View Modal */}
      {showArchivesModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Database className="w-5 h-5" />
                أرشيف الأعوام الدراسية السابقة المحفوظة 📁
              </h3>
              <button onClick={() => setShowArchivesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pe-1 custom-scrollbar">
              {(academicYearsArchive || []).length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs font-bold">لا يوجد أعوام دراسية مؤرشفة حالياً 📁</p>
              ) : (
                academicYearsArchive.map((arch) => (
                  <div key={arch.id} className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-[#0284C7] text-sm">🎓 العام الدراسي: {arch.yearName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">تاريخ الأرشفة: {new Date(arch.archivedAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-700">
                      <span className="bg-sky-50 p-2 rounded-xl text-center border border-sky-100">👥 {arch.studentsSnapshot?.length || 0} طالب مؤرشف</span>
                      <span className="bg-emerald-50 p-2 rounded-xl text-center border border-emerald-100">📅 {arch.attendanceSnapshot?.length || 0} سجل حضور</span>
                      <span className="bg-purple-50 p-2 rounded-xl text-center border border-purple-100">📚 {arch.agendaSnapshot?.length || 0} درس وواجب</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setShowArchivesModal(false)}
                className="px-5 py-2 bg-[#0284C7] text-white rounded-xl text-xs font-bold cursor-pointer">إغلاق ✕</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
