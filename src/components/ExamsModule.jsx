import React, {useState, useEffect, useRef} from'react';
import {createPortal} from'react-dom';
import {useApp} from'../context/AppContext';
import {
  FileSpreadsheet, 
  Award, 
  Plus, 
  CheckCircle2, 
  Trophy,
  BookOpen,
  Save,
  Search,
  Filter,
  Sparkles,
  Check,
  ArrowDown,
  ArrowUp,
  BarChart2,
  CheckSquare
} from'lucide-react';

export const ExamsModule = () => {
  const {
    lang, 
    t, 
    currentRole, 
    currentUser, 
    exams = [], 
    subjects = [], 
    students = [], 
    grades = [], 
    addExam, 
    gradeExamResult, 
    batchGradeExamResults 
  } = useApp();

  const isAr = lang ==='ar';
  const safeExams = exams || [];
  const safeSubjects = subjects || [];
  const safeStudents = students || [];

  // For Student or Parent: Show ONLY their own exam results
  if (currentRole ==='student'|| currentRole ==='parent') {
    const studentUser = safeStudents.find(s => s.id === currentUser?.id || s.name === currentUser?.name) || safeStudents[0] || {id:'STU-101', name: currentUser?.name ||'طالب متميز'};
    const myExams = safeExams.filter(ex => ex.results && ex.results.some(r => r.studentId === studentUser.id));

    return (
      <div className="space-y-6 animate-fade-in text-[#0F172A]">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Trophy className="w-6 h-6"/>
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-600">لوحة التقييم والنتائج الدراسية</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr ?`النتائج والعلامات الرسمية للتلميذ: ${studentUser.name}`:`Academic exam grades for: ${studentUser.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A]">كشف العلامات والامتحانات</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-indigo-600 border-b border-[#E2E8F0] font-bold">
                  <th className="p-3 text-right">الامتحان</th>
                  <th className="p-3">المادة</th>
                  <th className="p-3">العلامة</th>
                  <th className="p-3 text-left">ملاحظات وتقييم المعلم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {myExams.length === 0 ? (
                  <tr>
                    <td colSpan="4"className="p-6 text-slate-400 font-bold">لم تصدر أي نتائج امتحانات رسمية بعد. </td>
                  </tr>
                ) : (
                  myExams.map((ex) => {
                    const myResult = ex.results.find(r => r.studentId === studentUser.id);
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50">
                        <td className="p-3 text-right font-bold">{ex.title}</td>
                        <td className="p-3 font-bold text-slate-500">{ex.subject}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                            myResult.score >= 90 ?'bg-emerald-100 text-emerald-800':
                            myResult.score >= 60 ?'bg-indigo-100 text-indigo-800':'bg-red-100 text-red-800'
                          }`}>
                            {myResult.score} / 100
                          </span>
                        </td>
                        <td className="p-3 text-left text-slate-500 font-bold">{myResult.evaluation ||'—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 1. Linked Subjects & Active Selection
  const [selectedSubjectId, setSelectedSubjectId] = useState(() => safeSubjects[0]?.id ||'SUB-01');
  const activeSubject = safeSubjects.find((s) => s.id === selectedSubjectId) || safeSubjects[0] || {id:'SUB-01', name:'الرياضيات', nameEn:'Math'};

  // 2. Assessment Types List
  const standardAssessments = [
    'اختبار الرياضيات التقييمي - الشهر الأول (الرياضيات)',
    'اختبار الشهر الأول (التقييمي)',
    'اختبار الشهر الثاني',
    'امتحان منتصف الفصل الدراسي',
    'الامتحان النهائي المعتمد',
    'أعمال السنة والمشاركة'
  ];
  const [assessmentType, setAssessmentType] = useState('اختبار الشهر الأول (التقييمي)');

  // 3. Class & Section & Search Filter
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Modal and Toast State
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedToast, setSavedToast] = useState('');
  const [savedStudentId, setSavedStudentId] = useState(null);

  // New Exam Modal state
  const [examTitle, setExamTitle] = useState('');
  const [examTitleEn, setExamTitleEn] = useState('');
  const [modalSubjectId, setModalSubjectId] = useState(activeSubject.id);

  // Grading state
  const [gradingMarks, setGradingMarks] = useState({});
  const [gradingEvals, setGradingEvals] = useState({});

  // Input refs for super-smooth keyboard navigation (Enter / Up / Down)
  const inputRefs = useRef({});

  // Auto evaluation helper
  const getAutoEvaluation = (score) => {
    if (score ===''|| score === undefined || isNaN(score)) return'';
    const n = Number(score);
    if (n >= 90) return'أداء متميز وجيد جداً';
    if (n >= 80) return'جيد جداً ومتقدم';
    if (n >= 70) return'جيد ومثابر';
    if (n >= 60) return'مقبول';
    return'يحتاج متابعة واهتمام';
  };

  // Find active exam for this subject
  const currentExam = safeExams.find(
    (e) => (e.subjectId === activeSubject.id || e.subject === activeSubject.name) &&
           (e.title.includes(assessmentType) || (e.subject === activeSubject.name && e.title.includes('الشهر')))
  ) || safeExams.find(
    (e) => (e.subjectId === activeSubject.id || e.subject === activeSubject.name)
  );

  // Extract unique grades
  const availableGrades = Array.from(
    new Set([
      ...(grades || []).map((g) => g.name),
      ...safeStudents.map((s) => s.grade)
    ].filter(Boolean))
  );

  // Filtered students for grading table
  const filteredStudents = safeStudents.filter((stu) => {
    const matchesGrade = selectedGrade ==='all'|| stu.grade === selectedGrade;
    const matchesSection = selectedSection ==='all'|| (stu.classRoom ||'أ') === selectedSection;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (stu.name ||'').toLowerCase().includes(q) || (stu.nameEn ||'').toLowerCase().includes(q);
    return matchesGrade && matchesSection && matchesSearch;
  });

  // Sync loaded marks from exam when subject or exam changes
  useEffect(() => {
    const newMarks = {};
    const newEvals = {};
    if (currentExam?.results) {
      currentExam.results.forEach((r) => {
        newMarks[r.studentId] = r.score;
        newEvals[r.studentId] = r.evaluation;
      });
    }
    setGradingMarks(newMarks);
    setGradingEvals(newEvals);
  }, [currentExam?.id, selectedSubjectId, assessmentType]);

  // Handle Mark Change with Auto-Evaluation
  const handleMarkChange = (studentId, value) => {
    const cleanVal = value ===''?'': Math.max(0, Math.min(100, Number(value)));
    setGradingMarks((prev) => ({...prev, [studentId]: cleanVal}));

    // Auto compute evaluation if not manually customized
    if (cleanVal !=='') {
      const autoEval = getAutoEvaluation(cleanVal);
      setGradingEvals((prev) => ({...prev, [studentId]: autoEval}));
    }
  };

  // Keyboard navigation handler: Enter or ArrowDown focuses next student, ArrowUp focuses previous
  const handleKeyDown = (e, index) => {
    if (e.key ==='Enter'|| e.key ==='ArrowDown') {
      e.preventDefault();
      const nextIdx = index + 1;
      if (inputRefs.current[nextIdx]) {
        inputRefs.current[nextIdx].focus();
        inputRefs.current[nextIdx].select();
      }
    } else if (e.key ==='ArrowUp') {
      e.preventDefault();
      const prevIdx = index - 1;
      if (inputRefs.current[prevIdx]) {
        inputRefs.current[prevIdx].focus();
        inputRefs.current[prevIdx].select();
      }
    }
  };

  // Ensure exam exists before saving
  const ensureExamRecord = () => {
    if (currentExam) return currentExam;
    const newEx = addExam({
      title:`${assessmentType} - (${activeSubject.name})`,
      titleEn:`${assessmentType} - ${activeSubject.nameEn || activeSubject.name}`,
      subjectId: activeSubject.id,
      subject: activeSubject.name,
      grade: selectedGrade !=='all'? selectedGrade :'جميع الصفوف',
      classRoom: selectedSection !=='all'? selectedSection :'أ'
    });
    return newEx;
  };

  // 1. Batch Save All Marks at once
  const handleSaveAllMarks = () => {
    const examToUse = ensureExamRecord();
    const recordsToSave = [];

    filteredStudents.forEach((stu) => {
      const val = gradingMarks[stu.id];
      if (val !== undefined && val !=='') {
        const evalTxt = gradingEvals[stu.id] || getAutoEvaluation(val);
        recordsToSave.push({
          studentId: stu.id,
          score: Number(val),
          evaluation: evalTxt
        });
      }
    });

    if (recordsToSave.length === 0) {
      alert(isAr ?'يرجى إدخال علامة لطالب واحد على الأقل قبل الحفظ!':'Please enter at least one mark to save!');
      return;
    }

    if (batchGradeExamResults) {
      batchGradeExamResults(examToUse.id, recordsToSave);
    } else {
      recordsToSave.forEach((r) => {
        gradeExamResult(examToUse.id, r.studentId, r.score, r.evaluation);
      });
    }

    setSavedToast(isAr ?`تم حفظ واعتماد درجات (${recordsToSave.length}) طالب لمادة (${activeSubject.name}) بنجاح!`:`Marks saved successfully!`);
    setTimeout(() => setSavedToast(''), 3500);
  };

  // 2. Individual Single Row Save
  const handleSaveSingle = (studentId) => {
    const val = gradingMarks[studentId];
    if (val === undefined || val ==='') return;

    const examToUse = ensureExamRecord();
    const evalTxt = gradingEvals[studentId] || getAutoEvaluation(val);

    gradeExamResult(examToUse.id, studentId, Number(val), evalTxt);
    setSavedStudentId(studentId);
    setTimeout(() => setSavedStudentId(null), 2500);

    setSavedToast(isAr ?`تم حفظ درجة الطالب وتحديث الترتيب!`:`Student mark saved!`);
    setTimeout(() => setSavedToast(''), 3000);
  };

  // Quick fill uniform score for all filtered students
  const handleQuickFill = (uniformScore) => {
    const updatedMarks = {...gradingMarks};
    const updatedEvals = {...gradingEvals};
    filteredStudents.forEach((stu) => {
      updatedMarks[stu.id] = uniformScore;
      updatedEvals[stu.id] = getAutoEvaluation(uniformScore);
    });
    setGradingMarks(updatedMarks);
    setGradingEvals(updatedEvals);
  };

  const handleAddExamSubmit = (e) => {
    e.preventDefault();
    if (!examTitle) return;

    const chosenSub = safeSubjects.find((s) => s.id === modalSubjectId) || activeSubject;

    const newEx = addExam({
      title: examTitle,
      titleEn: examTitleEn || examTitle,
      subjectId: chosenSub.id,
      subject: chosenSub.name,
      grade: selectedGrade !=='all'? selectedGrade :'الصف السادس',
      classRoom: selectedSection !=='all'? selectedSection :'أ'
    });

    if (newEx?.id) {
      setSelectedSubjectId(chosenSub.id);
      setAssessmentType(examTitle);
    }

    setExamTitle('');
    setExamTitleEn('');
    setShowAddModal(false);
    setSavedToast(isAr ?'تم إنشاء الاختبار بنجاح! يمكنك الآن رصد الدرجات.':'Exam created successfully!');
    setTimeout(() => setSavedToast(''), 3500);
  };

  // Calculate live stats for current list
  const gradedCount = filteredStudents.filter((s) => gradingMarks[s.id] !== undefined && gradingMarks[s.id] !=='').length;
  const gradedScores = filteredStudents
    .map((s) => gradingMarks[s.id])
    .filter((v) => v !== undefined && v !==''&& !isNaN(v))
    .map(Number);
  const avgScore = gradedScores.length > 0 ? Math.round(gradedScores.reduce((a, b) => a + b, 0) / gradedScores.length) : 0;
  const passCount = gradedScores.filter((s) => s >= 60).length;
  const passRate = gradedScores.length > 0 ? Math.round((passCount / gradedScores.length) * 100) : 0;

  // Sort Top Performing Roster
  const topStudentsRoster = [...safeStudents].sort((a, b) => (b.gpa || 0) - (a.gpa || 0));

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Award className="w-6 h-6"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0284C7]">{isAr ?'نظام رصد الاختبارات والتقييمات الأكاديمية':'Academic Exams & Grading System'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                {isAr ?'مرتبط بجميع المواد':'All Subjects Linked'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ?'رصد درجات الطلاب لجميع المواد، إدخال فائق السهولة بالأسهم و Enter، حفظ جماعي، وتحديث فوري للترتيب والشهادات.'
                :'Record student test marks across all subjects, rapid keyboard navigation, batch saving, and real-time GPA update.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSaveAllMarks}
            className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
            title={isAr ?'حفظ واعتماد جميع العلامات المرصودة لجميع الطلاب':'Save all marks for all students'}
          >
            <Save className="w-4 h-4"/>
            <span>{isAr ?'حفظ واعتماد جميع العلامات':'Save All Marks'}</span>
          </button>

          {(currentRole ==='admin'|| currentRole ==='teacher') && (
            <button
              onClick={() => {
                setModalSubjectId(activeSubject.id);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4"/>
              <span>{isAr ?'إضافة اختبار جديد':'New Exam +'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {savedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0"/>
          <span>{savedToast}</span>
        </div>
      )}

      {/* Top Performing Honor Roll Roster */}
      {safeStudents.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
          <h3 className="text-base font-bold text-[#0284C7] border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500"/>
              <span>{isAr ?'لوحة شرف الأوائل المتفوقين (Top Ranked Roster)':'Top Academic Honor Roll'}</span>
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topStudentsRoster.slice(0, 3).map((stu, index) => (
              <div key={stu.id} className="interactive-card bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] flex items-center gap-3 shadow-sm hover:border-[#0284C7]/50">
                <div className="relative">
                  <img src={stu.avatar} alt={stu.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#0284C7]"/>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white font-bold text-[10px] rounded-full flex items-center justify-center border border-white">
                    #{index + 1}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</h4>
                  <p className="text-[11px] text-[#0284C7] font-semibold">{isAr ? stu.grade : stu.gradeEn} ({stu.classRoom ||'أ'})</p>
                  <span className="text-[10px] font-mono font-bold text-slate-500">GPA: {stu.gpa || 95}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 1. ALL SUBJECTS BAR (شريط ربط جميع المواد الدراسية) ── */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-3xl space-y-3 shadow-sm text-[#0F172A]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0284C7]"/>
            <h3 className="text-xs font-black text-slate-700">
              {isAr ?'المواد الدراسية (اختر المادة لرصد وتعديل علاماتها فوراً):':'School Subjects (Select Subject to Grade):'}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-[#0284C7] font-mono">
            {isAr ?`المادة النشطة: ${activeSubject.name}`:`Active: ${activeSubject.nameEn || activeSubject.name}`}
          </span>
        </div>

        {/* Scrollable Subject Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {safeSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            // Count exams or results in this subject
            const subjectExams = safeExams.filter(e => e.subjectId === sub.id || e.subject === sub.name);
            const totalGradesInSub = subjectExams.reduce((acc, e) => acc + (e.results?.length || 0), 0);

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-[1.02] ring-2 ring-[#0284C7]/30'
                    :'bg-[#F8FAFC] text-slate-700 border-[#E2E8F0] hover:border-[#0284C7] hover:bg-sky-50'
                }`}
              >
                <span className="text-sm">{sub.icon ||''}</span>
                <span>{isAr ? sub.name : (sub.nameEn || sub.name)}</span>
                {totalGradesInSub > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ?'bg-white/20 text-white':'bg-slate-200 text-slate-700'
                  }`}>
                    {totalGradesInSub}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. ASSESSMENT TYPE & CLASS FILTER BAR ── */}
      <div className="bg-white border border-[#E2E8F0] p-4 rounded-3xl space-y-3 shadow-sm text-[#0F172A]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Assessment / Exam Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              {isAr ?'نوع الاختبار / التقييم':'Assessment / Exam Type'}
            </label>
            <select
              value={assessmentType}
              onChange={(e) => setAssessmentType(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              {standardAssessments.map((type, i) => (
                <option key={i} value={type}>{type}</option>
              ))}
              {safeExams
                .filter(e => (e.subjectId === activeSubject.id || e.subject === activeSubject.name) && !standardAssessments.includes(e.title))
                .map((e) => (
                  <option key={e.id} value={e.title}>{e.title}</option>
                ))}
            </select>
          </div>

          {/* Grade / Class Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              {isAr ?'تصفية حسب الصف الدراسي':'Filter by Grade'}
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="all">{isAr ?'جميع الصفوف الدراسية (الكل)':'All Grades'}</option>
              {availableGrades.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              {isAr ?'الشعبة':'Section'}
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7] cursor-pointer"
            >
              <option value="all">{isAr ?'جميع الشعب':'All Sections'}</option>
              <option value="أ">الشعبة (أ)</option>
              <option value="ب">الشعبة (ب)</option>
              <option value="ج">الشعبة (ج)</option>
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              {isAr ?'بحث سريع عن تلميذ':'Search Student'}
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-2.5 right-3 rtl:right-3 ltr:left-3 text-slate-400"/>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ?'اسم التلميذ...':'Student name...'}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-8 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#0284C7]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-2 left-2 rtl:left-2 ltr:right-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Quick Performance Summary Bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-bold text-slate-500">
              {isAr ?'الطلاب المعروضين:':'Students:'} <b className="text-[#0F172A] font-mono">{filteredStudents.length}</b>
            </span>
            <span className="font-bold text-slate-500">
              {isAr ?'تم رصد درجات:':'Graded:'} <b className="text-emerald-600 font-mono">{gradedCount} / {filteredStudents.length}</b>
            </span>
            {gradedCount > 0 && (
              <>
                <span className="font-bold text-slate-500">
                  {isAr ?'متوسط الدرجات:':'Class Avg:'} <b className="text-[#0284C7] font-mono">{avgScore} / 100</b>
                </span>
                <span className="font-bold text-slate-500">
                  {isAr ?'نسبة النجاح:':'Pass Rate:'} <b className="text-purple-600 font-mono">{passRate}%</b>
                </span>
              </>
            )}
          </div>

          {/* Quick Fill Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-bold">{isAr ?'تعبئة سريعة:':'Quick Fill:'}</span>
            {[100, 90, 80, 70].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => handleQuickFill(score)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-[#0284C7] hover:text-white text-slate-700 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                title={isAr ?`تعبئة علامة ${score} لجميع الطلاب المعروضين`:`Fill ${score} for all`}
              >
                {score}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setGradingMarks({});
                setGradingEvals({});
              }}
              className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
              title={isAr ?'تفريغ الخانات الحالية':'Clear current marks'}
            >
              {isAr ?'تفريغ':'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN INTERACTIVE GRADING TABLE ── */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl space-y-4 shadow-sm text-[#0F172A]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-[#0284C7]"/>
            <div>
              <h3 className="text-base font-bold text-[#0284C7]">
                {isAr ?`دفتر رصد درجات: ${activeSubject.name}`:`Grading Sheet: ${activeSubject.name}`}
              </h3>
              <p className="text-xs text-slate-400">
                {isAr ?'اضغط Enter أو السهم للأسفل للانتقال الفوري إلى التلميذ التالي بسرعة فائقة.':'Press Enter or Down Arrow to quickly jump to next student.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveAllMarks}
            className="btn-mustard flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4"/>
            <span>{isAr ?`حفظ واعتماد جميع علامات (${activeSubject.name})`:'Save All Marks'}</span>
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300"/>
            <p className="text-sm font-bold">
              {isAr ?'لا يوجد طلاب مطابقون لمعايير التصفية والبحث الحالية.':'No students found matching current filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedGrade('all');
                setSelectedSection('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-[#0284C7] hover:underline cursor-pointer"
            >
              {isAr ?'إعادة ضبط الفلاتر وعرض جميع الطلاب':'Reset filters'}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                  <th className="p-3 font-semibold w-12 text-center">#</th>
                  <th className="p-3 font-semibold">{t('studentName')}</th>
                  <th className="p-3 font-semibold">{t('grade')}</th>
                  <th className="p-3 font-semibold w-36">{t('marks')} (/100)</th>
                  <th className="p-3 font-semibold">{t('evaluation')} والتقدير</th>
                  <th className="p-3 font-semibold text-center w-28">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu, idx) => {
                  const existingRes = (currentExam?.results || []).find((r) => String(r.studentId) === String(stu.id));
                  const currentMark = gradingMarks[stu.id] !== undefined ? gradingMarks[stu.id] : (existingRes ? existingRes.score :'');
                  const currentEval = gradingEvals[stu.id] !== undefined ? gradingEvals[stu.id] : (existingRes ? existingRes.evaluation :'');
                  const isRowSaved = savedStudentId === stu.id;

                  return (
                    <tr key={stu.id} className="hover:bg-[#F8FAFC] transition-all">
                      {/* Index */}
                      <td className="p-3 text-center text-slate-400 font-mono font-bold">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="p-3 font-bold">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={stu.avatar} 
                            alt={stu.name} 
                            className="w-9 h-9 rounded-full object-cover border-2 border-[#0284C7] shadow-sm"
                          />
                          <div>
                            <span className="block font-black text-[#0F172A]">{isAr ? stu.name : stu.nameEn}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{stu.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Grade & Section */}
                      <td className="p-3 text-slate-600 font-semibold">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px]">
                          {isAr ? stu.grade : stu.gradeEn} ({stu.classRoom ||'أ'})
                        </span>
                      </td>

                      {/* Grade Numeric Input with Keyboard Navigation */}
                      <td className="p-3 font-mono">
                        <div className="relative">
                          <input
                            ref={(el) => (inputRefs.current[idx] = el)}
                            type="number"
                            min="0"
                            max="100"
                            value={currentMark}
                            onChange={(e) => handleMarkChange(stu.id, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            placeholder="مثال: 95"
                            className="w-28 bg-[#F8FAFC] border-2 border-[#E2E8F0] focus:border-[#0284C7] text-[#0F172A] rounded-xl px-3 py-2 text-sm font-black text-center focus:outline-none transition-all shadow-inner"
                          />
                          {currentMark !==''&& !isNaN(currentMark) && (
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 text-center">
                              {Number(currentMark) >= 60 ?'ناجح':'راسب'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Evaluation Text Input */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={currentEval}
                          onChange={(e) => setGradingEvals((prev) => ({...prev, [stu.id]: e.target.value}))}
                          placeholder={isAr ?'أداء متميز وجيد جداً...':'Evaluation note...'}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] font-semibold"
                        />
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleSaveSingle(stu.id)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1 mx-auto ${
                            isRowSaved
                              ?'bg-emerald-600 text-white'
                              :'btn-mustard'
                          }`}
                          title={isAr ?'حفظ رصد هذا الطالب':'Save single student mark'}
                        >
                          {isRowSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5"/>
                              <span>{isAr ?'تم':'Saved'}</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5"/>
                              <span>{t('save')}</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save All Bar */}
        {filteredStudents.length > 0 && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500 font-semibold">
              {isAr ?`إجمالي الدرجات الجاهزة للاعتماد: ${gradedCount} من أصل ${filteredStudents.length} طالب.`:`${gradedCount} of ${filteredStudents.length} grades ready to save.`}
            </p>

            <button
              onClick={handleSaveAllMarks}
              className="btn-mustard flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4"/>
              <span>{isAr ?`اعتماد وحفظ جميع علامات (${activeSubject.name}) بنقرة واحدة`:'Save All Marks Now'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Custom Exam Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddExamSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?'إضافة اختبار مخصص جديد':'Add Custom Exam'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {isAr ?'المادة الدراسية':'Subject'}
              </label>
              <select
                value={modalSubjectId}
                onChange={(e) => setModalSubjectId(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer"
              >
                {safeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon ||''} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {isAr ?'عنوان الاختبار (عربي)':'Exam Title (Arabic)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="مثال: اختبار الشهر الأول، اختبار تطبيقات عملية..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                {isAr ?'Exam Title (English)':'Exam Title (English)'}
              </label>
              <input
                type="text"
                value={examTitleEn}
                onChange={(e) => setExamTitleEn(e.target.value)}
                placeholder="e.g. First Month Assessment..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4"/>
                <span>{isAr ?'إنشاء الاختبار وبدء الرصد':'Create & Grade'}</span>
              </button>
            </div>
          </form>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ExamsModule;
