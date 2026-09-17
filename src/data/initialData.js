export const initialSchoolInfo = {
  name: "مدرسة الدعم التعليمي",
  subTitle: "منصة إدارة مدرسية ذكية",
  academicYear: "2025 - 2026",
  currency: "USD",
  phone: "+961 70 123 456",
  email: "info@school.edu.lb",
  address: "بيروت، لبنان",
  logo: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80"
};

export const initialClasses = [
  { id: "c1", name: "الأول الأساسي", sections: ["أ", "ب"], capacity: 25, stage: "الابتدائية" },
  { id: "c2", name: "الثاني الأساسي", sections: ["أ", "ب"], capacity: 25, stage: "الابتدائية" },
  { id: "c3", name: "الثالث الأساسي", sections: ["أ"], capacity: 30, stage: "الابتدائية" },
  { id: "c4", name: "الرابع الأساسي", sections: ["أ", "ب"], capacity: 28, stage: "الابتدائية" },
  { id: "c5", name: "الخامس الأساسي", sections: ["أ"], capacity: 28, stage: "المتوسطة" },
  { id: "c6", name: "السادس الأساسي", sections: ["أ"], capacity: 30, stage: "المتوسطة" },
];

export const initialSubjects = [
  { id: "s1", name: "اللغة العربية", code: "ARB-101", color: "#EF4444", weeklyHours: 5, teacher: "أ. فاطمة الزهراء" },
  { id: "s2", name: "الرياضيات", code: "MTH-102", color: "#0284C7", weeklyHours: 5, teacher: "أ. أحمد منصور" },
  { id: "s3", name: "العلوم العامة", code: "SCI-103", color: "#10B981", weeklyHours: 4, teacher: "أ. ريم خليل" },
  { id: "s4", name: "اللغة الإنكليزية", code: "ENG-104", color: "#8B5CF6", weeklyHours: 4, teacher: "أ. مايكل حداد" },
];

export const initialTeachers = [
  {
    id: "t1",
    name: "أ. أحمد منصور",
    specialty: "رياضيات",
    phone: "+961 71 888 111",
    email: "ahmad.m@school.edu",
    salary: 850,
    classes: ["الأول الأساسي (أ)", "الثاني الأساسي (أ)"],
    status: "معتمد"
  },
  {
    id: "t2",
    name: "أ. فاطمة الزهراء",
    specialty: "لغة عربية وتربية إسلامية",
    phone: "+961 71 888 222",
    email: "fatima.z@school.edu",
    salary: 800,
    classes: ["الأول الأساسي (أ)", "الأول الأساسي (ب)"],
    status: "معتمد"
  },
  {
    id: "t3",
    name: "أ. ريم خليل",
    specialty: "علوم وأحياء",
    phone: "+961 71 888 333",
    email: "reem.k@school.edu",
    salary: 820,
    classes: ["الثالث الأساسي (أ)", "الرابع الأساسي (أ)"],
    status: "معتمد"
  }
];

export const initialStudents = [
  {
    id: "stu-1001",
    name: "كريم يوسف العلي",
    familyId: "FAM-201",
    familyName: "عائلة العلي",
    grade: "الأول الأساسي",
    section: "أ",
    gender: "ذكر",
    dob: "2018-05-12",
    parentName: "يوسف العلي",
    parentPhone: "+961 76 555 123",
    busRoute: "خط بيروت - الحمرا",
    tuitionTotal: 1500,
    discountAmount: 200,
    discountReason: "خصم تسجيل مبكر",
    paidAmount: 500,
    remainingAmount: 800,
    registrationDate: "2025-09-01",
    status: "نشط",
    notes: "طالب متفوق وهادئ"
  },
  {
    id: "stu-1002",
    name: "سارة يوسف العلي",
    familyId: "FAM-201",
    familyName: "عائلة العلي",
    grade: "الثالث الأساسي",
    section: "أ",
    gender: "أنثى",
    dob: "2016-08-20",
    parentName: "يوسف العلي",
    parentPhone: "+961 76 555 123",
    busRoute: "خط بيروت - الحمرا",
    tuitionTotal: 1600,
    discountAmount: 300,
    discountReason: "خصم الإخوة 20%",
    paidAmount: 600,
    remainingAmount: 700,
    registrationDate: "2025-09-01",
    status: "نشط",
    notes: "متميزة في مادة الرياضيات"
  },
  {
    id: "stu-1003",
    name: "جاد عمر الرفاعي",
    familyId: "FAM-202",
    familyName: "عائلة الرفاعي",
    grade: "الثاني الأساسي",
    section: "أ",
    gender: "ذكر",
    dob: "2017-03-15",
    parentName: "عمر الرفاعي",
    parentPhone: "+961 70 999 444",
    busRoute: "بدون نقل (خاص)",
    tuitionTotal: 1550,
    discountAmount: 0,
    discountReason: "-",
    paidAmount: 1550,
    remainingAmount: 0,
    registrationDate: "2025-09-02",
    status: "نشط",
    notes: "تم تسديد كامل القسط"
  }
];

