export const initialSubjects = [
  {
    id: "SUB-01",
    name: "الرياضيات",
    nameEn: "Mathematics",
    color: "#0284C7",
    bgColor: "rgba(2, 132, 199, 0.15)",
    borderColor: "rgba(2, 132, 199, 0.4)",
    icon: "📐",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "SUB-02",
    name: "العلوم والفيزياء",
    nameEn: "Science & Physics",
    color: "#059669",
    bgColor: "rgba(5, 150, 105, 0.15)",
    borderColor: "rgba(5, 150, 105, 0.4)",
    icon: "🧪",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "SUB-03",
    name: "اللغة الإنجليزية",
    nameEn: "English Language",
    color: "#7C3AED",
    bgColor: "rgba(124, 58, 237, 0.15)",
    borderColor: "rgba(124, 58, 237, 0.4)",
    icon: "🇬🇧",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "SUB-04",
    name: "اللغة العربية واللغويات",
    nameEn: "Arabic & Linguistics",
    color: "#E11D48",
    bgColor: "rgba(225, 29, 72, 0.15)",
    borderColor: "rgba(225, 29, 72, 0.4)",
    icon: "📖",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "SUB-05",
    name: "القرآن والدراسات الإسلامية",
    nameEn: "Quran & Islamic Studies",
    color: "#D97706",
    bgColor: "rgba(217, 119, 6, 0.15)",
    borderColor: "rgba(217, 119, 6, 0.4)",
    icon: "🕌",
    image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80"
  },
  {
    id: "SUB-06",
    name: "البرمجة والابتكار الرقمي",
    nameEn: "Coding & Digital Tech",
    color: "#0891B2",
    bgColor: "rgba(8, 145, 178, 0.15)",
    borderColor: "rgba(8, 145, 178, 0.4)",
    icon: "💻",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80"
  }
];

export const initialGrades = [
  {
    id: "GRD-01",
    name: "الصف الخامس الابتدائي",
    nameEn: "Grade 5 Elementary",
    stage: "التعليم الأساسي",
    stageEn: "Primary School",
    tuitionFee: 700,
    color: "#0284C7"
  },
  {
    id: "GRD-02",
    name: "الصف السادس الابتدائي",
    nameEn: "Grade 6 Elementary",
    stage: "التعليم الأساسي",
    stageEn: "Primary School",
    tuitionFee: 700,
    color: "#10b981"
  },
  {
    id: "GRD-03",
    name: "الصف السابع المتوسط",
    nameEn: "Grade 7 Intermediate",
    stage: "التعليم المتوسط",
    stageEn: "Middle School",
    tuitionFee: 700,
    color: "#a855f7"
  }
];

export const initialClassrooms = [
  {
    id: "CLS-01",
    gradeId: "GRD-01",
    gradeName: "الصف الخامس الابتدائي",
    sectionName: "الشعبة (أ)",
    sectionNameEn: "Section A",
    capacity: 30,
    supervisor: "أ. طارق خوري",
    roomNumber: "101"
  },
  {
    id: "CLS-02",
    gradeId: "GRD-01",
    gradeName: "الصف الخامس الابتدائي",
    sectionName: "الشعبة (ب)",
    sectionNameEn: "Section B",
    capacity: 28,
    supervisor: "أ. مريم صالح",
    roomNumber: "102"
  },
  {
    id: "CLS-03",
    gradeId: "GRD-02",
    gradeName: "الصف السادس الابتدائي",
    sectionName: "الشعبة (أ)",
    sectionNameEn: "Section A",
    capacity: 32,
    supervisor: "أ. سامر العلي",
    roomNumber: "201"
  }
];

export const initialExams = [
  {
    id: "EXM-101",
    title: "اختبار الرياضيات التقييمي - الشهر الأول",
    titleEn: "Math First Month Exam",
    subjectId: "SUB-01",
    subject: "الرياضيات",
    grade: "الصف السادس الابتدائي",
    classRoom: "أ",
    results: []
  }
];

export const initialStudents = [];

export const initialTeachers = [];

export const initialMasterTimetable = [];

export const initialStaffEmployees = [];

export const initialAdmins = [
  {
    id: "ADM-01",
    username: "admin",
    password: "123123123",
    name: "إدارة المدرسة العامة",
    nameEn: "General School Admin",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  }
];

export const initialBuses = [];

export const initialMessages = [];

const todayStr = new Date().toISOString().split('T')[0];
const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 3);
const pastStr = pastDate.toISOString().split('T')[0];

export const initialAgenda = [];

