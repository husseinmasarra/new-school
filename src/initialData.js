// Auto-synced initial school data
export const initialSubjects = [
  {
    "id": "SUB-45",
    "name": "اللغة العربية",
    "nameEn": "Arabic Language",
    "icon": "📖",
    "image": "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80",
    "color": "#E11D48",
    "bgColor": "rgba(225, 29, 72, 0.15)",
    "borderColor": "rgba(225, 29, 72, 0.4)"
  },
  {
    "id": "SUB-25",
    "name": "رياضيات",
    "nameEn": "Mathematics",
    "icon": "📐",
    "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80",
    "color": "#0284C7",
    "bgColor": "rgba(2, 132, 199, 0.15)",
    "borderColor": "rgba(2, 132, 199, 0.4)"
  },
  {
    "id": "SUB-29",
    "name": "تربية اسلامية",
    "nameEn": "Islamic Studies",
    "icon": "🕌",
    "image": "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80",
    "color": "#D97706",
    "bgColor": "rgba(217, 119, 6, 0.15)",
    "borderColor": "rgba(217, 119, 6, 0.4)"
  },
  {
    "id": "SUB-97",
    "name": "اللغة الانكليزية",
    "nameEn": "English Language",
    "icon": "🇬🇧",
    "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80",
    "color": "#7C3AED",
    "bgColor": "rgba(124, 58, 237, 0.15)",
    "borderColor": "rgba(124, 58, 237, 0.4)"
  },
  {
    "id": "SUB-30",
    "name": "علوم",
    "nameEn": "Science",
    "icon": "🧪",
    "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80",
    "color": "#059669",
    "bgColor": "rgba(5, 150, 105, 0.15)",
    "borderColor": "rgba(5, 150, 105, 0.4)"
  }
];

export const initialGrades = [
  {
    "id": "GRD-62",
    "name": "الروضة الثانية",
    "nameEn": "الروضة الثانية",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#0284C7"
  },
  {
    "id": "GRD-30",
    "name": "الروضة الثالثة",
    "nameEn": "الروضة الثالثة",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#0284C7"
  },
  {
    "id": "GRD-45",
    "name": "الصف الاول",
    "nameEn": "الصف الاول",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#10b981"
  },
  {
    "id": "GRD-23",
    "name": "الصف الثاني",
    "nameEn": "الصف الثاني",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#10b981"
  },
  {
    "id": "GRD-92",
    "name": "الصف الثالث",
    "nameEn": "الصف الثالث",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#10b981"
  },
  {
    "id": "GRD-90",
    "name": "الصف الرابع",
    "nameEn": "الصف الرابع",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#EF4444"
  },
  {
    "id": "GRD-31",
    "name": "الصف الخامس",
    "nameEn": "الصف الخامس",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#EF4444"
  },
  {
    "id": "GRD-71",
    "name": "الصف السادس",
    "nameEn": "الصف السادس",
    "stage": "التعليم الأساسي",
    "stageEn": "Primary School",
    "tuitionFee": 700,
    "color": "#EF4444"
  }
];

export const initialClassrooms = [
  {
    "id": "CLS-77",
    "gradeId": "GRD-17",
    "gradeName": "الصف الاول",
    "sectionName": "الشعبة (أ)",
    "sectionNameEn": "Section A",
    "capacity": 30,
    "supervisor": "أ. طارق خوري",
    "roomNumber": "101"
  },
  {
    "id": "CLS-89",
    "gradeId": "GRD-17",
    "gradeName": "الصف الدراسي",
    "sectionName": "الشعبة (أ)",
    "sectionNameEn": "Section A",
    "capacity": 30,
    "supervisor": "أ. طارق خوري",
    "roomNumber": "101"
  },
  {
    "id": "CLS-29",
    "gradeId": "GRD-17",
    "gradeName": "الصف الدراسي",
    "sectionName": "الشعبة (أ)",
    "sectionNameEn": "Section A",
    "capacity": 30,
    "supervisor": "أ. طارق خوري",
    "roomNumber": "101"
  }
];

