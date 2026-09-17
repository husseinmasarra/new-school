import React, {useState, useEffect, useMemo} from'react';
import {createPortal} from'react-dom';
import {useApp, defaultAvatars} from'../context/AppContext';
import {exportToExcelCSV} from'../utils/exportUtils';
import {
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Eye, 
  Phone, 
  RefreshCw, 
  Camera, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  UserCheck, 
  Edit3, 
  BookOpen, 
  DoorOpen,
  Printer,
  Bookmark,
  Link2,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { SubjectBadge } from './SubjectBadge';
import { UsersModule } from './UsersModule';

export const DirectoryModule = ({initialSubTab ='students'}) => {
  const {
    lang, 
    t, 
    currentRole, 
    currentUser,
    students, 
    teachers, 
    systemUsers = [],
    grades = [],
    classrooms = [],
    addStudent, 
    deleteStudent, 
    updateStudent,
    addTeacher, 
    deleteTeacher, 
    subjects = [],
    addAgendaItem,
    verifyAdminPassword 
  } = useApp();

  const isAr = lang ==='ar';
  const safeStudents = students || [];
  const safeTeachers = teachers || [];
  const safeGrades = grades || [];
  const safeClassrooms = classrooms || [];
  const safeSubjects = subjects || [];

  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState(() => localStorage.getItem('school_students_grade_filter') ||'all');
  const [studentsViewMode, setStudentsViewMode] = useState(() => localStorage.getItem('school_students_view_mode') ||'table'); //'table'(default) or'cards'

  useEffect(() => {
    localStorage.setItem('school_students_grade_filter', selectedGradeFilter);
  }, [selectedGradeFilter]);

  useEffect(() => {
    localStorage.setItem('school_students_view_mode', studentsViewMode);
  }, [studentsViewMode]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Add Student Modal State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [stuFirstName, setStuFirstName] = useState('');
  const [stuFatherName, setStuFatherName] = useState('');
  const [stuLastName, setStuLastName] = useState('');
  const [stuName, setStuName] = useState('');
  const [stuNameEn, setStuNameEn] = useState('');
  const [stuUsername, setStuUsername] = useState('');
  const [stuPassword, setStuPassword] = useState('123456');
  const [stuGrade, setStuGrade] = useState(() => safeGrades[0]?.name ||'الصف الخامس الابتدائي');
  const [stuGradeEn, setStuGradeEn] = useState(() => safeGrades[0]?.nameEn ||'Grade 5');
  const [stuClassRoom, setStuClassRoom] = useState(() => safeClassrooms[0]?.sectionName ||'أ');
  const [stuTuitionTotal, setStuTuitionTotal] = useState(() => (safeGrades[0]?.tuitionFee || 700).toString());
  const [stuTuitionDiscount, setStuTuitionDiscount] = useState('0');
  const [stuAdminFees, setStuAdminFees] = useState('0');
  const [stuHasTransport, setStuHasTransport] = useState(false);
  const [stuTransportFee, setStuTransportFee] = useState('0');
  const [stuAvatar, setStuAvatar] = useState(defaultAvatars[0]);
  const [stuParentName, setStuParentName] = useState('');
  const [stuParentPhone, setStuParentPhone] = useState('');
  const [stuMotherPhone, setStuMotherPhone] = useState('');
  const [stuMinistryClearance, setStuMinistryClearance] = useState('');
  const [stuIsSpecialCase, setStuIsSpecialCase] = useState(false);
  const [studentToPrint, setStudentToPrint] = useState(null);
  const [addAnotherSibling, setAddAnotherSibling] = useState(false);
  const [siblingsList, setSiblingsList] = useState([]);

  // Special Case & Quick Edit Paid States
  const [editStuIsSpecialCase, setEditStuIsSpecialCase] = useState(false);
  const [quickEditPaidStudent, setQuickEditPaidStudent] = useState(null);
  const [quickPaidAmount, setQuickPaidAmount] = useState('');
  const [quickEditAdminPass, setQuickEditAdminPass] = useState('');
  const [quickEditAdminError, setQuickEditAdminError] = useState('');

  // Auto-fill handlers for student name, parent name, and username
  const handleFirstNameChange = (val) => {
    setStuFirstName(val);
    const fullName = [val.trim(), stuFatherName.trim(), stuLastName.trim()].filter(Boolean).join('');
    setStuName(fullName);
    const autoUser = [val.trim(), stuLastName.trim()].filter(Boolean).join('');
    setStuUsername(autoUser);
  };

  const handleFatherNameChange = (val) => {
    setStuFatherName(val);
    const fullName = [stuFirstName.trim(), val.trim(), stuLastName.trim()].filter(Boolean).join('');
    setStuName(fullName);
    const autoParent = [val.trim(), stuLastName.trim()].filter(Boolean).join('');
    setStuParentName(autoParent);
  };

  const handleLastNameChange = (val) => {
    setStuLastName(val);
    const fullName = [stuFirstName.trim(), stuFatherName.trim(), val.trim()].filter(Boolean).join('');
    setStuName(fullName);
    const autoUser = [stuFirstName.trim(), val.trim()].filter(Boolean).join('');
    setStuUsername(autoUser);
    const autoParent = [stuFatherName.trim(), val.trim()].filter(Boolean).join('');
    setStuParentName(autoParent);
  };

  const addSiblingRow = () => {
    const nextRand = Math.floor(100 + Math.random() * 900);
    const suggestedUsername = stuLastName ?`sib.${stuLastName.toLowerCase().replace(/\s+/g,'')}.${nextRand}`:`student.${Date.now().toString().slice(-4)}`;
    setSiblingsList([...siblingsList, {
      id: Math.random().toString(),
      name:'',
      nameEn:'',
      grade: safeGrades[0]?.name ||'الصف الأول الابتدائي',
      gradeEn: safeGrades[0]?.nameEn ||'Grade 1',
      classRoom:'أ',
      tuitionTotal: (safeGrades[0]?.tuitionFee || 700).toString(),
      tuitionDiscount:'0',
      adminFees:'0',
      username: suggestedUsername,
      password: Math.floor(100000 + Math.random() * 900000).toString(),
      ministryClearance:''
    }]);
  };

  const removeSiblingRow = (id) => {
    setSiblingsList(siblingsList.filter(s => s.id !== id));
  };

  const updateSiblingField = (index, field, val) => {
    const updated = [...siblingsList];
    updated[index][field] = val;
    if (field ==='grade') {
      const foundGrd = safeGrades.find(g => g.name === val);
      if (foundGrd) {
        updated[index].gradeEn = foundGrd.nameEn || val;
        updated[index].tuitionTotal = (foundGrd.tuitionFee || 700).toString();
      }
    }
    setSiblingsList(updated);
  };

  // Edit Student Modal State
  const [showEditStudentModal, setShowEditStudentModal] = useState(null);
  const [editStuName, setEditStuName] = useState('');
  const [editStuNameEn, setEditStuNameEn] = useState('');
  const [editStuUsername, setEditStuUsername] = useState('');
  const [editStuPassword, setEditStuPassword] = useState('123456');
  const [editStuGrade, setEditStuGrade] = useState('');
  const [editStuGradeEn, setEditStuGradeEn] = useState('');
  const [editStuClassRoom, setEditStuClassRoom] = useState('أ');
  const [editStuTuitionTotal, setEditStuTuitionTotal] = useState('');
  const [editStuTuitionPaid, setEditStuTuitionPaid] = useState('');
  const [editStuTuitionDiscount, setEditStuTuitionDiscount] = useState('0');
  const [editStuAdminFees, setEditStuAdminFees] = useState('0');
  const [editStuHasTransport, setEditStuHasTransport] = useState(false);
  const [editStuTransportFee, setEditStuTransportFee] = useState('0');
  const [editStuParentName, setEditStuParentName] = useState('');
  const [editStuParentPhone, setEditStuParentPhone] = useState('');
  const [editStuMotherPhone, setEditStuMotherPhone] = useState('');
  const [editStuMinistryClearance, setEditStuMinistryClearance] = useState('');
  // Siblings added or linked during Student Edit Modal
  const [editSiblingsList, setEditSiblingsList] = useState([]);
  const [editLinkedExistingIds, setEditLinkedExistingIds] = useState([]);
  const [showLinkExistingSelect, setShowLinkExistingSelect] = useState(false);
  const [selectedStudentToLink, setSelectedStudentToLink] = useState('');

  const handleAddSiblingInEdit = () => {
    const parentLastName = (editStuName ||'').trim().split('').slice(-1)[0] ||'';
    const nextRand = Math.floor(100 + Math.random() * 900);
    const suggestedUsername = parentLastName 
      ?`sib.${parentLastName.toLowerCase().replace(/[^a-z0-9]/g,'')}.${nextRand}`
      :`student.${Date.now().toString().slice(-4)}`;

    const defaultGrade = safeGrades[0]?.name ||'الصف الأول الابتدائي';
    const defaultGradeEn = safeGrades[0]?.nameEn ||'Grade 1';
    const defaultTuition = editStuIsSpecialCase ?'0': (safeGrades[0]?.tuitionFee || 700).toString();

    setEditSiblingsList(prev => [
      ...prev,
      {
        id:`sib-edit-${Date.now()}-${Math.random()}`,
        name:'',
        nameEn:'',
        grade: defaultGrade,
        gradeEn: defaultGradeEn,
        classRoom:'أ',
        tuitionTotal: defaultTuition,
        tuitionDiscount:'0',
        adminFees:'0',
        hasTransport: false,
        transportFee:'0',
        username: suggestedUsername,
        password: Math.floor(100000 + Math.random() * 900000).toString(),
        ministryClearance:''
      }
    ]);
  };

  const handleRemoveSiblingInEdit = (id) => {
    setEditSiblingsList(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateSiblingInEdit = (index, field, val) => {
    setEditSiblingsList(prev => {
      const updated = [...prev];
      updated[index] = {...updated[index], [field]: val};
      if (field ==='grade') {
        const foundGrd = safeGrades.find(g => g.name === val);
        if (foundGrd) {
          updated[index].gradeEn = foundGrd.nameEn || val;
          if (!editStuIsSpecialCase) {
            updated[index].tuitionTotal = (foundGrd.tuitionFee || 700).toString();
          }
        }
      }
      return updated;
    });
  };

  const handleLinkExistingStudent = (studentId) => {
    if (!studentId) return;
    if (!editLinkedExistingIds.includes(studentId)) {
      setEditLinkedExistingIds(prev => [...prev, studentId]);
    }
    setSelectedStudentToLink('');
    setShowLinkExistingSelect(false);
  };

  const handleUnlinkExistingStudent = (studentId) => {
    setEditLinkedExistingIds(prev => prev.filter(id => id !== studentId));
  };

  // Print Lists States
  const [isPrintingStudentsTable, setIsPrintingStudentsTable] = useState(false);
  const [isPrintingTeachersTable, setIsPrintingTeachersTable] = useState(false);

  // Add Teacher Modal State
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [tchName, setTchName] = useState('');
  const [tchNameEn, setTchNameEn] = useState('');
  const [tchUsername, setTchUsername] = useState('');
  const [tchPassword, setTchPassword] = useState('123456');
  const [tchSubjects, setTchSubjects] = useState(() => [safeSubjects[0]?.name ||'الرياضيات']);
  const [tchAssignedClasses, setTchAssignedClasses] = useState([]);
  const [tchSalary, setTchSalary] = useState('1200');
  const [tchAvatar, setTchAvatar] = useState(defaultAvatars[1]);

  // Edit Teacher Modal State
  const [showEditTeacherModal, setShowEditTeacherModal] = useState(null);

  // Teacher Send Lesson Modal State
  const [showSendLessonModal, setShowSendLessonModal] = useState(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonHomework, setLessonHomework] = useState('');
  const [lessonGrade, setLessonGrade] = useState(() => safeGrades[0]?.name ||'الصف السادس');
  const [lessonClass, setLessonClass] = useState('أ');

  // Student Details Modal State
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(null);
  const [showFamilyDetailModal, setShowFamilyDetailModal] = useState(null);

  // Success Toast State
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Student Photo File Upload
  const handleStudentAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setStuAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle Teacher Photo File Upload
  const handleTeacherAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTchAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Auto-Generate Random Password
  const handleRegenerateStuPassword = () => setStuPassword(Math.floor(100000 + Math.random() * 900000).toString());
  const handleRegenerateTchPassword = () => setTchPassword(Math.floor(100000 + Math.random() * 900000).toString());

  const handlePrintClearance = (student) => {
    setStudentToPrint(student);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDeleteStudentInFamily = (student) => {
    if (!student) return;
    const confirmMsg = isAr
      ?`هل أنت متأكد من حذف الطالب"${student.name}"نهائياً من النظام؟`
      :`Are you sure you want to permanently delete student"${student.name}"?`;

    if (window.confirm(confirmMsg)) {
      deleteStudent(student.id);
      setShowFamilyDetailModal((prev) => {
        if (!prev) return null;
        const nextMembers = (prev.members || []).filter((m) => String(m.id) !== String(student.id));
        if (nextMembers.length === 0) {
          return null;
        }
        return {
          ...prev,
          members: nextMembers
        };
      });
      setSuccessMsg(isAr ?`تم حذف الطالب (${student.name}) بنجاح ✓`:`Student (${student.name}) deleted successfully ✓`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const handleDeleteEntireFamily = (family) => {
    if (!family || !family.members || family.members.length === 0) return;
    const count = family.members.length;
    const confirmMsg = isAr
      ?`هل أنت متأكد من حذف جميع الأبناء في عائلة (${family.familyName || family.parentName}) نهائياً؟ (العدد: ${count} أبناء)`
      :`Are you sure you want to permanently delete all ${count} children in this family?`;

    if (window.confirm(confirmMsg)) {
      family.members.forEach((m) => {
        deleteStudent(m.id);
      });
      setShowFamilyDetailModal(null);
      setSuccessMsg(isAr ?`تم حذف جميع طلاب العائلة (${family.familyName || family.parentName}) بنجاح ✓`:`Family deleted successfully ✓`);
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const handlePrintStudentsTable = () => {
    setIsPrintingStudentsTable(true);
    setTimeout(() => {
      window.print();
      setIsPrintingStudentsTable(false);
    }, 150);
  };

  const handlePrintTeachersTable = () => {
    setIsPrintingTeachersTable(true);
    setTimeout(() => {
      window.print();
      setIsPrintingTeachersTable(false);
    }, 150);
  };

  const handleOpenEditStudentModal = (student) => {
    setShowEditStudentModal(student);
    setEditStuName(student.name);
    setEditStuNameEn(student.nameEn ||'');
    setEditStuUsername(student.username);
    setEditStuPassword(student.password);
    setEditStuGrade(student.grade);
    setEditStuGradeEn(student.gradeEn ||'');
    setEditStuClassRoom(student.classRoom ||'أ');
    setEditStuTuitionTotal(student.tuitionTotal?.toString() ||'0');
    setEditStuTuitionPaid(student.tuitionPaid?.toString() ||'0');
    setEditStuTuitionDiscount(student.tuitionDiscount?.toString() ||'0');
    setEditStuAdminFees(student.adminFees?.toString() ||'0');
    setEditStuHasTransport(!!student.hasTransport);
    setEditStuTransportFee(student.transportFee?.toString() ||'0');
    setEditStuParentName(student.parentName ||'');
    setEditStuParentPhone(student.phone || student.parentPhone ||'');
    setEditStuMotherPhone(student.motherPhone ||'');
    setEditStuMinistryClearance(student.ministryClearance ||'');
    setEditStuIsSpecialCase(Boolean(student.isSpecialCase));
    setEditSiblingsList([]);
    setEditLinkedExistingIds([]);
    setShowLinkExistingSelect(false);
    setSelectedStudentToLink('');
  };

  const handleEditStudentSubmit = (e) => {
    e.preventDefault();
    // Verify Parent Phone Number uniqueness on edit (excluding current student, siblings in same family, and linked siblings)
    if (editStuParentPhone && editStuParentPhone.trim()) {
      const normPhone = (ph) => (ph ||'').replace(/[^0-9]/g,'');
      const cleanEditPhone = normPhone(editStuParentPhone);
      if (cleanEditPhone.length >= 6) {
        const duplicatePhone = (students || []).find((s) => {
          if (s.id === showEditStudentModal.id) return false;
          if (showEditStudentModal.familyId && s.familyId === showEditStudentModal.familyId) return false;
          if (editLinkedExistingIds.includes(s.id)) return false;
          const sPhone = normPhone(s.parentPhone || s.phone);
          if (!sPhone || sPhone.length < 6) return false;
          return sPhone === cleanEditPhone ||
            (sPhone.length >= 7 && cleanEditPhone.length >= 7 &&
             (sPhone.endsWith(cleanEditPhone.slice(-7)) || cleanEditPhone.endsWith(sPhone.slice(-7))));
        });

        if (duplicatePhone) {
          alert(isAr 
            ?`هذا الحساب موجود بالفعل!\n\nرقم هاتف ولي الأمر (${editStuParentPhone}) مسجل مسبقاً لطالب آخر:"${duplicatePhone.name}". لا يمكن استخدام نفس الهاتف.`
            :`This account already exists!\n\nThis parent phone is already registered to student:"${duplicatePhone.name}".`
          );
          return;
        }
      }
    }

    // Verify Ministry Clearance uniqueness (excluding current student)
    if (editStuMinistryClearance.trim()) {
      const isDuplicate = (students || []).some(
        s => s.id !== showEditStudentModal.id && s.ministryClearance && s.ministryClearance.trim() === editStuMinistryClearance.trim()
      );
      if (isDuplicate) {
        alert(isAr ?'رقم الإفادة هذا مسجل بالفعل لطالب آخر!':'Ministry Clearance reference is already registered to another student!');
        return;
      }
    }

    // Validate new siblings in editSiblingsList
    for (let i = 0; i < editSiblingsList.length; i++) {
      const sib = editSiblingsList[i];
      if (!sib.name || !sib.name.trim()) {
        alert(isAr ?`يرجى إدخال اسم الأخ/الأخت رقم (${i + 1})!`:`Please enter name for sibling #${i + 1}!`);
        return;
      }
      if (!sib.username || !sib.username.trim()) {
        alert(isAr ?`يرجى إدخال اسم الدخول للأخ/الأخت رقم (${i + 1})!`:`Please enter username for sibling #${i + 1}!`);
        return;
      }

      const cleanSibUser = sib.username.trim().toLowerCase();
      const isUserTaken = (students || []).some(s => s.username?.toLowerCase() === cleanSibUser) ||
                          (teachers || []).some(t => t.username?.toLowerCase() === cleanSibUser) ||
                          (systemUsers || []).some(u => u.username?.toLowerCase() === cleanSibUser) ||
                          editSiblingsList.some((other, idx) => idx !== i && other.username?.trim().toLowerCase() === cleanSibUser) ||
                          (cleanSibUser === editStuUsername.trim().toLowerCase());
      if (isUserTaken) {
        alert(isAr ?`اسم الدخول (${sib.username}) مستخدم بالفعل! يرجى اختيار اسم دخول آخر للأخ/الأخت.`:`Username (${sib.username}) is already taken!`);
        return;
      }

      if (sib.ministryClearance && sib.ministryClearance.trim()) {
        const cleanClr = sib.ministryClearance.trim();
        const isClrTaken = (students || []).some(s => s.ministryClearance && s.ministryClearance.trim() === cleanClr) ||
                           editSiblingsList.some((other, idx) => idx !== i && other.ministryClearance && other.ministryClearance.trim() === cleanClr) ||
                           (editStuMinistryClearance.trim() === cleanClr);
        if (isClrTaken) {
          alert(isAr ?`رقم الإفادة الوزارية (${cleanClr}) مسجل مسبقاً لطالب آخر!`:`Ministry clearance (${cleanClr}) is already registered!`);
          return;
        }
      }
    }

    // Determine target Family ID to unite the student and their siblings
    const targetFamilyId = showEditStudentModal.familyId ||`FAM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Update current edited student
    updateStudent(showEditStudentModal.id, {
      name: editStuName,
      nameEn: editStuNameEn || editStuName,
      username: editStuUsername,
      password: editStuPassword,
      grade: editStuGrade,
      gradeEn: editStuGradeEn,
      classRoom: editStuClassRoom,
      tuitionTotal: editStuIsSpecialCase ? 0 : Number(editStuTuitionTotal),
      tuitionPaid: editStuIsSpecialCase ? 0 : Number(editStuTuitionPaid),
      tuitionDiscount: editStuIsSpecialCase ? 0 : Number(editStuTuitionDiscount),
      adminFees: editStuIsSpecialCase ? 0 : Number(editStuAdminFees || 0),
      hasTransport: editStuIsSpecialCase ? false : editStuHasTransport,
      transportFee: editStuIsSpecialCase ? 0 : Number(editStuTransportFee || 0),
      phone: editStuParentPhone,
      parentPhone: editStuParentPhone,
      motherPhone: editStuMotherPhone,
      parentName: editStuParentName,
      parentNameEn: editStuParentName,
      ministryClearance: editStuMinistryClearance.trim(),
      isSpecialCase: editStuIsSpecialCase,
      familyId: targetFamilyId
    });

    // 2. Sync any existing siblings in this family
    const normPhone = (ph) => (ph ||'').replace(/[^0-9]/g,'');
    const cleanOrigPhone = normPhone(showEditStudentModal.parentPhone || showEditStudentModal.phone);
    (students || []).forEach(s => {
      if (s.id === showEditStudentModal.id) return;
      const sharesFamilyId = showEditStudentModal.familyId && s.familyId === showEditStudentModal.familyId;
      const sPhone = normPhone(s.parentPhone || s.phone);
      const sharesPhone = cleanOrigPhone && cleanOrigPhone.length >= 7 && sPhone && (sPhone === cleanOrigPhone || sPhone.endsWith(cleanOrigPhone.slice(-7)) || cleanOrigPhone.endsWith(sPhone.slice(-7)));

      if (sharesFamilyId || sharesPhone) {
        updateStudent(s.id, {
          familyId: targetFamilyId,
          parentPhone: editStuParentPhone,
          phone: editStuParentPhone,
          parentName: editStuParentName,
          parentNameEn: editStuParentName,
          motherPhone: editStuMotherPhone,
          isSpecialCase: editStuIsSpecialCase,
          ...(editStuIsSpecialCase ? {
            tuitionTotal: 0,
            tuitionPaid: 0,
            tuitionDiscount: 0,
            adminFees: 0,
            hasTransport: false,
            transportFee: 0
          } : {})
        });
      }
    });

    // 3. Link any selected existing students into this family
    editLinkedExistingIds.forEach(linkedId => {
      updateStudent(linkedId, {
        familyId: targetFamilyId,
        parentPhone: editStuParentPhone,
        phone: editStuParentPhone,
        parentName: editStuParentName,
        parentNameEn: editStuParentName,
        motherPhone: editStuMotherPhone,
        isSpecialCase: editStuIsSpecialCase,
        ...(editStuIsSpecialCase ? {
          tuitionTotal: 0,
          tuitionPaid: 0,
          tuitionDiscount: 0,
          adminFees: 0,
          hasTransport: false,
          transportFee: 0
        } : {})
      });
    });

    // 4. Create all newly added siblings
    editSiblingsList.forEach(sib => {
      addStudent({
        name: sib.name.trim(),
        nameEn: sib.nameEn?.trim() || sib.name.trim(),
        username: sib.username.trim(),
        password: sib.password ||'123456',
        grade: sib.grade,
        gradeEn: sib.gradeEn,
        classRoom: sib.classRoom ||'أ',
        avatar: defaultAvatars[0],
        tuitionTotal: editStuIsSpecialCase ? 0 : Number(sib.tuitionTotal || 0),
        tuitionPaid: 0,
        tuitionDiscount: editStuIsSpecialCase ? 0 : Number(sib.tuitionDiscount || 0),
        adminFees: editStuIsSpecialCase ? 0 : Number(sib.adminFees || 0),
        hasTransport: editStuIsSpecialCase ? false : !!sib.hasTransport,
        transportFee: editStuIsSpecialCase ? 0 : Number(sib.transportFee || 0),
        phone: (editStuParentPhone ||'').trim(),
        parentPhone: (editStuParentPhone ||'').trim(),
        motherPhone: (editStuMotherPhone ||'').trim(),
        parentName: editStuParentName ||`والد الطالب ${editStuName}`,
        parentNameEn: editStuParentName ||`Parent of ${editStuNameEn || editStuName}`,
        ministryClearance: (sib.ministryClearance ||'').trim(),
        isSpecialCase: editStuIsSpecialCase,
        familyId: targetFamilyId,
        frozen: false
      });
    });

    setShowEditStudentModal(null);
    setEditSiblingsList([]);
    setEditLinkedExistingIds([]);
    setShowLinkExistingSelect(false);
    setSelectedStudentToLink('');
    const totalAdded = editSiblingsList.length + editLinkedExistingIds.length;
    if (totalAdded > 0) {
      setSuccessMsg(isAr 
        ?`تم حفظ ملف الطالب وإضافة (${totalAdded}) من الإخوة إلى كرت العائلة بنجاح!`
        :`Student file updated and (${totalAdded}) siblings joined the family successfully!`
      );
    } else {
      setSuccessMsg(isAr ?'تم تعديل ملف الطالب بنجاح!':'Student file updated successfully!');
    }
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddStudentSubmit = (e) => {
    e.preventDefault();
    const finalStuName = stuName.trim() || [stuFirstName.trim(), stuFatherName.trim(), stuLastName.trim()].filter(Boolean).join('');
    if (!finalStuName || !stuUsername.trim()) {
      alert(isAr ?'يرجى ملء اسم التلميذ واسم المستخدم!':'Please enter student name and username!');
      return;
    }

    // 0. Primary Check: Parent Phone Number uniqueness (المفتاح المعتمد لمنع التكرار)
    const normPhone = (ph) => (ph ||'').replace(/[^0-9]/g,'');
    const cleanNewPhone = normPhone(stuParentPhone);

    if (!cleanNewPhone || cleanNewPhone.length < 6) {
      alert(isAr 
        ?'يرجى إدخال رقم هاتف ولي الأمر بشكل صحيح! (هو المفتاح المعتمد لمنع تكرار الحسابات).'
        :'Please enter a valid parent phone number! (It is the required key to prevent duplicate accounts).'
      );
      return;
    }

    // Verify if this parent phone is already registered for any student
    const existingStudentWithPhone = (students || []).find((s) => {
      const sPhone = normPhone(s.parentPhone || s.phone);
      if (!sPhone || sPhone.length < 6) return false;
      return sPhone === cleanNewPhone ||
        (sPhone.length >= 7 && cleanNewPhone.length >= 7 &&
         (sPhone.endsWith(cleanNewPhone.slice(-7)) || cleanNewPhone.endsWith(sPhone.slice(-7))));
    });

    if (existingStudentWithPhone) {
      alert(isAr 
        ?`هذا الحساب موجود بالفعل!\n\nرقم هاتف ولي الأمر (${stuParentPhone}) مسجل مسبقاً في النظام للطالب:"${existingStudentWithPhone.name}"(${existingStudentWithPhone.grade ||''}). لا يمكن تسجيل تلميذ مكرر بنفس رقم الهاتف.`
        :`This account already exists!\n\nThis parent phone (${stuParentPhone}) is already registered for student:"${existingStudentWithPhone.name}". Duplicate accounts are not allowed.`
      );
      return;
    }

    // 1. Verify primary student Ministry Clearance Number uniqueness
    if (stuMinistryClearance.trim()) {
      const isDuplicate = (students || []).some(
        s => s.ministryClearance && s.ministryClearance.trim() === stuMinistryClearance.trim()
      );
      if (isDuplicate) {
        alert(isAr ?'رقم الإفادة للطالب الرئيسي مسجل بالفعل لطالب آخر!':'Primary student Ministry Clearance number is already assigned!');
        return;
      }
    }

    // 2. Verify primary student Username uniqueness
    const usernameDuplicate = (students || []).some(
      s => s.username && s.username.toLowerCase().trim() === stuUsername.toLowerCase().trim()
    );
    if (usernameDuplicate) {
      alert(isAr ?'اسم المستخدم للطالب الرئيسي غير متاح!':'Primary student username is not available!');
      return;
    }

    // 3. Verify siblings validations
    for (let i = 0; i < siblingsList.length; i++) {
      const sib = siblingsList[i];
      if (!sib.name.trim()) {
        alert(isAr ?`يرجى إدخال اسم الأخ/الأخت المضاف رقم ${i + 1}`:`Please enter name for sibling #${i + 1}`);
        return;
      }
      if (!sib.username.trim()) {
        alert(isAr ?`يرجى إدخال اسم مستخدم للأخ/الأخت رقم ${i + 1}`:`Please enter username for sibling #${i + 1}`);
        return;
      }

      // Verify sibling username uniqueness
      const sibUsernameDuplicate = (students || []).some(
        s => s.username && s.username.toLowerCase().trim() === sib.username.toLowerCase().trim()
      ) || siblingsList.some((s, idx) => idx !== i && s.username.toLowerCase().trim() === sib.username.toLowerCase().trim()) || sib.username.toLowerCase().trim() === stuUsername.toLowerCase().trim();
      if (sibUsernameDuplicate) {
        alert(isAr ?`اسم المستخدم للأخ/الأخت"${sib.name}"غير متاح أو مكرر!`:`Username for sibling"${sib.name}"is already taken or duplicate!`);
        return;
      }

      // Verify sibling ministry clearance uniqueness
      if (sib.ministryClearance.trim()) {
        const sibMCIsDuplicate = (students || []).some(
          s => s.ministryClearance && s.ministryClearance.trim() === sib.ministryClearance.trim()
        ) || siblingsList.some((s, idx) => idx !== i && s.ministryClearance && s.ministryClearance.trim() === sib.ministryClearance.trim()) || sib.ministryClearance.trim() === stuMinistryClearance.trim();
        if (sibMCIsDuplicate) {
          alert(isAr ?`رقم الإفادة للأخ/الأخت"${sib.name}"مسجل بالفعل أو مكرر!`:`Ministry Clearance for sibling"${sib.name}"is duplicate!`);
          return;
        }
      }
    }

    // 4. Save primary student
    const isFamilySpecialCase = stuIsSpecialCase || siblingsList.some(s => s.isSpecialCase);
    const newFamilyId =`FAM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    addStudent({
      name: finalStuName,
      nameEn: stuNameEn || finalStuName,
      username: stuUsername,
      password: stuPassword,
      grade: stuGrade || (safeGrades[0]?.name ||'الصف الأول الابتدائي'),
      gradeEn: stuGradeEn || (safeGrades[0]?.nameEn ||'Grade 1'),
      classRoom: stuClassRoom ||'أ',
      avatar: stuAvatar,
      tuitionTotal: isFamilySpecialCase ? 0 : Number(stuTuitionTotal),
      tuitionPaid: 0,
      tuitionDiscount: isFamilySpecialCase ? 0 : Number(stuTuitionDiscount),
      adminFees: isFamilySpecialCase ? 0 : Number(stuAdminFees || 0),
      hasTransport: isFamilySpecialCase ? false : stuHasTransport,
      transportFee: isFamilySpecialCase ? 0 : Number(stuTransportFee || 0),
      phone: (stuParentPhone ||'').trim(),
      parentPhone: (stuParentPhone ||'').trim(),
      motherPhone: (stuMotherPhone ||'').trim(),
      parentName: stuParentName ||`والد الطالب ${finalStuName}`,
      parentNameEn: stuParentName ||`Parent of ${stuNameEn || finalStuName}`,
      ministryClearance: stuMinistryClearance.trim(),
      isSpecialCase: isFamilySpecialCase,
      familyId: newFamilyId,
      frozen: false
    });

    // 5. Save all added siblings
    siblingsList.forEach(sib => {
      addStudent({
        name: sib.name,
        nameEn: sib.nameEn || sib.name,
        username: sib.username,
        password: sib.password,
        grade: sib.grade,
        gradeEn: sib.gradeEn,
        classRoom: sib.classRoom,
        avatar: stuAvatar,
        tuitionTotal: isFamilySpecialCase ? 0 : Number(sib.tuitionTotal),
        tuitionPaid: 0,
        tuitionDiscount: isFamilySpecialCase ? 0 : Number(sib.tuitionDiscount),
        adminFees: isFamilySpecialCase ? 0 : Number(sib.adminFees || 0),
        hasTransport: isFamilySpecialCase ? false : !!sib.hasTransport,
        transportFee: isFamilySpecialCase ? 0 : Number(sib.transportFee || 0),
        phone: (stuParentPhone ||'').trim(),
        parentPhone: (stuParentPhone ||'').trim(),
        motherPhone: (stuMotherPhone ||'').trim(),
        parentName: stuParentName ||`والد الطالب ${finalStuName}`,
        parentNameEn: stuParentName ||`Parent of ${stuNameEn || finalStuName}`,
        ministryClearance: sib.ministryClearance.trim(),
        isSpecialCase: isFamilySpecialCase,
        familyId: newFamilyId,
        frozen: false
      });
    });

    // 6. Reset Form
    setStuFirstName('');
    setStuFatherName('');
    setStuLastName('');
    setStuName('');
    setStuNameEn('');
    setStuUsername('');
    setStuParentName('');
    setStuParentPhone('');
    setStuMotherPhone('');
    setStuMinistryClearance('');
    setStuIsSpecialCase(false);
    setStuTuitionTotal((safeGrades[0]?.tuitionFee || 700).toString());
    setStuTuitionDiscount('0');
    setStuAdminFees('0');
    setStuHasTransport(false);
    setStuTransportFee('0');
    setSiblingsList([]);
    setShowAddStudentModal(false);
    setSuccessMsg(isAr ?'تم إضافة الطالب وإخوته وتوثيق بيانات العائلة بنجاح!':'Students added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleAddTeacherSubmit = (e) => {
    e.preventDefault();
    if (!tchName || !tchUsername) return;

    const finalSubjects = tchSubjects.length > 0 ? tchSubjects : [safeSubjects[0]?.name ||'الرياضيات'];

    addTeacher({
      name: tchName,
      nameEn: tchNameEn || tchName,
      username: tchUsername,
      password: tchPassword,
      subject: finalSubjects[0],
      subjects: finalSubjects,
      assignedClassrooms: tchAssignedClasses,
      avatar: tchAvatar,
      monthlySalary: Number(tchSalary)
    });

    setTchName('');
    setTchNameEn('');
    setTchUsername('');
    setTchSubjects([safeSubjects[0]?.name ||'الرياضيات']);
    setTchAssignedClasses([]);
    setShowAddTeacherModal(false);
    setSuccessMsg(isAr ?'تم إضافة المعلم وإسناد المواد والصفوف بنجاح!':'Teacher added successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleEditTeacherSubmit = (e) => {
    e.preventDefault();
    if (!showEditTeacherModal) return;

    deleteTeacher(showEditTeacherModal.id);

    addTeacher({
      ...showEditTeacherModal,
      id: showEditTeacherModal.id
    });

    setShowEditTeacherModal(null);
    setSuccessMsg(isAr ?'تم تحديث مواد وصفوف المعلم بنجاح!':'Teacher updated successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSendLessonSubmit = (e) => {
    e.preventDefault();
    if (!showSendLessonModal || !lessonTitle) return;

    addAgendaItem({
      date: new Date().toISOString().split('T')[0],
      grade: lessonGrade,
      classRoom: lessonClass,
      subject: showSendLessonModal.subject || (showSendLessonModal.subjects?.[0] ||'المادة'),
      title: lessonTitle,
      titleEn: lessonTitle,
      homework: lessonHomework,
      homeworkEn: lessonHomework,
      dueDate: new Date().toISOString().split('T')[0]
    });

    setLessonTitle('');
    setLessonHomework('');
    setShowSendLessonModal(null);
    setSuccessMsg(isAr ?'تم إرسال ونشر الدرس للطلاب بنجاح!':'Lesson sent successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle subject selection
  const toggleSubjectSelect = (subName, targetState, setTargetState) => {
    if (targetState.includes(subName)) {
      setTargetState(targetState.filter((s) => s !== subName));
    } else {
      setTargetState([...targetState, subName]);
    }
  };

  // Toggle class selection
  const toggleClassSelect = (classLabel, targetState, setTargetState) => {
    if (targetState.includes(classLabel)) {
      setTargetState(targetState.filter((c) => c !== classLabel));
    } else {
      setTargetState([...targetState, classLabel]);
    }
  };

  const getSectionLetter = (str) => {
    if (!str) return'';
    const m = str.match(/[\(\s\-\_]([أبجدA-Z])[\)\s\-\_]?$/) || str.match(/([أبجدA-Z])/g);
    return m ? m[m.length - 1] :'';
  };

  const normGradeStr = (str) => (str ||'')
    .toLowerCase()
    .replace(/[أإآ]/g,'ا')
    .replace('الابتدائي','')
    .replace('المتوسط','')
    .replace('الثانوي','')
    .replace('الصف','')
    .replace('الشعبة','')
    .replace(/[\(\)\-\_\s]/g,'');

  const isStudentAssignedToTeacher = (student, assignedList) => {
    if (!assignedList || assignedList.length === 0) return true;
    const sGrade = normGradeStr(student.grade);
    const sSec = getSectionLetter(student.classRoom || student.classroom);

    return assignedList.some((assignedItem) => {
      const aGrade = normGradeStr(assignedItem);
      const aSec = getSectionLetter(assignedItem);
      const gradeMatches = !sGrade || !aGrade || aGrade.includes(sGrade) || sGrade.includes(aGrade.replace(/[أبجدA-Z]/g,''));
      const secMatches = !sSec || !aSec || sSec === aSec;
      return gradeMatches && secMatches;
    });
  };

  // Smart Search & Filter Logic
  const filteredStudents = safeStudents.filter((s) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || 
                          (s.name ||'').toLowerCase().includes(term) || 
                          (s.nameEn ||'').toLowerCase().includes(term) ||
                          (s.id ||'').toLowerCase().includes(term) ||
                          (s.username ||'').toLowerCase().includes(term) ||
                          (s.grade ||'').toLowerCase().includes(term) ||
                          (s.classRoom ||'').toLowerCase().includes(term) ||
                          (s.parentName ||'').toLowerCase().includes(term) ||
                          (s.parentPhone ||'').includes(term) ||
                          (s.phone ||'').includes(term) ||
                          (s.motherPhone ||'').includes(term) ||
                          (s.ministryClearance ||'').toLowerCase().includes(term);
    const matchesGrade = selectedGradeFilter ==='all'|| 
                         (selectedGradeFilter ==='special_cases'? Boolean(s.isSpecialCase) : (s.grade ||'').includes(selectedGradeFilter));
    const matchesTeacherAssignment = currentRole !=='teacher'|| isStudentAssignedToTeacher(s, currentUser?.assignedClassrooms || currentUser?.assignedClasses || []);

    return matchesSearch && matchesGrade && matchesTeacherAssignment;
  });

  const filteredTeachers = safeTeachers.filter((t) => {
    const teacherSubjectsStr = (t.subjects || [t.subject]).join('').toLowerCase();
    return t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
           teacherSubjectsStr.includes(searchTerm.toLowerCase());
  });

  // Helper to extract a normalized family key (linking siblings under one family)
  const getStudentFamilyKey = (student) => {
    // 1. If student has explicit familyId, group strictly by that familyId
    if (student.familyId && String(student.familyId).trim()) {
      return`fam_${String(student.familyId).trim()}`;
    }

    // 2. Never merge students into old cards by generic/dummy phone or generic parent name!
    const rawPhone = (student.parentPhone || student.phone ||'').replace(/[^0-9]/g,'');
    const isGenericPhone = !rawPhone || rawPhone ==='96103123456'|| rawPhone ==='123456'|| rawPhone.length < 8;
    
    const pName = (student.parentName ||'').trim().toLowerCase();
    const isGenericParent = !pName || pName.startsWith('والد الطالب') || pName.startsWith('parent of');

    // Only group if BOTH a specific custom phone AND an identical parent name exist AND familyName matches
    if (!isGenericPhone && !isGenericParent && student.familyName) {
      return`family_${student.familyName.trim().toLowerCase()}_${rawPhone}`;
    }

    // 3. Otherwise, each student has their own distinct separate card!
    return`stu_${student.id}`;
  };

  // Group unique families across all students (exactly ONE entry per family)
  const allUniqueFamilies = useMemo(() => {
    const map = {};
    (safeStudents || []).forEach(stu => {
      const fKey = getStudentFamilyKey(stu);
      if (!map[fKey]) {
        map[fKey] = {
          key: fKey,
          familyName: stu.familyName || (stu.parentName ?`عائلة ${stu.parentName.split('').slice(-1)[0] || stu.parentName}`:`عائلة الطالب ${stu.name}`),
          parentName: stu.parentName ||`والد الطالب ${stu.name}`,
          parentPhone: (stu.parentPhone || stu.phone ||'').trim(),
          motherPhone: stu.motherPhone ||'',
          members: []
        };
      }
      map[fKey].members.push(stu);
    });
    return Object.values(map);
  }, [safeStudents]);

  // Existing siblings already registered in the system for the student currently being edited
  const currentExistingSiblings = useMemo(() => {
    if (!showEditStudentModal) return [];
    const normPhone = (ph) => (ph ||'').replace(/[^0-9]/g,'');
    const stuPhone = normPhone(showEditStudentModal.parentPhone || showEditStudentModal.phone);
    return (safeStudents || []).filter(s => {
      if (s.id === showEditStudentModal.id) return false;
      if (showEditStudentModal.familyId && s.familyId && s.familyId === showEditStudentModal.familyId) return true;
      if (stuPhone && stuPhone.length >= 7) {
        const sPhone = normPhone(s.parentPhone || s.phone);
        if (sPhone && (sPhone === stuPhone || sPhone.endsWith(stuPhone.slice(-7)) || stuPhone.endsWith(sPhone.slice(-7)))) {
          return true;
        }
      }
      return false;
    });
  }, [showEditStudentModal, safeStudents]);

  // Candidates for linking an enrolled student as sibling to the currently edited student
  const linkableCandidates = useMemo(() => {
    if (!showEditStudentModal) return [];
    const existingIds = new Set(currentExistingSiblings.map(s => s.id));
    existingIds.add(showEditStudentModal.id);
    editLinkedExistingIds.forEach(id => existingIds.add(id));
    return (safeStudents || []).filter(s => !existingIds.has(s.id));
  }, [showEditStudentModal, currentExistingSiblings, editLinkedExistingIds, safeStudents]);

  // Filtered families based on search and grade filter
  const filteredFamilies = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return allUniqueFamilies.filter(fam => {
      if (term) {
        const matchesTerm = fam.familyName.toLowerCase().includes(term) ||
          fam.parentName.toLowerCase().includes(term) ||
          fam.parentPhone.toLowerCase().includes(term) ||
          (fam.motherPhone ||'').toLowerCase().includes(term) ||
          fam.members.some(m => 
            (m.name ||'').toLowerCase().includes(term) ||
            (m.nameEn ||'').toLowerCase().includes(term) ||
            (m.username ||'').toLowerCase().includes(term) ||
            (m.id ||'').toLowerCase().includes(term) ||
            (m.grade ||'').toLowerCase().includes(term) ||
            (m.classRoom ||'').toLowerCase().includes(term)
          );
        if (!matchesTerm) return false;
      }
      if (selectedGradeFilter ==='special_cases') {
        return fam.members.some(m => m.isSpecialCase);
      }
      if (selectedGradeFilter !=='all') {
        return fam.members.some(m => (m.grade ||'').includes(selectedGradeFilter));
      }
      return true;
    });
  }, [allUniqueFamilies, searchTerm, selectedGradeFilter]);

  const handleExportStudentsExcel = () => {
    const headers = ['المعرف','اسم الطالب','Name En','الصف','الشعبة','اسم ولي الأمر','هاتف ولي الأمر','الحساب المقبوض ($)','المتبقي ($)'];
    const rows = (safeStudents || []).map(s => [
      s.id, s.name, s.nameEn ||'', s.grade, s.classRoom ||'', s.parentName ||'', s.parentPhone ||'', s.isSpecialCase ? 0 : (s.tuitionPaid || 0), s.isSpecialCase ? 0 : Math.max(0, (s.tuitionTotal ?? 700) - (s.tuitionPaid || 0))
    ]);
    exportToExcelCSV(`kashf-tullab-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  const handleExportTeachersExcel = () => {
    const headers = ['المعرف','اسم المعلم','المادة الرئيسية','الراتب الشهري ($)','المكافأة المستحقة ($)','الهاتف'];
    const rows = (safeTeachers || []).map(t => [
      t.id, t.name, t.subject, t.monthlySalary || 1200, t.dueBonus || 0, t.phone ||''
    ]);
    exportToExcelCSV(`kashf-mudarisin-${new Date().toISOString().slice(0,10)}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      
      {/* Title Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-sm text-[#0F172A]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0284C7]/10 text-[#0284C7] rounded-2xl">
            <Users className="w-6 h-6"/>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0284C7]">{isAr ?'دليل المدرسة وسجل الحسابات':'School Directory & Accounts'}</h2>
            <p className="text-xs text-slate-500 mt-1">
              {isAr 
                ?"سجل حسابات الطلاب المعلمين، إسناد أكثر من مادة وصف وشعبة لكل معلم."
                :"Manage students, teachers, assign multiple subjects & classrooms per teacher."}
            </p>
          </div>
        </div>

        {/* Admin and Vice Principal Action Buttons */}
        {(currentRole ==='admin'|| currentRole ==='vice_principal') && (
          <div className="flex flex-wrap items-center gap-2">
            {activeTab ==='students'&& (
              <>
                <button
                  onClick={handlePrintStudentsTable}
                  className="px-3.5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ?"طباعة كشف كافة الطلاب":"Print Student Roster"}
                >
                  <Printer className="w-4 h-4"/>
                  <span>{isAr ?"طباعة كشف الطلاب":"Print Roster"}</span>
                </button>

                <button
                  onClick={handleExportStudentsExcel}
                  className="px-3.5 py-2.5 bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="تصدير سجل كافة الطلاب لملف اكسل"
                >
                  <span>تصدير Excel </span>
                </button>

                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow cursor-pointer transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4"/>
                  <span>{isAr ?"إضافة طالب جديد +":"Add Student +"}</span>
                </button>
              </>
            )}

            {activeTab ==='teachers'&& currentRole ==='admin'&& (
              <>
                <button
                  onClick={handlePrintTeachersTable}
                  className="px-3.5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  title={isAr ?"طباعة كشف كافة المعلمين":"Print Teacher Roster"}
                >
                  <Printer className="w-4 h-4"/>
                  <span>{isAr ?"طباعة كشف المعلمين":"Print Roster"}</span>
                </button>

                <button
                  onClick={handleExportTeachersExcel}
                  className="px-3.5 py-2.5 bg-sky-50 text-[#0284C7] border border-sky-200 hover:bg-sky-100 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  title="تصدير سجل المعلمين لملف اكسل"
                >
                  <span>تصدير Excel </span>
                </button>

                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="btn-mustard flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold shadow cursor-pointer transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4"/>
                  <span>{isAr ?"إضافة معلم جديد +":"Add Teacher +"}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0"/>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs & Smart Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-3xl shadow-sm text-[#0F172A]">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab ==='students'?'bg-[#0284C7] text-white shadow-md':'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span> {isAr ?`دليل الطلاب مفصولين بالصفوف (${safeStudents.length})`:`Students by Grade (${safeStudents.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('families')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab ==='families'?'bg-[#0284C7] text-white shadow-md':'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span> {isAr ?`كروت العائلات الموحدة (${allUniqueFamilies.length})`:`Unified Family Cards (${allUniqueFamilies.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'teachers' ? 'bg-[#0284C7] text-white shadow-md' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span> {isAr ? `كادر المعلمين (${safeTeachers.length})` : `Teachers (${safeTeachers.length})`}</span>
            </button>

            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 md:flex-none px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'users' ? 'bg-[#0284C7] text-white shadow-md ring-2 ring-sky-300' : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span> {isAr ? `إدارة المستخدمين والصلاحيات (${systemUsers.length})` : `Users & Roles (${systemUsers.length})`}</span>
              </button>
            )}
          </div>

          {/* Smart Search Bar (for Students, Families, Teachers) */}
          {activeTab !== 'users' && (
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-[#0284C7] absolute top-3 right-3 rtl:right-3 ltr:left-3 pointer-events-none"/>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isAr ? 'البحث الذكي (الاسم، المعرف ID، الصف، الشعبة، اسم الدخول...)' : 'Search by name, ID, grade, username...'}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-2xl px-9 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#0284C7]/20 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute top-2.5 left-3 rtl:left-3 ltr:right-3 text-slate-400 hover:text-red-500 text-xs font-bold bg-slate-200 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="مسح البحث"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>

        {/* Grade Quick Filter Pills & View Mode Toggle (for Students) */}
        {activeTab ==='students'&& (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1 no-scrollbar flex-wrap">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-1">فلترة الصفوف:</span>
              <button
                onClick={() => setSelectedGradeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedGradeFilter ==='all'
                    ?'bg-[#0284C7] text-white shadow-xs'
                    :'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isAr ?`كل العائلات (${allUniqueFamilies.length})`:`All Families (${allUniqueFamilies.length})`}
              </button>
              <button
                onClick={() => setSelectedGradeFilter(selectedGradeFilter ==='special_cases'?'all':'special_cases')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  selectedGradeFilter ==='special_cases'
                    ?'bg-amber-600 text-white shadow-xs'
                    :'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
                }`}
              >
                 {isAr ?'حالات خاصة':'Special Cases'} ({allUniqueFamilies.filter(f => f.members.some(m => m.isSpecialCase)).length})
              </button>
              {safeGrades.map((g) => {
                const count = safeStudents.filter(s => (s.grade ||'').includes(g.name)).length;
                return (
                  <button
                    key={g.id || g.name}
                    onClick={() => setSelectedGradeFilter(selectedGradeFilter === g.name ?'all': g.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      selectedGradeFilter === g.name
                        ?'bg-[#0284C7] text-white shadow-xs'
                        :'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? g.name : (g.nameEn || g.name)} ({count})
                  </button>
                );
              })}
            </div>

            {/* View Mode Toggle: Single Row Cards or Grid */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setStudentsViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  studentsViewMode ==='table'
                    ?'bg-[#0284C7] text-white shadow-xs'
                    :'text-slate-600 hover:bg-slate-200'
                }`}
                title="عرض كل كرت بسطر (اسم الأب، الهاتف، القسط المتبقي)"
              >
                <span> {isAr ?'كروت أسطر (اسم الأب والمتبقي)':'Row Cards (Balance Only)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStudentsViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  studentsViewMode ==='cards'
                    ?'bg-[#0284C7] text-white shadow-xs'
                    :'text-slate-600 hover:bg-slate-200'
                }`}
                title="عرض شبكة كروت"
              >
                <span> {isAr ?'شبكة كروت':'Cards Grid'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PARENTS & FAMILIES DIRECTORY / STUDENTS */}
      {activeTab ==='students'&& (() => {
        // 1. When'all'is selected: Unify into ONE card per family ("لا تفصل الصفوف هنا اجعل كرت العائلة واحد")
        if (selectedGradeFilter ==='all') {
          if (filteredFamilies.length === 0) {
            return (
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-slate-400 space-y-2">
                <Users className="w-12 h-12 mx-auto opacity-30 text-[#0284C7]"/>
                <p className="text-sm font-bold">{isAr ?'لا توجد عائلات مطابقة لخيارات البحث حالياً.':'No families found matching filters.'}</p>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-[#0284C7]/20 pb-2">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-6 bg-[#0284C7] rounded-full block"/>
                  <h3 className="text-sm font-extrabold text-[#0284C7] flex items-center gap-2">
                    <span>{isAr ?'كروت أولياء الأمور والعائلات':'Family & Parent Cards'}</span>
                    <span className="bg-sky-50 text-[#0284C7] text-[10px] px-2 py-0.5 rounded-full font-black border border-sky-200">
                      {filteredFamilies.length} {isAr ?'عائلة':'Families'}
                    </span>
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
                  {isAr ?'كرت موحد لكل عائلة — اضغط على الكرت لعرض تفاصيل الأبناء':'Unified card per family — click card to view children'}
                </span>
              </div>

              {studentsViewMode ==='table'? (
                /* كل كرت بسطر: اسم الأب، رقم الهاتف، القسط المتبقي فقط للعائلة (والباقي داخل الكرت) */
                <div className="space-y-2.5">
                  {filteredFamilies.map((family, fIdx) => {
                    const isFamilySpecialCase = family.members.every(s => s.isSpecialCase) || (family.members.length === 1 && family.members[0].isSpecialCase);
                    const combinedTotalUSD = isFamilySpecialCase
                      ? 0
                      : family.members.reduce((sum, s) => {
                          const trans = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
                          const tTotal = s.isSpecialCase ? 0 : (s.tuitionTotal ?? 700);
                          return sum + Number(tTotal) + trans;
                        }, 0);
                    const combinedDiscountUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
                    const combinedPaidUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
                    const combinedRemUSD = Math.max(0, combinedTotalUSD - combinedDiscountUSD - combinedPaidUSD);
                    const cleanPhone = (family.parentPhone ||'').replace(/[^0-9]/g,'');

                    return (
                      <div
                        key={family.key}
                        onClick={() => {
                          if (family.members.length === 1) {
                            setShowStudentDetailModal(family.members[0]);
                          } else {
                            setShowFamilyDetailModal(family);
                          }
                        }}
                        className="w-full bg-white hover:bg-sky-50/70 border border-slate-200 hover:border-[#0284C7] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 group"
                        title={isAr ?'اضغط لعرض كافة التفاصيل الكاملة':'Click to view full details'}
                      >
                        {/* 1. اسم الأب (ولي الأمر) */}
                        <div className="flex items-center gap-3 min-w-[200px] flex-1">
                          <span className="font-mono text-slate-400 font-bold text-xs w-6 text-center shrink-0">
                            {fIdx + 1}
                          </span>
                          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 border group-hover:scale-105 transition-transform ${
                            family.members.length > 1 ?'bg-amber-100 text-amber-800 border-amber-300':'bg-sky-100 text-[#0284C7] border-sky-200/80'
                          }`}>
                            {family.members.length > 1 ?'':''}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400 font-bold block">
                              {isAr ?'اسم الأب / ولي الأمر':'Father / Guardian'}
                            </span>
                            <div className="flex items-center gap-2 truncate">
                              <h4 className="font-extrabold text-[#0F172A] text-sm group-hover:text-[#0284C7] transition-colors truncate">
                                {family.parentName || (isAr ?'غير مسجل':'Not Registered')}
                              </h4>
                              {family.members.length > 1 && (
                                <span className="text-[9px] bg-amber-50 text-amber-900 border border-amber-300 font-black px-1.5 py-0.5 rounded-md shrink-0">
                                  {family.members.length} {isAr ?'أبناء':'children'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. رقم الهاتف مع زر واتساب السريع */}
                        <div className="flex items-center gap-2 shrink-0"onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono font-bold text-xs dir-ltr">
                            <span></span>
                            <span>{family.parentPhone || (isAr ?'بدون هاتف':'No Phone')}</span>
                          </div>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors inline-flex items-center justify-center border border-emerald-200 shadow-2xs"
                              title={isAr ?'مراسلة ولي الأمر عبر واتساب':'Chat on WhatsApp'}
                            >
                              <span className="text-sm leading-none"></span>
                            </a>
                          )}
                        </div>

                        {/* 3. القسط المتبقي للعائلة فقط */}
                        <div className="shrink-0 text-center sm:text-right">
                          {isFamilySpecialCase ? (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <span></span>
                              <span>{isAr ?'حالة خاصة (معفى)':'Special Case (Exempt)'}</span>
                            </span>
                          ) : combinedRemUSD === 0 ? (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <span>✓</span>
                              <span>{isAr ?'مسدد بالكامل':'Paid in Full'}</span>
                            </span>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-700 border border-red-200 font-mono inline-flex items-center gap-1.5 shadow-2xs">
                              <span className="text-slate-400 font-sans text-[11px] font-normal">{isAr ?'المتبقي:':'Due:'}</span>
                              <span className="text-sm font-black">${combinedRemUSD}</span>
                            </span>
                          )}
                        </div>

                        {/* مؤشر الضغط للتفاصيل */}
                        <div className="flex items-center gap-1 text-xs text-[#0284C7] font-bold shrink-0 bg-sky-50 group-hover:bg-sky-100 px-2.5 py-1.5 rounded-xl border border-sky-200/60 transition-colors">
                          <Eye className="w-3.5 h-3.5"/>
                          <span className="hidden sm:inline">{isAr ?'التفاصيل':'Details'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* شبكة كروت العائلات */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFamilies.map((family) => {
                    const isFamilySpecialCase = family.members.every(s => s.isSpecialCase) || (family.members.length === 1 && family.members[0].isSpecialCase);
                    const combinedTotalUSD = isFamilySpecialCase
                      ? 0
                      : family.members.reduce((sum, s) => {
                          const trans = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
                          const tTotal = s.isSpecialCase ? 0 : (s.tuitionTotal ?? 700);
                          return sum + Number(tTotal) + trans;
                        }, 0);
                    const combinedDiscountUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
                    const combinedPaidUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
                    const combinedRemUSD = Math.max(0, combinedTotalUSD - combinedDiscountUSD - combinedPaidUSD);
                    const cleanPhone = (family.parentPhone ||'').replace(/[^0-9]/g,'');

                    return (
                      <div
                        key={family.key}
                        onClick={() => {
                          if (family.members.length === 1) {
                            setShowStudentDetailModal(family.members[0]);
                          } else {
                            setShowFamilyDetailModal(family);
                          }
                        }}
                        className="bg-white border-2 border-slate-200 hover:border-[#0284C7] p-5 rounded-3xl shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-lg shrink-0">
                              
                            </div>
                            <div className="truncate">
                              <span className="text-[10px] text-slate-400 font-bold block">{isAr ?'ولي الأمر':'Guardian'}</span>
                              <h4 className="font-black text-sm text-[#0F172A] truncate">{family.parentName}</h4>
                            </div>
                          </div>
                          {family.members.length > 1 && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-black px-2 py-0.5 rounded-full shrink-0">
                               {family.members.length} {isAr ?'أبناء':'children'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl font-mono">
                          <span className="text-slate-400 font-sans"> {isAr ?'الهاتف:':'Phone:'}</span>
                          <span className="font-bold text-[#0284C7] dir-ltr">{family.parentPhone ||'—'}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <span className="text-slate-500 font-bold">{isAr ?'القسط المتبقي:':'Balance Due:'}</span>
                          {isFamilySpecialCase ? (
                            <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"> معفى</span>
                          ) : combinedRemUSD === 0 ? (
                            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ مسدد بالكامل</span>
                          ) : (
                            <span className="font-mono font-black text-red-600">${combinedRemUSD}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        // 2. When a specific grade filter is chosen ("وفي الصفوف يكونو مفصولين")
        const gradeStudents = filteredStudents;
        if (gradeStudents.length === 0) {
          return (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-30 text-[#0284C7]"/>
              <p className="text-sm font-bold">{isAr ?'لا يوجد طلاب مطابقون في هذا الصف حالياً.':'No students found matching filters in this grade.'}</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {/* Grade Divider Title */}
            <div className="flex items-center justify-between border-b border-[#0284C7]/20 pb-2">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-[#0284C7] rounded-full block"/>
                <h3 className="text-sm font-extrabold text-[#0284C7] flex items-center gap-2">
                  <span>{selectedGradeFilter ==='special_cases'? (isAr ?'الطلاب ذوو الحالات الخاصة':'Special Cases') : selectedGradeFilter}</span>
                  <span className="bg-sky-50 text-[#0284C7] text-[10px] px-2 py-0.5 rounded-full font-black border border-sky-200">
                    {gradeStudents.length} {isAr ?'تلميذ':'Students'}
                  </span>
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                {isAr ?'عرض مفصول خاص بهذا الصف الدراسي':'Separated grade view'}
              </span>
            </div>

            {/* Student list for this grade */}
            <div className="space-y-2.5">
              {gradeStudents.map((stu, sIdx) => {
                const stuTuition = stu.isSpecialCase ? 0 : (stu.tuitionTotal ?? 700);
                const stuPaid = Number(stu.tuitionPaid) || 0;
                const stuDiscount = Number(stu.tuitionDiscount) || 0;
                const remainingUSD = Math.max(0, Number(stuTuition) - stuDiscount - stuPaid);
                const phoneClean = (stu.parentPhone || stu.phone ||'').replace(/[^0-9]/g,'');

                return (
                  <div
                    key={stu.id}
                    onClick={() => setShowStudentDetailModal(stu)}
                    className="w-full bg-white hover:bg-sky-50/70 border border-slate-200 hover:border-[#0284C7] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-4 group"
                    title={isAr ?'اضغط لعرض كافة التفاصيل الكاملة':'Click to view full details'}
                  >
                    {/* 1. اسم الطالب واسم الأب */}
                    <div className="flex items-center gap-3 min-w-[200px] flex-1">
                      <span className="font-mono text-slate-400 font-bold text-xs w-6 text-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-base shrink-0 border border-sky-200/80 group-hover:scale-105 transition-transform">
                        
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-[#0F172A] text-sm group-hover:text-[#0284C7] transition-colors truncate">
                            {isAr ? stu.name : stu.nameEn}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            {stu.classRoom ?`شعبة ${stu.classRoom}`:'شعبة أ'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block truncate mt-0.5">
                          {isAr ?'ولي الأمر:':'Parent:'} {stu.parentName || (isAr ?'غير مسجل':'N/A')}
                        </span>
                      </div>
                    </div>

                    {/* 2. رقم الهاتف */}
                    <div className="flex items-center gap-2 shrink-0"onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl font-mono font-bold text-xs dir-ltr">
                        <span></span>
                        <span>{stu.parentPhone || stu.phone || (isAr ?'بدون هاتف':'No Phone')}</span>
                      </div>
                      {phoneClean && (
                        <a
                          href={`https://wa.me/${phoneClean}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors inline-flex items-center justify-center border border-emerald-200 shadow-2xs"
                          title={isAr ?'مراسلة ولي الأمر عبر واتساب':'Chat on WhatsApp'}
                        >
                          <span className="text-sm leading-none"></span>
                        </a>
                      )}
                    </div>

                    {/* 3. القسط المتبقي فقط */}
                    <div className="shrink-0 text-center sm:text-right">
                      {stu.isSpecialCase ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                          <span></span>
                          <span>{isAr ?'حالة خاصة (معفى)':'Special Case (Exempt)'}</span>
                        </span>
                      ) : remainingUSD === 0 ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                          <span>✓</span>
                          <span>{isAr ?'مسدد بالكامل':'Paid in Full'}</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-black bg-red-50 text-red-700 border border-red-200 font-mono inline-flex items-center gap-1.5 shadow-2xs">
                          <span className="text-slate-400 font-sans text-[11px] font-normal">{isAr ?'المتبقي:':'Due:'}</span>
                          <span className="text-sm font-black">${remainingUSD}</span>
                        </span>
                      )}
                    </div>

                    {/* مؤشر الضغط للتفاصيل */}
                    <div className="flex items-center gap-1 text-xs text-[#0284C7] font-bold shrink-0 bg-sky-50 group-hover:bg-sky-100 px-2.5 py-1.5 rounded-xl border border-sky-200/60 transition-colors">
                      <Eye className="w-3.5 h-3.5"/>
                      <span className="hidden sm:inline">{isAr ?'التفاصيل':'Details'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* UNIFIED FAMILY CARDS - EXACTLY ONE CARD PER FAMILY */}
      {activeTab ==='families'&& (() => {
        if (filteredFamilies.length === 0) {
          return (
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-10 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto opacity-30 text-[#0284C7]"/>
              <p className="text-sm font-bold">{isAr ?'لا توجد عائلات مطابقة للبحث حالياً.':'No families found matching filters.'}</p>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0284C7]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-amber-500 rounded-full block"/>
                <h3 className="text-sm font-extrabold text-[#0284C7] flex items-center gap-2">
                  <span>{isAr ?'كروت العائلات الموحدة (كرت واحد فقط لكل عائلة مسجلة)':'Unified Family Cards'}</span>
                  <span className="bg-amber-50 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-black border border-amber-300">
                    {filteredFamilies.length} {isAr ?'عائلة':'Families'}
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-bold">
                {isAr ?'تجميع كافة الإخوة تحت كرت عائلي موحد مع فصل الطلاب بالصفوف والشعب':'All siblings unified under one card with grades separated'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredFamilies.map((family) => {
                const isMultiSibling = family.members.length > 1;
                // If ANY sibling in the family is marked as a special case -> entire family is special case!
                const isFamilySpecialCase = family.members.some(s => s.isSpecialCase);

                // Combined financial totals for the family
                const combinedTotalUSD = isFamilySpecialCase
                  ? 0
                  : family.members.reduce((sum, s) => {
                      const trans = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
                      const tTotal = s.isSpecialCase ? 0 : (s.tuitionTotal ?? 700);
                      return sum + Number(tTotal) + trans;
                    }, 0);
                const combinedDiscountUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
                const combinedPaidUSD = family.members.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
                const combinedRemUSD = Math.max(0, combinedTotalUSD - combinedDiscountUSD - combinedPaidUSD);

                const cleanPhone = (family.parentPhone ||'').replace(/[^0-9]/g,'');

                return (
                  <div
                    key={family.key}
                    className={`bg-white border-2 p-5 rounded-3xl shadow-xs transition-all relative flex flex-col justify-between min-h-[460px] hover:shadow-md ${
                      isMultiSibling 
                        ?'border-amber-400 bg-gradient-to-b from-amber-50/20 via-white to-white ring-1 ring-amber-400/20'
                        :'border-[#E2E8F0] hover:border-[#0284C7]/40'
                    }`}
                  >
                    <div className="space-y-3 shrink-0">
                      {/* Family Header */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-10 h-10 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                            isMultiSibling ?'bg-amber-500 text-white':'bg-[#0284C7] text-white'
                          }`}>
                            {isMultiSibling ?'':''}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-black text-[#0F172A] truncate flex items-center gap-1.5">
                              <span>{family.familyName}</span>
                            </h4>
                            <span className="text-[10px] text-slate-500 font-bold block truncate">
                              ولي الأمر: {family.parentName}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black border ${
                            isMultiSibling
                              ?'bg-amber-100 text-amber-900 border-amber-300'
                              :'bg-sky-50 text-[#0284C7] border-sky-200'
                          }`}>
                            {isMultiSibling ?`${family.members.length} إخوة`:`تلميذ واحد`}
                          </span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-lg transition font-mono font-bold cursor-pointer"
                              title="مراسلة ولي الأمر عبر واتساب"
                            >
                              <Phone className="w-2.5 h-2.5"/>
                              <span>واتساب</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Parent Phone display */}
                      <div className="bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-slate-100 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400 font-sans">هاتف التواصل:</span>
                        <span className="font-bold text-[#0284C7]">{family.parentPhone ||'غير مسجل'}</span>
                      </div>

                      {/* Unified Financial Summary Box */}
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-center space-y-1">
                        <span className="text-[10px] font-black text-[#0284C7] block">
                           {isMultiSibling ?`المالية الموّحدة للعائلة (${family.members.length} إخوة)`:'الملخص المالي'}
                        </span>
                        <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono">
                          <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[8px]">إجمالي الأقساط:</span>
                            <span className="font-extrabold text-[#0F172A]">${combinedTotalUSD}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                            <span className="text-slate-400 block text-[8px]">الخصم:</span>
                            <span className="font-extrabold text-emerald-600">-${combinedDiscountUSD}</span>
                          </div>
                          <div className="bg-white p-1.5 rounded-xl border border-slate-100">
                            <span className="text-red-500 block text-[8px] font-bold">المتبقي:</span>
                            <span className="font-black text-red-600">${combinedRemUSD}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Children List in this Family - Grouped and Separated clearly by their Grades */}
                    <div className="space-y-3 my-2 flex-1 overflow-y-auto pr-1 max-h-[300px] custom-scrollbar">
                      <div className="text-[10px] font-black text-slate-500 border-b border-slate-100 pb-1 flex items-center justify-between">
                        <span>قائمة الطلاب مفصولين حسب الصفوف:</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">{family.members.length} تلاميذ</span>
                      </div>

                      {(() => {
                        // Group siblings by their Grade
                        const gradeGroups = {};
                        family.members.forEach(m => {
                          const grpKey =`${m.grade ||'غير محدد'} - ${m.classRoom ?`شعبة ${m.classRoom}`:'شعبة عامة'}`;
                          if (!gradeGroups[grpKey]) gradeGroups[grpKey] = [];
                          gradeGroups[grpKey].push(m);
                        });

                        return Object.entries(gradeGroups).map(([gradeTitle, studentsInGrade], gIdx) => (
                          <div key={gIdx} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-2.5 space-y-2">
                            {/* Grade Separation Header Badge */}
                            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-sky-200 shadow-2xs">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                                <span className="text-[11px] font-black text-[#0284C7]">
                                   {gradeTitle}
                                </span>
                              </div>
                              <span className="text-[9px] bg-sky-50 text-[#0284C7] font-bold px-2 py-0.5 rounded-md border border-sky-100">
                                {studentsInGrade.length} {studentsInGrade.length > 1 ?'تلاميذ':'تلميذ'}
                              </span>
                            </div>

                            {/* Students in this specific Grade */}
                            <div className="space-y-2">
                              {studentsInGrade.map((member) => (
                                <div key={member.id} className="bg-white border border-slate-200 p-2 rounded-xl space-y-1.5 text-xs shadow-2xs">
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className="w-6 h-6 rounded-full bg-[#0284C7]/10 text-[#0284C7] font-black text-[10px] flex items-center justify-center shrink-0 border border-[#0284C7]">
                                        {(member.name ||'ط')[0]}
                                      </div>
                                      <div className="truncate">
                                        <h5 className="text-[11px] font-black text-[#0F172A] truncate">
                                          {isAr ? member.name : member.nameEn}
                                        </h5>
                                        <span className="text-[9px] font-mono text-slate-400">ID: {member.id}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => setShowStudentDetailModal(member)}
                                        className="p-1 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-md cursor-pointer"
                                        title="معاينة"
                                      >
                                        <Eye className="w-3 h-3"/>
                                      </button>
                                      {currentRole ==='admin'&& (
                                        <>
                                          <button
                                            onClick={() => handleOpenEditStudentModal(member)}
                                            className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-md cursor-pointer"
                                            title="تعديل"
                                          >
                                            <Edit3 className="w-3 h-3"/>
                                          </button>
                                          <button
                                            onClick={() => updateStudent(member.id, {frozen: !member.frozen})}
                                            className={`p-1 rounded-md cursor-pointer ${member.frozen ?'bg-red-600 text-white':'bg-slate-100 text-slate-600'}`}
                                            title={member.frozen ?'إلغاء التجميد':'تجميد'}
                                          >
                                            
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (window.confirm(isAr ?`هل أنت متأكد من حذف الطالب"${member.name}"نهائياً من النظام؟`:`Are you sure you want to delete student"${member.name}"?`)) {
                                                deleteStudent(member.id);
                                                setSuccessMsg(isAr ?`تم حذف الطالب (${member.name}) بنجاح ✓`:`Student (${member.name}) deleted successfully ✓`);
                                                setTimeout(() => setSuccessMsg(''), 3500);
                                              }
                                            }}
                                            className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-md cursor-pointer hover:scale-105 transition-transform"
                                            title={isAr ?"حذف الطالب":"Delete"}
                                          >
                                            <Trash2 className="w-3 h-3"/>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* Credentials */}
                                  <div className="flex items-center justify-between gap-1 text-[9px] font-mono bg-slate-50 p-1 rounded-lg border border-slate-100">
                                    <div className="truncate">
                                      <span className="text-slate-400 font-sans">: </span>
                                      <span className="font-bold text-[#0284C7]">{member.username}</span>
                                    </div>
                                    <div className="truncate">
                                      <span className="text-slate-400 font-sans">: </span>
                                      <span className="font-bold text-slate-700 tracking-wider">{'*'.repeat(Math.max(6, String(member.password ||'******').length))}</span>
                                    </div>
                                  </div>

                                  {/* Member Financial Row & Quick Edit Paid Button */}
                                  <div className="flex items-center justify-between text-[10px] bg-slate-50/80 p-1.5 rounded-lg border border-slate-100 font-mono">
                                    <span className="text-slate-500">
                                      {(member.isSpecialCase || isFamilySpecialCase) ? (
                                        <span className="text-amber-700 font-bold font-sans bg-amber-50 px-2 py-0.5 rounded border border-amber-200"> حالة خاصة ($0)</span>
                                      ) : (
                                        <>قسط: <b className="text-slate-700">${member.tuitionTotal ?? 700}</b></>
                                      )}
                                    </span>
                                    <span className="text-blue-600 font-bold">
                                      مدفوع: ${member.tuitionPaid || 0}
                                    </span>
                                    {currentRole ==='admin'&& (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuickEditPaidStudent(member);
                                          setQuickPaidAmount((member.tuitionPaid || 0).toString());
                                        }}
                                        className="text-[9px] bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 cursor-pointer font-bold font-sans transition-colors"
                                      >
                                         تعديل المدفوع
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* TEACHERS TABLE ROSTER */}
      {activeTab ==='teachers'&& (
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-right rtl:text-right ltr:text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-[#F8FAFC]">
                  <th className="p-3 font-semibold">{t('teacherName')}</th>
                  <th className="p-3 font-semibold"> {t('username')}</th>
                  <th className="p-3 font-semibold"> {isAr ?'المواد التي يدرسها':'Assigned Subjects'}</th>
                  <th className="p-3 font-semibold"> {isAr ?'الصفوف والشُعب الموكلة':'Assigned Classrooms'}</th>
                  <th className="p-3 font-semibold">{t('monthlySalary')} ($ USD)</th>
                  <th className="p-3 font-semibold text-center">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#0F172A]">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-xs text-slate-400">
                      {isAr ?'لا يوجد معلمون مضافون حالياً. اضغط على"+ إضافة معلم جديد"للبدء!':'No teachers found.'}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((tch) => {
                    const teacherSubjectsList = tch.subjects || [tch.subject];
                    const teacherClassesList = tch.assignedClassrooms || [];

                    return (
                      <tr key={tch.id} className="hover:bg-[#F8FAFC] transition-all">
                        <td className="p-3 font-bold flex items-center gap-2">
                          <div className="w-9 h-9 rounded-full font-black text-xs bg-[#0284C7]/10 text-[#0284C7] border border-[#0284C7] flex items-center justify-center shrink-0">
                            {(tch.name ||'م')[0]}
                          </div>
                          <div>
                            <div>{isAr ? tch.name : tch.nameEn}</div>
                            <div className="text-[10px] text-slate-400 font-mono">ID: {tch.id}</div>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[#0284C7] font-bold">
                          <div>{tch.username}</div>
                          <div className="text-[10px] text-slate-700 tracking-wider font-black">{'*'.repeat(Math.max(6, String(tch.password ||'******').length))}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {teacherSubjectsList.map((subName, i) => (
                              <SubjectBadge key={i} subjectName={subName} />
                            ))}
                          </div>
                        </td>
                        <td className="p-3">
                          {teacherClassesList.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">{isAr ?'غير محدد':'None'}</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {teacherClassesList.map((clsLabel, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                                  {clsLabel}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#0284C7]">${tch.monthlySalary} USD</td>
                        <td className="p-3 flex items-center justify-center gap-1.5">
                          {currentRole ==='admin'&& (
                            <button
                              onClick={() => setShowEditTeacherModal(tch)}
                              className="p-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] rounded-lg cursor-pointer"
                              title={isAr ?'تعديل المواد والصفوف':'Edit Subjects & Classes'}
                            >
                              <Edit3 className="w-3.5 h-3.5"/>
                            </button>
                          )}

                          <button
                            onClick={() => setShowSendLessonModal(tch)}
                            className="btn-mustard flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold shadow cursor-pointer"
                            title="إرسال درس وواجب بيتي للطلاب"
                          >
                            <Send className="w-3.5 h-3.5"/>
                            <span>{isAr ?'درس':'Lesson'}</span>
                          </button>

                          {currentRole ==='admin'&& (
                            <button
                              onClick={() => deleteTeacher(tch.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg cursor-pointer"
                              title={t('delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS AND PERMISSIONS TAB */}
      {activeTab === 'users' && (
        <div className="pt-2 animate-fade-in">
          <UsersModule />
        </div>
      )}

      {/* Add Student Modal - Portal to document.body */}
      {showAddStudentModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddStudentSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?'إضافة طالب جديد وحساب مستقر تلقائياً':'Add New Student'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddStudentModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>



            {/* Student Name: Split into 3 columns: First Name, Father Name, Family/Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم التلميذ(ة)':'Student First Name'} <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required 
                  value={stuFirstName} 
                  onChange={(e) => handleFirstNameChange(e.target.value)} 
                  placeholder={isAr ?"مثال: محمد":"e.g. Mohamed"} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم الأب':"Father's Name"} <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required 
                  value={stuFatherName} 
                  onChange={(e) => handleFatherNameChange(e.target.value)} 
                  placeholder={isAr ?"مثال: خالد":"e.g. Khaled"} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'الكنية / العائلة':"Surname / Family Name"} <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required 
                  value={stuLastName} 
                  onChange={(e) => handleLastNameChange(e.target.value)} 
                  placeholder={isAr ?"مثال: مسرة":"e.g. Masri"} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] font-semibold"
                />
              </div>
            </div>

            {/* Display full combined Arabic name & English name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'الاسم الكامل للطالب':'Full Student Name'}</label>
                <input 
                  type="text"
                  value={stuName} 
                  onChange={(e) => setStuName(e.target.value)} 
                  placeholder={isAr ?"يتولد تلقائياً (التلميذ + الأب + الكنية)...":"Auto-composed..."} 
                  className="w-full bg-slate-50 border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم الطالب (English)':'English Name'}</label>
                <input 
                  type="text"
                  value={stuNameEn} 
                  onChange={(e) => setStuNameEn(e.target.value)} 
                  placeholder="Mohamed Khaled..."
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            {/* Parent Name & Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم ولي الأمر':'Parent Name'}</label>
                  <span className="text-[10px] text-[#0284C7] font-semibold">{isAr ?'(تلقائي: الأب + الكنية)':'(Auto: Father + Surname)'}</span>
                </div>
                <input 
                  type="text"
                  value={stuParentName} 
                  onChange={(e) => setStuParentName(e.target.value)} 
                  placeholder={isAr ?"مثال: خالد مسرة...":"Parent name..."} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] font-bold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{isAr ?'هاتف ولي الأمر':'Parent Phone'} <span className="text-red-500">*</span></label>
                  <span className="text-[10px] text-[#0284C7] font-bold"> {isAr ?'المفتاح المعتمد':'Primary Key'}</span>
                </div>
                <input type="text"required value={stuParentPhone} onChange={(e) => setStuParentPhone(e.target.value)} placeholder="+961 70 123 456..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'هاتف الأم':"Mother's Phone"}</label>
                <input type="text"value={stuMotherPhone} onChange={(e) => setStuMotherPhone(e.target.value)} placeholder="+961 70 999 888..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]"/>
              </div>
            </div>

            {/* Ministry Endorsement Clearance Number (Optional) */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500"/>
                <span>{isAr ?'رقم الإفادة المعتمد من الوزارة (اختياري - فريد)':'Ministry Clearance Reference No. (Unique - Optional)'}</span>
              </label>
              <input 
                type="text"
                value={stuMinistryClearance} 
                onChange={(e) => setStuMinistryClearance(e.target.value)} 
                placeholder={isAr ?"أدخل رقم الإفادة الوزارية الرسمي...":"Enter unique Ministry clearance reference code..."} 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{t('username')} <span className="text-red-500">*</span></label>
                  <span className="text-[10px] text-[#0284C7] font-semibold">{isAr ?'(تلقائي: التلميذ + الكنية)':'(Auto: Student + Surname)'}</span>
                </div>
                <input 
                  type="text"
                  required 
                  value={stuUsername} 
                  onChange={(e) => setStuUsername(e.target.value)} 
                  placeholder={isAr ?"مثال: محمد مسرة":"e.g. mohamed masri"} 
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{t('password')}</label>
                  <button type="button"onClick={handleRegenerateStuPassword} className="text-[10px] text-[#0284C7] font-bold flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3"/>
                    <span>{isAr ?'توليد جديد':'Generate'}</span>
                  </button>
                </div>
                <input type="text"required value={stuPassword} onChange={(e) => setStuPassword(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"/>
              </div>
            </div>

            {/* Special Case Classification Checkbox */}
            <div className="bg-amber-50/70 border border-amber-300/80 p-3 rounded-2xl flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={stuIsSpecialCase}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setStuIsSpecialCase(checked);
                    if (checked) {
                      setStuTuitionTotal('0');
                    } else {
                      const foundGrd = safeGrades.find((g) => g.name === stuGrade);
                      setStuTuitionTotal((foundGrd?.tuitionFee || 700).toString());
                    }
                  }}
                  className="w-4.5 h-4.5 accent-amber-600 rounded cursor-pointer"
                />
                <span> {isAr ?'تصنيف الطالب ضمن «الحالات الخاصة» (ينطبق الإعفاء التلقائي على كافة الإخوة)':'Classify as Special Case (Full exemption applies to all siblings)'}</span>
              </label>
              {stuIsSpecialCase && (
                <span className="text-[10px] font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
                  {isAr ?'القسط = 0$ لكافة الإخوة':'Tuition = $0 for all siblings'}
                </span>
              )}
            </div>

            {/* Dynamic Grades and Classrooms Select */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('grade')}</label>
                <select
                  value={stuGrade}
                  onChange={(e) => {
                    setStuGrade(e.target.value);
                    const foundGrd = safeGrades.find((g) => g.name === e.target.value);
                    if (foundGrd) {
                      setStuGradeEn(foundGrd.nameEn || e.target.value);
                      if (foundGrd.tuitionFee) {
                        setStuTuitionTotal(foundGrd.tuitionFee.toString());
                      }
                    }
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeGrades.length === 0 ? (
                    <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                  ) : (
                    safeGrades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {isAr ? g.name : g.nameEn}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'الشعبة':'Classroom'}</label>
                <select
                  value={stuClassRoom}
                  onChange={(e) => setStuClassRoom(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeClassrooms.length === 0 ? (
                    <>
                      <option value="أ">الشعبة (أ)</option>
                      <option value="ب">الشعبة (ب)</option>
                      <option value="ج">الشعبة (ج)</option>
                    </>
                  ) : (
                    safeClassrooms.map((c) => (
                      <option key={c.id} value={c.sectionName}>
                        {c.gradeName ?`${c.gradeName} -`:''}{isAr ? c.sectionName : c.sectionNameEn}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('totalTuition')} ($ USD)</label>
                <input type="number"value={stuTuitionTotal} onChange={(e) => setStuTuitionTotal(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono rounded-xl px-3 py-2 text-xs focus:outline-none"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'الخصومات ($ USD)':'Discount ($ USD)'}</label>
                <input type="number"value={stuTuitionDiscount} onChange={(e) => setStuTuitionDiscount(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-emerald-600 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'المصاريف الإدارية ($ USD)':'Admin Fees ($ USD)'}</label>
                <input type="number"value={stuAdminFees} onChange={(e) => setStuAdminFees(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-amber-600 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none"/>
              </div>
            </div>

            {/* Dynamic Sibling Addition Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3 text-right">
              <button
                type="button"
                onClick={addSiblingRow}
                className="w-full py-2 bg-sky-50 dark:bg-sky-950/20 hover:bg-sky-100 text-[#0284C7] dark:text-sky-400 border border-dashed border-[#0284C7]/30 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span> {isAr ?'إضافة أخ / أخت (تلميذ إضافي لنفس ولي الأمر)':'Add Brother/Sister (Additional Sibling Student)'}</span>
              </button>

              {siblingsList.length > 0 && (
                <div className="space-y-3 p-3 rounded-2xl border border-sky-100 bg-sky-50/10 dark:bg-sky-950/5 text-right">
                  <h4 className="text-xs font-black text-[#0284C7] flex items-center gap-1.5 justify-end">
                    <span> {isAr ?'بيانات الإخوة الإضافيين المضافين للطلب:':'Additional Siblings Details:'}</span>
                  </h4>
                  
                  {siblingsList.map((sib, index) => (
                    <div key={sib.id} className="relative p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-xs">
                      {/* Header with remove button */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <button
                          type="button"
                          onClick={() => removeSiblingRow(sib.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          {isAr ?'حذف هذا الأخ':'Remove Sibling'}
                        </button>
                        <span className="text-[10px] font-black text-slate-500">{isAr ?`الأخ المضاف #${index + 1}`:`Sibling #${index + 1}`}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'اسم الأخ/الأخت الكامل *':'Sibling Name *'}</label>
                          <input 
                            type="text"
                            required 
                            value={sib.name} 
                            onChange={(e) => updateSiblingField(index,'name', e.target.value)} 
                            placeholder={isAr ?"مثال: يوسف محمد علي...":"Sibling name..."} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] text-right"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'اسم الأخ/الأخت (English)':'Sibling English Name'}</label>
                          <input 
                            type="text"
                            value={sib.nameEn} 
                            onChange={(e) => updateSiblingField(index,'nameEn', e.target.value)} 
                            placeholder="Youssef Mohamed..."
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0284C7] text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('grade')}</label>
                          <select
                            value={sib.grade}
                            onChange={(e) => updateSiblingField(index,'grade', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeGrades.map((g) => (
                              <option key={g.id} value={g.name}>
                                {isAr ? g.name : g.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'الشعبة':'Classroom'}</label>
                          <select
                            value={sib.classRoom}
                            onChange={(e) => updateSiblingField(index,'classRoom', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeClassrooms.map((c) => (
                              <option key={c.id} value={c.sectionName}>
                                {c.gradeName ?`${c.gradeName} -`:''}{isAr ? c.sectionName : c.sectionNameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-right">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('totalTuition')} ($ USD)</label>
                          <input 
                            type="number"
                            value={sib.tuitionTotal} 
                            onChange={(e) => updateSiblingField(index,'tuitionTotal', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'الخصومات ($ USD)':'Discount ($ USD)'}</label>
                          <input 
                            type="number"
                            value={sib.tuitionDiscount} 
                            onChange={(e) => updateSiblingField(index,'tuitionDiscount', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-emerald-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'المصاريف الإدارية ($ USD)':'Admin Fees ($ USD)'}</label>
                          <input 
                            type="number"
                            value={sib.adminFees ||'0'} 
                            onChange={(e) => updateSiblingField(index,'adminFees', e.target.value)} 
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-amber-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'رقم إفادة الوزارة':'Clearance No.'}</label>
                          <input 
                            type="text"
                            value={sib.ministryClearance} 
                            onChange={(e) => updateSiblingField(index,'ministryClearance', e.target.value)} 
                            placeholder={isAr ?"رقم إفادة فريد...":"Unique clearance..."}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-right">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 block">{t('username')}</span>
                          <input 
                            type="text"
                            required 
                            value={sib.username} 
                            onChange={(e) => updateSiblingField(index,'username', e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-lg px-2 py-1 text-[11px] focus:outline-none text-right"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-500 block">{t('password')}</span>
                          <input 
                            type="password"
                            required 
                            value={sib.password} 
                            onChange={(e) => updateSiblingField(index,'password', e.target.value)} 
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-bold font-mono rounded-lg px-2 py-1 text-[11px] focus:outline-none text-right"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Combined Family Tuition Panel */}
              <div className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border-2 border-sky-200 dark:border-sky-900 rounded-2xl flex items-center justify-between text-right">
                <div className="flex items-center gap-2">
                  <span className="text-xl"></span>
                  <div>
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300">{isAr ?'الحساب المالي المجمع للمسجلين:':'Total Family Tuition:'}</h4>
                    <p className="text-[10px] text-slate-500 font-bold">{isAr ?`طالب رئيسي + ${siblingsList.length} إخوة`:`1 Primary + ${siblingsList.length} Siblings`}</p>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-sm font-black text-[#0284C7] dark:text-sky-400 block"title={isAr ?'إجمالي الأقساط':'Total Tuition'}>
                    {isAr ?'القسط:':'Tuition:'} ${(Number(stuTuitionTotal || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionTotal || 0), 0))} USD
                  </span>
                  <span className="text-[10px] text-amber-600 font-extrabold block"title={isAr ?'إجمالي المصاريف الإدارية':'Total Admin Fees'}>
                    {isAr ?'المصاريف الإدارية:':'Admin Fees:'} +${(Number(stuAdminFees || 0) + siblingsList.reduce((acc, s) => acc + Number(s.adminFees || 0), 0))} USD
                  </span>
                  <span className="text-[10px] text-emerald-600 font-extrabold block">
                    {isAr ?'الخصم الإجمالي:':'Total Discount:'} -${(Number(stuTuitionDiscount || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionDiscount || 0), 0))} USD
                  </span>
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800 pt-0.5 block">
                    {isAr ?'صافي المبلغ المطلوب:':'Net Total:'} ${(Number(stuTuitionTotal || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionTotal || 0), 0)) + (Number(stuAdminFees || 0) + siblingsList.reduce((acc, s) => acc + Number(s.adminFees || 0), 0)) - (Number(stuTuitionDiscount || 0) + siblingsList.reduce((acc, s) => acc + Number(s.tuitionDiscount || 0), 0))} USD
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowAddStudentModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Add Teacher Modal with Multi-Subject & Multi-Classroom Support */}
      {showAddTeacherModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleAddTeacherSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?'إضافة معلم جديد (المواد والصفوف الموكلة)':'Add Teacher'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddTeacherModal(false)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم المعلم الكامل':'Teacher Name'} <span className="text-red-500">*</span></label>
                <input type="text"required value={tchName} onChange={(e) => setTchName(e.target.value)} placeholder="أ. طارق عبد الله..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'اسم المعلم (English)':'English Name'}</label>
                <input type="text"value={tchNameEn} onChange={(e) => setTchNameEn(e.target.value)} placeholder="Tarek Abdallah..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('username')} <span className="text-red-500">*</span></label>
                <input type="text"required value={tchUsername} onChange={(e) => setTchUsername(e.target.value)} placeholder="tarek.math..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0284C7]"/>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">{t('password')}</label>
                  <button type="button"onClick={handleRegenerateTchPassword} className="text-[10px] text-[#0284C7] font-bold flex items-center gap-1 cursor-pointer">
                    <RefreshCw className="w-3 h-3"/>
                    <span>{isAr ?'توليد جديد':'Generate'}</span>
                  </button>
                </div>
                <input type="text"required value={tchPassword} onChange={(e) => setTchPassword(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-red-600 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"/>
              </div>
            </div>

            {/* MULTI-SUBJECT SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0284C7]"/>
                <span>{isAr ?'اختر المواد التي يدرسها المعلم (أكثر من مادة):':'Select Assigned Subjects (Multiple):'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeSubjects.map((sub) => {
                  const isChecked = tchSubjects.includes(sub.name);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => toggleSubjectSelect(sub.name, tchSubjects, setTchSubjects)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-105'
                          :'bg-white text-slate-700 border-slate-200 hover:border-[#0284C7]'
                      }`}
                    >
                      <span>{sub.icon ||''}</span>
                      <span>{sub.name}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MULTI-CLASSROOM SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-emerald-600"/>
                <span>{isAr ?'اختر الصفوف والشعب الموكلة للمعلم (أكثر من شعبة):':'Select Assigned Classrooms (Multiple):'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeClassrooms.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">{isAr ?'أضف صفوف وشعب أولاً من قسم (الصفوف والشعب).':'Add classrooms first.'}</p>
                ) : (
                  safeClassrooms.map((cls) => {
                    const label =`${cls.gradeName} - ${cls.sectionName}`;
                    const isChecked = tchAssignedClasses.includes(label);

                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClassSelect(label, tchAssignedClasses, setTchAssignedClasses)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                          isChecked 
                            ?'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                            :'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                        }`}
                      >
                        <span></span>
                        <span>{label}</span>
                        {isChecked && <span>✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{t('monthlySalary')} ($ USD)</label>
              <input type="number"value={tchSalary} onChange={(e) => setTchSalary(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-mono rounded-xl px-3 py-2 text-xs focus:outline-none"/>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowAddTeacherModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Edit Teacher Modal for Assigning Multiple Subjects & Classes */}
      {showEditTeacherModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleEditTeacherSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?`تعديل مواد وصفوف المعلم: ${showEditTeacherModal.name}`:`Edit Teacher - ${showEditTeacherModal.nameEn}`}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowEditTeacherModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* MULTI-SUBJECT SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-[#0284C7] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#0284C7]"/>
                <span>{isAr ?'تحديث المواد التي يدرسها المعلم:':'Assigned Subjects:'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeSubjects.map((sub) => {
                  const currentList = showEditTeacherModal.subjects || [showEditTeacherModal.subject];
                  const isChecked = currentList.includes(sub.name);

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        const updated = isChecked 
                          ? currentList.filter((s) => s !== sub.name)
                          : [...currentList, sub.name];
                        setShowEditTeacherModal({
                          ...showEditTeacherModal,
                          subject: updated[0] ||'الرياضيات',
                          subjects: updated
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ?'bg-[#0284C7] text-white border-[#0284C7] shadow-md scale-105'
                          :'bg-white text-slate-700 border-slate-200 hover:border-[#0284C7]'
                      }`}
                    >
                      <span>{sub.icon ||''}</span>
                      <span>{sub.name}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* MULTI-CLASSROOM SELECTOR */}
            <div className="space-y-2 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]">
              <label className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-emerald-600"/>
                <span>{isAr ?'تحديث الصفوف والشعب الموكلة للمعلم:':'Assigned Classrooms:'}</span>
              </label>

              <div className="flex flex-wrap gap-2 pt-1">
                {safeClassrooms.map((cls) => {
                  const label =`${cls.gradeName} - ${cls.sectionName}`;
                  const currentClasses = showEditTeacherModal.assignedClassrooms || [];
                  const isChecked = currentClasses.includes(label);

                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        const updated = isChecked
                          ? currentClasses.filter((c) => c !== label)
                          : [...currentClasses, label];
                        setShowEditTeacherModal({
                          ...showEditTeacherModal,
                          assignedClassrooms: updated
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isChecked 
                          ?'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                          :'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'
                      }`}
                    >
                      <span></span>
                      <span>{label}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowEditTeacherModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Send Lesson Modal - Portal to document.body */}
      {showSendLessonModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <form
            onSubmit={handleSendLessonSubmit}
            className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#0284C7] flex items-center gap-2">
                <Send className="w-5 h-5 text-[#0284C7]"/>
                <span>{isAr ?`إرسال درس وواجب بيتي - ${showSendLessonModal.name}`:`Send Lesson & Homework - ${showSendLessonModal.nameEn}`}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowSendLessonModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{t('grade')}</label>
                <select value={lessonGrade} onChange={(e) => setLessonGrade(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">{isAr ?'الشعبة':'Classroom'}</label>
                <select value={lessonClass} onChange={(e) => setLessonClass(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none">
                  {safeClassrooms.map((c) => (
                    <option key={c.id} value={c.sectionName}>{c.sectionName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ?'عنوان الدرس الشارح':'Lesson Title'} <span className="text-red-500">*</span></label>
              <input type="text"required value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="درس حل المعاملات الرياضية ص 45..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">{isAr ?'تفاصيل الواجب المنزلي المطلوبة':'Homework Description'}</label>
              <textarea rows={3} value={lessonHomework} onChange={(e) => setLessonHomework(e.target.value)} placeholder="حل التمارين من رقم 1 إلى 10 على دفتر الواجبات..."className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7]"/>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button type="button"onClick={() => setShowSendLessonModal(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 btn-mustard rounded-xl text-xs font-bold shadow cursor-pointer">{isAr ?'إرسال ونشر الآن':'Send & Publish'}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Student Detail Modal - Portal to document.body */}
      {showStudentDetailModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full font-black text-base bg-[#0284C7]/10 text-[#0284C7] border-2 border-[#0284C7] flex items-center justify-center shrink-0">
                  {(showStudentDetailModal.name ||'ط')[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0284C7]">{isAr ? showStudentDetailModal.name : showStudentDetailModal.nameEn}</h3>
                  <p className="text-xs text-slate-500">{isAr ? showStudentDetailModal.grade : showStudentDetailModal.gradeEn} ({showStudentDetailModal.classRoom})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStudentDetailModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* PROMINENT ACCOUNT CREDENTIALS BOX */}
            <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-sky-50 dark:bg-slate-900 p-3.5 rounded-2xl border-2 border-[#0284C7]/40 space-y-2 text-right">
              <span className="text-[11px] font-black text-[#0284C7] block"> بيانات حساب الطالب لخاصة بالدخول للمنظومة:</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-sky-200 text-right">
                  <span className="text-slate-500 block font-bold text-[10px]"> اسم الحساب (اسم الدخول):</span>
                  <span className="font-mono font-black text-sm text-[#0284C7] dir-ltr block pt-0.5">{showStudentDetailModal.username}</span>
                </div>
                <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-sky-200 text-right">
                  <span className="text-slate-500 block font-bold text-[10px]"> كلمة المرور:</span>
                  <span className="font-mono font-black text-sm text-slate-700 tracking-widest dir-ltr block pt-0.5">{'*'.repeat(Math.max(6, String(showStudentDetailModal.password ||'******').length))}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-right">
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{t('parentName')}:</span>
                <span className="font-bold text-[#0F172A] dark:text-slate-100">{isAr ? showStudentDetailModal.parentName : showStudentDetailModal.parentNameEn}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{isAr ?'هاتف الأب':'Father Phone'}:</span>
                <span className="font-mono font-bold text-[#0284C7] dark:text-sky-400">{showStudentDetailModal.phone || showStudentDetailModal.parentPhone ||'N/A'}</span>
              </div>
              <div className="bg-[#F8FAFC] dark:bg-slate-900 p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block font-semibold">{isAr ?'هاتف الأم':"Mother's Phone"}:</span>
                <span className="font-mono font-bold text-[#0284C7] dark:text-sky-400">{showStudentDetailModal.motherPhone ||'غير مسجل'}</span>
              </div>

              {/* Financial breakdown */}
              {(() => {
                const isDetailSpecial = Boolean(showStudentDetailModal.isSpecialCase);
                const detailTotal = isDetailSpecial ? 0 : (showStudentDetailModal.tuitionTotal ?? 600);
                const detailTransport = isDetailSpecial ? 0 : (showStudentDetailModal.hasTransport ? (showStudentDetailModal.transportFee || 0) : 0);
                const detailDiscount = isDetailSpecial ? 0 : (showStudentDetailModal.tuitionDiscount || 0);
                const detailPaid = isDetailSpecial ? 0 : (showStudentDetailModal.tuitionPaid || 0);
                const detailRemaining = isDetailSpecial ? 0 : Math.max(0, detailTotal + detailTransport - detailDiscount - detailPaid);

                return (
                  <div className={`p-3 rounded-xl border col-span-2 space-y-1 ${isDetailSpecial ?'bg-amber-50/60 border-amber-300 dark:border-amber-700/50':'bg-[#F8FAFC] dark:bg-slate-900 border-[#E2E8F0] dark:border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[#0284C7] block font-black text-[10px] uppercase tracking-wider">{isAr ?'تفاصيل الرسوم والأقساط السنوية':'Tuition & Payment Summary'}</span>
                      {isDetailSpecial && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs">
                           {isAr ?'حالة خاصة (معفى بالكامل - حسابه 0)':'Special Case (Exempt - $0)'}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between font-mono pt-1">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ?'إجمالي القسط الأساسي:':'Total Tuition:'}</span>
                      <span className="font-extrabold">${detailTotal} USD</span>
                    </div>
                    {showStudentDetailModal.hasTransport && !isDetailSpecial && (
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ?'رسوم النقل (الباص):':'Bus Transport Fee:'}</span>
                        <span className="font-extrabold text-sky-600">+${detailTransport} USD</span>
                      </div>
                    )}
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ?'الخصومات الممنوحة:':'Tuition Discount:'}</span>
                      <span className="font-extrabold text-emerald-600">-${detailDiscount} USD</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">{isAr ?'إجمالي المقبوض:':'Total Paid:'}</span>
                      <span className="font-extrabold text-[#0284C7]">${detailPaid} USD</span>
                    </div>
                    <div className="flex justify-between font-mono border-t border-slate-200 dark:border-slate-800 pt-1">
                      <span className="text-red-500 font-sans font-bold">{isAr ?'المتبقي المستحق:':'Remaining Balance:'}</span>
                      <span className={`font-black text-sm ${isDetailSpecial ?'text-amber-800 font-black':'text-red-600'}`}>
                        {isDetailSpecial ? (isAr ?'معفى ($0)':'Exempt ($0)') :`$${detailRemaining} USD`}
                      </span>
                    </div>
                  </div>
                );
              })()}
              
              {/* Ministry Endorsement Clearance Number Box */}
              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 col-span-2 flex items-center justify-between">
                <div className="text-right">
                  <span className="text-amber-800 dark:text-amber-400 block font-black text-[10px] uppercase tracking-wider">{isAr ?'رقم إفادة تسجيل الوزارة (الرقم المرجعي)':'Ministry Clearance Reference Number'}</span>
                  <span className="font-mono font-black text-sm text-amber-900 dark:text-amber-300 block mt-0.5">{showStudentDetailModal.ministryClearance || (isAr ?'غير مسجل أو إفادة مؤقتة':'Not Registered / Pending')}</span>
                </div>
                {showStudentDetailModal.ministryClearance && (
                  <button 
                    onClick={() => handlePrintClearance(showStudentDetailModal)}
                    className="flex items-center gap-1 bg-[#EF4444] hover:bg-red-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow transition-all cursor-pointer border border-red-400"
                    title={isAr ?'طباعة الإفادة الرسمية للوزارة':'Print Ministry Clearance'}
                  >
                    <Printer className="w-3.5 h-3.5 text-white"/>
                    <span>{isAr ?'طباعة الإفادة':'Print Clearance'}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {currentRole ==='admin'&& (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateStudent(showStudentDetailModal.id, {frozen: !showStudentDetailModal.frozen});
                        setShowStudentDetailModal({...showStudentDetailModal, frozen: !showStudentDetailModal.frozen});
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                        showStudentDetailModal.frozen
                          ?'bg-red-600 hover:bg-red-700 text-white shadow-md'
                          :'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-300'
                      }`}
                    >
                      <span></span>
                      <span>{showStudentDetailModal.frozen ? (isAr ?'مجمد':'Frozen') : (isAr ?'تجميد':'Freeze')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s = showStudentDetailModal;
                        setShowStudentDetailModal(null);
                        handleOpenEditStudentModal(s);
                      }}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5"/>
                      <span>{isAr ?'تعديل':'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s = showStudentDetailModal;
                        if (!s) return;
                        if (window.confirm(isAr ?`هل أنت متأكد من حذف الطالب"${s.name}"نهائياً من النظام؟`:`Are you sure you want to delete student"${s.name}"?`)) {
                          const sid = s.id;
                          setShowStudentDetailModal(null);
                          deleteStudent(sid);
                          setSuccessMsg(isAr ?`تم حذف الطالب (${s.name}) بنجاح ✓`:`Student (${s.name}) deleted successfully ✓`);
                          setTimeout(() => setSuccessMsg(''), 3500);
                        }
                      }}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5"/>
                      <span>{isAr ?'حذف':'Delete'}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => handlePrintClearance(showStudentDetailModal)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                  title={isAr ?'طباعة إفادة الطالب':'Print Clearance'}
                >
                  <Printer className="w-3.5 h-3.5"/>
                  <span>{isAr ?'إفادة':'Clearance'}</span>
                </button>
              </div>
              <button onClick={() => setShowStudentDetailModal(null)} className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer">{t('close')}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Family Detail Modal - Portal to document.body */}
      {showFamilyDetailModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border-2 border-[#0284C7] rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] relative text-right rtl">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl font-black text-xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center shrink-0">
                  
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0284C7]">
                    {showFamilyDetailModal.familyName ||`عائلة ${showFamilyDetailModal.parentName}`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-bold text-slate-700">{isAr ?'ولي الأمر:':'Parent:'} {showFamilyDetailModal.parentName}</span>
                    <span>•</span>
                    <span className="bg-sky-50 text-[#0284C7] px-2 py-0.5 rounded-full font-bold border border-sky-200">
                      {showFamilyDetailModal.members.length} {isAr ?'أبناء مسجلين':'Children'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowFamilyDetailModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Parent Contact Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">{isAr ?'هاتف الأب / ولي الأمر:':'Father Phone:'}</span>
                  <span className="font-mono font-black text-sm text-[#0284C7] dir-ltr block pt-0.5">
                    {showFamilyDetailModal.parentPhone || (isAr ?'غير مسجل':'N/A')}
                  </span>
                </div>
                {showFamilyDetailModal.parentPhone && (
                  <a
                    href={`https://wa.me/${showFamilyDetailModal.parentPhone.replace(/[^0-9]/g,'')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                    title="واتساب"
                  >
                    
                  </a>
                )}
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold">{isAr ?'هاتف الأم:':'Mother Phone:'}</span>
                <span className="font-mono font-black text-sm text-slate-700 dir-ltr block pt-0.5">
                  {showFamilyDetailModal.motherPhone || (isAr ?'غير مسجل':'N/A')}
                </span>
              </div>
            </div>

            {/* Combined Financial Box */}
            {(() => {
              const isFamilySpecialCase = showFamilyDetailModal.members.every(s => s.isSpecialCase);
              const combinedTotalUSD = isFamilySpecialCase
                ? 0
                : showFamilyDetailModal.members.reduce((sum, s) => {
                    const trans = s.hasTransport ? (Number(s.transportFee) || 0) : 0;
                    const tTotal = s.isSpecialCase ? 0 : (s.tuitionTotal ?? 700);
                    return sum + Number(tTotal) + trans;
                  }, 0);
              const combinedDiscountUSD = showFamilyDetailModal.members.reduce((sum, s) => sum + (Number(s.tuitionDiscount) || 0), 0);
              const combinedPaidUSD = showFamilyDetailModal.members.reduce((sum, s) => sum + (Number(s.tuitionPaid) || 0), 0);
              const combinedRemUSD = Math.max(0, combinedTotalUSD - combinedDiscountUSD - combinedPaidUSD);

              return (
                <div className="bg-sky-50/50 border-2 border-sky-200 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0284C7] flex items-center gap-1.5">
                      <span></span>
                      <span>{isAr ?'الملخص المالي الموحد لكافة أبناء العائلة:':'Unified Family Financial Summary:'}</span>
                    </span>
                    {isFamilySpecialCase ? (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                         {isAr ?'إعفاء كامل (حالة خاصة)':'Exempted (Special Case)'}
                      </span>
                    ) : combinedRemUSD === 0 ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                        ✓ {isAr ?'مسدد بالكامل':'Paid in Full'}
                      </span>
                    ) : (
                      <span className="text-xs font-black text-red-600 font-mono">
                        {isAr ?'المتبقي:':'Due:'} ${combinedRemUSD}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[9px] font-sans">{isAr ?'إجمالي الأقساط:':'Total:'}</span>
                      <span className="font-extrabold text-slate-800">${combinedTotalUSD}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[9px] font-sans">{isAr ?'الخصم الممنوح:':'Discount:'}</span>
                      <span className="font-extrabold text-emerald-600">-${combinedDiscountUSD}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[9px] font-sans">{isAr ?'إجمالي المدفوع:':'Paid:'}</span>
                      <span className="font-extrabold text-[#0284C7]">${combinedPaidUSD}</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-red-500 block text-[9px] font-sans font-bold">{isAr ?'المتبقي:':'Remaining:'}</span>
                      <span className="font-black text-red-600">${combinedRemUSD}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Children List in this Family - Separated by Grade */}
            <div className="space-y-2.5">
              <span className="text-xs font-black text-slate-700 block">
                 {isAr ?'الأبناء المسجلون في المدرسة (مفصولين حسب الصفوف والشعب):':'Children Enrolled (Separated by Grade & Section):'}
              </span>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {showFamilyDetailModal.members.map((stu) => {
                  const stuTuition = stu.isSpecialCase ? 0 : (stu.tuitionTotal ?? 700);
                  const stuPaid = Number(stu.tuitionPaid) || 0;
                  const stuDiscount = Number(stu.tuitionDiscount) || 0;
                  const rem = Math.max(0, Number(stuTuition) - stuDiscount - stuPaid);

                  return (
                    <div key={stu.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={stu.avatar || defaultAvatars[0]}
                          alt={stu.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#0284C7] shrink-0 shadow-xs"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                              {isAr ? stu.name : stu.nameEn}
                            </h4>
                            <span className="text-[10px] bg-sky-100 text-[#0284C7] font-black px-2 py-0.5 rounded-md border border-sky-200 shrink-0">
                              {stu.grade} ({stu.classRoom ?`${isAr ?'شعبة':'Sec'} ${stu.classRoom}`:`${isAr ?'شعبة أ':'Sec A'}`})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>: <b className="text-[#0284C7]">{stu.username}</b></span>
                            <span>: <b className="text-slate-700 tracking-wider">{'*'.repeat(Math.max(6, String(stu.password ||'******').length))}</b></span>
                            <span>•</span>
                            <span className="font-bold">
                              {stu.isSpecialCase ? (isAr ?'معفى':'Exempt') : rem === 0 ? (isAr ?'✓ مسدد':'✓ Paid') :`${isAr ?'المتبقي:':'Due:'} $${rem}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setShowStudentDetailModal(stu);
                          }}
                          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="عرض تفاصيل الطالب الشاملة"
                        >
                          <Eye className="w-3.5 h-3.5"/>
                          <span>{isAr ?'التفاصيل':'Details'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintClearance(stu)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl cursor-pointer"
                          title="طباعة إفادة الطالب"
                        >
                          <Printer className="w-3.5 h-3.5"/>
                        </button>
                        {currentRole ==='admin'&& (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEditStudentModal(stu);
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded-xl cursor-pointer"
                              title="تعديل الحساب"
                            >
                              <Edit3 className="w-3.5 h-3.5"/>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudentInFamily(stu)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl cursor-pointer hover:scale-105 transition-transform"
                              title={isAr ?"حذف هذا الطالب":"Delete Student"}
                            >
                              <Trash2 className="w-3.5 h-3.5"/>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {currentRole ==='admin'? (
                <button
                  type="button"
                  onClick={() => handleDeleteEntireFamily(showFamilyDetailModal)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                  title={isAr ?'حذف العائلة وجميع أبنائها من المدرسة':'Delete Entire Family'}
                >
                  <Trash2 className="w-3.5 h-3.5"/>
                  <span>{isAr ?'حذف العائلة بالكامل':'Delete Family'}</span>
                </button>
              ) : <div />}
              <button 
                onClick={() => setShowFamilyDetailModal(null)} 
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Official Ministry Endorsement/Clearance Certificate for Printing */}
      {studentToPrint && (
        <div id="print-certificate-area"className="hidden print:block bg-white text-black p-10 max-w-[800px] mx-auto border-8 border-double border-amber-600 rounded-3xl space-y-8 font-sans relative text-right rtl">
          
          {/* Printable Styles Override */}
          <style dangerouslySetInnerHTML={{__html:`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-certificate-area, #print-certificate-area * {
                visibility: visible;
              }
              #print-certificate-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border: 8px double #d97706 !important;
                border-radius: 24px !important;
                background-color: white !important;
                color: black !important;
                padding: 40px !important;
                box-sizing: border-box !important;
              }
            }
          `}} />

          {/* Certificate Header Banner */}
          <div className="flex items-center justify-between border-b-4 border-amber-600 pb-4">
            <div className="text-right space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">الجمهورية اللبنانية</h4>
              <h4 className="font-extrabold text-xs text-slate-600">وزارة التربية والتعليم العالي</h4>
              <h5 className="font-bold text-[10px] text-slate-500">منطقة الإدارة التعليمية</h5>
            </div>
            
            {/* School Logo / Seal Placeholder */}
            <div className="text-center space-y-1 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-4 border-amber-600 flex items-center justify-center font-black text-xl text-amber-700 bg-amber-50">
                
              </div>
              <span className="font-black text-xs text-amber-800">مدرسة الدعم التعليمي</span>
            </div>

            <div className="text-left space-y-1">
              <h4 className="font-extrabold text-sm text-slate-800">مدرسة الدعم التعليمي الخاصة</h4>
              <h4 className="font-extrabold text-xs text-slate-600">قسم التسجيل والملفات</h4>
              <h5 className="font-bold text-[10px] text-slate-500">التاريخ: {new Date().toLocaleDateString('ar-YE')}</h5>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center space-y-2 py-4">
            <h1 className="text-2xl font-black text-amber-800 underline decoration-double decoration-amber-600 underline-offset-8">إفادة تسجيل وتصديق رسمي</h1>
            <p className="text-xs text-slate-500 font-bold">صادرة بموجب اللوائح الرسمية المصادق عليها من وزارة التربية والتعليم العالي</p>
          </div>

          {/* Verification Paragraph */}
          <div className="text-sm text-slate-800 leading-loose text-justify font-medium">
            بناءً على طلب ولي الأمر المذكور أدناه، تشهد إدارة **مدرسة الدعم التعليمي الخاصة** المرخصة رسمياً، بأن التلميذ المذكورة بياناته في الجدول أدناه قد تم تسجيله رسمياً في السجلات الأكاديمية للمدرسة للعام الدراسي الحالي، وتم منحه رقم الإفادة الرسمي المعتمد والموثق لدى وزارة التربية والتعليم العالي لتصنيف وتصديق الملفات الطلابية.
          </div>

          {/* Official Information Box */}
          <div className="border-2 border-amber-600 rounded-2xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-2 border-b border-amber-600 bg-amber-50">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">اسم التلميذ الكامل:</span>
                <span className="font-black text-sm text-amber-950">{studentToPrint.name}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">اسم التلميذ بالإنجليزية:</span>
                <span className="font-black text-xs text-slate-800 font-mono">{studentToPrint.nameEn ||'N/A'}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 border-b border-amber-600">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">المرحلة الدراسية / الصف:</span>
                <span className="font-black text-xs text-slate-800">{studentToPrint.grade}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">الشعبة المخصصة:</span>
                <span className="font-black text-xs text-slate-800">الشعبة ({studentToPrint.classRoom ||'أ'})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-amber-600">
              <div className="p-3 border-l border-amber-600">
                <span className="text-[10px] text-slate-500 block font-bold">اسم ولي الأمر:</span>
                <span className="font-black text-xs text-slate-800">{studentToPrint.parentName ||'غير مسجل'}</span>
              </div>
              <div className="p-3">
                <span className="text-[10px] text-slate-500 block font-bold">رقم التواصل المعتمد:</span>
                <span className="font-black text-xs text-slate-800 font-mono">{studentToPrint.phone ||'N/A'}</span>
              </div>
            </div>

            {/* Ministry Clearance Number (Golden Highlight row) */}
            <div className="p-4 bg-amber-100/50 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-amber-800 font-black text-xs tracking-wider"> رقم إفادة تصنيف ملف الوزارة الرسمي</span>
              <span className="font-mono font-black text-xl text-amber-950 bg-white border border-amber-500 px-6 py-1.5 rounded-xl shadow-inner select-all">
                {studentToPrint.ministryClearance ||'PENDING-VERIFICATION'}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">يرجى استخدام هذا الرقم كمرجع رسمي للملف في كافة المراسلات والتقارير الأكاديمية</span>
            </div>
          </div>

          {/* Stamp and Signature Area */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            
            {/* School stamp */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 space-y-16">
              <span className="font-extrabold text-slate-800 block">توقيع وختم مدير المدرسة</span>
              <div className="text-[10px] text-slate-400 font-bold">
                تاريخ الإصدار: {new Date().toLocaleDateString('ar-YE')}
              </div>
            </div>

            {/* Ministry validation stamp */}
            <div className="border border-dashed border-slate-300 rounded-2xl p-4 space-y-16">
              <span className="font-extrabold text-slate-800 block">خاص بتصديق وزارة التربية والتعليم العالي</span>
              <div className="text-[9px] text-slate-400 font-bold">
                (خاص بالدائرة التعليمية الرسمية لتوقيع وختم المندوب المعتمد)
              </div>
            </div>

          </div>

          {/* Footer warning */}
          <div className="text-center text-[9px] text-slate-400 border-t border-slate-100 pt-4">
            تعتبر هذه الإفادة لاغية أو غير صالحة إذا تم كشطها أو تغيير بياناتها الأساسية دون توقيع رسمي وختم حي من الإدارة المدرسية والوزارة المعنية.
          </div>

        </div>
      )}

      {/* Edit Student Modal - Portal to document.body */}
      {showEditStudentModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex justify-center items-start overflow-y-auto p-4 sm:p-6">
          <form
            onSubmit={handleEditStudentSubmit}
            className="bg-white dark:bg-[#1E293B] border-2 border-amber-500 rounded-3xl p-6 max-w-4xl w-full space-y-4 shadow-2xl animate-scale-up text-[#0F172A] dark:text-slate-100 relative my-auto text-right max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500"/>
                <span>{isAr ?`تعديل ملف الطالب: ${showEditStudentModal.name}`:`Edit Student: ${showEditStudentModal.name}`}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setShowEditStudentModal(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'اسم الطالب الكامل':'Student Name'} <span className="text-red-500">*</span></label>
                <input type="text"required value={editStuName} onChange={(e) => setEditStuName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'اسم الطالب (English)':'English Name'}</label>
                <input type="text"value={editStuNameEn} onChange={(e) => setEditStuNameEn(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>
            </div>

            {/* Parent Name & Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'اسم ولي الأمر':'Parent Name'}</label>
                <input type="text"value={editStuParentName} onChange={(e) => setEditStuParentName(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'هاتف الأب / ولي الأمر':'Father Phone'}</label>
                <input type="text"value={editStuParentPhone} onChange={(e) => setEditStuParentPhone(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'هاتف الأم':"Mother's Phone"}</label>
                <input type="text"value={editStuMotherPhone} onChange={(e) => setEditStuMotherPhone(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right"/>
              </div>
            </div>

            {/* Ministry Clearance Number (Optional) */}
            <div className="space-y-1 text-right">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500"/>
                <span>{isAr ?'رقم الإفادة المعتمد من الوزارة (اختياري - فريد)':'Ministry Clearance Reference No. (Unique - Optional)'}</span>
              </label>
              <input 
                type="text"
                value={editStuMinistryClearance} 
                onChange={(e) => setEditStuMinistryClearance(e.target.value)} 
                placeholder={isAr ?"أدخل رقم الإفادة الوزارية الرسمي...":"Enter unique Ministry clearance reference code..."} 
                className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500 text-right"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('username')} <span className="text-red-500">*</span></label>
                <input type="text"required value={editStuUsername} onChange={(e) => setEditStuUsername(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('password')} <span className="text-red-500">*</span></label>
                <input type="text"required value={editStuPassword} onChange={(e) => setEditStuPassword(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-red-600 dark:text-red-400 font-extrabold rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500 text-right"/>
              </div>
            </div>

            {/* Grades and Classroom */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{t('grade')}</label>
                <select
                  value={editStuGrade}
                  onChange={(e) => {
                    setEditStuGrade(e.target.value);
                    const foundGrd = safeGrades.find((g) => g.name === e.target.value);
                    if (foundGrd) {
                      setEditStuGradeEn(foundGrd.nameEn || e.target.value);
                    }
                  }}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeGrades.map((g) => (
                    <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'الشعبة':'Classroom'}</label>
                <select
                  value={editStuClassRoom}
                  onChange={(e) => setEditStuClassRoom(e.target.value)}
                  className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                >
                  {safeClassrooms.map((c) => (
                    <option key={c.id} value={c.sectionName}>{isAr ? c.sectionName : c.sectionNameEn}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Special Case Classification */}
            <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-800/50 p-3 rounded-2xl flex items-center justify-between">
              <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editStuIsSpecialCase}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setEditStuIsSpecialCase(checked);
                    if (checked) {
                      setEditStuTuitionTotal('0');
                      setEditStuTuitionDiscount('0');
                      setEditStuAdminFees('0');
                      setEditStuHasTransport(false);
                      setEditStuTransportFee('0');
                      setEditSiblingsList(prev => prev.map(sib => ({
                        ...sib,
                        tuitionTotal:'0',
                        tuitionDiscount:'0',
                        adminFees:'0',
                        hasTransport: false,
                        transportFee:'0'
                      })));
                    }
                  }}
                  className="w-4.5 h-4.5 accent-amber-600 rounded cursor-pointer"
                />
                <span> {isAr ?'تصنيف الطالب ضمن «الحالات الخاصة» (ينطبق على كافة الإخوة تلقائياً)':'Classify as Special Case (applies to all siblings)'}</span>
              </label>
              {editStuIsSpecialCase && (
                <span className="text-[10px] font-black bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 px-2 py-0.5 rounded-lg border border-amber-300">
                  {isAr ?'إعفاء كامل 0$':'Full Exemption $0'}
                </span>
              )}
            </div>

            {/* Tuition Fees & Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'إجمالي القسط السنوي ($)':'Total Tuition ($)'}</label>
                <input type="number"value={editStuTuitionTotal} onChange={(e) => setEditStuTuitionTotal(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'الخصومات الممنوحة ($)':'Discounts ($)'}</label>
                <input type="number"value={editStuTuitionDiscount} onChange={(e) => setEditStuTuitionDiscount(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-emerald-600 dark:text-emerald-400 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'المصاريف الإدارية ($)':'Admin Fees ($)'}</label>
                <input type="number"value={editStuAdminFees} onChange={(e) => setEditStuAdminFees(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-amber-600 dark:text-amber-400 font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'المبلغ المدفوع ($)':'Paid Amount ($)'}</label>
                <input type="number"value={editStuTuitionPaid} onChange={(e) => setEditStuTuitionPaid(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"/>
              </div>
            </div>

            {/* Edit Transportation Details (Bus) */}
            <div className="bg-sky-50/20 dark:bg-slate-900/50 p-4.5 rounded-2xl border border-sky-100/50 dark:border-slate-800 space-y-3.5 text-right">
              <div className="flex items-center justify-end">
                <label className="text-xs font-bold text-[#0284C7] dark:text-sky-400 flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editStuHasTransport}
                    onChange={(e) => setEditStuHasTransport(e.target.checked)}
                    className="w-4 h-4 accent-[#0284C7] rounded"
                  />
                  <span>{isAr ?'هل يريد الطالب التسجيل في باص/نقل المدرسة؟':'Register for School Bus/Transport?'}</span>
                </label>
              </div>

              {editStuHasTransport && (
                <div className="space-y-1 max-w-xs ml-auto text-right">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">{isAr ?'قيمة رسوم النقل ($ USD)':'Transportation Fee ($ USD)'} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={editStuTransportFee}
                    onChange={(e) => setEditStuTransportFee(e.target.value)}
                    placeholder="50..."
                    className="w-full bg-[#F8FAFC] dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0284C7] text-right"
                  />
                </div>
              )}
            </div>

            {/* SIBLINGS MANAGEMENT & ADDITION IN EDIT MODAL */}
            <div className="pt-4 border-t-2 border-dashed border-amber-300 dark:border-amber-900/60 space-y-3.5 text-right">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-3 rounded-2xl border border-amber-200/80 dark:border-amber-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-2xl"></span>
                  <div>
                    <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <span>{isAr ?'إضافة وتوثيق إخوة لهذا الطالب (كرت العائلة)':'Family & Sibling Management'}</span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.2 rounded-md font-bold">
                        {isAr ?'ميزة جديدة':'New'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-400 font-bold">
                      {isAr 
                        ?'يمكنك إضافة إخوة جدد أو ربط طالب مسجل بالمدرسة لضمهم معاً في كرت عائلة موحد'
                        :'Add new siblings or link existing students into this family card'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddSiblingInEdit}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span> {isAr ?'إضافة أخ / أخت جديد':'Add New Sibling'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLinkExistingSelect(!showLinkExistingSelect)}
                    className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 dark:bg-sky-900/40 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 rounded-xl text-xs font-black border border-sky-300 dark:border-sky-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span> {isAr ?'ربط طالب مسجل كأخ':'Link Enrolled Student'}</span>
                  </button>
                </div>
              </div>

              {/* Already registered siblings badge list */}
              {currentExistingSiblings.length > 0 && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-right">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
                    {isAr ?'الإخوة المسجلون مسبقاً في هذه العائلة:':'Already Registered Siblings in Family:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentExistingSiblings.map(sib => (
                      <span key={sib.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200">
                        <span></span>
                        <span>{sib.name}</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">({sib.grade} - شعبة {sib.classRoom ||'أ'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector for linking an enrolled student */}
              {showLinkExistingSelect && (
                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-sky-900 dark:text-sky-300 block">
                    {isAr ?'اختر طالباً مسجلاً في المدرسة لربطه كأخ/أخت في كرت هذه العائلة:':'Select an enrolled student to link as sibling:'}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedStudentToLink}
                      onChange={(e) => setSelectedStudentToLink(e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="">{isAr ?'-- اختر التلميذ من القائمة --':'-- Select student --'}</option>
                      {linkableCandidates.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.grade} - شعبة {c.classRoom ||'أ'}) - هاتف: {c.parentPhone || c.phone ||'N/A'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedStudentToLink}
                      onClick={() => handleLinkExistingStudent(selectedStudentToLink)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      {isAr ?'تأكيد الربط ✓':'Confirm Link'}
                    </button>
                  </div>
                </div>
              )}

              {/* Linked existing students list */}
              {editLinkedExistingIds.length > 0 && (
                <div className="space-y-2 p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-2xl">
                  <h5 className="text-xs font-black text-sky-900 dark:text-sky-300">
                    {isAr ?'الطلاب المحدد ربطهم كإخوة لهذه العائلة:':'Students to be linked as siblings:'}
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {editLinkedExistingIds.map(linkedId => {
                      const stu = (students || []).find(s => s.id === linkedId);
                      if (!stu) return null;
                      return (
                        <div key={linkedId} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleUnlinkExistingStudent(linkedId)}
                            className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            {isAr ?'إلغاء الربط ✕':'Unlink'}
                          </button>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{stu.name}</span>
                            <span className="text-[10px] text-slate-500">{stu.grade} - شعبة ({stu.classRoom ||'أ'})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Newly added siblings in edit modal */}
              {editSiblingsList.length > 0 && (
                <div className="space-y-3 p-3 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
                  <h5 className="text-xs font-black text-amber-900 dark:text-amber-300">
                    {isAr ?`الإخوة الجدد المضافون (${editSiblingsList.length}):`:`New Siblings Added (${editSiblingsList.length}):`}
                  </h5>

                  {editSiblingsList.map((sib, index) => (
                    <div key={sib.id} className="relative p-3.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-3 shadow-xs">
                      {/* Header with remove button */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveSiblingInEdit(sib.id)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3"/>
                          <span>{isAr ?'حذف هذا الأخ':'Remove Sibling'}</span>
                        </button>
                        <span className="text-[11px] font-black text-amber-800 dark:text-amber-400">
                          {isAr ?`الأخ المضاف #${index + 1}`:`Sibling #${index + 1}`}
                        </span>
                      </div>

                      {/* Name inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {isAr ?'اسم الأخ/الأخت الكامل':'Sibling Full Name'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={sib.name}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'name', e.target.value)}
                            placeholder={isAr ?'مثال: يوسف محمد مسرة...':'Sibling Name...'}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {isAr ?'اسم الأخ/الأخت (English)':'Sibling English Name'}
                          </label>
                          <input
                            type="text"
                            value={sib.nameEn}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'nameEn', e.target.value)}
                            placeholder="Youssef Masri..."
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-right"
                          />
                        </div>
                      </div>

                      {/* Grade & Classroom */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('grade')}</label>
                          <select
                            value={sib.grade}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'grade', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeGrades.map((g) => (
                              <option key={g.id} value={g.name}>{isAr ? g.name : g.nameEn}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'الشعبة':'Classroom'}</label>
                          <select
                            value={sib.classRoom}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'classRoom', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-bold"
                          >
                            {safeClassrooms.map((c) => (
                              <option key={c.id} value={c.sectionName}>{isAr ? c.sectionName : c.sectionNameEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Financial info */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'القسط السنوي ($)':'Tuition ($)'}</label>
                          <input
                            type="number"
                            disabled={editStuIsSpecialCase}
                            value={sib.tuitionTotal}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'tuitionTotal', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'الخصومات ($)':'Discount ($)'}</label>
                          <input
                            type="number"
                            disabled={editStuIsSpecialCase}
                            value={sib.tuitionDiscount}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'tuitionDiscount', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-emerald-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'المصاريف الإدارية ($)':'Admin Fees ($)'}</label>
                          <input
                            type="number"
                            disabled={editStuIsSpecialCase}
                            value={sib.adminFees}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'adminFees', e.target.value)}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-amber-600 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{isAr ?'رقم الإفادة الوزارية':'Clearance No.'}</label>
                          <input
                            type="text"
                            value={sib.ministryClearance}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'ministryClearance', e.target.value)}
                            placeholder={isAr ?'إفادة فريدة...':'Clearance ref...'}
                            className="w-full bg-[#F8FAFC] dark:bg-slate-950 border border-[#E2E8F0] dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right"
                          />
                        </div>
                      </div>

                      {/* Bus transport for sibling */}
                      {!editStuIsSpecialCase && (
                        <div className="flex items-center justify-between p-2.5 bg-sky-50/40 dark:bg-sky-950/20 rounded-xl border border-sky-100 dark:border-sky-900/40">
                          <label className="text-[11px] font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sib.hasTransport}
                              onChange={(e) => handleUpdateSiblingInEdit(index,'hasTransport', e.target.checked)}
                              className="w-4 h-4 accent-sky-600 rounded"
                            />
                            <span>{isAr ?'تسجيل الأخ في باص / نقل المدرسة':'Register for school bus'}</span>
                          </label>
                          {sib.hasTransport && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-500 font-bold">{isAr ?'الرسوم ($):':'Fee ($):'}</span>
                              <input
                                type="number"
                                value={sib.transportFee}
                                onChange={(e) => handleUpdateSiblingInEdit(index,'transportFee', e.target.value)}
                                className="w-20 bg-white dark:bg-slate-900 border border-sky-300 text-sky-700 font-mono rounded-lg px-2 py-1 text-xs text-right"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Username & Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('username')} <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            required
                            value={sib.username}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'username', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[#0F172A] dark:text-white font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleUpdateSiblingInEdit(index,'password', Math.floor(100000 + Math.random() * 900000).toString())}
                              className="text-[10px] text-amber-600 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-2.5 h-2.5"/>
                              <span>{isAr ?'توليد كلمة سر':'Generate'}</span>
                            </button>
                            <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{t('password')} <span className="text-red-500">*</span></label>
                          </div>
                          <input
                            type="password"
                            required
                            value={sib.password}
                            onChange={(e) => handleUpdateSiblingInEdit(index,'password', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono rounded-xl px-2.5 py-1.5 text-xs focus:outline-none text-right font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Family financial overview if siblings added */}
              {(editSiblingsList.length > 0 || editLinkedExistingIds.length > 0) && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-center justify-between text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-xl"></span>
                    <div>
                      <h4 className="text-xs font-black text-amber-950 dark:text-amber-200">
                        {isAr ?'إجمالي طلاب العائلة بعد الحفظ:':'Total Family Students after Save:'}
                      </h4>
                      <p className="text-[10px] text-amber-800/80 dark:text-amber-400 font-bold">
                        {1 + currentExistingSiblings.length + editLinkedExistingIds.length + editSiblingsList.length} {isAr ?'طلاب مسجلين':'students'}
                      </p>
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                      {editStuIsSpecialCase 
                        ? (isAr ?'معفى بالكامل ($0)':'Exempt ($0)')
                        :`$${Number(editStuTuitionTotal || 0) + editSiblingsList.reduce((acc, s) => acc + Number(s.tuitionTotal || 0), 0)} USD`}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button type="button"onClick={() => setShowEditStudentModal(null)} className="px-4 py-2 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">{t('cancel')}</button>
              <button type="submit"className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer transition-colors">{t('save')}</button>
            </div>
          </form>
        </div>,
        document.body
      )}

      {/* Printable Students Roster Spreadsheet */}
      {isPrintingStudentsTable && (
        <div id="print-students-table-area"className="hidden print:block bg-white text-black p-8 font-sans text-right rtl">
          <style dangerouslySetInnerHTML={{__html:`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-students-table-area, #print-students-table-area * {
                visibility: visible;
              }
              #print-students-table-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                color: black !important;
              }
            }
          `}} />
          
          <div className="text-center space-y-2 border-b-2 border-amber-600 pb-4 mb-6">
            <h1 className="text-xl font-black text-amber-800">مدرسة الدعم التعليمي الخاصة</h1>
            <h2 className="text-base font-extrabold text-slate-700">كشف بيانات الطلاب والأقساط الدراسية</h2>
            <p className="text-[10px] text-slate-500 font-bold">تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300 text-right">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-extrabold">الرقم التعريفي (ID)</th>
                <th className="p-2 border border-slate-300 font-extrabold">اسم التلميذ</th>
                <th className="p-2 border border-slate-300 font-extrabold">الصف والشعبة</th>
                <th className="p-2 border border-slate-300 font-extrabold">هاتف ولي الأمر</th>
                <th className="p-2 border border-slate-300 font-extrabold">إجمالي القسط السنوي</th>
                <th className="p-2 border border-slate-300 font-extrabold">المبلغ المدفوع</th>
                <th className="p-2 border border-slate-300 font-extrabold">المبلغ المتبقي</th>
                <th className="p-2 border border-slate-300 font-extrabold">رقم الإفادة الوزارية</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const remaining = s.isSpecialCase ? 0 : Math.max(0, (s.tuitionTotal || 0) - (s.tuitionPaid || 0));
                return (
                  <tr key={s.id} className="border border-slate-300">
                    <td className="p-2 border border-slate-300 font-mono font-bold">{s.id}</td>
                    <td className="p-2 border border-slate-300 font-extrabold">{s.name}</td>
                    <td className="p-2 border border-slate-300 font-bold">{s.grade} ({s.classRoom ||'أ'})</td>
                    <td className="p-2 border border-slate-300 font-mono">{s.phone || s.parentPhone ||'غير مسجل'}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold">{s.isSpecialCase ?'0$ (معفى)':`$${s.tuitionTotal || 0}`}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-emerald-700">{s.isSpecialCase ?'$0':`$${s.tuitionPaid || 0}`}</td>
                    <td className="p-2 border border-slate-300 font-mono font-bold text-red-600">{s.isSpecialCase ?'0$ (معفى)':`$${remaining}`}</td>
                    <td className="p-2 border border-slate-300 font-mono">{s.ministryClearance ||'لا يوجد'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-12 text-xs">
            <div>
              <span className="font-bold block">إجمالي عدد الطلاب المدرجين: {filteredStudents.length} طلاب</span>
            </div>
            <div className="text-center">
              <span className="font-bold block">توقيع وختم الإدارة المالية</span>
              <div className="w-32 h-16 border border-dashed border-slate-200 mt-2 mx-auto rounded-lg"/>
            </div>
          </div>
        </div>
      )}

      {/* Printable Teachers Roster Spreadsheet */}
      {isPrintingTeachersTable && (
        <div id="print-teachers-table-area"className="hidden print:block bg-white text-black p-8 font-sans text-right rtl">
          <style dangerouslySetInnerHTML={{__html:`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-teachers-table-area, #print-teachers-table-area * {
                visibility: visible;
              }
              #print-teachers-table-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background-color: white !important;
                color: black !important;
              }
            }
          `}} />
          
          <div className="text-center space-y-2 border-b-2 border-amber-600 pb-4 mb-6">
            <h1 className="text-xl font-black text-amber-800">مدرسة الدعم التعليمي الخاصة</h1>
            <h2 className="text-base font-extrabold text-slate-700">كشف رواتب ومخصصات أعضاء هيئة التدريس</h2>
            <p className="text-[10px] text-slate-500 font-bold">تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>

          <table className="w-full text-xs border-collapse border border-slate-300 text-right">
            <thead>
              <tr className="bg-slate-100 border border-slate-300">
                <th className="p-2 border border-slate-300 font-extrabold">الرقم الوظيفي (ID)</th>
                <th className="p-2 border border-slate-300 font-extrabold">اسم المعلم الكامل</th>
                <th className="p-2 border border-slate-300 font-extrabold">المادة الأساسية</th>
                <th className="p-2 border border-slate-300 font-extrabold">الصف والشعب المخصصة</th>
                <th className="p-2 border border-slate-300 font-extrabold">الراتب الشهري الأساسي</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border border-slate-300">
                  <td className="p-2 border border-slate-300 font-mono font-bold">{t.id}</td>
                  <td className="p-2 border border-slate-300 font-extrabold">{t.name}</td>
                  <td className="p-2 border border-slate-300 font-bold">{t.subject ||'غير محدد'}</td>
                  <td className="p-2 border border-slate-300">{(t.assignedClassrooms || []).join('،') ||'عام'}</td>
                  <td className="p-2 border border-slate-300 font-mono font-bold text-amber-700">${t.monthlySalary || 0} USD</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-12 text-xs">
            <div>
              <span className="font-bold block">إجمالي عدد المعلمين المدرجين: {teachers.length} معلمين</span>
            </div>
            <div className="text-center">
              <span className="font-bold block">توقيع وختم الشؤون المالية والموارد البشرية</span>
              <div className="w-32 h-16 border border-dashed border-slate-200 mt-2 mx-auto rounded-lg"/>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Paid Tuition Modal */}
      {quickEditPaidStudent && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-right space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <button
                type="button"
                onClick={() => setQuickEditPaidStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shadow-xs">
                  
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    {isAr ?'تعديل القسط المدفوع':'Edit Paid Tuition'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    {quickEditPaidStudent.name} ({quickEditPaidStudent.grade})
                  </p>
                </div>
              </div>
            </div>

            {/* Quick summary info */}
            {(() => {
              const trans = quickEditPaidStudent.hasTransport ? (Number(quickEditPaidStudent.transportFee) || 0) : 0;
              const stuTuitionVal = quickEditPaidStudent.isSpecialCase ? 0 : (quickEditPaidStudent.tuitionTotal ?? 700);
              const netTotal = Math.max(0, Number(stuTuitionVal) + trans - (Number(quickEditPaidStudent.tuitionDiscount) || 0));

              return (
                <>
                  <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-sans block text-[9px]">القسط السنوي:</span>
                      <span className="font-extrabold text-[#0F172A] dark:text-white">${stuTuitionVal}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-sans block text-[9px]">الخصومات:</span>
                      <span className="font-extrabold text-emerald-600">-${quickEditPaidStudent.tuitionDiscount || 0}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 font-sans block text-[9px]">المدفوع حالياً:</span>
                      <span className="font-extrabold text-blue-600">${quickEditPaidStudent.tuitionPaid || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                        {isAr ?'المبلغ المدفوع الجديد ($ USD):':'New Paid Amount ($ USD):'}
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">الصافي المطلوب: ${netTotal}</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={quickPaidAmount}
                      onChange={(e) => setQuickPaidAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-50 dark:bg-slate-850 border-2 border-blue-300 dark:border-blue-700 text-[#0F172A] dark:text-white rounded-xl px-4 py-2.5 text-base font-mono font-black focus:outline-none focus:border-blue-600 text-center"
                      autoFocus
                    />
                  </div>

                  {/* Quick Shortcut Buttons */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setQuickPaidAmount(netTotal.toString())}
                      className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold cursor-pointer transition-colors text-center"
                    >
                      تسديد كامل (${netTotal})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickPaidAmount((Math.round(netTotal / 2)).toString())}
                      className="flex-1 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded-xl font-bold cursor-pointer transition-colors text-center"
                    >
                      نصف القسط (${Math.round(netTotal / 2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickPaidAmount('0')}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-center"
                    >
                      تصفير (0$)
                    </button>
                  </div>
                </>
              );
            })()}

            {/* Security Check: If current user is not admin, require admin password */}
            {currentRole !=='admin'&& (
              <div className="bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 p-3 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                  <span className="text-xs font-black">
                     تعديل الحسابات مسموح حصراً للمدير العام
                  </span>
                </div>
                <p className="text-[10px] text-red-600 dark:text-red-300 font-semibold">
                  أنت مسجل بحساب غير حساب المدير. يرجى إدخال كلمة سر المدير العام لتأكيد التعديل:
                </p>
                <div className="space-y-1">
                  <input
                    type="password"
                    required
                    value={quickEditAdminPass}
                    onChange={(e) => {
                      setQuickEditAdminPass(e.target.value);
                      setQuickEditAdminError('');
                    }}
                    placeholder="كلمة سر المدير العام..."
                    className="w-full bg-white dark:bg-slate-900 border border-red-300 dark:border-red-800 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                  {quickEditAdminError && (
                    <span className="text-[10px] text-red-700 dark:text-red-400 font-bold block">
                       {quickEditAdminError}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setQuickEditPaidStudent(null);
                  setQuickEditAdminPass('');
                  setQuickEditAdminError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentRole !=='admin') {
                    if (!verifyAdminPassword || !verifyAdminPassword(quickEditAdminPass)) {
                      setQuickEditAdminError(isAr ?'كلمة سر المدير غير صحيحة! التعديل محمي.':'Incorrect admin password!');
                      return;
                    }
                  }
                  const val = Math.max(0, Number(quickPaidAmount) || 0);
                  updateStudent(quickEditPaidStudent.id, {tuitionPaid: val});
                  setQuickEditPaidStudent(null);
                  setQuickEditAdminPass('');
                  setQuickEditAdminError('');
                  setSuccessMsg(isAr ?`تم تحديث القسط المدفوع للطالب «${quickEditPaidStudent.name}» إلى $${val} بنجاح!`:'Tuition paid updated successfully!');
                  setTimeout(() => setSuccessMsg(''), 4000);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
              >
                {isAr ?'حفظ التعديل':'Save Payment'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