export const initialDailyMarks = [
  // Student STU-588 (محمد خالد مسرة)
  { id: "DM-101", studentId: "STU-588", subjectId: "SUB-01", subjectName: "الرياضيات", date: "2026-07-05", type: "أعمال السنة", score: 19, maxScore: 20, notes: "إجابة نموذجية ممتازة" },
  { id: "DM-102", studentId: "STU-588", subjectId: "SUB-01", subjectName: "الرياضيات", date: "2026-07-10", type: "اختبار قصير", score: 19, maxScore: 20, notes: "تفوق في مسائل الهندسة" },
  { id: "DM-103", studentId: "STU-588", subjectId: "SUB-01", subjectName: "الرياضيات", date: "2026-07-15", type: "منتصف الفصل", score: 18, maxScore: 20, notes: "درجة مرتفعة في الاختبار الموحد" },
  { id: "DM-104", studentId: "STU-588", subjectId: "SUB-01", subjectName: "الرياضيات", date: "2026-07-20", type: "النهائي", score: 38, maxScore: 40, notes: "الامتحان النهائي الرسمي" },

  { id: "DM-201", studentId: "STU-588", subjectId: "SUB-02", subjectName: "العلوم والفيزياء", date: "2026-07-06", type: "أعمال السنة", score: 20, maxScore: 20, notes: "نشاط مختبري ممتاز" },
  { id: "DM-202", studentId: "STU-588", subjectId: "SUB-02", subjectName: "العلوم والفيزياء", date: "2026-07-11", type: "اختبار قصير", score: 19, maxScore: 20, notes: "تجربة الكيمياء العملية" },
  { id: "DM-203", studentId: "STU-588", subjectId: "SUB-02", subjectName: "العلوم والفيزياء", date: "2026-07-16", type: "منتصف الفصل", score: 20, maxScore: 20, notes: "علامة كاملة في الجزء النظري" },
  { id: "DM-204", studentId: "STU-588", subjectId: "SUB-02", subjectName: "العلوم والفيزياء", date: "2026-07-21", type: "النهائي", score: 39, maxScore: 40, notes: "الامتحان النهائي" },

  { id: "DM-301", studentId: "STU-588", subjectId: "SUB-03", subjectName: "اللغة الإنجليزية", date: "2026-07-07", type: "أعمال السنة", score: 19, maxScore: 20, notes: "مشاركة يومية باللغة" },
  { id: "DM-302", studentId: "STU-588", subjectId: "SUB-03", subjectName: "اللغة الإنجليزية", date: "2026-07-12", type: "اختبار قصير", score: 18, maxScore: 20, notes: "قواعد القراءة والتعبير" },
  { id: "DM-303", studentId: "STU-588", subjectId: "SUB-03", subjectName: "اللغة الإنجليزية", date: "2026-07-17", type: "منتصف الفصل", score: 18, maxScore: 20, notes: "اختبار الاستماع والكتابة" },
  { id: "DM-304", studentId: "STU-588", subjectId: "SUB-03", subjectName: "اللغة الإنجليزية", date: "2026-07-21", type: "النهائي", score: 37, maxScore: 40, notes: "الامتحان النهائي" },

  { id: "DM-401", studentId: "STU-588", subjectId: "SUB-04", subjectName: "اللغة العربية واللغويات", date: "2026-07-08", type: "أعمال السنة", score: 18, maxScore: 20, notes: "إملاء وقواعد نحو" },
  { id: "DM-402", studentId: "STU-588", subjectId: "SUB-04", subjectName: "اللغة العربية واللغويات", date: "2026-07-13", type: "اختبار قصير", score: 18, maxScore: 20, notes: "تعبير وقراءة نقدية" },
  { id: "DM-403", studentId: "STU-588", subjectId: "SUB-04", subjectName: "اللغة العربية واللغويات", date: "2026-07-18", type: "منتصف الفصل", score: 17, maxScore: 20, notes: "بلاغة وإعراب" },
  { id: "DM-404", studentId: "STU-588", subjectId: "SUB-04", subjectName: "اللغة العربية واللغويات", date: "2026-07-22", type: "النهائي", score: 36, maxScore: 40, notes: "الامتحان النهائي" },

  { id: "DM-501", studentId: "STU-588", subjectId: "SUB-05", subjectName: "البرمجة والابتكار الرقمي", date: "2026-07-09", type: "أعمال السنة", score: 20, maxScore: 20, notes: "مشروع تطبيق ويب ممتاز" },
  { id: "DM-502", studentId: "STU-588", subjectId: "SUB-05", subjectName: "البرمجة والابتكار الرقمي", date: "2026-07-14", type: "اختبار قصير", score: 20, maxScore: 20, notes: "تطبيق React ومكوناته" },
  { id: "DM-503", studentId: "STU-588", subjectId: "SUB-05", subjectName: "البرمجة والابتكار الرقمي", date: "2026-07-19", type: "منتصف الفصل", score: 20, maxScore: 20, notes: "علامة كاملة في البرمجة" },
  { id: "DM-504", studentId: "STU-588", subjectId: "SUB-05", subjectName: "البرمجة والابتكار الرقمي", date: "2026-07-22", type: "النهائي", score: 40, maxScore: 40, notes: "مشروع النهائي متكامل" },

  { id: "DM-601", studentId: "STU-588", subjectId: "SUB-06", subjectName: "التربية الوطنية والدراسات", date: "2026-07-09", type: "أعمال السنة", score: 18, maxScore: 20, notes: "مشاركة صفية ملحوظة" },
  { id: "DM-602", studentId: "STU-588", subjectId: "SUB-06", subjectName: "التربية الوطنية والدراسات", date: "2026-07-14", type: "اختبار قصير", score: 19, maxScore: 20, notes: "بحث ومشاريع اجتماعية" },
  { id: "DM-603", studentId: "STU-588", subjectId: "SUB-06", subjectName: "التربية الوطنية والدراسات", date: "2026-07-19", type: "منتصف الفصل", score: 18, maxScore: 20, notes: "اختبار الجغرافيا والتاريخ" },
  { id: "DM-604", studentId: "STU-588", subjectId: "SUB-06", subjectName: "التربية الوطنية والدراسات", date: "2026-07-22", type: "النهائي", score: 36, maxScore: 40, notes: "الامتحان النهائي" }
];

