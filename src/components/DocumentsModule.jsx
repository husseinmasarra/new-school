import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderArchive, 
  FileText, 
  CheckCircle2, 
  Upload, 
  Eye, 
  BookOpen,
  Download,
  Plus,
  Trash2,
  Search,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

export const DocumentsModule = () => {
  const { 
    lang, 
    t, 
    currentRole, 
    currentUser,
    students = [], 
    subjects = [],
    uploadStudentDoc, 
    selectedStudentId,
    studyResources = [],
    addStudyResource,
    deleteStudyResource
  } = useApp();

  const isAr = lang === 'ar';
  const safeStudents = students || [];
  const safeSubjects = subjects || [];

  const [activeTab, setActiveTab] = useState('resources'); // 'resources' (المكتبة التعليمية) or 'archive' (أرشيف الهويات)
  const [selectedStuId, setSelectedStuId] = useState(selectedStudentId || safeStudents[0]?.id);
  const [newDocName, setNewDocName] = useState('');
  const [docImage, setDocImage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Study Materials Modal State
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState(safeSubjects[0]?.name || '');
  const [resGrade, setResGrade] = useState('الصف السادس الابتدائي');
  const [resType, setResType] = useState('PDF');
  const [filterSubject, setFilterSubject] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedStudent = safeStudents.find((s) => s.id === selectedStuId) || safeStudents[0];

  const handleDocFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocSubmit = (e) => {
    e.preventDefault();
    if (!newDocName || !selectedStudent) return;

    uploadStudentDoc(selectedStudent.id, newDocName, docImage);
    setNewDocName('');
    setDocImage('');
    setSuccessToast(isAr ? 'تمت أرشفة وثيقة الطالب وصورتها بنجاح 🟢' : 'Document archived successfully!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleAddResourceSubmit = (e) => {
    e.preventDefault();
    addStudyResource({
      title: resTitle,
      subject: resSubject,
      grade: resGrade,
      type: resType,
      teacherName: currentUser?.name || 'أ. معلم المادة',
      link: '#',
      icon: resType === 'PDF' ? '📄' : resType === 'Document' ? '📐' : '💻'
    });

    setShowAddResourceModal(false);
    setResTitle('');
    setSuccessToast(isAr ? 'تم إضافة المرفق والملخص التعليمي إلى المكتبة بنجاح 📚' : 'Resource added successfully!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const filteredResources = (studyResources || []).filter((r) => {
    const matchSubject = filterSubject === 'all' || r.subject === filterSubject;
    const matchSearch = !searchTerm || r.title.includes(searchTerm) || r.subject.includes(searchTerm);
    return matchSubject && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Toast Banner */}
      {successToast && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-fade-in shadow-xl border border-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Header & Subtab Switcher */}
      <div className="bg-gradient-to-r from-[#0284C7] via-sky-700 to-[#0369A1] text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 relative z-10">
          <h2 className="text-xl font-black flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-300" />
            <span>{isAr ? 'مكتبة المرفقات والملخصات والأرشيف المدرسي' : 'Study Materials Library & Digital Archive'}</span>
          </h2>
          <p className="text-xs text-sky-100 font-medium">
            {isAr ? 'مركز التحميل الإلكتروني للملخصات وأوراق العمل وأرشيف الوثائق الرسمية' : 'Digital resource center for worksheets, study PDFs, and student document archives'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resources' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            📚 المكتبة والملخصات التعليمية
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'archive' ? 'bg-white text-[#0284C7] shadow-md font-extrabold' : 'text-white hover:bg-white/10'
            }`}
          >
            📁 أرشيف الهويات والوثائق
          </button>
        </div>
      </div>

      {/* TAB 1: STUDY RESOURCES LIBRARY */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Top Filter Bar & Add Resource Button */}
          <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-3xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600">المادة الدراسية:</span>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-bold focus:outline-none"
                >
                  <option value="all">جميع المواد الدراسية</option>
                  {safeSubjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن ملف أو ملخص..."
                  className="bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none pe-8"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {currentRole !== 'student' && (
              <button
                onClick={() => setShowAddResourceModal(true)}
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-2xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>رفع ملخص أو ورقة عمل +</span>
              </button>
            )}
          </div>

          {/* Resources Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredResources.length === 0 ? (
              <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto opacity-30 text-[#0284C7]" />
                <p className="text-xs font-bold">لا يوجد ملخصات أو ملفات تعليمية مضافة حالياً.</p>
              </div>
            ) : (
              filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-white border border-[#E2E8F0] p-5 rounded-3xl shadow-sm hover:border-[#0284C7] transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-sky-50 text-[#0284C7] rounded-lg text-[10px] font-black border border-sky-200">
                        {res.icon} {res.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{res.date}</span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[#0F172A] group-hover:text-[#0284C7] transition-colors leading-snug">
                      {res.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 font-bold space-y-0.5">
                      <span className="block text-[#0284C7]">📚 {res.subject} • {res.grade}</span>
                      <span className="block text-slate-400">👨‍🏫 المعلم: {res.teacherName}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={res.link}
                      onClick={(e) => {
                        e.preventDefault();
                        alert(`جاري تحميل الملف التعليمي: ${res.title} 📄`);
                      }}
                      className="flex-1 bg-sky-50 hover:bg-[#0284C7] text-[#0284C7] hover:text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل الملخص PDF</span>
                    </a>

                    {currentRole === 'admin' && (
                      <button
                        onClick={() => deleteStudyResource(res.id)}
                        className="p-2 text-red-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OFFICIAL STUDENT IDENTITY ARCHIVE */}
      {activeTab === 'archive' && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-[#0284C7] flex items-center gap-2">
              <FolderArchive className="w-5 h-5" />
              <span>أرشفة وثائق وهويات الطلاب الرسمية:</span>
            </h3>

            <select
              value={selectedStuId}
              onChange={(e) => setSelectedStuId(e.target.value)}
              className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
            >
              {safeStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
              ))}
            </select>
          </div>

          {/* Upload Form */}
          {currentRole !== 'student' && (
            <form onSubmit={handleUploadDocSubmit} className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder="اسم الوثيقة (مثل: الهوية الوطنية / جواز السفر)..."
                  className="bg-white border border-slate-200 text-xs font-bold text-[#0F172A] rounded-xl px-3 py-2 focus:outline-none"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDocFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0284C7] file:text-white hover:file:bg-[#0369A1] cursor-pointer"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-5 py-2 bg-[#0284C7] text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" /> أرشفة الصورة وحفظها 📁
                </button>
              </div>
            </form>
          )}

          {/* Archived Docs List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(selectedStudent?.documents || []).length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-400 text-xs font-bold">
                لا يوجد وثائق مؤرشفة لهذا الطالب حالياً.
              </div>
            ) : (
              selectedStudent.documents.map((doc, idx) => (
                <div key={idx} className="p-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-xs font-bold">{doc.name || 'وثيقة إثبات شخصية'}</span>
                  </div>
                  {doc.url && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-[#0284C7] font-bold hover:underline">
                      عرض الوثيقة 👁️
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddResourceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddResourceSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>إضافة ملخص تعليمي / ورقة عمل للمكتبة</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddResourceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">عنوان الملخص / الملف التعليمي <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                placeholder="مثال: ملخص دروس الرياضيات - الفصل الأول..."
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">المادة الدراسية</label>
                <select
                  value={resSubject}
                  onChange={(e) => setResSubject(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {safeSubjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">نوع الملف</label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  <option value="PDF">مستند PDF 📄</option>
                  <option value="Document">ورقة عمل / تمارين 📐</option>
                  <option value="Zip / Code">كود / مشروع برمجيات 💻</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button" onClick={() => setShowAddResourceModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">إلغاء</button>
              <button type="submit" className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold shadow cursor-pointer">حفظ ونشر المرفق 🌟</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

