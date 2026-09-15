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
  X,
  GraduationCap,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Search
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
    deleteAgendaItem,
    students = [],
    teachers = [],
    grades = [],
    selectedStudentId,
    setSelectedStudentId
  } = useApp();

  const isAr = lang === 'ar';
  const safeSubjects = subjects || [];
  const safeStudents = students || [];
  const safeGrades = grades || [];

  // Active student resolution
  const activeStudent = safeStudents.find(s => 
    s.id === selectedStudentId || 
    s.id === currentUser?.id || 
    s.id === currentUser?.studentId || 
    s.name === currentUser?.name || 
    s.username === currentUser?.username
  ) || (currentUser?.role === 'student' ? currentUser : null) || safeStudents[0];

  // Helper section letter extraction: handles "الشعبة (أ)", "أ", "شعبة ب", etc.
  const getSectionLetter = (str) => {
    if (!str) return '';
    const clean = String(str).replace(/[أإآ]/g, 'ا');
    const m = clean.match(/[\(\s\-\_]([ابجدA-Z])[\)\s\-\_]?$/) || clean.match(/([ابجدA-Z])/g);
    return m ? m[m.length - 1] : '';
  };

  // Grade normalization helper
  const normGradeStr = (str) => (str || '')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace('الابتدائي', '')
    .replace('المتوسط', '')
    .replace('الثانوي', '')
    .replace('الصف', '')
    .replace('الشعبة', '')
    .replace(/[\(\)\-\_\s]/g, '');

  const isGradeMatch = (g1, g2) => {
    if (!g1 || !g2) return true;
    const n1 = normGradeStr(g1);
    const n2 = normGradeStr(g2);
    return !n1 || !n2 || n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  const isSecMatch = (lessonSec, studentSec) => {
    if (!lessonSec || !studentSec) return false;
    const lLetter = getSectionLetter(lessonSec);
    const sLetter = getSectionLetter(studentSec);
    if (lLetter && sLetter) {
      return lLetter === sLetter;
    }
    const n1 = normGradeStr(lessonSec);
    const n2 = normGradeStr(studentSec);
    return n1 === n2 || (Boolean(n1) && Boolean(n2) && (n1.includes(n2) || n2.includes(n1)));
  };

  const normSubject = (str) => (str || '')
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/^ال/, '')
    .replace(/[\s\-_]/g, '');

  const isSubjectMatch = (s1, s2) => {
    if (!s1 || !s2) return false;
    const n1 = normSubject(s1);
    const n2 = normSubject(s2);
    return n1 === n2 || n1.includes(n2) || n2.includes(n1);
  };

  // Find active teacher record and assigned classrooms & subjects
  const activeTeacher = (teachers || []).find((t) => 
    t.id === currentUser?.id || 
    t.username === currentUser?.username || 
    t.name === currentUser?.name
  ) || (currentRole === 'teacher' ? currentUser : null);

  const teacherAssignedList = (currentRole === 'teacher')
    ? (
        activeTeacher?.assignedClassrooms?.length > 0 
          ? activeTeacher.assignedClassrooms 
          : activeTeacher?.assignedClasses?.length > 0
          ? activeTeacher.assignedClasses
          : (currentUser?.assignedClassrooms || currentUser?.assignedClasses || [])
      )
    : [];

  const teacherSubjectList = (currentRole === 'teacher')
    ? (
        activeTeacher?.subjects?.length > 0 
          ? activeTeacher.subjects 
          : activeTeacher?.subject 
          ? [activeTeacher.subject] 
          : activeTeacher?.specialty 
          ? [activeTeacher.specialty] 
          : (currentUser?.subjects || (currentUser?.subject ? [currentUser.subject] : []))
      )
    : [];

  const isTeacherAssignedToSubject = (subjectName) => {
    if (currentRole !== 'teacher') return true;
    if (teacherSubjectList.length === 0) return true;
    return teacherSubjectList.some(s => isSubjectMatch(s, subjectName));
  };

  const allSections = ['أ', 'ب', 'ج', 'د'];
  const getSectionsForGrade = (targetGradeName) => {
    return allSections.filter((secLetter) => {
      if (currentRole !== 'teacher' || teacherAssignedList.length === 0) return true;
      return teacherAssignedList.some((assignedStr) => {
        const gradeOk = isGradeMatch(targetGradeName, assignedStr);
        const secLetterAssigned = getSectionLetter(assignedStr);
        return gradeOk && (!secLetterAssigned || secLetterAssigned === secLetter);
      });
    });
  };

  // Compile full list of grades available
  const allGradeNames = Array.from(new Set([
    ...safeGrades.map(g => g.name),
    ...safeStudents.map(s => s.grade).filter(Boolean),
    'الصف الاول',
    'الصف الثاني',
    'الصف الثالث',
    'الصف الرابع',
    'الصف الخامس',
    'الصف السادس'
  ])).filter(Boolean);

  const availableGradesForTeacher = allGradeNames.filter((gName) => {
    if (currentRole !== 'teacher' || teacherAssignedList.length === 0) return true;
    return teacherAssignedList.some((assignedStr) => isGradeMatch(gName, assignedStr));
  });

  const defaultInitialGrade = (currentRole === 'teacher' && availableGradesForTeacher.length > 0)
    ? availableGradesForTeacher[0]
    : (allGradeNames[0] || 'الصف الأول');

  const defaultInitialSection = (currentRole === 'teacher')
    ? (getSectionsForGrade(defaultInitialGrade)[0] || 'أ')
    : 'أ';

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
  const [newLessonGrade, setNewLessonGrade] = useState(defaultInitialGrade);
  const [newLessonSection, setNewLessonSection] = useState(defaultInitialSection);
  const [newLessonType, setNewLessonType] = useState('lesson');
  const [newLessonDate, setNewLessonDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newLessonTeacher, setNewLessonTeacher] = useState(currentUser?.name || 'أ. معلم المادة');

  // Filters for teachers/admins inside modal
  const [modalGradeFilter, setModalGradeFilter] = useState('all');
  const [modalSectionFilter, setModalSectionFilter] = useState('all');

  const canManageLessons = currentRole === 'admin' || currentRole === 'vice_principal' || currentRole === 'teacher';
  const canPostInCurrentSubject = currentRole === 'admin' || currentRole === 'vice_principal' || (currentRole === 'teacher' && isTeacherAssignedToSubject(selectedSubjectForLessons?.name));
  const isStudentOrParent = currentRole === 'student' || currentRole === 'parent';

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

  const openSubjectModal = (sub) => {
    setSelectedSubjectForLessons(sub);
    if (currentRole === 'teacher') {
      const targetGrade = availableGradesForTeacher.length > 0 ? availableGradesForTeacher[0] : (allGradeNames[0] || 'الصف الأول');
      setNewLessonGrade(targetGrade);
      const secs = getSectionsForGrade(targetGrade);
      setNewLessonSection(secs[0] || 'أ');
      setNewLessonTeacher(currentUser?.name || activeTeacher?.name || 'أ. معلم المادة');
    }
  };

  const handlePostSubjectLesson = (e) => {
    e.preventDefault();
    if (!newLessonTitle || !selectedSubjectForLessons) return;

    const sectionVal = getSectionLetter(newLessonSection) || newLessonSection || 'أ';

    if (currentRole === 'teacher') {
      if (!isTeacherAssignedToSubject(selectedSubjectForLessons.name)) {
        alert(isAr 
          ? `عذراً، بصفتك معلماً لا يمكنك نشر دروس لمادة (${selectedSubjectForLessons.name}) لأنها غير مسندة لتخصصك التدريسي.` 
          : 'You are not assigned to teach this subject.');
        return;
      }
      if (teacherAssignedList.length > 0) {
        const isGradeValid = teacherAssignedList.some(a => isGradeMatch(newLessonGrade, a));
        if (!isGradeValid) {
          alert(isAr 
            ? `عذراً، الصف (${newLessonGrade}) غير موكل إليك.` 
            : 'Grade not assigned to you.');
          return;
        }
        const allowedSecs = getSectionsForGrade(newLessonGrade);
        if (allowedSecs.length > 0 && !allowedSecs.includes(sectionVal)) {
          alert(isAr 
            ? `عذراً، الشعبة (${sectionVal}) غير مسندة إليك لهذا الصف.` 
            : 'Section not assigned to you.');
          return;
        }
      }
    }

    addAgendaItem({
      title: newLessonTitle,
      subject: selectedSubjectForLessons.name,
      grade: newLessonGrade,
      classRoom: sectionVal,
      section: sectionVal,
      date: newLessonDate || new Date().toISOString().split('T')[0],
      homework: newLessonContent || 'شرح المادة ومتابعة التمارين.',
      activityType: newLessonType || 'lesson',
      teacherName: newLessonTeacher || currentUser?.name || 'أ. معلم المادة'
    });

    setNewLessonTitle('');
    setNewLessonContent('');
    alert(isAr 
      ? `تم بنجاح نشر الدرس لـ (${newLessonGrade} - الشعبة ${sectionVal})! 🟢` 
      : 'Lesson published successfully for target grade and section!');
  };

  // Filter subjects: if student/parent, only show subjects that have lessons for student's specific grade and section
  const displayedSubjects = safeSubjects.filter((sub) => {
    if (isStudentOrParent) {
      const studentLessons = agenda.filter(a => {
        const matchesSubject = isSubjectMatch(a.subject, sub.name);
        const matchesGrade = isGradeMatch(a.grade, activeStudent?.grade);
        const matchesSection = isSecMatch(a.classRoom, activeStudent?.classRoom || activeStudent?.classroom);
        return matchesSubject && matchesGrade && matchesSection;
      });
      return studentLessons.length > 0;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{t('navSubjects')}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isStudentOrParent
                ? (isAr ? 'المواد الدراسية التي تحتوي على دروس وشروحات مخصصة لصفك وشعبتك.' : 'Enrolled subjects with active lessons for your class.')
                : (isAr ? 'انقر على كرت أي مادة لإضافة واستعراض الدروس المخصصة لكل صف وشعبة.' : 'Click any subject card to post and manage grade/section lessons.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Parent Student Switcher in Top Banner */}
          {currentRole === 'parent' && safeStudents.length > 1 && (
            <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-2xl">
              <Users className="w-4 h-4 text-[#0284C7]" />
              <span className="text-xs font-bold text-slate-700">{isAr ? 'الأبناء:' : 'Child:'}</span>
              <select
                value={activeStudent?.id}
                onChange={(e) => {
                  if (setSelectedStudentId) setSelectedStudentId(e.target.value);
                }}
                className="bg-white border border-sky-300 text-sky-900 rounded-xl px-2.5 py-1 text-xs font-bold cursor-pointer outline-none"
              >
                {safeStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade} - شعبة {s.classRoom || 'أ'})
                  </option>
                ))}
              </select>
            </div>
          )}

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
      </div>

      {/* Teacher Status & Subject Restrictions Banner */}
      {currentRole === 'teacher' && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center font-bold shadow text-lg">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'الأستاذ(ة):' : 'Teacher:'}</span>
                <span className="text-sm font-black text-[#0284C7]">{activeTeacher?.name || currentUser?.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-[11px] font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {isAr ? `المواد المصرحة: ${teacherSubjectList.length > 0 ? teacherSubjectList.join('، ') : 'كل المواد'}` : `Subjects: ${teacherSubjectList.join(', ')}`}
                </span>
                <span className="text-[11px] font-bold bg-white text-[#0284C7] px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {isAr ? `الصفوف والشُعب الموكلة: ${teacherAssignedList.length > 0 ? teacherAssignedList.join('، ') : 'كل الصفوف'}` : `Classes: ${teacherAssignedList.join(', ')}`}
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs text-sky-800 font-bold bg-white/90 px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5 shadow-sm">
            <span>🎯</span>
            <span>{isAr ? 'يمكنك نشر الدروس حصراً لمادتك والصفوف والشُعب الموكلة إليك' : 'Publish restricted to your assigned subjects and sections'}</span>
          </span>
        </div>
      )}

      {/* Student/Parent Identification Badge */}
      {isStudentOrParent && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center font-bold shadow">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">{isAr ? 'عزيزي التلميذ(ة):' : 'Student:'}</span>
                <span className="text-sm font-black text-[#0284C7]">{activeStudent?.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-bold bg-white text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {isAr ? `الصف: ${activeStudent?.grade || 'غير محدد'}` : `Grade: ${activeStudent?.grade}`}
                </span>
                <span className="text-[11px] font-bold bg-white text-[#0284C7] px-2.5 py-0.5 rounded-lg border border-sky-200">
                  {isAr ? `الشعبة: ${activeStudent?.classRoom ? `(${activeStudent.classRoom})` : '(أ)'}` : `Section: ${activeStudent?.classRoom || 'A'}`}
                </span>
              </div>
            </div>
          </div>

          <span className="text-xs text-sky-700 font-semibold bg-white/80 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'تظهر لك فقط المواد التي نشرت لها دروس تناسب صفك وشعبتك' : 'Only subjects with lessons for your class are displayed'}</span>
          </span>
        </div>
      )}

      {/* Empty State for Student */}
      {displayedSubjects.length === 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-12 text-center text-slate-500 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            {isAr ? 'لا توجد مواد متاح بها دروس لصفك حالياً' : 'No subjects with lessons available yet'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            {isAr 
              ? `لم يقم المعلمون بعد بنشر دروس أو واجبات لـ (${activeStudent?.grade || 'صفك'} - الشعبة ${activeStudent?.classRoom || 'أ'}). ستظهر المواد تلقائياً فور رفع الدروس.`
              : 'Subjects will automatically appear here once teachers upload lessons matching your grade and section.'}
          </p>
        </div>
      )}

      {/* Full-Color Subjects Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSubjects.map((sub) => {
          const cardBg = sub.color || '#0284C7';
          
          // Filter subject lessons for this subject
          const subjectLessons = agenda.filter(a => {
            const matchesSubject = isSubjectMatch(a.subject, sub.name);
            if (isStudentOrParent) {
              const matchesGrade = isGradeMatch(a.grade, activeStudent?.grade);
              const matchesSection = isSecMatch(a.classRoom, activeStudent?.classRoom || activeStudent?.classroom);
              return matchesSubject && matchesGrade && matchesSection;
            }
            return matchesSubject;
          });

          return (
            <div
              key={sub.id}
              onClick={() => openSubjectModal(sub)}
              className="interactive-card rounded-3xl p-6 shadow-xl relative overflow-hidden text-white transition-all transform hover:scale-[1.02] flex flex-col justify-between min-h-[190px] cursor-pointer group"
              style={{
                backgroundColor: cardBg,
                backgroundImage: `linear-gradient(135deg, ${cardBg} 0%, rgba(0, 0, 0, 0.4) 100%)`
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

                <div className="flex items-center gap-2">
                  {currentRole === 'teacher' && (
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black shadow-sm flex items-center gap-1 ${
                      isTeacherAssignedToSubject(sub.name) 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/20 text-white/90 backdrop-blur-sm'
                    }`}>
                      {isTeacherAssignedToSubject(sub.name) 
                        ? (isAr ? 'مادتك المسندة 🎯' : 'Assigned') 
                        : (isAr ? 'استعراض فقط 👁️' : 'View Only')}
                    </span>
                  )}

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
            
            {/* Modal Header */}
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
                    {isStudentOrParent 
                      ? (isAr ? 'استعراض الدروس الخاصة بصفك وشعبتك بالتحديد' : 'Lessons tailored specifically to your class and section')
                      : (isAr ? 'إضافة واستعراض الدروس المخصصة حسب الصف والشعبة' : 'Post and manage lessons by grade and section')}
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

            {/* Student & Parent Context Banner inside modal */}
            {isStudentOrParent && (
              <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#0284C7] text-white rounded-xl shadow-sm">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">
                      {isAr ? 'التلميذ(ة):' : 'Student:'}{' '}
                      <span className="text-[#0284C7] font-black">{activeStudent?.name}</span>
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                        {isAr ? `الصف: ${activeStudent?.grade || 'غير محدد'}` : `Grade: ${activeStudent?.grade}`}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-[#0284C7]">
                        {isAr ? `الشعبة: ${activeStudent?.classRoom ? `(${activeStudent.classRoom})` : '(أ)'}` : `Section: ${activeStudent?.classRoom || 'A'}`}
                      </span>
                    </div>
                  </div>
                </div>

                {currentRole === 'parent' && safeStudents.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600">{isAr ? 'تبديل التلميذ:' : 'Switch:'}</span>
                    <select
                      value={activeStudent?.id}
                      onChange={(e) => {
                        if (setSelectedStudentId) setSelectedStudentId(e.target.value);
                      }}
                      className="bg-white border border-slate-300 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold shadow-sm outline-none"
                    >
                      {safeStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Teacher / Admin / Vice Principal Add Lesson Form */}
            {canManageLessons && (
              canPostInCurrentSubject ? (
                <form onSubmit={handlePostSubjectLesson} className="bg-[#F8FAFC] border-2 border-dashed border-[#0284C7]/40 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-black text-[#0284C7] flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-[#0284C7]" />
                      <span>{isAr ? `إضافة درس جديد لمادة (${selectedSubjectForLessons.name}):` : `Add new lesson for ${selectedSubjectForLessons.name}:`}</span>
                    </h4>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-lg">
                      {isAr ? 'حسب الصف والشعبة' : 'Targeted by Class'}
                    </span>
                  </div>

                  {/* Teacher context banner inside form */}
                  {currentRole === 'teacher' && (
                    <div className="bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#0284C7]">
                        <span>👨‍🏫 الأستاذ: {activeTeacher?.name || currentUser?.name}</span>
                        <span className="bg-white px-2 py-0.5 rounded border border-sky-300 text-[10px]">محدد المادة والشعبة</span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        <strong>الصفوف والشُعب الموكلة:</strong> {teacherAssignedList.length > 0 ? teacherAssignedList.join('، ') : 'كل الصفوف'}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isAr ? 'عنوان الدرس الشامل' : 'Lesson Title'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder={isAr ? 'مثال: جمع الكسور العشرية...' : 'e.g. Fractions addition...'}
                        className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isAr ? 'الصف الدراسي' : 'Grade'}
                        </label>
                        <select
                          value={newLessonGrade}
                          onChange={(e) => {
                            const newG = e.target.value;
                            setNewLessonGrade(newG);
                            const secs = getSectionsForGrade(newG);
                            if (secs.length > 0 && !secs.includes(newLessonSection)) {
                              setNewLessonSection(secs[0]);
                            }
                          }}
                          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-2 text-xs font-bold cursor-pointer"
                        >
                          {(currentRole === 'teacher' && availableGradesForTeacher.length > 0 ? availableGradesForTeacher : allGradeNames).map((gName, idx) => (
                            <option key={idx} value={gName}>{gName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isAr ? 'الشعبة المستهدفة' : 'Section'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={newLessonSection}
                          onChange={(e) => setNewLessonSection(e.target.value)}
                          className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2 py-2 text-xs font-bold cursor-pointer"
                        >
                          {getSectionsForGrade(newLessonGrade).map((secLetter) => (
                            <option key={secLetter} value={secLetter}>{isAr ? `الشعبة (${secLetter})` : `Section ${secLetter}`}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-2 font-bold flex items-center gap-2">
                      <span>📌</span>
                      <span>تحديد الصف والشعبة إلزامي: نظراً لاختلاف الدروس بين الشُعب، يتم توجيه ونشر هذا الدرس حصراً للشعبة والصف المحددين.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isAr ? 'نوع النشاط' : 'Activity Type'}
                      </label>
                      <select
                        value={newLessonType}
                        onChange={(e) => setNewLessonType(e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2.5 py-2 text-xs font-bold cursor-pointer"
                      >
                        <option value="lesson">{isAr ? 'درس وشرح كتابي 📖' : 'Lesson & Explanation'}</option>
                        <option value="homework">{isAr ? 'واجب منزلي ✍️' : 'Homework Task'}</option>
                        <option value="exam">{isAr ? 'اختبار ومراجعة 📝' : 'Review & Exam'}</option>
                        <option value="competition">{isAr ? 'مسابقة وتحدي 🏆' : 'Challenge & Quiz'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isAr ? 'تاريخ النشر' : 'Date'}
                      </label>
                      <input
                        type="date"
                        value={newLessonDate}
                        onChange={(e) => setNewLessonDate(e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2.5 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        {isAr ? 'اسم الأستاذ / المرسل' : 'Teacher Name'}
                      </label>
                      <input
                        type="text"
                        value={newLessonTeacher}
                        onChange={(e) => setNewLessonTeacher(e.target.value)}
                        placeholder="اسم المعلم..."
                        className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-2.5 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {isAr ? 'تفاصيل الدرس والأنشطة والواجبات المطلوبة' : 'Lesson details and homework instructions'}
                    </label>
                    <textarea
                      rows="3"
                      value={newLessonContent}
                      onChange={(e) => setNewLessonContent(e.target.value)}
                      placeholder={isAr ? 'اكتب الشرح وأرقام الصفحات والأنشطة المطلوب إنجازها...' : 'Write lesson notes and homework exercises...'}
                      className="w-full bg-white border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn-mustard px-5 py-2.5 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isAr ? 'نشر الدرس وإرساله للطلاب 🚀' : 'Publish Lesson to Students 🚀'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-sm">
                  <span className="text-xl">⚠️</span>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-amber-800">صلاحية النشر مقيدة للمعلم</p>
                    <p>مادة <strong>({selectedSubjectForLessons.name})</strong> غير مسندة لتخصصك التدريسي.</p>
                    <p className="text-[11px] text-amber-700">المواد المصرحة لك حالياً: <strong>{teacherSubjectList.length > 0 ? teacherSubjectList.join('، ') : 'لا توجد مواد مسندة'}</strong>. يمكنك فقط استعراض الدروس المرفوعة أدناه دون صلاحية نشر دروس جديدة لهذه المادة.</p>
                  </div>
                </div>
              )
            )}

            {/* Filter Bar for Teachers/Admins */}
            {canManageLessons && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-700">{isAr ? 'فلترة الدروس:' : 'Filter Lessons:'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={modalGradeFilter}
                    onChange={(e) => setModalGradeFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1 font-bold text-xs"
                  >
                    <option value="all">{isAr ? 'جميع الصفوف' : 'All Grades'}</option>
                    {(currentRole === 'teacher' && availableGradesForTeacher.length > 0 ? availableGradesForTeacher : allGradeNames).map((g, idx) => (
                      <option key={idx} value={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={modalSectionFilter}
                    onChange={(e) => setModalSectionFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1 font-bold text-xs"
                  >
                    <option value="all">{isAr ? 'جميع الشُعب' : 'All Sections'}</option>
                    <option value="أ">الشعبة (أ)</option>
                    <option value="ب">الشعبة (ب)</option>
                    <option value="ج">الشعبة (ج)</option>
                    <option value="د">الشعبة (د)</option>
                  </select>
                </div>
              </div>
            )}

            {/* List of Lessons */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0284C7]" />
                  <span>
                    {isStudentOrParent
                      ? (isAr ? 'قائمة الدروس المخصصة لصفك وشعبتك:' : 'Lessons for your class and section:')
                      : (isAr ? 'قائمة الدروس المرفوعة لهذه المادة:' : 'Lessons posted for this subject:')}
                  </span>
                </h4>
              </div>

              {(() => {
                const subjectLessons = agenda.filter(a => {
                  const matchesSubject = isSubjectMatch(a.subject, selectedSubjectForLessons.name);
                  
                  if (isStudentOrParent) {
                    const matchesGrade = isGradeMatch(a.grade, activeStudent?.grade);
                    const matchesSection = isSecMatch(a.classRoom, activeStudent?.classRoom || activeStudent?.classroom);
                    return matchesSubject && matchesGrade && matchesSection;
                  }

                  // Teacher/Admin filters
                  const matchesGrade = modalGradeFilter === 'all' || isGradeMatch(a.grade, modalGradeFilter);
                  const matchesSection = modalSectionFilter === 'all' || isSecMatch(a.classRoom, modalSectionFilter);

                  return matchesSubject && matchesGrade && matchesSection;
                });

                if (subjectLessons.length === 0) {
                  return (
                    <div className="p-8 text-center bg-[#F8FAFC] rounded-2xl border border-slate-200 text-slate-400 font-bold text-xs space-y-2">
                      <BookOpen className="w-10 h-10 mx-auto opacity-30 text-[#0284C7]" />
                      <p className="text-slate-600 font-extrabold text-sm">
                        {isStudentOrParent 
                          ? (isAr ? `لا توجد دروس أو واجبات لـ (${activeStudent?.grade || 'صفك'} - الشعبة ${activeStudent?.classRoom || 'أ'}) حالياً.` : 'No lessons for your grade and section.')
                          : (isAr ? 'لا توجد دروس مرفوعة تطابق الفلترة المحددة.' : 'No lessons matching selected filters.')}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {isStudentOrParent 
                          ? (isAr ? 'سيتم إشعارك فور قيام الأستاذ برفع دروس جديدة.' : 'You will be notified once new lessons are posted.')
                          : (isAr ? 'استخدم النموذج أعلاه لإضافة ونشر درس جديد.' : 'Use form above to post a new lesson.')}
                      </p>
                    </div>
                  );
                }

                return subjectLessons.map((item) => (
                  <div key={item.id} className="bg-[#F8FAFC] hover:bg-slate-50/80 border border-[#E2E8F0] p-4 rounded-2xl space-y-2 text-xs transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-black text-[#0284C7] text-sm">{item.title}</h5>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {item.activityType === 'homework' ? '✍️ واجب منزلي' : item.activityType === 'exam' ? '📝 اختبار' : item.activityType === 'competition' ? '🏆 مسابقة' : '📖 شرح درس'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold mt-1">
                          <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                            {item.grade || 'صف عام'}
                          </span>
                          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {isAr ? `الشعبة: ${item.classRoom ? (item.classRoom === 'جميع الشُعب' ? 'جميع الشُعب' : `(${item.classRoom})`) : '(أ)'}` : `Section: ${item.classRoom || 'A'}`}
                          </span>
                        </div>
                      </div>

                      {canManageLessons && (
                        <button
                          onClick={() => {
                            if (window.confirm(isAr ? `هل أنت متأكد من حذف هذا الدرس (${item.title})؟` : `Delete lesson (${item.title})?`)) {
                              deleteAgendaItem(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'حذف الدرس' : 'Delete Lesson'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-slate-700 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-slate-100">
                      {item.homework || item.description || (isAr ? 'شرح الدرس ومتابعة التطبيقات.' : 'Lesson explanation.')}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1 font-bold text-slate-500">
                        <UserCheck className="w-3.5 h-3.5 text-[#0284C7]" />
                        <span>{isAr ? `المرسل: ${item.teacherName || 'أ. معلم المادة'}` : `Teacher: ${item.teacherName}`}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.date || new Date().toISOString().split('T')[0]}</span>
                      </span>
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
