import type {
  User,
  Student,
  Teacher,
  Course,
  Grade,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  ScheduleItem,
  Room,
  Notification,
  Document,
  NewsEvent,
  Request as UserRequest,
  AnalyticsData,
  AIInsight,
  AIChatMessage,
  AISuggestion,
  DashboardStats,
} from "@/types";

interface TranscriptSegment {
  time: string;
  text: string;
}

interface Lecture {
  id: string;
  courseId: string;
  title: string;
  date: string;
  audioUrl: string;
  transcript: TranscriptSegment[];
  summary: string[];
}

export const DEMO_UNIVERSITY = {
  id: "univ-1",
  name: "Tashkent University of Information Technologies",
  code: "TUIT",
  address: "108, Amir Temur Avenue, Tashkent, Uzbekistan",
  phone: "+998712020202",
  email: "info@tuit.uz",
  website: "https://tuit.uz",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

export const DEMO_FACULTY = {
  id: "fac-1",
  universityId: "univ-1",
  name: "Faculty of Computer Science",
  code: "FCS",
  deanId: "teacher-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

export const DEMO_DEPARTMENT = {
  id: "dept-1",
  facultyId: "fac-1",
  name: "Department of Artificial Intelligence",
  code: "DAI",
  headId: "teacher-1",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

export const DEMO_GROUP: any = {
  id: "group-1",
  departmentId: "dept-1",
  name: "AI-24-01",
  code: "AI-24-01",
  year: 2,
  studentIds: ["student-1", "student-2", "student-3"],
  curatorId: "teacher-1",
  schedule: [],
  createdAt: "2024-09-01T00:00:00Z",
  updatedAt: new Date().toISOString(),
};

export const DEMO_STUDENTS: Student[] = [
  {
    id: "student-1",
    email: "student@unios.ai",
    password: "demo123",
    firstName: "Ahmed",
    lastName: "Karimov",
    middleName: "Rustamovich",
    role: "student",
    avatar: "AK",
    phone: "+998901234567",
    status: "active",
    universityId: "univ-1",
    facultyId: "fac-1",
    departmentId: "dept-1",
    groupId: "group-1",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    studentNumber: "STU-2024-001",
    enrollmentDate: "2024-09-01",
    gpa: 3.72,
    credits: 96,
    attendanceRate: 92,
  },
  {
    id: "student-2",
    email: "student2@unios.ai",
    password: "demo123",
    firstName: "Malika",
    lastName: "Yusupova",
    middleName: "Azizovna",
    role: "student",
    avatar: "MY",
    phone: "+998901234568",
    status: "active",
    universityId: "univ-1",
    facultyId: "fac-1",
    departmentId: "dept-1",
    groupId: "group-1",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    studentNumber: "STU-2024-002",
    enrollmentDate: "2024-09-01",
    gpa: 3.85,
    credits: 98,
    attendanceRate: 95,
  },
  {
    id: "student-3",
    email: "student3@unios.ai",
    password: "demo123",
    firstName: "Jasur",
    lastName: "Rahimov",
    middleName: "Bekzodovich",
    role: "student",
    avatar: "JR",
    phone: "+998901234569",
    status: "active",
    universityId: "univ-1",
    facultyId: "fac-1",
    departmentId: "dept-1",
    groupId: "group-1",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    studentNumber: "STU-2024-003",
    enrollmentDate: "2024-09-01",
    gpa: 3.45,
    credits: 90,
    attendanceRate: 88,
  },
];

export const DEMO_TEACHERS: Teacher[] = [
  {
    id: "teacher-1",
    email: "teacher@unios.ai",
    password: "demo123",
    firstName: "Dilshod",
    lastName: "Abdullayev",
    middleName: "Bakhtiyarovich",
    role: "teacher",
    avatar: "DA",
    phone: "+998901234568",
    status: "active",
    universityId: "univ-1",
    facultyId: "fac-1",
    departmentId: "dept-1",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2020-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
    position: "Senior Lecturer",
    hireDate: "2020-09-01",
    subjects: ["subj-1", "subj-2", "subj-3"],
    groups: ["group-1", "group-2"],
    office: "Room 305, Building A",
    officeHours: "Mon-Wed 14:00-16:00",
  },
  {
    id: "teacher-2",
    email: "teacher2@unios.ai",
    password: "demo123",
    firstName: "Nodira",
    lastName: "Yusupova",
    middleName: "Alisherovna",
    role: "teacher",
    avatar: "NY",
    phone: "+998901234569",
    status: "active",
    universityId: "univ-1",
    facultyId: "fac-1",
    departmentId: "dept-1",
    lastLoginAt: new Date().toISOString(),
    createdAt: "2019-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
    position: "Associate Professor",
    hireDate: "2019-01-15",
    subjects: ["subj-4", "subj-5"],
    groups: ["group-1"],
    office: "Room 201, Building B",
    officeHours: "Tue-Thu 10:00-12:00",
  },
];

export const DEMO_COURSES: Course[] = [
  {
    id: "c1",
    subjectId: "subj-1",
    teacherId: "teacher-1",
    groupId: "group-1",
    semester: 1,
    year: 2024,
    schedule: [],
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    subjectId: "subj-4",
    teacherId: "teacher-2",
    groupId: "group-1",
    semester: 1,
    year: 2024,
    schedule: [],
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
];

export const DEMO_SUBJECTS = [
  { id: "subj-1", name: "Artificial Intelligence", code: "AI-401", credits: 4, departmentId: "dept-1" },
  { id: "subj-2", name: "Machine Learning", code: "ML-301", credits: 4, departmentId: "dept-1" },
  { id: "subj-3", name: "Neural Networks", code: "NN-401", credits: 4, departmentId: "dept-1" },
  { id: "subj-4", name: "Economics", code: "ECO-210", credits: 3, departmentId: "dept-1" },
  { id: "subj-5", name: "Databases", code: "DB-310", credits: 4, departmentId: "dept-1" },
];

export const DEMO_LECTURES: Lecture[] = [
  {
    id: "lec-ai-neural",
    courseId: "c1",
    title: "Neural Networks: Architecture, Training and Regularization",
    date: "22 September 2026",
    audioUrl: "",
    transcript: [
      { time: "00:00", text: "Welcome to the lecture on neural networks. Today we will trace the path from perceptron to deep architectures. Let's start with a question: what distinguishes a neural network from classical machine learning algorithms? The key idea is that the model itself extracts features from data rather than relying on manual feature engineering." },
      { time: "05:12", text: "Let's look at activation functions. Sigmoid maps values to (0, 1) range, but with many layers its gradient vanishes — this is the vanishing gradient problem. That's why in practice for hidden layers we use ReLU: it's linear for positive values and zeroes out negative ones, which speeds up training and avoids saturation." },
      { time: "12:40", text: "Training a network is minimizing a loss function via gradient descent. We move weights in the direction of the anti-gradient with a step size called the learning rate. Too large a step — the model diverges, too small — it converges slowly. Batch size determines how many examples the network sees before updating weights." },
      { time: "24:16", text: "The main enemy of neural networks is overfitting: the model memorizes training data instead of generalizing to new data. We fight it with regularization: dropout randomly disables neurons during training, L2 regularization penalizes large weights, and early stopping halts training when validation error stops decreasing." },
    ],
    summary: [
      "Neural networks automatically extract features unlike classical ML algorithms.",
      "Sigmoid causes vanishing gradients in deep networks; ReLU is the standard for hidden layers.",
      "Gradient descent minimizes the loss function; learning rate and batch size are key hyperparameters.",
      "Overfitting is treated with dropout, L2 regularization, and early stopping.",
    ],
  },
  {
    id: "lec-ai-ml-intro",
    courseId: "c1",
    title: "Introduction to Machine Learning: Tasks and Types",
    date: "15 September 2026",
    audioUrl: "",
    transcript: [
      { time: "00:00", text: "Machine learning is a field of AI where systems learn to make decisions from data rather than explicit rules. We distinguish supervised, unsupervised, and reinforcement learning." },
      { time: "09:30", text: "Regression and classification are the main supervised learning tasks. In unsupervised learning we look for hidden structures, such as clustering students by knowledge groups." },
    ],
    summary: [
      "ML learns from data, not explicit rules.",
      "Three types of learning: supervised, unsupervised, and reinforcement.",
      "Classification and regression are basic supervised learning tasks.",
    ],
  },
  {
    id: "lec-eco-elasticity",
    courseId: "c2",
    title: "Price Elasticity of Demand and Supply",
    date: "20 September 2026",
    audioUrl: "",
    transcript: [
      { time: "00:00", text: "Elasticity shows how strongly demand reacts to price changes. Elasticity coefficient E = %ΔQ / %ΔP. If E > 1 — demand is elastic." },
      { time: "08:30", text: "Cross-price elasticity measures how the price change of one good affects demand for another. Positive value means goods are substitutes, negative means they are complements." },
      { time: "19:45", text: "Income elasticity shows demand reaction to consumer income changes. Necessity goods have low income elasticity, luxury goods have high income elasticity." },
    ],
    summary: [
      "Elasticity — reaction of demand to price change (E = %ΔQ / %ΔP).",
      "Cross-price elasticity > 0 — substitutes, < 0 — complements.",
      "Income elasticity distinguishes necessities from luxuries.",
    ],
  },
  {
    id: "lec-db-sql",
    courseId: "c3",
    title: "SQL and Database Normalization",
    date: "18 September 2026",
    audioUrl: "",
    transcript: [
      { time: "00:00", text: "SQL is a declarative query language for relational databases. Main operations: SELECT, INSERT, UPDATE, DELETE." },
      { time: "14:05", text: "Normalization eliminates redundancy and update anomalies. First normal form requires atomic values, second eliminates partial dependency, third eliminates transitive dependency." },
    ],
    summary: [
      "SQL is a declarative language for working with relational DBs.",
      "Normalization (1-3 NF) removes redundancy and anomalies.",
    ],
  },
];

export const DEMO_GRADES: Grade[] = [
  { id: "g1", studentId: "student-1", subjectId: "subj-1", teacherId: "teacher-1", type: "midterm", value: 85, maxValue: 100, weight: 0.3, date: "2024-10-15", semester: 1, createdAt: "2024-10-15T00:00:00Z", updatedAt: "2024-10-15T00:00:00Z" },
  { id: "g2", studentId: "student-1", subjectId: "subj-1", teacherId: "teacher-1", type: "final", value: 92, maxValue: 100, weight: 0.5, date: "2024-12-20", semester: 1, createdAt: "2024-12-20T00:00:00Z", updatedAt: "2024-12-20T00:00:00Z" },
  { id: "g3", studentId: "student-1", subjectId: "subj-4", teacherId: "teacher-2", type: "midterm", value: 78, maxValue: 100, weight: 0.3, date: "2024-10-18", semester: 1, createdAt: "2024-10-18T00:00:00Z", updatedAt: "2024-10-18T00:00:00Z" },
  { id: "g4", studentId: "student-1", subjectId: "subj-4", teacherId: "teacher-2", type: "final", value: 88, maxValue: 100, weight: 0.5, date: "2024-12-22", semester: 1, createdAt: "2024-12-22T00:00:00Z", updatedAt: "2024-12-22T00:00:00Z" },
];

export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  { id: "a1", studentId: "student-1", subjectId: "subj-1", teacherId: "teacher-1", scheduleItemId: "s1", date: "2024-09-10", status: "present", createdAt: "2024-09-10T00:00:00Z", updatedAt: "2024-09-10T00:00:00Z" },
  { id: "a2", studentId: "student-1", subjectId: "subj-1", teacherId: "teacher-1", scheduleItemId: "s2", date: "2024-09-12", status: "present", createdAt: "2024-09-12T00:00:00Z", updatedAt: "2024-09-12T00:00:00Z" },
  { id: "a3", studentId: "student-1", subjectId: "subj-4", teacherId: "teacher-2", scheduleItemId: "s3", date: "2024-09-11", status: "present", createdAt: "2024-09-11T00:00:00Z", updatedAt: "2024-09-11T00:00:00Z" },
];

export const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    subjectId: "subj-1",
    teacherId: "teacher-1",
    groupId: "group-1",
    title: "Neural Network Implementation",
    description: "Implement a simple neural network from scratch using NumPy",
    type: "project",
    assignedDate: "2024-09-15",
    dueDate: "2024-10-15",
    maxPoints: 100,
    attachments: [],
    submissions: [
      { id: "sub-1", assignmentId: "asg-1", studentId: "student-1", submittedAt: "2024-10-10T00:00:00Z", content: "GitHub link...", attachments: [], grade: 95, feedback: "Excellent work!", status: "graded", createdAt: "2024-10-10T00:00:00Z", updatedAt: "2024-10-10T00:00:00Z" },
    ],
    createdAt: "2024-09-15T00:00:00Z",
    updatedAt: "2024-09-15T00:00:00Z",
  },
];

export const DEMO_EXAMS: Exam[] = [
  { id: "exam-1", subjectId: "subj-1", teacherId: "teacher-1", groupId: "group-1", title: "AI Midterm", date: "2024-10-15", startTime: "10:00", endTime: "12:00", roomId: "room-1", type: "midterm", maxPoints: 100, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  { id: "exam-2", subjectId: "subj-4", teacherId: "teacher-2", groupId: "group-1", title: "Economics Final", date: "2024-12-20", startTime: "14:00", endTime: "16:00", roomId: "room-2", type: "final", maxPoints: 100, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
];

export const DEMO_ROOMS: Room[] = [
  { id: "room-1", name: "Lecture Hall A", code: "LH-A", building: "Building A", floor: 1, capacity: 200, type: "lecture", equipment: ["projector", "sound"], createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
  { id: "room-2", name: "Lecture Hall B", code: "LH-B", building: "Building B", floor: 1, capacity: 150, type: "lecture", equipment: ["projector", "sound"], createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];

export const DEMO_SCHEDULE: ScheduleItem[] = [
  { id: "s1", courseId: "c1", subjectId: "subj-1", teacherId: "teacher-1", groupId: "group-1", roomId: "room-1", dayOfWeek: 1, startTime: "10:00", endTime: "11:30", type: "lecture", weekType: "all", createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  { id: "s2", courseId: "c1", subjectId: "subj-1", teacherId: "teacher-1", groupId: "group-1", roomId: "room-1", dayOfWeek: 3, startTime: "10:00", endTime: "11:30", type: "lecture", weekType: "all", createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "student-1", type: "grade_added", title: "New Grade", content: "You received a grade of 92/100 for AI Final", isRead: false, priority: "high", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "n2", userId: "student-1", type: "assignment_due", title: "Assignment Due Soon", content: "Neural Network Implementation due in 2 days", isRead: false, priority: "medium", actionUrl: "/student/assignments/asg-1", actionLabel: "View", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const DEMO_DOCUMENTS: Document[] = [
  { id: "doc-1", ownerId: "student-1", title: "Student ID Card", description: "Official student identification", category: "id_card", fileUrl: "/docs/id-card.pdf", fileType: "pdf", fileSize: 204800, status: "active", issuedAt: "2024-09-01T00:00:00Z", createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
];

export const DEMO_NEWS: NewsEvent[] = [
  { id: "news-1", title: "AI Conference 2026", content: "Annual AI conference will be held on campus", type: "event", category: "academic", authorId: "admin-1", targetAudience: "all", publishDate: "2024-09-15T00:00:00Z", isPinned: true, attachments: [], views: 150, createdAt: "2024-09-15T00:00:00Z", updatedAt: "2024-09-15T00:00:00Z" },
];

export const DEMO_REQUESTS: UserRequest[] = [
  { id: "req-1", studentId: "student-1", type: "document", status: "pending", title: "Transcript Request", description: "Need official transcript for scholarship application", documents: [], createdAt: "2024-09-10T00:00:00Z", updatedAt: "2024-09-10T00:00:00Z" },
];

export const DEMO_ANALYTICS: AnalyticsData = {
  overview: {
    totalStudents: 3,
    totalTeachers: 2,
    totalGroups: 1,
    totalSubjects: 5,
    averageGPA: 3.67,
    attendanceRate: 92,
    activeUsers: 5,
  },
  studentsByFaculty: [{ faculty: "fac-1", count: 3 }],
  studentsByYear: [{ year: 2, count: 3 }],
  gpaTrends: [
    { period: "Sep 2024", averageGPA: 3.45 },
    { period: "Oct 2024", averageGPA: 3.52 },
    { period: "Nov 2024", averageGPA: 3.58 },
    { period: "Dec 2024", averageGPA: 3.61 },
    { period: "Jan 2025", averageGPA: 3.67 },
    { period: "Feb 2025", averageGPA: 3.72 },
  ],
  attendanceTrends: [
    { period: "Sep 2024", rate: 88 },
    { period: "Oct 2024", rate: 90 },
    { period: "Nov 2024", rate: 89 },
    { period: "Dec 2024", rate: 91 },
    { period: "Jan 2025", rate: 92 },
    { period: "Feb 2025", rate: 92 },
  ],
  facultyPerformance: [{ faculty: "fac-1", gpa: 3.67, attendance: 92, students: 3 }],
  teacherWorkload: [
    { teacher: "Dilshod Abdullayev", hours: 12, students: 3, subjects: 3 },
    { teacher: "Nodira Yusupova", hours: 8, students: 3, subjects: 2 },
  ],
  assignmentCompletion: [
    { subject: "Artificial Intelligence", completed: 1, total: 1 },
    { subject: "Economics", completed: 0, total: 0 },
  ],
  lowAttendanceGroups: [],
  failingStudents: [],
};

export const DEMO_AI_INSIGHTS: AIInsight[] = [
  {
    id: "ai-1",
    type: "warning",
    category: "attendance",
    title: "Attendance Drop Detected",
    description: "Group AI-24-01 attendance dropped below 85% this week",
    data: { groupId: "group-1", rate: 82 },
    suggestedAction: "Contact curator and schedule check-ins",
    confidence: 0.87,
    createdAt: new Date().toISOString(),
    targetRole: ["teacher", "admin"],
    targetEntityIds: ["group-1"],
  },
];

export const DEMO_AI_SUGGESTIONS: AISuggestion[] = [
  { id: "sug-1", text: "Review lecture on vanishing gradients", category: "study", icon: "BookOpen" },
  { id: "sug-2", text: "Practice quiz on elasticity", category: "quiz", icon: "HelpCircle" },
  { id: "sug-3", text: "Ask professor about batch size optimization", category: "question", icon: "MessageSquareText" },
];

export const DEMO_DASHBOARD_STATS: DashboardStats = {
  gpa: 3.72,
  attendanceRate: 92,
  pendingAssignments: 1,
  upcomingExams: 2,
  creditsCompleted: 96,
  totalCredits: 120,
  currentSemester: 1,
};

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  
  const existing = localStorage.getItem("unios-data");
  if (existing) return;
  
  const initialData = {
    university: DEMO_UNIVERSITY,
    faculties: [DEMO_FACULTY],
    departments: [DEMO_DEPARTMENT],
    groups: [DEMO_GROUP],
    students: DEMO_STUDENTS,
    teachers: DEMO_TEACHERS,
    subjects: DEMO_SUBJECTS,
    courses: DEMO_COURSES,
    grades: DEMO_GRADES,
    attendanceRecords: DEMO_ATTENDANCE,
    assignments: DEMO_ASSIGNMENTS,
    exams: DEMO_EXAMS,
    rooms: DEMO_ROOMS,
    scheduleItems: DEMO_SCHEDULE,
    notifications: DEMO_NOTIFICATIONS,
    documents: DEMO_DOCUMENTS,
    newsEvents: DEMO_NEWS,
    requests: DEMO_REQUESTS,
    analytics: DEMO_ANALYTICS,
    aiInsights: DEMO_AI_INSIGHTS,
    aiSuggestions: DEMO_AI_SUGGESTIONS,
    dashboardStats: DEMO_DASHBOARD_STATS,
    aiChatMessages: [],
  };
  
  localStorage.setItem("unios-data", JSON.stringify(initialData));
}