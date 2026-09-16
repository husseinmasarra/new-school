import React, {useState} from'react';
import {createPortal} from'react-dom';
import {useApp, defaultAvatars, systemPermissionOptions} from'../context/AppContext';
import {
  ShieldCheck, 
  UserPlus, 
  Users, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Lock, 
  Camera, 
  User, 
  Shield
} from'lucide-react';

export const UsersModule = () => {
  const {
    lang,
    systemUsers = [],
    addSystemUser,
    updateSystemUserPermissions,
    deleteSystemUser,
    generateStrong8CharPassword,
  } = useApp();

  const isAr = lang ==='ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState('');

  // Add User State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserNameEn, setNewUserNameEn] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState(() => (generateStrong8CharPassword ? generateStrong8CharPassword() :'User@2026'));
  const [newUserRole, setNewUserRole] = useState('teacher');
  const [newUserRoleTitle, setNewUserRoleTitle] = useState('مدرس معتمد');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState(defaultAvatars?.[1] ||'/avatars/teacher_f.png');
  const [newUserPermissions, setNewUserPermissions] = useState(['send_lessons','manage_grades','send_messages']);

  // Edit Permissions State
  const [editingPermissionsUser, setEditingPermissionsUser] = useState(null);
  const [editPermissionsList, setEditPermissionsList] = useState([]);

  // Filter users based on search and role
  const filteredUsers = (systemUsers || []).filter((usr) => {
    const matchesRole = roleFilter ==='all'|| usr.role === roleFilter;
    const q = searchTerm.toLowerCase().trim();
    if (!q) return matchesRole;
    const nameMatch = (usr.name ||'').toLowerCase().includes(q) || (usr.nameEn ||'').toLowerCase().includes(q);
    const usernameMatch = (usr.username ||'').toLowerCase().includes(q);
    const phoneMatch = (usr.phone ||'').includes(q);
    const roleMatch = (usr.roleTitle || usr.role ||'').toLowerCase().includes(q);
    return matchesRole && (nameMatch || usernameMatch || phoneMatch || roleMatch);
  });

  const handleRoleChange = (role) => {
    setNewUserRole(role);
    if (role ==='admin') {
      setNewUserRoleTitle('مدير عام النظام');
      setNewUserPermissions(['manage_all','manage_finance','manage_users','print_cards']);
    } else if (role ==='vice_principal') {
      setNewUserRoleTitle('مساعد مدير');
      setNewUserPermissions(['add_student','record_payment','send_reminders','print_cards']);
    } else if (role ==='teacher') {
      setNewUserRoleTitle('مدرس معتمد');
      setNewUserPermissions(['send_lessons','manage_grades','send_messages','print_cards']);
    } else if (role ==='driver') {
      setNewUserRoleTitle('سائق حافلة مدرسية');
      setNewUserPermissions(['manage_bus','contact_parents']);
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

  const handleNewUserAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUserAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
      phone: newUserPhone ||'+961 70 000 000',
      avatar: newUserAvatar,
      permissions: newUserPermissions
    });

    setNewUserName('');
    setNewUserNameEn('');
    setNewUserUsername('');
    setNewUserPhone('');
    setNewUserPassword(generateStrong8CharPassword ? generateStrong8CharPassword() :'User@2026');
    setShowAddUserModal(false);
    setToastMessage(isAr ?'تم إضافة المستخدم الجديد ومنحه الصلاحيات بنجاح':'User added successfully!');
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
    setToastMessage(isAr ?'تم تحديث صلاحيات المستخدم بنجاح':'Permissions updated successfully!');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleDeleteUser = (userId, userName) => {
    if (userId ==='USER-ADMIN-01') {
      alert(isAr ?'لا يمكن حذف الحساب الإداري الأساسي للنظام!':'Primary admin user cannot be deleted!');
      return;
    }
    const confirmed = window.confirm(
      isAr 
        ?`هل أنت متأكد من رغبتك في حذف حساب المستخدم (${userName}) نهائياً؟`
        :`Are you sure you want to delete user (${userName})?`
    );
    if (confirmed) {
      deleteSystemUser(userId);
      setToastMessage(isAr ?`تم حذف حساب المستخدم (${userName}) بنجاح`:'User deleted successfully');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  // Counts by role
  const totalCount = systemUsers.length;
  const adminCount = systemUsers.filter((u) => u.role ==='admin').length;
  const teacherCount = systemUsers.filter((u) => u.role ==='teacher').length;
  const driverCount = systemUsers.filter((u) => u.role ==='driver').length;
  const vicePrincipalCount = systemUsers.filter((u) => u.role ==='vice_principal').length;

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0"/>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0369A1] to-[#02182B] border border-[#0EA5E9]/20 p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EF4444] text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5"/>
              {isAr ?'إدارة الوصول والأمان والصلاحيات':'Access & Security Control'}
            </span>
            <h2 className="text-2xl font-black text-white">
              {isAr ?'إدارة حسابات المستخدمين والصلاحيات':'User Accounts & Permissions'}
            </h2>
            <p className="text-sky-100 text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
              {isAr 
                ?'إضافة حسابات المدراء، المساعدين، المدرسين، والسائقين، والتحكم بالصلاحيات الدقيقة لكل مستخدم لحماية بيانات المنظومة.'
                :'Manage system administrators, teachers, and drivers with precise granular permissions.'}
            </p>
          </div>

          <button
            onClick={() => {
              setNewUserPassword(generateStrong8CharPassword ? generateStrong8CharPassword() :'User@2026');
              setShowAddUserModal(true);
            }}
            className="btn-mustard flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4"/>
            <span>{isAr ?'إضافة مستخدم جديد':'Add New User'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setRoleFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter ==='all'
              ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-[1.02]'
              :'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#0284C7]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{isAr ?'إجمالي المستخدمين':'Total Users'}</span>
            <Users className="w-4 h-4"/>
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{totalCount}</p>
        </div>

        <div 
          onClick={() => setRoleFilter('admin')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter ==='admin'
              ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-[1.02]'
              :'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#0284C7]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{isAr ?'المدراء':'Admins'}</span>
            <Shield className="w-4 h-4 text-[#EF4444]"/>
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{adminCount}</p>
        </div>

        <div 
          onClick={() => setRoleFilter('teacher')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter ==='teacher'
              ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-[1.02]'
              :'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#0284C7]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{isAr ?'المعلمين':'Teachers'}</span>
            <User className="w-4 h-4 text-purple-600"/>
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{teacherCount}</p>
        </div>

        <div 
          onClick={() => setRoleFilter('driver')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter ==='driver'
              ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-[1.02]'
              :'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#0284C7]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold opacity-80">{isAr ?'السائقين':'Drivers'}</span>
            <span className="text-base"></span>
          </div>
          <p className="text-2xl font-black mt-2 font-mono">{driverCount}</p>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute top-3 right-3 rtl:right-3 ltr:left-3 text-slate-400"/>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isAr ?'بحث بالاسم، اسم المستخدم، الهاتف...':'Search by name, username, phone...'}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] rounded-2xl py-2.5 px-9 focus:outline-none focus:border-[#0284C7]"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="absolute top-2.5 left-3 rtl:left-3 ltr:right-3 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Role Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter ==='all'
                ?'bg-[#0284C7] text-white shadow-sm'
                :'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ?'الكل':'All'} ({totalCount})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter ==='admin'
                ?'bg-[#0284C7] text-white shadow-sm'
                :'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ?'الإدارة':'Admin'} ({adminCount})
          </button>
          <button
            onClick={() => setRoleFilter('vice_principal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter ==='vice_principal'
                ?'bg-[#0284C7] text-white shadow-sm'
                :'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ?'مساعد مدير':'Vice Principal'} ({vicePrincipalCount})
          </button>
          <button
            onClick={() => setRoleFilter('teacher')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter ==='teacher'
                ?'bg-[#0284C7] text-white shadow-sm'
                :'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ?'المعلمين':'Teachers'} ({teacherCount})
          </button>
          <button
            onClick={() => setRoleFilter('driver')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              roleFilter ==='driver'
                ?'bg-[#0284C7] text-white shadow-sm'
                :'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isAr ?'السائقين':'Drivers'} ({driverCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0284C7]"/>
            <h3 className="text-base font-bold text-[#0284C7]">
              {isAr ?'قائمة حسابات المستخدمين النشطة في المنظومة':'Active System User Accounts'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7]/20">
              {filteredUsers.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600"/>
            <span>{isAr ?'كلمات السر محمية ومحجوبة بالكامل':'Passwords strictly masked'}</span>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300"/>
            <p className="text-sm font-bold">{isAr ?'لا توجد حسابات مطابقة لمعايير البحث':'No user accounts match your search'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                  <th className="p-3 font-semibold">{isAr ?'المستخدم والاسم':'User'}</th>
                  <th className="p-3 font-semibold">{isAr ?'اسم الدخول (Username)':'Username'}</th>
                  <th className="p-3 font-semibold">{isAr ?'كلمة السر':'Password'}</th>
                  <th className="p-3 font-semibold">{isAr ?'الدور الوظيفي':'Role'}</th>
                  <th className="p-3 font-semibold">{isAr ?'الصلاحيات الممنوحة':'Permissions'}</th>
                  <th className="p-3 font-semibold text-center">{isAr ?'إجراءات':'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-[#F8FAFC] transition-all">
                    {/* Avatar & Name */}
                    <td className="p-3 font-bold">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={usr.avatar || defaultAvatars?.[0]} 
                          alt={usr.name} 
                          className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7] shadow-sm"
                        />
                        <div>
                          <span className="block font-black text-[#0F172A]">{isAr ? usr.name : (usr.nameEn || usr.name)}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{usr.phone || usr.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="p-3 font-mono text-[#0284C7] font-bold">
                      <span className="px-2 py-1 rounded-lg bg-sky-50 border border-sky-100">
                        {usr.username}
                      </span>
                    </td>

                    {/* Masked Password (ALWAYS hidden with stars) */}
                    <td className="p-3 font-mono text-slate-700 tracking-widest font-black text-sm select-none">
                      <span className="bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-600">
                        {'*'.repeat(Math.max(6, String(usr.password ||'******').length))}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3 font-semibold text-slate-700">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        usr.role ==='admin'
                          ?'bg-red-50 text-red-700 border-red-200'
                          : usr.role ==='vice_principal'
                          ?'bg-amber-50 text-amber-800 border-amber-200'
                          : usr.role ==='teacher'
                          ?'bg-purple-50 text-purple-700 border-purple-200'
                          :'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {usr.roleTitle || usr.role}
                      </span>
                    </td>

                    {/* Permissions Chips */}
                    <td className="p-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {(usr.permissions || []).map((permId) => {
                          const opt = (systemPermissionOptions || []).find((p) => p.id === permId);
                          return (
                            <span 
                              key={permId} 
                              className="px-2 py-0.5 rounded-md bg-[#0284C7]/10 border border-[#0284C7]/20 text-[10px] font-bold text-[#0284C7]"
                            >
                              {opt ? (isAr ? opt.name : (opt.nameEn || opt.name)) : permId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPermissions(usr)}
                          className="px-2.5 py-1.5 bg-[#0284C7]/10 hover:bg-[#0284C7] text-[#0284C7] hover:text-white rounded-xl font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                          title={isAr ?'تعديل الصلاحيات':'Edit Permissions'}
                        >
                          <ShieldCheck className="w-3.5 h-3.5"/>
                          <span>{isAr ?'الصلاحيات':'Permissions'}</span>
                        </button>

                        {usr.id !=='USER-ADMIN-01'&& (
                          <button
                            onClick={() => handleDeleteUser(usr.id, usr.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
                            title={isAr ?'حذف المستخدم':'Delete User'}
                          >
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleAddUserSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative my-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?'إضافة مستخدم جديد وتعيين الصلاحيات':'Add New System User'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Avatar Select */}
            <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
              <img src={newUserAvatar} alt="Avatar"className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]"/>
              <div className="flex flex-wrap gap-1">
                {(defaultAvatars || []).slice(0, 6).map((av, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewUserAvatar(av)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                      newUserAvatar === av ?'border-[#0284C7] scale-110':'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt=""className="w-full h-full object-cover"/>
                  </button>
                ))}
                <label className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 border-2 border-transparent">
                  <Camera className="w-3.5 h-3.5 text-slate-600"/>
                  <input type="file"accept="image/*"onChange={handleNewUserAvatarUpload} className="hidden"/>
                </label>
              </div>
            </div>

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'الاسم (عربي)':'Name (Arabic)'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="أ.حسين علي"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'الاسم (إنجليزي)':'Name (English)'}
                </label>
                <input
                  type="text"
                  value={newUserNameEn}
                  onChange={(e) => setNewUserNameEn(e.target.value)}
                  placeholder="Hussein Ali"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'اسم الدخول (Username)':'Username'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="hussein.ali"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'كلمة السر':'Password'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'رقم الهاتف':'Phone Number'}
                </label>
                <input
                  type="text"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  placeholder="+961 70 000 000"
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  {isAr ?'الدور الوظيفي':'Role'}
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full mt-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="admin"> مدير عام (Admin)</option>
                  <option value="vice_principal"> مساعد مدير (Vice Principal)</option>
                  <option value="teacher"> مدرس (Teacher)</option>
                  <option value="driver"> سائق (Driver)</option>
                </select>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-2">
              <p className="text-xs font-extrabold text-[#0284C7] flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]"/>
                <span>{isAr ?'الصلاحيات الممنوحة للمستخدم:':'Granted Permissions:'}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-48 overflow-y-auto">
                {(systemPermissionOptions || []).map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer hover:text-[#0284C7] p-2 rounded-xl bg-white border border-slate-100 hover:border-[#0284C7]/40 shadow-sm transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={newUserPermissions.includes(perm.id)}
                      onChange={() => togglePermissionCheckbox(perm.id)}
                      className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer"
                    />
                    <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ?'إلغاء':'Cancel'}
              </button>
              <button
                type="submit"
                className="btn-mustard px-6 py-2 rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4"/>
                <span>{isAr ?'إضافة المستخدم وحفظ الصلاحيات':'Save & Add User'}</span>
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
                <ShieldCheck className="w-5 h-5"/>
                <span>
                  {isAr ?`تعديل صلاحيات: ${editingPermissionsUser.name}`:`Edit Permissions: ${editingPermissionsUser.nameEn || editingPermissionsUser.name}`}
                </span>
              </h3>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1 max-h-72 overflow-y-auto">
              {(systemPermissionOptions || []).map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-center gap-2.5 text-xs font-bold text-slate-800 cursor-pointer hover:text-[#0284C7] p-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-[#0284C7]/40 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={editPermissionsList.includes(perm.id)}
                    onChange={() => toggleEditPermissionCheckbox(perm.id)}
                    className="accent-[#0284C7] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>{isAr ? perm.name : (perm.nameEn || perm.name)}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ?'إلغاء':'Cancel'}
              </button>
              <button
                onClick={handleSaveEditPermissions}
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                {isAr ?'حفظ الصلاحيات':'Save Permissions'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
export default UsersModule;