export const initialStudents = [
  {
    "id": "STU-117",
    "name": "نورا",
    "nameEn": "نورا",
    "username": "نورا مسرة",
    "password": "945693",
    "grade": "الصف الاول",
    "gradeEn": "الصف الاول",
    "classRoom": "أ",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "tuitionTotal": 0,
    "tuitionPaid": 0,
    "tuitionDiscount": 0,
    "adminFees": 0,
    "hasTransport": false,
    "transportFee": 0,
    "phone": "81713408",
    "parentPhone": "81713408",
    "motherPhone": "",
    "parentName": "ابراهيم مسرة",
    "parentNameEn": "ابراهيم مسرة",
    "ministryClearance": "",
    "isSpecialCase": true,
    "frozen": false
  },
  {
    "id": "STU-245",
    "name": "حسين ابراهيم مسرة",
    "nameEn": "حسين ابراهيم مسرة",
    "username": "حسين مسرة",
    "password": "123456",
    "grade": "الروضة الثانية",
    "gradeEn": "الروضة الثانية",
    "classRoom": "الشعبة (أ)",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "tuitionTotal": 0,
    "tuitionPaid": 0,
    "tuitionDiscount": 0,
    "adminFees": 0,
    "hasTransport": false,
    "transportFee": 0,
    "phone": "81713408",
    "parentPhone": "81713408",
    "motherPhone": "",
    "parentName": "ابراهيم مسرة",
    "parentNameEn": "ابراهيم مسرة",
    "ministryClearance": "",
    "isSpecialCase": true,
    "frozen": false
  },
  {
    "id": "STU-996",
    "name": "محمد خالد حسين مسرة",
    "nameEn": "محمد خالد حسين مسرة",
    "username": "محمد خالد مسرة",
    "password": "123456",
    "grade": "الصف الاول",
    "gradeEn": "Grade 1",
    "classRoom": "الشعبة (أ)",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "tuitionTotal": 700,
    "tuitionPaid": 0,
    "tuitionDiscount": 0,
    "adminFees": 0,
    "hasTransport": false,
    "transportFee": 0,
    "phone": "+961 03 123 456",
    "parentPhone": "+961 03 123 456",
    "motherPhone": "",
    "parentName": "حسين مسرة",
    "parentNameEn": "حسين مسرة",
    "ministryClearance": "",
    "isSpecialCase": false,
    "frozen": false
  }
];

export const initialTeachers = [];

export const initialStaffEmployees = [];

export const initialExams = [
  {
    "id": "EXM-101",
    "title": "اختبار الرياضيات التقييمي - الشهر الأول",
    "titleEn": "Math First Month Exam",
    "subjectId": "SUB-01",
    "subject": "الرياضيات",
    "grade": "الصف السادس الابتدائي",
    "classRoom": "أ",
    "results": [
      {
        "studentId": "STU-588",
        "score": 1,
        "evaluation": "ممتاز واصل التقدم!"
      }
    ]
  }
];

export const initialExpenses = [];

export const initialBuses = [];

export const initialMessages = [
  {
    "id": "MSG-310",
    "date": "2026-08-16",
    "title": "تذكير مالي - قسط الطالب محمد خالد مسرة ($ USD)",
    "titleEn": "Financial Reminder - Tuition for M.Khaled massara  ($ USD)",
    "content": "نود تذكيركم بوجود قسط متبقي بقيمة $600 USD (ما يعادل 54,000,000 ل.ل.). نرجو السداد عبر Fresh USD أو OMT / Whish.",
    "contentEn": "Reminder: Student remaining tuition balance is $600 USD. Please settle via Fresh USD or OMT / Whish.",
    "targetType": "student",
    "targetValue": "محمد خالد مسرة",
    "category": "financial",
    "priority": "urgent"
  },
  {
    "id": "MSG-311",
    "date": "2026-07-22",
    "senderRole": "teacher",
    "senderName": "أ. مريم صالح",
    "recipientName": "حسين مسرة",
    "studentName": "محمد خالد مسرة",
    "studentId": "STU-588",
    "category": "إشادة وتميز دراسي 🌟",
    "text": "ممتاز",
    "time": "٠٧:٣٩ م"
  }
];

export const initialAgenda = [];

export const initialTutoringCourses = [];

export const initialTutoringPayments = [];

export const initialMasterTimetable = [];

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

export const initialDailyMarks = [];

export const initialPushNotifications = [
  {
    "id": "PNOT-87761",
    "timestamp": "2026-07-22T16:39:47.761Z",
    "title": "🔔 إشعار معلم المادة: أ. مريم صالح",
    "body": "ملاحظة خاصة بحق الطالب (محمد خالد مسرة): ممتاز",
    "recipient": "STU-588"
  }
];

export const initialTuitionPayments = [];

export const initialAttendanceRecords = [];

export const initialBehaviorRecords = [];

export const initialNotificationsList = [];

export const initialStudyResources = [];
