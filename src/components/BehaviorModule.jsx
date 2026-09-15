import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  AlertCircle, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  Star, 
  Bookmark,
  Users
} from 'lucide-react';

export const BehaviorModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    currentUser,
    students = [], 
    teachers = [], 
    behaviorRecords = [], 
    addBehaviorRecord, 
    deleteBehaviorRecord,
    addNotification
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];

  // Arabic Normalization Helper for Behavior Module Searches
  const normalizeArabic = (text) => {
    if (!text) return '';
    return text
      .toString()
      .replace(/[أإآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, ''); // Tashkeel
  };

  const matchesSearchText = (text, query) => {
    if (!text || !query) return true;
    const normText = normalizeArabic(text.toLowerCase());
    const normQuery = normalizeArabic(query.toLowerCase().trim());
    return normText.includes(normQuery);
  };

  // For Student or Parent: Show ONLY their own behavior notes
  if (currentRole === 'student' || currentRole === 'parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || { id: 'STU-101', name: currentUser?.name || 'طالب متميز' };
    const myRecords = behaviorRecords.filter(b => b.studentId === studentUser.id);
    
    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A] dark:text-slate-100">
        {/* Header */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-slate-800 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400">سجل التوجيه والملاحظات السلوكية</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isAr ? `الملاحظات السلوكية والتوجيهية الخاصة بالتلميذ: ${studentUser.name}` : `Behavior and discipline logs for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* History Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myRecords.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 space-y-2">
              <Star className="w-12 h-12 mx-auto opacity-30 text-amber-500 animate-pulse" />
              <p className="text-xs font-bold">لا يوجد أي ملاحظات سلوكية سلبية مسجلة. سلوك ممتاز ومثالي! 🌟👏</p>
            </div>
          ) : (
            myRecords.map((rec) => (
              <div 
                key={rec.id} 
                className={`bg-white dark:bg-[#1E293B] border p-5 rounded-3xl shadow-xs transition-all ${
                  rec.type === 'إيجابي' ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/10' :
                  rec.type === 'تنبيه' ? 'border-red-200 dark:border-red-800/40 bg-red-50/10' : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{rec.title}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-0.5">بواسطة المعلم: {rec.teacherName}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${
                    rec.type === 'إيجابي' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                    rec.type === 'تنبيه' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {rec.type === 'إيجابي' ? '🌟 إيجابي وتفوق' : rec.type === 'تنبيه' ? '⚠️ تنبيه سلوكي' : '📝 ملاحظة عامة'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">"{rec.notes}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(safeStudents[0]?.id || '');
  
  // Searchable student selection state inside Add Behavior Note
  const [studentSearchQuery, setStudentSearchQuery] = useState(() => {
    return safeStudents[0] ? `${safeStudents[0].name} (${safeStudents[0].grade})` : '';
  });
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const [recordType, setRecordType] = useState('إيجابي'); // 'إيجابي', 'ملاحظة', 'تنبيه'
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert(isAr ? 'الرجاء اختيار طالب من القائمة أولاً!' : 'Please select a student from the list first!');
      return;
    }
    const targetStudent = safeStudents.find(s => s.id === selectedStudentId) || safeStudents[0];
    
    addBehaviorRecord({
      studentId: selectedStudentId,
      studentName: targetStudent?.name || 'طالب',
      grade: targetStudent?.grade || 'الصف السادس الابتدائي',
      type: recordType,
      title,
      notes,
      teacherName: currentUser?.name || 'أ. معلم المادة'
    });

    addNotification({
      title: `رصد سلوكي جديد: ${targetStudent.name}`,
      message: `تم إضافة تسجيل سلوك (${recordType}) بعنوان: ${title}`,
      type: 'behavior'
    });

    setShowAddModal(false);
    setTitle('');
    setNotes('');
    setToastMsg(isAr ? 'تم رصد الملاحظة السلوكية والتوجيهية بنجاح 🌟' : 'Behavior record added successfully!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  const filteredRecords = behaviorRecords.filter((b) => {
    const matchType = filterType === 'all' || b.type === filterType;
    const matchSearch = !searchTerm || 
      matchesSearchText(b.studentName, searchTerm) || 
      matchesSearchText(b.title, searchTerm) ||
      (b.studentId && matchesSearchText(b.studentId, searchTerm));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A] dark:text-slate-100">
      {toastMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-2xl z-[99999] animate-bounce flex items-center gap-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-200 fill-amber-200" />
            <span>{isAr ? 'سجل ملاحظات السلوك والتوجيه المباشر للطلاب' : 'Behavioral Guidance & Observations Log'}</span>
          </h2>
          <p className="text-xs text-amber-100 font-medium">
            {isAr ? 'منظومة رصد التميّز السلوكي والإشادات والملاحظات التوجيهية وتوثيقها في ملف الطالب' : 'Track student behavior, positive commendations, and guidance notes'}
          </p>
        </div>

        {currentRole !== 'student' && (
          <button
            onClick={() => setShowAddModal(prev => !prev)}
            className="px-5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-2xl text-xs font-black shadow flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border border-amber-300"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddModal ? (isAr ? 'إغلاق نموذج الرصد ✕' : 'Close Form ✕') : (isAr ? 'إضافة رصد / ملاحظة سلوكية +' : 'Add Behavior Note +')}</span>
          </button>
        )}
      </div>

      {/* Inline Add Form (Separated page section, not in a portal modal overlay!) */}
      {showAddModal && (
        <div className="bg-white dark:bg-[#1E293B] border-2 border-amber-500 rounded-3xl p-6 shadow-md animate-fade-in space-y-4 text-[#0F172A] dark:text-slate-100 relative">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{isAr ? 'رصد ملاحظة سلوكية / إشادة لطالب جديدة' : 'Commend Student / Add Behavior Note'}</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold text-xs cursor-pointer transition-colors"
            >
              {isAr ? 'إلغاء وإغلاق ✕' : 'Close ✕'}
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Searchable Student Selection */}
              <div className="space-y-1 relative text-right">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ابحث واختر الطالب المعني <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={isAr ? "اكتب حرفاً من اسم الطالب للبحث..." : "Type student name to search..."}
                    value={studentSearchQuery}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setShowStudentDropdown(true);
                    }}
                    onFocus={() => setShowStudentDropdown(true)}
                    className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 text-right"
                  />
                  {studentSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setStudentSearchQuery('');
                        setSelectedStudentId('');
                        setShowStudentDropdown(true);
                      }}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Dropdown list */}
                {showStudentDropdown && (
                  <>
                    <div onClick={() => setShowStudentDropdown(false)} className="fixed inset-0 z-10" />
                    <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 space-y-0.5 scrollbar-thin text-right">
                      {(() => {
                        const normalizedQuery = normalizeArabic(studentSearchQuery.toLowerCase().trim());
                        const filteredStu = safeStudents.filter(s => {
                          if (!studentSearchQuery.trim()) return true;
                          return normalizeArabic(s.name.toLowerCase()).includes(normalizedQuery) ||
                                 (s.nameEn && normalizeArabic(s.nameEn.toLowerCase()).includes(normalizedQuery)) ||
                                 s.id.toLowerCase().includes(normalizedQuery);
                        });

                        if (filteredStu.length === 0) {
                          return (
                            <div className="text-center py-4 text-slate-400 font-bold text-[10px]">
                              {isAr ? '❌ لا يوجد طلاب مطابقين لبحثك' : 'No matching students'}
                            </div>
                          );
                        }

                        return filteredStu.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setStudentSearchQuery(`${s.name} (${s.grade})`);
                              setShowStudentDropdown(false);
                            }}
                            className={`flex items-center justify-between p-2 rounded-xl text-right cursor-pointer text-xs font-bold transition-all ${
                              selectedStudentId === s.id 
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800' 
                                : 'hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
                            }`}
                          >
                            <span>{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">({s.grade})</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </>
                )}
              </div>

              {/* Behavior Type */}
              <div className="space-y-1 text-right">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">تصنيف الملاحظة</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                >
                  <option value="إيجابي">🌟 إيجابي وتفوق</option>
                  <option value="ملاحظة">📝 ملاحظة وتوجيه</option>
                  <option value="تنبيه">⚠️ تنبيه انضباط</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1 text-right">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">عنوان الملاحظة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تميز في المشروع العلمي..."
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
                />
              </div>

            </div>

            {/* Notes details */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">تفاصيل وتوصيات الملاحظة</label>
              <textarea
                rows="2"
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب التوصيات أو تفاصيل الموقف السلوكي..."
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 dark:focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">إلغاء</button>
              <button type="submit" className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-colors">حفظ وتوثيق في الملف 🌟</button>
            </div>

          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-4.5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-right">
            <span className="font-bold text-slate-600 dark:text-slate-300">نوع الملاحظة:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
            >
              <option value="all">جميع التسجيلات السلوكية</option>
              <option value="إيجابي">🌟 إيجابي وتفوق</option>
              <option value="ملاحظة">📝 ملاحظة وتوجيه</option>
              <option value="تنبيه">⚠️ تنبيه انضباط</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب..."
              className="bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none pe-8 text-right"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <span className="text-[11px] font-extrabold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
          إجمالي التسجيلات السلوكية: {filteredRecords.length} ملاحظة
        </span>
      </div>

      {/* Records Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 space-y-2">
            <Star className="w-12 h-12 mx-auto opacity-30 text-amber-400" />
            <p className="text-xs font-bold">لا يوجد تسجيلات سلوكية مقيدة بهذه المعايير.</p>
          </div>
        ) : (
          filteredRecords.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-3xl border text-right space-y-3 relative group shadow-sm transition-all ${
                b.type === 'إيجابي' 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-[#0F172A] dark:text-slate-100' 
                  : b.type === 'تنبيه'
                  ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-800/40 text-[#0F172A] dark:text-slate-100'
                  : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-[#0F172A] dark:text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                    b.type === 'إيجابي' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' :
                    b.type === 'تنبيه' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 dark:border-red-800' :
                    'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}>
                    {b.type === 'إيجابي' ? '🌟 إيجابي وتفوق' : b.type === 'تنبيه' ? '⚠️ تنبيه انضباط' : '📝 ملاحظة وتوجيه'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{b.date}</span>
                </div>

                {currentRole === 'admin' && (
                  <button
                    onClick={() => deleteBehaviorRecord(b.id)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <h4 className="text-sm font-black text-[#0F172A] dark:text-slate-100">{b.title}</h4>
                <span className="text-[11px] font-bold text-[#0284C7] dark:text-sky-400 block">الطالب: {b.studentName} ({b.grade})</span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 leading-relaxed font-medium">
                "{b.notes}"
              </p>

              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center justify-between pt-1">
                <span>المعلم المشرف: {b.teacherName}</span>
                <span className="text-amber-700 dark:text-amber-400/80">مُوثق في الملف 📁</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

