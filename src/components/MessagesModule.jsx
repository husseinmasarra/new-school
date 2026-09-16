import React, {useState, useMemo} from'react';
import {createPortal} from'react-dom';
import {useApp} from'../context/AppContext';
import {openWhatsAppMessage} from'../utils/exportUtils';
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
  Search,
  Filter,
  Calendar,
  Printer,
  Copy,
  Check,
  Share2,
  RotateCcw,
  Clock,
  Trash2,
  FileText,
  AlertCircle,
  Eye,
  Edit3
} from'lucide-react';

const DEFAULT_TUITION_TITLE ='تذكير بموعد استحقاق القسط الشهري المستحق';
const DEFAULT_TUITION_TEXT ='السلام عليكم ورحمة الله وبركاته ولي امر ({اسم_التلميذ}) نود تذكيركم بضرورة تسديد القسط الشهري المستحق يرجى التسديد في اقرب وقت شاكرين تعاونكم الكريم';

export const MessagesModule = () => {
  const {
    lang, 
    t, 
    currentRole, 
    messages = [], 
    addMessage, 
    deleteMessage,
    students = [], 
    teachers = [], 
    systemUsers = [],
    siteSettings = {},
    updateSiteSettings
  } = useApp();

  const isAr = lang ==='ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeUsers = systemUsers || [];

  // Administration Financial Reminder Template (written and saved by administration)
  const adminTuitionTitle = siteSettings?.tuitionReminderTitle || DEFAULT_TUITION_TITLE;
  const adminTuitionText = siteSettings?.tuitionReminderText || DEFAULT_TUITION_TEXT;

  // Custom Administration Reminder Modal State
  const [showCustomReminderModal, setShowCustomReminderModal] = useState(false);
  const [customReminderTitle, setCustomReminderTitle] = useState(adminTuitionTitle);
  const [customReminderText, setCustomReminderText] = useState(adminTuitionText);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // ── Multi-Recipient State ─────────────────────────────────────────
  const [recipientMode, setRecipientMode] = useState('group'); //'group'|'individual'
  const [targetType, setTargetType] = useState('all'); // used in group mode
  const [targetGrade, setTargetGrade] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState(new Set()); // ids or labels
  const [recipientSearch, setRecipientSearch] = useState('');

  // Build all possible individual recipients list
  const allRecipients = useMemo(() => {
    const list = [];
    safeStudents.forEach(s => list.push({id:`stu_${s.id}`, label:`${isAr ? s.name : s.nameEn}`, type:'student', grade: s.grade}));
    safeTeachers.forEach(t => list.push({id:`tch_${t.id}`, label:`${isAr ? t.name : t.nameEn}`, type:'teacher'}));
    safeUsers.filter(u => u.role !=='student').forEach(u => list.push({id:`usr_${u.id}`, label:`${isAr ? u.name : u.nameEn}`, type:'user'}));
    return list;
  }, [safeStudents, safeTeachers, safeUsers, isAr]);

  const filteredRecipients = allRecipients.filter(r =>
    r.label.toLowerCase().includes(recipientSearch.toLowerCase())
  );

  // List of students with unpaid dues for financial reminders
  const unpaidStudentsList = useMemo(() => {
    return safeStudents.filter(s => {
      if (s?.isSpecialCase) return false;
      const total = Number(s.tuitionTotal || 0) - Number(s.discountAmount || 0);
      const paid = Number(s.tuitionPaid || 0);
      return (total - paid) > 0;
    });
  }, [safeStudents]);

  const toggleRecipient = (id) => {
    setSelectedRecipients(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)));
  const clearAll = () => setSelectedRecipients(new Set());

  // ── Smart Search & Filter States ───────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTarget, setFilterTarget] = useState('all');
  const [filterDatePeriod, setFilterDatePeriod] = useState('all'); //'all'|'today'|'week'|'month'
  const [activeQuickChip, setActiveQuickChip] = useState('all');
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [printModalMsg, setPrintModalMsg] = useState(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    let targetValue ='';
    if (recipientMode ==='group') {
      if (targetType ==='all') targetValue = t('targetAll');
      if (targetType ==='grade') targetValue = targetGrade;
      if (targetType ==='unpaid_tuition') targetValue = t('targetUnpaid');

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
        senderName: currentRole ==='admin'? (isAr ?'الإدارة العامة':'General Administration') : (isAr ?'كادر المعلمين':'Teaching Faculty')
      });
    } else {
      // Individual — send one message per selected recipient
      if (selectedRecipients.size === 0) return;
      const recipientNames = allRecipients
        .filter(r => selectedRecipients.has(r.id))
        .map(r => r.label)
        .join('،');

      addMessage({
        title,
        titleEn: title,
        content,
        contentEn: content,
        targetType:'individual',
        targetValue: recipientNames,
        recipients: Array.from(selectedRecipients),
        recipientCount: selectedRecipients.size,
        category,
        priority,
        date: new Date().toISOString().split('T')[0],
        senderName: currentRole ==='admin'? (isAr ?'الإدارة العامة':'General Administration') : (isAr ?'كادر المعلمين':'Teaching Faculty')
      });
    }

    setTitle('');
    setContent('');
    setSelectedRecipients(new Set());
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleQuickTemplate = (templateType) => {
    if (templateType ==='tuition') {
      setRecipientMode('group');
      setTargetType('unpaid_tuition');
      setCategory('financial');
      setPriority('urgent');
      setTitle(adminTuitionTitle);
      setContent(adminTuitionText.replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}/g,'التلميذ المحترم'));
    } else if (templateType ==='trip') {
      setRecipientMode('group');
      setTargetType('all');
      setCategory('general');
      setPriority('normal');
      setTitle('إعلان رحلة علمية استكشافية');
      setContent('تعلن إدارة المدرسة عن تنظيم رحلة استكشافية إلى معرض العلوم والتكنولوجيا يوم الخميس القادم. يرجى إعادة استمارة موافقة ولي الأمر.');
    }
  };

  // ── Smart Search Helpers ──────────────────────────────────────────
  const normalizeArabic = (text) => {
    if (!text) return'';
    return text
      .toString()
      .replace(/[أإآا]/g,'ا')
      .replace(/ة/g,'ه')
      .replace(/[ىي]/g,'ي')
      .replace(/[\u064B-\u065F]/g,'') // Tashkeel
      .toLowerCase()
      .trim();
  };

  const isDateInPeriod = (dateStr, period) => {
    if (!dateStr || period ==='all') return true;
    try {
      const msgDate = new Date(dateStr);
      const today = new Date();
      if (period ==='today') {
        return dateStr === today.toISOString().split('T')[0];
      }
      if (period ==='week') {
        const diffTime = today - msgDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }
      if (period ==='month') {
        return msgDate.getFullYear() === today.getFullYear() && msgDate.getMonth() === today.getMonth();
      }
    } catch {
      return true;
    }
    return true;
  };

  const highlightMatch = (text, query) => {
    if (!text || !query || !query.trim()) return text;
    const cleanQ = query.trim();
    const words = cleanQ.split(/\s+/).filter(Boolean);
    if (words.length === 0) return text;
    try {
      const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
      const regex = new RegExp(`(${pattern})`,'gi');
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-amber-950 font-black px-1 rounded mx-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const handleCopyMessage = (msg) => {
    const textToCopy =`${msg.title}\n\n${msg.content}\n\n الموجه إليهم: ${msg.targetValue ||'الجميع'}\n التاريخ: ${msg.date}\n المرسل: ${msg.senderName}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedMsgId(msg.id);
    setTimeout(() => setCopiedMsgId(null), 2500);
  };

  const handleWhatsAppShare = (msg) => {
    const text = encodeURIComponent(`*${msg.title}*\n\n${msg.content}\n\n *${msg.senderName}* | ${msg.date}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`,'_blank');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterPriority('all');
    setFilterTarget('all');
    setFilterDatePeriod('all');
    setActiveQuickChip('all');
  };

  // Quick statistics counts
  const allCount = (messages || []).length;
  const urgentCount = (messages || []).filter(m => m.priority ==='urgent'|| m.category ==='urgent').length;
  const generalCount = (messages || []).filter(m => m.category ==='general').length;
  const financialCount = (messages || []).filter(m => m.category ==='financial').length;
  const academicCount = (messages || []).filter(m => m.category ==='academic').length;
  const weekCount = (messages || []).filter(m => isDateInPeriod(m.date,'week')).length;
  const todayCount = (messages || []).filter(m => isDateInPeriod(m.date,'today')).length;

  // Smart Filtered Messages calculation
  const filteredMessages = useMemo(() => {
    return (messages || []).filter((msg) => {
      // 1. Quick Chip Filter
      if (activeQuickChip ==='urgent'&& msg.priority !=='urgent'&& msg.category !=='urgent') return false;
      if (activeQuickChip ==='financial'&& msg.category !=='financial') return false;
      if (activeQuickChip ==='general'&& msg.category !=='general') return false;
      if (activeQuickChip ==='academic'&& msg.category !=='academic') return false;
      if (activeQuickChip ==='week'&& !isDateInPeriod(msg.date,'week')) return false;
      if (activeQuickChip ==='today'&& !isDateInPeriod(msg.date,'today')) return false;

      // 2. Dropdown Category
      if (filterCategory !=='all'&& msg.category !== filterCategory) return false;

      // 3. Dropdown Priority
      if (filterPriority !=='all'&& msg.priority !== filterPriority) return false;

      // 4. Dropdown Target
      if (filterTarget !=='all') {
        if (filterTarget ==='all_school'&& msg.targetType !=='all') return false;
        if (filterTarget ==='grade'&& msg.targetType !=='grade') return false;
        if (filterTarget ==='individual'&& msg.targetType !=='individual') return false;
        if (filterTarget ==='unpaid'&& msg.targetType !=='unpaid_tuition') return false;
      }

      // 5. Date Period
      if (filterDatePeriod !=='all'&& !isDateInPeriod(msg.date, filterDatePeriod)) return false;

      // 6. Smart Multi-Word Text Search
      if (searchQuery.trim()) {
        const queryWords = normalizeArabic(searchQuery).split(/\s+/).filter(Boolean);
        const corpus = normalizeArabic([
          msg.title,
          msg.content,
          msg.senderName,
          msg.targetValue,
          msg.category ==='financial'?'مالي اقساط دفعة تسديد':'',
          msg.category ==='academic'?'اكاديمي دراسي تعليمي امتحانات':'',
          msg.category ==='urgent'?'عاجل طارئ هام تنبيه':'',
          msg.priority ==='urgent'?'عاجل فوري':'عادي',
          msg.date
        ].join(''));

        const matchesAll = queryWords.every(w => corpus.includes(w));
        if (!matchesAll) return false;
      }

      return true;
    });
  }, [messages, searchQuery, filterCategory, filterPriority, filterTarget, filterDatePeriod, activeQuickChip]);


  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">

      {/* Module Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Megaphone className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('messagesTitle')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ?"إرسال رسائل وتعاميم مخصصة لأفراد أو مجموعات متعددة في آنٍ واحد."
                :"Send messages and announcements to individuals or multiple groups at once."}
            </p>
          </div>
        </div>

        {(currentRole ==='admin'|| currentRole ==='teacher') && (
          <div className="flex flex-wrap gap-2">
            {currentRole ==='admin'&& (
              <button
                type="button"
                onClick={() => {
                  setCustomReminderTitle(adminTuitionTitle);
                  setCustomReminderText(adminTuitionText);
                  setShowCustomReminderModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
                title="كتابة وصياغة نص التذكير المالي المعتمد للإدارة"
              >
                <Edit3 className="w-3.5 h-3.5"/>
                <span>{isAr ?'كتابة نص التذكير المالي (الإدارة)':'Admin Reminder Text'}</span>
              </button>
            )}
            <button onClick={() => handleQuickTemplate('tuition')}
              className="btn-mustard flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow cursor-pointer">
              <CreditCard className="w-3.5 h-3.5"/>
              <span>{isAr ?'تذكير أقساط':'Tuition Reminder'}</span>
            </button>
            <button onClick={() => handleQuickTemplate('trip')}
              className="btn-mustard flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow cursor-pointer">
              <Sparkles className="w-3.5 h-3.5"/>
              <span>{isAr ?'إعلان رحلة':'Trip Notice'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 shadow-lg animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0"/>
          <span> تم إرسال الرسالة بنجاح إلى المستلمين المحددين!</span>
        </div>
      )}

      {/* Send Message Form */}
      {(currentRole ==='admin'|| currentRole ==='teacher') && (
        <form onSubmit={handleSendMessage} className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-5 shadow-sm text-[#0F172A]">
          <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="w-5 h-5 text-[#0284C7]"/>
            <span>{t('sendMessageTitle')}</span>
          </h3>

          {/* Recipient Mode Toggle */}
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-2xl w-fit">
            <button type="button"onClick={() => setRecipientMode('group')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${recipientMode ==='group'?'bg-[#0284C7] text-white shadow':'text-slate-500 hover:text-slate-700'}`}>
              <Users className="w-3.5 h-3.5"/> إرسال لمجموعة
            </button>
            <button type="button"onClick={() => setRecipientMode('individual')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${recipientMode ==='individual'?'bg-[#0284C7] text-white shadow':'text-slate-500 hover:text-slate-700'}`}>
              <UserCheck className="w-3.5 h-3.5"/> إرسال لأشخاص محددين
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Group Mode: Target Type */}
            {recipientMode ==='group'&& (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Target className="w-4 h-4 text-[#0284C7]"/>
                  <span>{t('targetType')}</span>
                </label>
                <select value={targetType} onChange={(e) => setTargetType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#0284C7]">
                  <option value="all"> {t('targetAll')}</option>
                  <option value="grade"> {t('targetGrade')}</option>
                  <option value="unpaid_tuition"> {t('targetUnpaid')}</option>
                </select>
                {targetType ==='grade'&& (
                  <input type="text"value={targetGrade} onChange={e => setTargetGrade(e.target.value)}
                    placeholder="مثال: الصف الخامس الابتدائي"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] mt-2"/>
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
              <label className="text-xs font-semibold text-slate-700">{isAr ?'الأولوية':'Priority'}</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                <option value="normal">{isAr ?'عادية':'Normal'}</option>
                <option value="urgent">{isAr ?'عاجلة':'Urgent'}</option>
              </select>
            </div>
          </div>

          {/* Individual Recipient Picker */}
          {recipientMode ==='individual'&& (
            <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <Search className="w-4 h-4 text-slate-400 shrink-0"/>
                <input type="text"value={recipientSearch} onChange={e => setRecipientSearch(e.target.value)}
                  placeholder="ابحث عن طالب أو معلم..."
                  className="flex-1 bg-transparent text-xs text-[#0F172A] focus:outline-none placeholder:text-slate-400"/>
                <div className="flex items-center gap-1">
                  <button type="button"onClick={selectAll} className="text-[10px] text-[#0284C7] font-bold cursor-pointer hover:underline">تحديد الكل</button>
                  <span className="text-slate-300">|</span>
                  <button type="button"onClick={clearAll} className="text-[10px] text-red-500 font-bold cursor-pointer hover:underline">إلغاء الكل</button>
                </div>
              </div>

              {selectedRecipients.size > 0 && (
                <div className="px-3 py-2 bg-[#0284C7]/5 border-b border-[#E2E8F0] flex flex-wrap gap-1.5">
                  {allRecipients.filter(r => selectedRecipients.has(r.id)).map(r => (
                    <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0284C7] text-white text-[10px] font-bold rounded-full">
                      {r.label}
                      <button type="button"onClick={() => toggleRecipient(r.id)} className="cursor-pointer">
                        <X className="w-2.5 h-2.5"/>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-44 overflow-y-auto divide-y divide-slate-50">
                {filteredRecipients.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-4">لا توجد نتائج</p>
                ) : filteredRecipients.map(r => (
                  <label key={r.id} className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${selectedRecipients.has(r.id) ?'bg-[#0284C7]/8':'hover:bg-[#F8FAFC]'}`}>
                    <input type="checkbox"checked={selectedRecipients.has(r.id)} onChange={() => toggleRecipient(r.id)} className="accent-[#0284C7] w-3.5 h-3.5"/>
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

          {/* Admin Financial Reminder Banner & Controls */}
          {(category ==='financial'|| targetType ==='unpaid_tuition') && (
            <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-2xl space-y-2.5 animate-fade-in text-[#0F172A]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-700 shrink-0"/>
                  <span className="text-xs font-bold text-amber-950">
                    {isAr ?'نص التذكير المالي (صياغة وكتابة الإدارة):':'Admin Financial Reminder Text:'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(adminTuitionTitle);
                      setContent(adminTuitionText.replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}/g,'التلميذ المحترم'));
                    }}
                    className="text-[11px] font-bold bg-white text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <RotateCcw className="w-3 h-3"/>
                    <span>{isAr ?'تحميل نص الإدارة المعتمد':'Load Admin Text'}</span>
                  </button>

                  {currentRole ==='admin'&& (
                    <button
                      type="button"
                      onClick={() => {
                        if (!content) {
                          alert(isAr ?'يرجى كتابة نص التذكير أولاً':'Please enter reminder text');
                          return;
                        }
                        updateSiteSettings({
                          tuitionReminderTitle: title || DEFAULT_TUITION_TITLE,
                          tuitionReminderText: content
                        });
                        alert(isAr ?'تم حفظ واعتماد هذا النص كتذكير مالي رسمي صادر من الإدارة!':'Saved as official admin reminder!');
                      }}
                      className="text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3 h-3"/>
                      <span>{isAr ?'حفظ النص الحالي كمعتمد للإدارة':'Save as Admin Text'}</span>
                    </button>
                  )}

                  {currentRole ==='admin'&& (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomReminderTitle(title || adminTuitionTitle);
                        setCustomReminderText(content || adminTuitionText);
                        setShowCustomReminderModal(true);
                      }}
                      className="text-[11px] font-bold bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3"/>
                      <span>{isAr ?'تخصيص متقدم مع المتأخرين':'Advanced Workspace'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
                <span className="text-[10px] font-bold text-amber-800">
                  {isAr ?'إدراج متغيرات ذكية سريعة في النص:':'Insert Variables:'}
                </span>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev +'{اسم_التلميذ}')}
                  className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100"
                >
                  + &#123;اسم_التلميذ&#125;
                </button>
                <button
                  type="button"
                  onClick={() => setContent(prev => prev +'{المبلغ_المستحق}')}
                  className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100"
                >
                  + &#123;المبلغ_المستحق&#125;
                </button>
              </div>
            </div>
          )}

          {/* Message Fields */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('msgSubject')} <span className="text-red-500">*</span></label>
            <input type="text"required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="تنبيه هام ومستعجل..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">{t('msgBody')} <span className="text-red-500">*</span></label>
            <textarea rows={3} required value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب هنا تفاصيل الرسالة والتعميم الرسمية..."
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            {recipientMode ==='individual'&& selectedRecipients.size > 0 && (
              <span className="text-xs text-[#0284C7] font-bold">سيُرسل إلى {selectedRecipients.size} شخص</span>
            )}
            <div className="ms-auto">
              <button type="submit"className="btn-mustard flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer">
                <Send className="w-4 h-4"/>
                <span>{isAr ?'إرسال التنبيه فوراً':'Send Alert Now'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Smart Search & Inbox Section */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-5 shadow-sm text-[#0F172A]">
        
        {/* Inbox Header & Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
              <Megaphone className="w-5 h-5"/>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0284C7] flex items-center gap-2">
                <span>{isAr ?'صندوق التعاميم والتواصل المدرسي': t('inbox')}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                  {filteredMessages.length} {isAr ?'تعميم':'messages'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ?'البحث الذكي، الفلترة المتعددة، والطباعة الرسمية للتعاميم والإعلانات.':'Smart search, multi-filters and official circular printing.'}
              </p>
            </div>
          </div>

          {(searchQuery || filterCategory !=='all'|| filterPriority !=='all'|| filterTarget !=='all'|| filterDatePeriod !=='all'|| activeQuickChip !=='all') && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>{isAr ?'إعادة ضبط الفلاتر':'Reset Filters'}</span>
            </button>
          )}
        </div>

        {/* ── Smart Search Engine Bar ───────────────────────────────── */}
        <div className="space-y-3">
          <div className="relative flex items-center">
            <div className="absolute right-4 text-sky-500 pointer-events-none">
              <Search className="w-5 h-5"/>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr 
                ?"البحث الذكي في التعاميم: عنوان التعميم، نص المحتوى، اسم المرسل، الصف المستهدف، التاريخ..."
                :"Smart search in circulars: title, content, sender, target, date..."}
              className="w-full bg-[#F8FAFC] border-2 border-slate-200 focus:border-[#0284C7] text-slate-900 rounded-2xl py-3 pr-12 pl-12 text-xs font-semibold focus:outline-none transition-all shadow-inner placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-4 p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors cursor-pointer"
                title={isAr ?'مسح البحث':'Clear'}
              >
                <X className="w-3.5 h-3.5"/>
              </button>
            )}
          </div>

          {/* Quick Filter Chips Toolbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveQuickChip('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='all'
                  ?'bg-[#0284C7] text-white shadow-md'
                  :'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span></span>
              <span>{isAr ?`الكل (${allCount})`:`All (${allCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('urgent')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='urgent'
                  ?'bg-red-600 text-white shadow-md'
                  :'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`عاجل وهام (${urgentCount})`:`Urgent (${urgentCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='general'
                  ?'bg-sky-600 text-white shadow-md'
                  :'bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`إعلانات عامة (${generalCount})`:`General (${generalCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('financial')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='financial'
                  ?'bg-amber-600 text-white shadow-md'
                  :'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`أقساط ومالية (${financialCount})`:`Financial (${financialCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('academic')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='academic'
                  ?'bg-emerald-600 text-white shadow-md'
                  :'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`أكاديمية ودراسية (${academicCount})`:`Academic (${academicCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='week'
                  ?'bg-purple-600 text-white shadow-md'
                  :'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`تعاميم هذا الأسبوع (${weekCount})`:`This Week (${weekCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQuickChip('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeQuickChip ==='today'
                  ?'bg-blue-600 text-white shadow-md'
                  :'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              <span></span>
              <span>{isAr ?`تعاميم اليوم (${todayCount})`:`Today (${todayCount})`}</span>
            </button>
          </div>

          {/* Advanced Multi-Criteria Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">
                {isAr ?'تصنيف التعميم:':'Category:'}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ?'جميع الفئات':'All Categories'}</option>
                <option value="general">{isAr ?'عامة':'General'}</option>
                <option value="academic">{isAr ?'أكاديمية':'Academic'}</option>
                <option value="financial">{isAr ?'مالية وأقساط':'Financial'}</option>
                <option value="urgent">{isAr ?'عاجلة':'Urgent'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">
                {isAr ?'الأولوية:':'Priority:'}
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ?'كل الأولويات':'All Priorities'}</option>
                <option value="urgent">{isAr ?'عاجل فقط':'Urgent Only'}</option>
                <option value="normal">{isAr ?'عادي':'Normal'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">
                {isAr ?'الجهة المستهدفة:':'Audience:'}
              </label>
              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ?'كل الفئات الموجهة':'All Audiences'}</option>
                <option value="all_school">{isAr ?'الجميع (عام)':'Everyone'}</option>
                <option value="grade">{isAr ?'صفوف دراسية':'Specific Grade'}</option>
                <option value="individual">{isAr ?'أفراد محددين':'Individuals'}</option>
                <option value="unpaid">{isAr ?'غير مسددي الأقساط':'Unpaid Tuition'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 block">
                {isAr ?'الفترة الزمنية:':'Time Period:'}
              </label>
              <select
                value={filterDatePeriod}
                onChange={(e) => setFilterDatePeriod(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none"
              >
                <option value="all">{isAr ?'كل التواريخ':'All Time'}</option>
                <option value="today">{isAr ?'اليوم':'Today'}</option>
                <option value="week">{isAr ?'آخر 7 أيام':'Past 7 Days'}</option>
                <option value="month">{isAr ?'هذا الشهر':'This Month'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Results List ──────────────────────────────────────────── */}
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12 bg-[#F8FAFC] rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto"/>
            <h4 className="text-sm font-extrabold text-slate-700">
              {isAr ?'لا توجد تعاميم أو رسائل تطابق معايير البحث الذكي':'No circulars or messages match search'}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {isAr 
                ?'جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر لعرض كافة التعاميم المتاحة.'
                :'Try searching with other keywords or clear applied filters.'}
            </p>
            <button
              onClick={resetFilters}
              className="btn-mustard px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer transition-all inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5"/>
              <span>{isAr ?'عرض جميع التعاميم':'View All Circulars'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="bg-[#F8FAFC] hover:bg-slate-50/80 p-5 rounded-3xl border border-[#E2E8F0] space-y-3 hover:border-[#0284C7]/60 transition-all shadow-sm group"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                      msg.category ==='financial'?'bg-amber-50 text-amber-800 border-amber-300':
                      msg.category ==='urgent'?'bg-red-50 text-red-800 border-red-300':
                      msg.category ==='academic'?'bg-emerald-50 text-emerald-800 border-emerald-300':
                      'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/30'
                    }`}>
                      {msg.category ==='financial'?'مالية وأقساط': msg.category ==='urgent'?'عاجلة وهامة': msg.category ==='academic'?'دراسية وأكاديمية':'إعلان عام'}
                    </span>

                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#0284C7]"/>
                      <span>{highlightMatch(msg.senderName ||'الإدارة', searchQuery)}</span>
                    </span>

                    {msg.priority ==='urgent'&& (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded-md animate-pulse">
                        عاجل 
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400"/>
                    <span>{highlightMatch(msg.date, searchQuery)}</span>
                  </div>
                </div>

                {/* Message Title */}
                <h4 className="text-sm font-black text-[#0284C7] leading-tight">
                  {highlightMatch(msg.title, searchQuery)}
                </h4>

                {/* Message Body Content */}
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-2xl border border-slate-200 font-medium whitespace-pre-line shadow-inner">
                  {highlightMatch(msg.content, searchQuery)}
                </p>

                {/* Target & Action Toolbar */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    {msg.targetValue && (
                      <span className="bg-sky-50 border border-sky-200 text-sky-900 px-2.5 py-0.5 rounded-lg font-bold">
                         الموجه إليهم: {highlightMatch(msg.targetValue, searchQuery)}
                      </span>
                    )}
                    {msg.recipientCount && (
                      <span className="text-[10px] text-[#0284C7] font-bold bg-[#0284C7]/10 px-2 py-0.5 rounded-full">
                        {msg.recipientCount} مستلم
                      </span>
                    )}
                  </div>

                  {/* Circular Actions: Copy, Print, WhatsApp, Delete */}
                  <div className="flex items-center gap-1.5 ms-auto flex-wrap">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title={isAr ?'نسخ نص التعميم':'Copy'}
                    >
                      {copiedMsgId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600"/>
                          <span className="text-emerald-700">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500"/>
                          <span>{isAr ?'نسخ':'Copy'}</span>
                        </>
                      )}
                    </button>

                    {/* Print Official Circular Button */}
                    <button
                      type="button"
                      onClick={() => setPrintModalMsg(msg)}
                      className="px-2.5 py-1 bg-[#0284C7]/10 hover:bg-[#0284C7]/20 text-[#0284C7] rounded-xl border border-[#0284C7]/30 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title={isAr ?'طباعة التعميم الرسمي':'Print Circular'}
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0284C7]"/>
                      <span>{isAr ?'طباعة رسمية':'Print'}</span>
                    </button>

                    {/* WhatsApp Share Button */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppShare(msg)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title={isAr ?'مشاركة عبر واتساب':'WhatsApp'}
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-600"/>
                      <span>واتساب</span>
                    </button>

                    {/* Delete Message for Admins and Teachers */}
                    {(currentRole ==='admin'|| currentRole ==='teacher') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(isAr ?`هل أنت متأكد من حذف تعميم (${msg.title})؟`:`Delete message (${msg.title})?`)) {
                            if (deleteMessage) deleteMessage(msg.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={isAr ?'حذف التعميم':'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5"/>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Circular Print Preview Modal */}
      {printModalMsg && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl animate-scale-up text-[#0F172A] relative border-4 border-[#0284C7]/20 print:border-none print:shadow-none print:max-w-none">
            
            {/* Header with Print / Close Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#0284C7]"/>
                <h3 className="text-base font-black text-[#0284C7]">
                  {isAr ?'معاينة وطباعة التعميم الإداري الرسمي':'Official Circular Print Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4"/>
                  <span>{isAr ?'طباعة فورية':'Print'}</span>
                </button>
                <button
                  onClick={() => setPrintModalMsg(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Official Circular Document */}
            <div className="p-6 bg-white rounded-2xl border-2 border-slate-300 space-y-6 text-slate-900 shadow-sm print:p-0 print:border-none">
              
              {/* Official School Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1 text-right">
                  <h2 className="text-lg font-black text-[#0284C7]">
                    {siteSettings.schoolName || (isAr ?'مدرسة الدعم التعليمي النموذجية':'Educational Support School')}
                  </h2>
                  <p className="text-xs text-slate-600 font-bold">
                    {isAr ?'الإدارة العامة وشؤون الطلاب والتعاميم':'General Administration & Student Affairs'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {isAr ?`العام الدراسي: ${siteSettings.academicYear ||'2026/2027'}`:`Year: ${siteSettings.academicYear ||'2026/2027'}`}
                  </p>
                </div>

                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-300 bg-slate-50 flex items-center justify-center p-1">
                  {siteSettings.schoolLogo ? (
                    <img src={siteSettings.schoolLogo} alt="Logo"className="w-full h-full object-contain"/>
                  ) : (
                    <Megaphone className="w-8 h-8 text-[#0284C7]"/>
                  )}
                </div>
              </div>

              {/* Document Sub-header */}
              <div className="flex items-center justify-between text-xs font-mono font-bold bg-slate-100 p-2.5 rounded-xl">
                <span>{isAr ?`رقم التعميم: ${printModalMsg.id}`:`Ref: ${printModalMsg.id}`}</span>
                <span>{isAr ?`تاريخ الإصدار: ${printModalMsg.date}`:`Date: ${printModalMsg.date}`}</span>
                <span>{isAr ?`درجة الأهمية: ${printModalMsg.priority ==='urgent'?'عاجل ومؤكد':'عادي'}`:`Priority: ${printModalMsg.priority}`}</span>
              </div>

              {/* Circular Target */}
              <div className="text-xs font-bold text-slate-700 bg-sky-50 border border-sky-200 p-3 rounded-xl">
                <span>{isAr ?'إلى حضرة:':'To:'}</span>
                <span className="text-[#0284C7] font-black">{printModalMsg.targetValue || (isAr ?'كافة أولياء الأمور والطلاب المحترمين':'All Parents & Students')}</span>
              </div>

              {/* Circular Title */}
              <div className="text-center py-2 border-y border-dashed border-slate-300">
                <h3 className="text-base font-black text-slate-950 underline decoration-[#0284C7] underline-offset-8">
                  {printModalMsg.title}
                </h3>
              </div>

              {/* Circular Content */}
              <div className="text-sm font-medium leading-loose text-slate-800 whitespace-pre-line px-2 text-justify">
                {printModalMsg.content}
              </div>

              {/* Official Signature and Seal Area */}
              <div className="pt-6 border-t border-slate-300 flex items-end justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 block">{isAr ?'المرسل والمسؤول:':'Issued by:'}</span>
                  <span className="font-black text-slate-900">{printModalMsg.senderName || (isAr ?'إدارة المدرسة':'Administration')}</span>
                </div>

                <div className="w-36 h-24 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-2 text-[10px] text-slate-400 font-bold">
                  <span>خاتم وتوقيع</span>
                  <span>الإدارة العامة الرسمية</span>
                </div>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL: ADMINISTRATION FINANCIAL REMINDER WORKSPACE ─────────────── */}
      {showCustomReminderModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl text-[#0F172A] animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Edit3 className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="text-base font-black text-[#032541]">
                    {isAr ?'كتابة وصياغة نص التذكير المالي المعتمد للإدارة':'Admin Financial Reminder Workspace'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAr ?'تخصيص النص الرسمي للتذكير بالأقساط والتعاميم ورسائل الواتساب الصادرة من الإدارة.':'Customize the official administration tuition reminder text.'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCustomReminderModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Inputs Workspace */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isAr ?'عنوان التذكير المالي (الإدارة):':'Reminder Title:'}
                </label>
                <input
                  type="text"
                  value={customReminderTitle}
                  onChange={(e) => setCustomReminderTitle(e.target.value)}
                  placeholder="مثال: تذكير بموعد استحقاق القسط الشهري المستحق"
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-bold text-[#0F172A] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ?'نص رسالة التذكير المالي (صياغة الإدارة المعتمدة):':'Reminder Message Body:'}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {customReminderText.length} {isAr ?'حرف':'chars'}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={customReminderText}
                  onChange={(e) => setCustomReminderText(e.target.value)}
                  placeholder="اكتب هنا صيغة التذكير المالي المعتمدة لدى الإدارة..."
                  className="w-full bg-[#F8FAFC] border border-slate-300 text-xs font-medium text-[#0F172A] rounded-xl p-3 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Dynamic Variables Toolbar */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 block">
                  {isAr ?'المتغيرات الذكية (انقر للإدراج في النص):':'Dynamic Placeholders:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomReminderText(prev => prev +'{اسم_التلميذ}')}
                    className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer transition-all shadow-2xs"
                  >
                    + &#123;اسم_التلميذ&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomReminderText(prev => prev +'{المبلغ_المستحق}')}
                    className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer transition-all shadow-2xs"
                  >
                    + &#123;المبلغ_المستحق&#125;
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomReminderText(prev => prev +'{الصف}')}
                    className="text-[10px] font-mono font-bold bg-white text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-100 cursor-pointer transition-all shadow-2xs"
                  >
                    + &#123;الصف&#125;
                  </button>
                </div>
                <p className="text-[10px] text-amber-800/80 mt-1">
                  {isAr ?'المتغيرات مثل {اسم_التلميذ} و {المبلغ_المستحق} يتم استبدالها تلقائياً باسم كل تلميذ والمبلغ المتبقي عليه عند الإرسال.':'Variables will be dynamically replaced.'}
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isAr ?'معاينة كيف ستظهر الرسالة لولي الأمر:':'Parent Message Preview:'}
                </span>
                <h4 className="text-xs font-black text-[#0284C7]">{customReminderTitle}</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                  {customReminderText
                    .replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}|\(اسم التلميذ \)/g,'محمد خالد مسرة')
                    .replace(/\{المبلغ_المستحق\}|\{المبلغ_المتبقي\}/g,'$250 USD')
                    .replace(/\{الصف\}/g,'الصف السادس الابتدائي')}
                </p>
              </div>

              {/* Unpaid Students Fast WhatsApp Reminders */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden space-y-2 p-3 bg-[#F8FAFC]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#032541] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-600"/>
                    <span>{isAr ?`التلاميذ غير المسددين للأقساط (${unpaidStudentsList.length}):`:`Unpaid Students (${unpaidStudentsList.length}):`}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isAr ?'إرسال مباشر عبر واتساب بنص الإدارة':'Send via WhatsApp'}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl p-1">
                  {unpaidStudentsList.length === 0 ? (
                    <p className="text-center text-[11px] text-slate-400 py-3">{isAr ?'لا يوجد تلاميذ متأخرين عن السداد حالياً':'No unpaid students'}</p>
                  ) : (
                    unpaidStudentsList.map(stu => {
                      const rem = Math.max(0, (stu.tuitionTotal || 0) - (stu.discountAmount || 0) - (stu.tuitionPaid || 0));
                      return (
                        <div key={stu.id} className="flex items-center justify-between p-2 text-[11px] hover:bg-amber-50/40 transition-colors">
                          <div>
                            <span className="font-bold text-slate-900 block">{stu.name}</span>
                            <span className="text-[10px] text-slate-400">{stu.grade} • <strong className="text-red-600 font-mono">${rem} متبقي</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const waMsg = customReminderText
                                .replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}|\(اسم التلميذ \)/g, stu.name)
                                .replace(/\{المبلغ_المستحق\}|\{المبلغ_المتبقي\}/g,`$${rem} USD`)
                                .replace(/\{الصف\}/g, stu.grade);
                              openWhatsAppMessage(stu.parentPhone || stu.phone ||'+961 70 000 000', waMsg);
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="إرسال واتساب مباشر بنص الإدارة"
                          >
                            <Share2 className="w-3 h-3 text-emerald-600"/>
                            <span>واتساب الإدارة </span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomReminderModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ?'إلغاء':'Cancel'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateSiteSettings({
                      tuitionReminderTitle: customReminderTitle,
                      tuitionReminderText: customReminderText
                    });
                    alert(isAr ?'تم حفظ واعتماد نص التذكير المالي للإدارة بنجاح!':'Admin reminder text saved!');
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4"/>
                  <span>{isAr ?'حفظ واعتماد نص الإدارة':'Save Admin Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateSiteSettings({
                      tuitionReminderTitle: customReminderTitle,
                      tuitionReminderText: customReminderText
                    });
                    setTitle(customReminderTitle);
                    setContent(customReminderText.replace(/\{اسم_التلميذ\}|\{اسم_الطالب\}/g,'أبنائكم الأعزاء'));
                    setCategory('financial');
                    setTargetType('unpaid_tuition');
                    setRecipientMode('group');
                    setShowCustomReminderModal(false);
                  }}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5"/>
                  <span>{isAr ?'تطبيق في نموذج التعميم':'Use in Message'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
