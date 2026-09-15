import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Palette, 
  Camera, 
  Image as ImageIcon,
  FileText,
  Calendar,
  UserCheck,
  Send,
  X
} from 'lucide-react';

export const SubjectsModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    currentUser,
    subjects = [], 
    addSubject, 
    deleteSubject,
    agenda = [],
    addAgendaItem,
    students = [],
    grades = []
  } = useApp();

  const isAr = lang === 'ar';
  const safeSubjects = subjects || [];
  const safeStudents = students || [];
  const safeGrades = grades || [];

  // Active student if student or parent logged in
  const currentStudent = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0];

  const normStr = (str) => (str || '')
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\s]/g, '');

  const isGradeMatch = (g1, g2) => {
    if (!g1 || !g2) return true;
    const n1 = normStr(g1);
    const n2 = normStr(g2);
    return !n1 || !n2 || n1.includes(n2) || n2.includes(n1);
  };

  const isSecMatch = (s1, s2) => {
    if (!s1 || !s2) return true;
    const n1 = normStr(s1);
    const n2 = normStr(s2);
    return !n1 || !n2 || n1.includes(n2) || n2.includes(n1);
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [icon, setIcon] = useState('📚');
  const [color, setColor] = useState('#0284C7');
  const [subjectImage, setSubjectImage] = useState('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80');

  // Modal State for Interactive Subject Lessons
  const [selectedSubjectForLessons, setSelectedSubjectForLessons] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonGrade, setNewLessonGrade] = useState(safeGrades[0]?.name || 'الصف السادس الابتدائي');
  const [newLessonSection, setNewLessonSection] = useState('أ');

  const presetColors = [
    { hex: '#0284C7', label: isAr ? 'أزرق سماوي (Sky Blue)' : 'Sky Blue' },
    { hex: '#10b981', label: isAr ? 'أخضر زمردي (Emerald)' : 'Emerald Green' },
    { hex: '#a855f7', label: isAr ? 'بنفسجي (Purple)' : 'Purple' },
    { hex: '#EF4444', label: isAr ? 'أحمر قرمزي (Vibrant Red)' : 'Vibrant Red' },
    { hex: '#f97316', label: isAr ? 'برتقالي (Orange)' : 'Orange' },
    { hex: '#06b6d4', label: isAr ? 'سماوي (Cyan)' : 'Cyan' },
    { hex: '#f59e0b', label: isAr ? 'ذهبي (Mustard Gold)' : 'Mustard Gold' },
    { hex: '#ec4899', label: isAr ? 'وردي (Pink)' : 'Pink' }
  ];

  const handleSubjectImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSubjectImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    const hexToRgba = (hex, alpha) => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.slice(0, 2), 16) || 2;
      const g = parseInt(cleanHex.slice(2, 4), 16) || 132;
      const b = parseInt(cleanHex.slice(4, 6), 16) || 199;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    addSubject({
      name,
      nameEn: nameEn || name,
      icon,
      image: subjectImage,
      color,
      bgColor: hexToRgba(color, 0.15),
      borderColor: hexToRgba(color, 0.4)
    });

    setName('');
    setNameEn('');
    setShowAddModal(false);
  };

  const handlePostSubjectLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedSubjectForLessons) return;

    addAgendaItem({
      title: newLessonTitle,
      subject: selectedSubjectForLessons.name,
      grade: newLessonGrade,
      classRoom: newLessonSection,
      date: new Date().toISOString().split('T')[0],
      homework: newLessonContent || 'شرح المادة وحل الأنشطة.',
      activityType: 'lesson',
      teacherName: currentUser?.name || 'أ. معلم المادة'
    });

    setNewLessonTitle('');
    setNewLessonContent('');
    alert(isAr ? 'تم إرسال الدرس بنجاح لصف وشعبة الطلاب! 🟢' : 'Lesson posted successfully!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('navSubjects')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ? "انقر على كرت أي مادة لمشاهدة وإرسال الدروس والواجبات المخصصة لكل صف وشعبة."
                : "Click any subject card to view and send grade/section specific lessons."}
            </p>
          </div>
        </div>

        {currentRole === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة مادة جديدة +" : "Add New Subject +"}</span>
          </button>
        )}
      </div>

      {/* Full-Color Subjects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeSubjects.map((sub) => {
          const cardBg = sub.color || '#0284C7';
          // Filter subject lessons for this subject
          const subjectLessons = agenda.filter(a => {
            const matchesSubject = a.subject === sub.name || (a.subject && a.subject.includes(sub.name));
            if (currentRole === 'student' || currentRole === 'parent') {
              const matchesGrade = isGradeMatch(a.grade, currentStudent?.grade);
              const matchesSection = isSecMatch(a.classRoom, currentStudent?.classRoom || currentStudent?.classroom);
              return matchesSubject && matchesGrade && matchesSection;
            }
            return matchesSubject;
          });

          return (
            <div
              key={sub.id}
              onClick={() => setSelectedSubjectForLessons(sub)}
              className="interactive-card rounded-3xl p-6 shadow-xl relative overflow-hidden text-white transition-all transform hover:scale-[1.02] flex flex-col justify-between min-h-[180px] cursor-pointer group"
              style={{
                backgroundColor: cardBg,
                backgroundImage: `linear-gradient(135deg, ${cardBg} 0%, rgba(0, 0, 0, 0.35) 100%)`
              }}
            >
              {/* Header with Photo Image & Title */}
              <div className="flex items-start justify-between gap-3 z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md bg-white/10 shrink-0">
                    {sub.image ? (
                      <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {sub.icon || '📚'}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm group-hover:underline">
                      {isAr ? sub.name : sub.nameEn}
                    </h3>
                    <span className="text-[11px] text-white/80 font-bold block mt-1">
                      {isAr ? `الدروس المرفوعة: ${subjectLessons.length} درس` : `Lessons: ${subjectLessons.length}`}
                    </span>
                  </div>
                </div>

                {currentRole === 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSubject(sub.id);
                    }}
                    className="p-2 bg-white/20 hover:bg-red-600 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer border border-white/20"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Bottom Footer Badge Tag */}
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-bold shadow-sm">
                  <span>{sub.icon || '📚'}</span>
                  <span>{isAr ? 'اضغط لاستعراض الدروس 📖' : 'Click to view lessons'}</span>
                </span>

                <span className="text-[10px] text-white/90 font-bold bg-black/30 px-2.5 py-1 rounded-lg">
                  {cardBg}
                </span>
              </div>

              <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Interactive Subject Lessons Modal */}
      {selectedSubjectForLessons && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md"
                  style={{ backgroundColor: selectedSubjectForLessons.color || '#0284C7' }}
                >
                  {selectedSubjectForLessons.icon || '📚'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0284C7]">
                    {isAr ? `دروس مادة: ${selectedSubjectForLessons.name}` : `Lessons: ${selectedSubjectForLessons.nameEn}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAr ? 'عرض الدروس المخصصة حسب الصف والشعبة' : 'Subject specific lessons per grade and section'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSubjectForLessons(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Teacher / Admin Add Lesson Form */}
            {(currentRole === 'admin' || currentRole === 'teacher') && (
              <form onSubmit={handlePostSubjectLesson} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                  <Send className="w-4 h-4 text-[#0284C7]" />
                  <span>{isAr ? 'إضافة إرسال درس جديد لهذه المادة:' : 'Post new lesson for this subject:'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder={isAr ? 'عنوان الدرس الشامل...' : 'Lesson title...'}
                    className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newLessonGrade}
                      onChange={(e) => setNewLessonGrade(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-2 text-xs font-bold"
                    >
                      {safeGrades.map(g => (
                        <option key={g.id} value={g.name}>{g.name}</option>
                      ))}
                    </select>
                    <select
                      value={newLessonSection}
                      onChange={(e) => setNewLessonSection(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-2 text-xs font-bold"
                    >
                      <option value="أ">الشعبة أ</option>
                      <option value="ب">الشعبة ب</option>
                      <option value="ج">الشعبة ج</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows="2"
                  value={newLessonContent}
                  onChange={(e) => setNewLessonContent(e.target.value)}
                  placeholder={isAr ? 'تفاصيل الدرس والواجبات المطلوبة...' : 'Lesson details and homework...'}
                  className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                />

                <button
                  type="submit"
                  className="btn-mustard px-4 py-2 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إرسال الدرس للطلاب 🚀' : 'Post Lesson 🚀'}</span>
                </button>
              </form>
            )}

            {/* List of Lessons */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">قائمة الدروس المرفوعة لهذه المادة:</h4>
              {(() => {
                const subjectLessons = agenda.filter(a => {
                  const matchesSubject = a.subject === selectedSubjectForLessons.name || (a.subject && a.subject.includes(selectedSubjectForLessons.name));
                  if (currentRole === 'student' || currentRole === 'parent') {
                    const matchesGrade = isGradeMatch(a.grade, currentStudent?.grade);
                    const matchesSection = isSecMatch(a.classRoom, currentStudent?.classRoom || currentStudent?.classroom);
                    return matchesSubject && matchesGrade && matchesSection;
                  }
                  return matchesSubject;
                });

                if (subjectLessons.length === 0) {
                  return (
                    <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs space-y-1">
                      <BookOpen className="w-8 h-8 mx-auto opacity-30 text-[#0284C7]" />
                      <p>لا توجد دروس مرفوعة حالياً لهذه المادة بهذا الصف والشعبة.</p>
                    </div>
                  );
                }

                return subjectLessons.map((item) => (
                  <div key={item.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h5 className="font-extrabold text-[#0284C7] text-sm">{item.title}</h5>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                        {item.grade} ({item.classRoom || 'أ'})
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed font-medium">{item.homework || item.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>المرسل: {item.teacherName || 'أ. معلم المادة'}</span>
                      <span>التاريخ: {item.date || new Date().toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Add Subject Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0284C7]" />
                <span>{isAr ? 'إضافة مادة جديدة بالكامل' : 'Add New Subject'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#0284C7]" />
                <span>{isAr ? 'رفع صورة المادة من جهازك:' : 'Upload subject image:'}</span>
              </label>

              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#0284C7] bg-slate-200 shrink-0">
                  <img src={subjectImage} alt="Subject Preview" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSubjectImageUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block">{isAr ? 'اختر أي صورة من الكمبيوتر أو الجوال' : 'Select any image file'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المادة (عربي)' : 'Subject Name (Arabic)'} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: الكيمياء العضوية..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ? 'اسم المادة (English)' : 'Subject Name (English)'}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Organic Chemistry..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="btn-mustard px-5 py-2 rounded-xl text-xs font-bold shadow cursor-pointer transition-all"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}

    </div>
  );
};
