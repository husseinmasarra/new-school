import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialSchoolInfo,
  initialClasses,
  initialSubjects,
  initialTeachers,
  initialStudents,
  initialPayments,
  initialAgenda,
  initialAnnouncements,
  initialHonorRoll,
  initialBuses,
  initialGrades
} from '../data/initialData';

const SchoolContext = createContext(null);

const STORAGE_KEY = 'SMART_SCHOOL_DATA_V1';

export const SchoolProvider = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userRole, setUserRole] = useState('مدير عام النظام');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);

  // Core Data with LocalStorage Cache
  const [schoolInfo, setSchoolInfo] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    return saved ? JSON.parse(saved) : initialSchoolInfo;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : initialClasses;
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teachers`);
    return saved ? JSON.parse(saved) : initialTeachers;
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [agenda, setAgenda] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_agenda`);
    return saved ? JSON.parse(saved) : initialAgenda;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_announcements`);
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [honorRoll, setHonorRoll] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_honor`);
    return saved ? JSON.parse(saved) : initialHonorRoll;
  });

  const [buses, setBuses] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_buses`);
    return saved ? JSON.parse(saved) : initialBuses;
  });

  const [grades, setGrades] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
    return saved ? JSON.parse(saved) : initialGrades;
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : {};
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(schoolInfo));
    localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
    localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
    localStorage.setItem(`${STORAGE_KEY}_teachers`, JSON.stringify(teachers));
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
    localStorage.setItem(`${STORAGE_KEY}_agenda`, JSON.stringify(agenda));
    localStorage.setItem(`${STORAGE_KEY}_announcements`, JSON.stringify(announcements));
    localStorage.setItem(`${STORAGE_KEY}_honor`, JSON.stringify(honorRoll));
    localStorage.setItem(`${STORAGE_KEY}_buses`, JSON.stringify(buses));
    localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(grades));
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendanceRecords));
  }, [
    schoolInfo, classes, subjects, teachers, students, payments,
    agenda, announcements, honorRoll, buses, grades, attendanceRecords
  ]);

  // Keyboard shortcut for Search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Student Actions
  const addStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `stu-${Date.now().toString().slice(-4)}`,
      paidAmount: studentData.isSpecialCase ? 0 : (studentData.paidAmount ? Number(studentData.paidAmount) : 0),
      tuitionTotal: studentData.isSpecialCase ? 0 : Number(studentData.tuitionTotal ?? 700),
      discountAmount: studentData.isSpecialCase ? 0 : Number(studentData.discountAmount || 0),
      remainingAmount: studentData.isSpecialCase ? 0 : ((Number(studentData.tuitionTotal ?? 700) - Number(studentData.discountAmount || 0)) - Number(studentData.paidAmount || 0)),
      registrationDate: new Date().toISOString().split('T')[0],
      status: "نشط"
    };

    setStudents(prev => [newStudent, ...prev]);

    // If initial payment was provided, create receipt
    if (newStudent.paidAmount > 0) {
      addPayment({
        studentId: newStudent.id,
        studentName: newStudent.name,
        grade: newStudent.grade,
        amount: newStudent.paidAmount,
        currency: "USD",
        paymentMethod: "نقدي عند التسجيل",
        notes: "دفعة أولى عند تسجيل الطالب",
        remainingAfter: newStudent.remainingAmount
      });
    }

    return newStudent;
  };

  const updateStudent = (id, updated) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Payment Actions & Receipt Generation
  const addPayment = (paymentData) => {
    const receiptNum = `REC-LB-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const newPayment = {
      ...paymentData,
      id: receiptNum,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      receivedBy: "إدارة المحاسبة والمالية"
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update student's paid and remaining balance
    setStudents(prev => prev.map(stu => {
      if (stu.id === paymentData.studentId) {
        const newPaid = stu.isSpecialCase ? 0 : (Number(stu.paidAmount || 0) + Number(paymentData.amount));
        const netTuition = stu.isSpecialCase ? 0 : (Number(stu.tuitionTotal || 0) - Number(stu.discountAmount || 0));
        const newRemaining = stu.isSpecialCase ? 0 : Math.max(0, netTuition - newPaid);
        return {
          ...stu,
          paidAmount: newPaid,
          remainingAmount: newRemaining
        };
      }
      return stu;
    }));

    return newPayment;
  };

  // Agenda Actions
  const addAgendaItem = (item) => {
    setAgenda(prev => [{ ...item, id: `ag-${Date.now()}` }, ...prev]);
  };

  const deleteAgendaItem = (id) => {
    setAgenda(prev => prev.filter(item => item.id !== id));
  };

  // Announcements
  const addAnnouncement = (item) => {
    setAnnouncements(prev => [{ ...item, id: `ann-${Date.now()}` }, ...prev]);
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(prev => prev.filter(item => item.id !== id));
  };

  // Attendance
  const markAttendance = (dateStr, studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        [studentId]: status
      }
    }));
  };

  // Reset Data to Initial
  const resetToFactoryDefaults = () => {
    localStorage.clear();
    setSchoolInfo(initialSchoolInfo);
    setClasses(initialClasses);
    setSubjects(initialSubjects);
    setTeachers(initialTeachers);
    setStudents(initialStudents);
    setPayments(initialPayments);
    setAgenda(initialAgenda);
    setAnnouncements(initialAnnouncements);
    setHonorRoll(initialHonorRoll);
    setBuses(initialBuses);
    setGrades(initialGrades);
    setAttendanceRecords({});
  };

  return (
    <SchoolContext.Provider value={{
      activeTab,
      setActiveTab,
      isSearchOpen,
      setIsSearchOpen,
      userRole,
      setUserRole,
      selectedReceipt,
      setSelectedReceipt,
      selectedStudentForReport,
      setSelectedStudentForReport,
      schoolInfo,
      setSchoolInfo,
      classes,
      setClasses,
      subjects,
      setSubjects,
      teachers,
      setTeachers,
      students,
      setStudents,
      addStudent,
      updateStudent,
      deleteStudent,
      payments,
      addPayment,
      agenda,
      addAgendaItem,
      deleteAgendaItem,
      announcements,
      addAnnouncement,
      deleteAnnouncement,
      honorRoll,
      setHonorRoll,
      buses,
      setBuses,
      grades,
      setGrades,
      attendanceRecords,
      markAttendance,
      resetToFactoryDefaults
    }}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