export const initialPayments = [
  {
    id: "REC-LB-001045",
    studentId: "stu-1001",
    studentName: "كريم يوسف العلي",
    grade: "الأول الأساسي",
    amount: 500,
    currency: "USD",
    paymentDate: "2025-09-05",
    paymentMethod: "نقدي Cash",
    receivedBy: "إدارة المحاسبة والمالية",
    notes: "الدفعة الأولى من القسط السنوي",
    remainingAfter: 800
  },
  {
    id: "REC-LB-001046",
    studentId: "stu-1002",
    studentName: "سارة يوسف العلي",
    grade: "الثالث الأساسي",
    amount: 600,
    currency: "USD",
    paymentDate: "2025-09-05",
    paymentMethod: "نقدي Cash",
    receivedBy: "إدارة المحاسبة والمالية",
    notes: "دفعة تسجيل مع خصم الأخوة",
    remainingAfter: 700
  },
  {
    id: "REC-LB-001047",
    studentId: "stu-1003",
    studentName: "جاد عمر الرفاعي",
    grade: "الثاني الأساسي",
    amount: 1550,
    currency: "USD",
    paymentDate: "2025-09-06",
    paymentMethod: "تحويل مصرفي",
    receivedBy: "إدارة المحاسبة والمالية",
    notes: "سداد كامل القسط السنوي",
    remainingAfter: 0
  }
];

export const initialAgenda = [
  {
    id: "ag-1",
    date: "2026-09-15",
    grade: "الأول الأساسي",
    section: "أ",
    subject: "اللغة العربية",
    lessonTitle: "حرف الباء وتجريده",
    homework: "كتابة حرف الباء بالحركات الثلاث في الدفتر ص 14",
    deadline: "2026-09-16",
    teacher: "أ. فاطمة الزهراء"
  },
  {
    id: "ag-2",
    date: "2026-09-15",
    grade: "الأول الأساسي",
    section: "أ",
    subject: "الرياضيات",
    lessonTitle: "مقارنة الأعداد (أكبر من وأصغر من)",
    homework: "حل التمارين رقم 1 و 2 صفحة 22 في كتاب الأنشطة",
    deadline: "2026-09-16",
    teacher: "أ. أحمد منصور"
  }
];

export const initialAnnouncements = [
  {
    id: "ann-1",
    title: "بدء التسجيل للعام الدراسي الجديد 2026",
    content: "ترحب إدارة مدرسة الدعم التعليمي بأولياء الأمور الكرام وتعلن عن فتح باب التسجيل وتثبيت المقاعد للعام الدراسي القادم.",
    date: "2026-09-10",
    priority: "عاجل",
    target: "الجميع"
  },
  {
    id: "ann-2",
    title: "مواعيد حافلات النقل المدرسي",
    content: "يرجى من أولياء الأمور المشتركين في خدمة النقل الالتزام بمواعيد التجمع الصباحية المحددة في الجدول لضمان وصول الطلاب في الوقت المحدد.",
    date: "2026-09-12",
    priority: "هام",
    target: "أولياء الأمور"
  }
];

export const initialHonorRoll = [
  {
    id: "hn-1",
    studentName: "سارة يوسف العلي",
    grade: "الثالث الأساسي",
    average: 98.6,
    rank: 1,
    title: "المركز الأول على مستوى المرحلة",
    avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "hn-2",
    studentName: "جاد عمر الرفاعي",
    grade: "الثاني الأساسي",
    average: 97.4,
    rank: 1,
    title: "المركز الأول في الرياضيات والعلوم",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80"
  },
  {
    id: "hn-3",
    studentName: "كريم يوسف العلي",
    grade: "الأول الأساسي",
    average: 96.8,
    rank: 2,
    title: "المركز الثاني متميز في القراءة والخط",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
  }
];

export const initialBuses = [
  {
    id: "bus-1",
    busNumber: "حافلة رقم 12 (سعة 24 راكب)",
    route: "خط الحمرا - الروشة - قريطم",
    driverName: "أبو خالد سليم",
    driverPhone: "+961 70 333 777",
    studentsCount: 18
  },
  {
    id: "bus-2",
    busNumber: "حافلة رقم 15 (سعة 30 راكب)",
    route: "خط الأشرفية - الدورة - فرن الشباك",
    driverName: "طوني حداد",
    driverPhone: "+961 71 222 999",
    studentsCount: 22
  }
];

export const initialGrades = [
  {
    id: "grd-1",
    studentId: "stu-1001",
    studentName: "كريم يوسف العلي",
    grade: "الأول الأساسي",
    subjectId: "s1",
    subjectName: "اللغة العربية",
    exam1: 18,
    exam2: 19,
    midterm: 38,
    finalExam: 39,
    total: 94,
    maxTotal: 100,
    status: "ممتاز"
  },
  {
    id: "grd-2",
    studentId: "stu-1001",
    studentName: "كريم يوسف العلي",
    grade: "الأول الأساسي",
    subjectId: "s2",
    subjectName: "الرياضيات",
    exam1: 19,
    exam2: 20,
    midterm: 40,
    finalExam: 38,
    total: 97,
    maxTotal: 100,
    status: "ممتاز"
  }
];