export const initialTutoringCourses = [
  {
    id: "TUT-01",
    title: "دورة تقوية الرياضيات المتقدمة",
    titleEn: "Advanced Mathematics Tutoring",
    subject: "الرياضيات",
    fee: 50,
    description: "جلسات تدريبية مكثفة لتقوية المهارات الرياضية وحل المسائل الهندسية والجبرية المتقدمة للشهادات والامتحانات.",
    days: "الإثنين والأربعاء (04:00 - 05:30 مساءً)",
    instructor: "أ. طارق خوري",
    maxSeats: 15,
    enrolledStudentIds: ["STU-588", "STU-102"],
    studentFeesMap: { "STU-588": 45, "STU-102": 50 }
  },
  {
    id: "TUT-02",
    title: "معهد تقوية اللغة الإنجليزية والمحادثة",
    titleEn: "English Language & Conversation Clinic",
    subject: "اللغة الإنجليزية",
    fee: 40,
    description: "تطوير مهارات القواعد والمحادثة وتراكيب الجمل لطلاب المرحلتين المتوسطة والابتدائية بأحدث الأساليب التفاعلية.",
    days: "الثلاثاء والخميس (03:30 - 05:00 مساءً)",
    instructor: "أ. منى الزهراني",
    maxSeats: 12,
    enrolledStudentIds: ["STU-588"],
    studentFeesMap: { "STU-588": 40 }
  },
  {
    id: "TUT-03",
    title: "تقوية مهارات البرمجة والذكاء الاصطناعي",
    titleEn: "Coding & AI Basics Workshop",
    subject: "البرمجة والابتكار الرقمي",
    fee: 60,
    description: "ورشة عمل عملية مكثفة لتعلم أسس البرمجة وتطوير التفكير المنطقي وبناء المشاريع الرقمية.",
    days: "السبت (10:00 صباحاً - 01:00 ظهراً)",
    instructor: "أ. سامر العلي",
    maxSeats: 10,
    enrolledStudentIds: ["STU-103"],
    studentFeesMap: { "STU-103": 60 }
  }
];

export const initialTutoringPayments = [
  {
    id: "TPAY-101",
    receiptNo: "REC-TUT-001",
    date: "2026-07-20",
    studentId: "STU-588",
    studentName: "محمد خالد مسرة",
    courseId: "TUT-01",
    courseTitle: "دورة تقوية الرياضيات المتقدمة",
    amount: 45,
    currency: "USD",
    method: "نقدي (Cash)",
    notes: "تسديد القسط كاملاً عن شهر تموز لمعهد التقوية",
    recordedBy: "المدير العام"
  },
  {
    id: "TPAY-102",
    receiptNo: "REC-TUT-002",
    date: "2026-07-21",
    studentId: "STU-102",
    studentName: "سارة أحمد النجار",
    courseId: "TUT-01",
    courseTitle: "دورة تقوية الرياضيات المتقدمة",
    amount: 25,
    currency: "USD",
    method: "نقدي (Cash)",
    notes: "الدفعة الأولى من قسط دورة التقوية",
    recordedBy: "المدير العام"
  }
];

