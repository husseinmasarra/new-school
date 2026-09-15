import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Target, 
  CreditCard, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  Megaphone,
  Users,
  UserCheck,
  X,
  Search
} from 'lucide-react';

export const MessagesModule = () => {
  const { lang, t, currentRole, messages, addMessage, students, teachers, systemUsers } = useApp();

  const isAr = lang === 'ar';
  const safeStudents  = students  || [];
  const safeTeachers  = teachers  || [];
  const safeUsers     = systemUsers || [];

  // Form State
  const [title,      setTitle]    = useState('');
  const [content,    setContent]  = useState('');
  const [category,   setCategory] = useState('general');
  const [priority,   setPriority] = useState('normal');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ── Multi-Recipient State ─────────────────────────────────────────
  const [recipientMode, setRecipientMode] = useState('group'); // 'group' | 'individual'
  const [targetType,   setTargetType]  = useState('all');       // used in group mode
  const [targetGrade,  setTargetGrade] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState(new Set()); // ids or labels
  const [recipientSearch, setRecipientSearch] = useState('');

  // Build all possible individual recipients list
  const allRecipients = useMemo(() => {
    const list = [];
    safeStudents.forEach(s => list.push({ id: `stu_${s.id}`, label: `👤 ${isAr ? s.name : s.nameEn}`, type: 'student', grade: s.grade }));
    safeTeachers.forEach(t => list.push({ id: `tch_${t.id}`, label: `👨‍🏫 ${isAr ? t.name : t.nameEn}`, type: 'teacher' }));
    safeUsers.filter(u => u.role !== 'student').forEach(u => list.push({ id: `usr_${u.id}`, label: `🛡️ ${isAr ? u.name : u.nameEn}`, type: 'user' }));
    return list;
  }, [safeStudents, safeTeachers, safeUsers, isAr]);

  const filteredRecipients = allRecipients.filter(r =>
    r.label.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)));
  const clearAll  = () => setSelectedRecipients(new Set());

  // Filter Inbox State
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery,    setSearchQuery]    = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    let targetValue = '';
    if (recipientMode === 'group') {
      if (targetType === 'all')   targetValue = t('targetAll');
      if (targetType === 'grade') targetValue = targetGrade;
      if (targetType === 'unpaid_tuition') targetValue = t('targetUnpaid');

      addMessage({
        title,
        titleEn: title,
        content,
        contentEn: content,
        targetType,
        targetValue,
        category,
        priority,
        date: new Date().toISOString().split('T')[0],
        senderName: currentRole === 'admin' ? (isAr ? 'الإدارة العامة' : 'General Administration') : (isAr ? 'كادر المعلمين' : 'Teaching Faculty')
      });
    } else {
      // Individual — send one message per selected recipient
      if (selectedRecipients.size === 0) return;
      const recipientNames = allRecipients
        .filter(r => selectedRecipients.has(r.id))
        .map(r => r.label)
        .join('، ');

      addMessage({
        title,
        titleEn: title,
        content,
        contentEn: content,
        targetType: 'individual',
        targetValue: recipientNames,
        recipients: Array.from(selectedRecipients),
        recipientCount: selectedRecipients.size,
        category,
        priority,
        date: new Date().toISOString().split('T')[0],
        senderName: currentRole === 'admin' ? (isAr ? 'الإدارة العامة' : 'General Administration') : (isAr ? 'كادر المعلمين' : 'Teaching Faculty')
      });
    }

    setTitle('');
    setContent('');
    setSelectedRecipients(new Set());
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleQuickTemplate = (templateType) => {
    if (templateType === 'tuition') {
      setRecipientMode('group');
      setTargetType('unpaid_tuition');
      setCategory('financial');
      setPriority('urgent');
      setTitle('تذكير بموعد استحقاق قسط المدرسة ($ USD)');
      setContent('نحيطكم علماً بضرورة سداد المتبقي من القسط المالي المدرسي قبل نهاية الشهر الحالي لضمان استمرارية الخدمات والدخول للبوابة.');
    } else if (templateType === 'trip') {
      setRecipientMode('group');
      setTargetType('all');
      setCategory('general');
      setPriority('normal');
      setTitle('إعلان رحلة علمية استكشافية');
      setContent('تعلن إدارة المدرسة عن تنظيم رحلة استكشافية إلى معرض العلوم والتكنولوجيا يوم الخميس القادم. يرجى إعادة استمارة موافقة ولي الأمر.');
    }
  };

  // Filter Messages
  const filteredMessages = messages.filter((msg) => {
    const matchesCategory = filterCategory === 'all' || msg.category === filterCategory;
    const matchesSearch   = (msg.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (msg.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">

      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('messagesTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "إرسال رسائل وتعاميم مخصصة لأفراد أو مجموعات متعددة في آنٍ واحد."
                : "Send messages and announcements to individuals or multiple groups at once."}
            </p>
          </div>
        </div>

        {(currentRole === 'admin' || currentRole === 'teacher') && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleQuickTemplate('tuition')}
              className="btn-mustard flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow cursor-pointer">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isAr ? 'تذكير أقساط' : 'Tuition Reminder'}</span>
            </button>
            <button onClick={() => handleQuickTemplate('trip')}
              className="btn-mustard flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعلان رحلة' : 'Trip Notice'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>✅ تم إرسال الرسالة بنجاح إلى المستلمين المحددين!</span>
        </div>
      )}

      {/* Send Message Form */}
      {(currentRole === 'admin' || currentRole === 'teacher') && (
        <form onSubmit={handleSendMessage} className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-5 shadow-sm text-[#0F172A]">
          <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-5 h-5 text-[#0284C7]" />
            <span>{t('sendMessageTitle')}</span>
          </h3>

          {/* Recipient Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-2xl w-fit">
            <button type="button" onClick={() => setRecipientMode('group')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${recipientMode === 'group' ? 'bg-[#0284C7] text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
              <Users className="w-3.5 h-3.5" /> إرسال لمجموعة
            </button>
            <button type="button" onClick={() => setRecipientMode('individual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${recipientMode === 'individual' ? 'bg-[#0284C7] text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}>
              <UserCheck className="w-3.5 h-3.5" /> إرسال لأشخاص محددين
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Group Mode: Target Type */}
            {recipientMode === 'group' && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Target className="w-4 h-4 text-[#0284C7]" />
                  <span>{t('targetType')}</span>
                </label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0284C7]">
                  <option value="all">🌐 {t('targetAll')}</option>
                  <option value="grade">🏫 {t('targetGrade')}</option>
                  <option value="unpaid_tuition">💳 {t('targetUnpaid')}</option>
                </select>
                {targetType === 'grade' && (
                  <input type="text" value={targetGrade} onChange={e => setTargetGrade(e.target.value)}
                    placeholder="مثال: الصف الخامس الابتدائي"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] mt-2" />
                )}
              </div>
            )}

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t('msgCategory')}</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                <option value="general">{t('catGeneral')}</option>
                <option value="academic">{t('catAcademic')}</option>
                <option value="financial">{t('catFinancial')}</option>
                <option value="urgent">{t('catUrgent')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ? 'الأولوية' : 'Priority'}</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                <option value="normal">{isAr ? 'عادية 🟢' : 'Normal 🟢'}</option>
                <option value="urgent">{isAr ? 'عاجلة 🚨' : 'Urgent 🚨'}</option>
              </select>
            </div>
          </div>

          {/* Individual Recipient Picker */}
          {recipientMode === 'individual' && (
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input type="text" value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)}
                  placeholder="ابحث عن طالب أو معلم..."
                  className="flex-1 bg-transparent text-xs text-[#0F172A] focus:outline-none placeholder:text-slate-400" />
                <div className="flex items-center gap-1">
                  <button type="button" onClick={selectAll} className="text-[10px] text-[#0284C7] font-bold cursor-pointer hover:underline">تحديد الكل</button>
                  <span className="text-slate-300">|</span>
                  <button type="button" onClick={clearAll} className="text-[10px] text-red-500 font-bold cursor-pointer hover:underline">إلغاء الكل</button>
                </div>
              </div>

              {selectedRecipients.size > 0 && (
                <div className="px-3 py-2 bg-[#0284C7]/5 border-b border-[#E2E8F0] flex flex-wrap gap-1.5">
                  {allRecipients.filter(r => selectedRecipients.has(r.id)).map(r => (
                    <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0284C7] text-white text-[10px] font-bold rounded-full">
                      {r.label}
                      <button type="button" onClick={() => toggleRecipient(r.id)} className="cursor-pointer">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-50">
                {filteredRecipients.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">لا توجد نتائج</p>
                ) : filteredRecipients.map(r => (
                  <label key={r.id} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${selectedRecipients.has(r.id) ? 'bg-[#0284C7]/8' : 'hover:bg-[#F8FAFC]'}`}>
                    <input type="checkbox" checked={selectedRecipients.has(r.id)} onChange={() => toggleRecipient(r.id)} className="accent-[#0284C7] w-3.5 h-3.5" />
                    <span className="text-xs text-[#0F172A]">{r.label}</span>
                    {r.grade && <span className="text-[10px] text-slate-400 ms-auto">{r.grade}</span>}
                  </label>
                ))}
              </div>

              <div className="px-3 py-1.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-[10px] text-slate-500">
                تم تحديد <span className="font-bold text-[#0284C7]">{selectedRecipients.size}</span> مستلم
              </div>
            </div>
          )}

          {/* Message Fields */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('msgSubject')} <span className="text-red-500">*</span></label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="تنبيه هام ومستعجل..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('msgBody')} <span className="text-red-500">*</span></label>
            <textarea rows={3} required value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب هنا تفاصيل الرسالة والتعميم الرسمية..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]" />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            {recipientMode === 'individual' && selectedRecipients.size > 0 && (
              <span className="text-xs text-[#0284C7] font-bold">سيُرسل إلى {selectedRecipients.size} شخص</span>
            )}
            <div className="ms-auto">
              <button type="submit" className="btn-mustard flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer">
                <Send className="w-4 h-4" />
                <span>{isAr ? 'إرسال التنبيه فوراً 🚀' : 'Send Alert Now 🚀'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Inbox */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#0284C7]" />
            <span>{t('inbox')} ({filteredMessages.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث في الرسائل..."
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] w-40" />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-1.5 text-xs focus:outline-none">
              <option value="all">الكل</option>
              <option value="general">عامة</option>
              <option value="academic">أكاديمية</option>
              <option value="financial">مالية</option>
              <option value="urgent">عاجلة</option>
            </select>
          </div>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            {isAr ? 'لا توجد تعاميم أو رسائل مسجلة حالياً.' : 'No messages found.'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2 hover:border-[#0284C7]/50 transition-all">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                      msg.category === 'financial'  ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      msg.category === 'urgent'     ? 'bg-red-50 text-red-700 border-red-200' :
                      msg.category === 'academic'   ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20'
                    }`}>
                      {msg.category === 'financial' ? '💳 مالية' : msg.category === 'urgent' ? '🚨 عاجلة' : msg.category === 'academic' ? '📚 أكاديمية' : '📢 عامة'}
                    </span>
                    <span className="text-[11px] font-bold text-[#0F172A]">{msg.senderName}</span>
                    {msg.priority === 'urgent' && <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded-md animate-pulse">عاجل</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {msg.recipientCount && (
                      <span className="text-[10px] text-[#0284C7] font-bold bg-[#0284C7]/10 px-2 py-0.5 rounded-full">
                        {msg.recipientCount} مستلم
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#0F172A]">{msg.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{msg.content}</p>
                {msg.targetValue && (
                  <p className="text-[10px] text-slate-400">📍 إلى: {msg.targetValue}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