export const initialExpenses = [];
export const initialPushNotifications = [];
export const initialTuitionPayments = [];

export const initialAttendanceRecords = [
  { id: "ATT-101", date: "2026-07-22", studentId: "STU-588", studentName: "محمد خالد مسرة", grade: "الصف السادس الابتدائي", section: "أ", status: "حاضر", notes: "حضور مبكر ومشارك" },
  { id: "ATT-102", date: "2026-07-22", studentId: "STU-102", studentName: "سارة أحمد النجار", grade: "الصف السادس الابتدائي", section: "أ", status: "حاضر", notes: "حضور منتظم" },
  { id: "ATT-103", date: "2026-07-22", studentId: "STU-103", studentName: "كريم يوسف حداد", grade: "الصف السادس الابتدائي", section: "أ", status: "متأخر", notes: "تأخر 10 دقائق بعذر" },
  { id: "ATT-104", date: "2026-07-22", studentId: "STU-104", studentName: "لين هاني الحسيني", grade: "الصف الخامس الابتدائي", section: "أ", status: "حاضر", notes: "حاضر" },
  { id: "ATT-105", date: "2026-07-22", studentId: "STU-105", studentName: "عمر زياد شهاب", grade: "الصف الخامس الابتدائي", section: "أ", status: "بعذر", notes: "إجازة مرضية بعذر رسمي" }
];

export const initialBehaviorRecords = [
  { id: "BEH-101", date: "2026-07-21", studentId: "STU-588", studentName: "محمد خالد مسرة", grade: "الصف السادس الابتدائي", type: "إيجابي", title: "مساعدة زميل وتفوق في الحصة", notes: "قام بمساعدة الطلاب في تطبيق التمرين المكتبي بالبرمجة بكل إيجابية.", teacherName: "أ. سامر العلي" },
  { id: "BEH-102", date: "2026-07-20", studentId: "STU-102", studentName: "سارة أحمد النجار", grade: "الصف السادس الابتدائي", type: "إيجابي", title: "تميز في إعداد المشروع العلمي", notes: "تقديم نموذج مختبري رائع في مادة العلوم.", teacherName: "أ. مريم صالح" },
  { id: "BEH-103", date: "2026-07-19", studentId: "STU-103", studentName: "كريم يوسف حداد", grade: "الصف السادس الابتدائي", type: "ملاحظة", title: "تأخر في تسليم كتاب التمارين", notes: "تم التنبيه على ضرورة احضار دفتر الواجبات بانتظام.", teacherName: "أ. طارق خوري" }
];

export const initialNotificationsList = [
  { id: "NOTIF-101", timestamp: "اليوم 09:15 ص", title: "حضور وتسجيل مبكر ☀️", message: "تم تسجيل حضور التلميذ محمد خالد مسرة بنجاح اليوم.", type: "attendance", isRead: false },
  { id: "NOTIF-102", timestamp: "أمس 01:30 م", title: "علامة دراسية جديدة 📊", message: "تم إضافة علامة رصد سجل العلامات اليومية لمادة البرمجة والابتكار.", type: "grade", isRead: false },
  { id: "NOTIF-103", timestamp: "منذ يومين", title: "ملاحظة سلوك وتشجيع 🌟", message: "تلقى التلميذ إشادة سلوك إيجابية من المعلم أ. سامر العلي.", type: "behavior", isRead: true },
  { id: "NOTIF-104", timestamp: "منذ 3 أيام", title: "إعلان من إدارة مدرسة الدعم", message: "يرجى التقيّد بمواعيد الدوام المدرسي من 07:30 صباحاً حتى 12:00 ظهراً.", type: "announcement", isRead: true }
];

export const initialStudyResources = [
  { id: "RES-101", title: "ملخص مادة العلوم والفيزياء - الفصل الأول PDF", subject: "العلوم والفيزياء", grade: "الصف السادس الابتدائي", type: "PDF", link: "#", date: "2026-07-20", teacherName: "أ. مريم صالح", icon: "📄" },
  { id: "RES-102", title: "دفتر أسئلة وتدريبات الرياضيات الشامل", subject: "الرياضيات", grade: "الصف السادس الابتدائي", type: "Document", link: "#", date: "2026-07-18", teacherName: "أ. طارق خوري", icon: "📐" },
  { id: "RES-103", title: "دليل قواعد البرمجة وتطبيقات الويب", subject: "البرمجة والابتكار الرقمي", grade: "الصف السادس الابتدائي", type: "Zip / Code", link: "#", date: "2026-07-15", teacherName: "أ. سامر العلي", icon: "💻" }
];
