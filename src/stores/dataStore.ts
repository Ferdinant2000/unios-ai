"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  University,
  Faculty,
  Department,
  Group,
  Student,
  Teacher,
  Subject,
  Course,
  Grade,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  Message,
  Conversation,
  Notification,
  Document,
  NewsEvent,
  Request,
  ScheduleItem,
  Room,
  AnalyticsData,
  AIInsight,
  AIChatMessage,
  AISuggestion,
  DashboardStats,
  FilterState,
  SortState,
} from "@/types";

interface DataState {
  university: University | null;
  faculties: Faculty[];
  departments: Department[];
  groups: Group[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  courses: Course[];
  grades: Grade[];
  attendanceRecords: AttendanceRecord[];
  assignments: Assignment[];
  exams: Exam[];
  scheduleItems: ScheduleItem[];
  rooms: Room[];
  messages: Message[];
  conversations: Conversation[];
  notifications: Notification[];
  documents: Document[];
  newsEvents: NewsEvent[];
  requests: Request[];
  analytics: AnalyticsData;
  aiInsights: AIInsight[];
  aiChatMessages: AIChatMessage[];
  aiSuggestions: AISuggestion[];
  dashboardStats: DashboardStats;
  isLoading: boolean;
  error: string | null;

  filters: FilterState;
  sort: SortState;

  setUniversity: (university: University) => void;
  setFaculties: (faculties: Faculty[]) => void;
  setDepartments: (departments: Department[]) => void;
  setGroups: (groups: Group[]) => void;
  setStudents: (students: Student[]) => void;
  setTeachers: (teachers: Teacher[]) => void;
  setSubjects: (subjects: Subject[]) => void;
  setCourses: (courses: Course[]) => void;
  setGrades: (grades: Grade[]) => void;
  setAttendanceRecords: (records: AttendanceRecord[]) => void;
  setAssignments: (assignments: Assignment[]) => void;
  setExams: (exams: Exam[]) => void;
  setScheduleItems: (items: ScheduleItem[]) => void;
  setRooms: (rooms: Room[]) => void;
  setMessages: (messages: Message[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  setDocuments: (documents: Document[]) => void;
  setNewsEvents: (events: NewsEvent[]) => void;
  setRequests: (requests: Request[]) => void;
  setAnalytics: (analytics: AnalyticsData) => void;
  setAIInsights: (insights: AIInsight[]) => void;
  setAIChatMessages: (messages: AIChatMessage[]) => void;
  setAISuggestions: (suggestions: AISuggestion[]) => void;
  setDashboardStats: (stats: DashboardStats) => void;

  addGrade: (grade: Grade) => void;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;

  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;

  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  addAssignmentSubmission: (assignmentId: string, submission: AssignmentSubmission) => void;
  updateAssignmentSubmission: (assignmentId: string, submissionId: string, updates: Partial<AssignmentSubmission>) => void;

  addExam: (exam: Exam) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  addScheduleItem: (item: ScheduleItem) => void;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;

  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;

  addNewsEvent: (event: NewsEvent) => void;
  updateNewsEvent: (id: string, updates: Partial<NewsEvent>) => void;
  deleteNewsEvent: (id: string) => void;

  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;

  addStudent: (student: Student) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  addTeacher: (teacher: Teacher) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  addGroup: (group: Group) => void;
  updateGroup: (id: string, updates: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  addSubject: (subject: Subject) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  recalculateStudentGPA: (studentId: string) => void;
  recalculateGroupStats: (groupId: string) => void;
  recalculateAnalytics: () => void;

  setFilters: (filters: Partial<FilterState>) => void;
  setSort: (sort: SortState) => void;
  resetFilters: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilters: FilterState = {
  search: "",
  semester: undefined,
  subject: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined,
  groupId: undefined,
  teacherId: undefined,
};

const initialSort: SortState = {
  field: "createdAt",
  direction: "desc",
};

const initialDashboardStats: DashboardStats = {
  gpa: 0,
  attendanceRate: 0,
  pendingAssignments: 0,
  upcomingExams: 0,
  creditsCompleted: 0,
  totalCredits: 0,
  currentSemester: 1,
};

const initialAnalytics: AnalyticsData = {
  overview: {
    totalStudents: 0,
    totalTeachers: 0,
    totalGroups: 0,
    totalSubjects: 0,
    averageGPA: 0,
    attendanceRate: 0,
    activeUsers: 0,
  },
  studentsByFaculty: [],
  studentsByYear: [],
  gpaTrends: [],
  attendanceTrends: [],
  facultyPerformance: [],
  teacherWorkload: [],
  assignmentCompletion: [],
  lowAttendanceGroups: [],
  failingStudents: [],
};

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      university: null,
      faculties: [],
      departments: [],
      groups: [],
      students: [],
      teachers: [],
      subjects: [],
      courses: [],
      grades: [],
      attendanceRecords: [],
      assignments: [],
      exams: [],
      scheduleItems: [],
      rooms: [],
      messages: [],
      conversations: [],
      notifications: [],
      documents: [],
      newsEvents: [],
      requests: [],
      analytics: initialAnalytics,
      aiInsights: [],
      aiChatMessages: [],
      aiSuggestions: [],
      dashboardStats: initialDashboardStats,
      isLoading: false,
      error: null,
      filters: initialFilters,
      sort: initialSort,

      setUniversity: (university) => set({ university }),
      setFaculties: (faculties) => set({ faculties }),
      setDepartments: (departments) => set({ departments }),
      setGroups: (groups) => set({ groups }),
      setStudents: (students) => set({ students }),
      setTeachers: (teachers) => set({ teachers }),
      setSubjects: (subjects) => set({ subjects }),
      setCourses: (courses) => set({ courses }),
      setGrades: (grades) => set({ grades }),
      setAttendanceRecords: (attendanceRecords) => set({ attendanceRecords }),
      setAssignments: (assignments) => set({ assignments }),
      setExams: (exams) => set({ exams }),
      setScheduleItems: (scheduleItems) => set({ scheduleItems }),
      setRooms: (rooms) => set({ rooms }),
      setMessages: (messages) => set({ messages }),
      setConversations: (conversations) => set({ conversations }),
      setNotifications: (notifications) => set({ notifications }),
      setDocuments: (documents) => set({ documents }),
      setNewsEvents: (newsEvents) => set({ newsEvents }),
      setRequests: (requests) => set({ requests }),
      setAnalytics: (analytics) => set({ analytics }),
      setAIInsights: (aiInsights) => set({ aiInsights }),
      setAIChatMessages: (aiChatMessages) => set({ aiChatMessages }),
      setAISuggestions: (aiSuggestions) => set({ aiSuggestions }),
      setDashboardStats: (dashboardStats) => set({ dashboardStats }),

      addGrade: (grade) =>
        set((state) => {
          const newGrades = [...state.grades, grade];
          return { grades: newGrades };
        }),

      updateGrade: (id, updates) =>
        set((state) => ({
          grades: state.grades.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g)),
        })),

      deleteGrade: (id) =>
        set((state) => ({
          grades: state.grades.filter((g) => g.id !== id),
        })),

      addAttendanceRecord: (record) =>
        set((state) => ({
          attendanceRecords: [...state.attendanceRecords, record],
        })),

      updateAttendanceRecord: (id, updates) =>
        set((state) => ({
          attendanceRecords: state.attendanceRecords.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      addAssignment: (assignment) =>
        set((state) => ({
          assignments: [...state.assignments, assignment],
        })),

      updateAssignment: (id, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),

      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      addAssignmentSubmission: (assignmentId, submission) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId ? { ...a, submissions: [...a.submissions, submission] } : a
          ),
        })),

      updateAssignmentSubmission: (assignmentId, submissionId, updates) =>
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  submissions: a.submissions.map((s) =>
                    s.id === submissionId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
                  ),
                }
              : a
          ),
        })),

      addExam: (exam) =>
        set((state) => ({
          exams: [...state.exams, exam],
        })),

      updateExam: (id, updates) =>
        set((state) => ({
          exams: state.exams.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      deleteExam: (id) =>
        set((state) => ({
          exams: state.exams.filter((e) => e.id !== id),
        })),

      addScheduleItem: (item) =>
        set((state) => ({
          scheduleItems: [...state.scheduleItems, item],
        })),

      updateScheduleItem: (id, updates) =>
        set((state) => ({
          scheduleItems: state.scheduleItems.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteScheduleItem: (id) =>
        set((state) => ({
          scheduleItems: state.scheduleItems.filter((s) => s.id !== id),
        })),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      markMessageAsRead: (messageId) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, isRead: true, readAt: new Date().toISOString() } : m
          ),
        })),

      addConversation: (conversation) =>
        set((state) => ({
          conversations: [...state.conversations, conversation],
        })),

      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),

      markNotificationAsRead: (notificationId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          ),
        })),

      markAllNotificationsAsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId && !n.isRead ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          ),
        })),

      addDocument: (document) =>
        set((state) => ({
          documents: [...state.documents, document],
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
          ),
        })),

      deleteDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
        })),

      addNewsEvent: (event) =>
        set((state) => ({
          newsEvents: [event, ...state.newsEvents],
        })),

      updateNewsEvent: (id, updates) =>
        set((state) => ({
          newsEvents: state.newsEvents.map((e) =>
            e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
          ),
        })),

      deleteNewsEvent: (id) =>
        set((state) => ({
          newsEvents: state.newsEvents.filter((e) => e.id !== id),
        })),

      addRequest: (request) =>
        set((state) => ({
          requests: [...state.requests, request],
        })),

      updateRequest: (id, updates) =>
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
          ),
        })),

      addStudent: (student) =>
        set((state) => ({
          students: [...state.students, student],
        })),

      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      addTeacher: (teacher) =>
        set((state) => ({
          teachers: [...state.teachers, teacher],
        })),

      updateTeacher: (id, updates) =>
        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTeacher: (id) =>
        set((state) => ({
          teachers: state.teachers.filter((t) => t.id !== id),
        })),

      addGroup: (group) =>
        set((state) => ({
          groups: [...state.groups, group],
        })),

      updateGroup: (id, updates) =>
        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
          ),
        })),

      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== id),
        })),

      addSubject: (subject) =>
        set((state) => ({
          subjects: [...state.subjects, subject],
        })),

      updateSubject: (id, updates) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        })),

      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        })),

      recalculateStudentGPA: (studentId) => {
        const { grades, students, updateStudent } = get();
        const studentGrades = grades.filter((g) => g.studentId === studentId);
        if (studentGrades.length === 0) return;

        const totalWeighted = studentGrades.reduce((sum, g) => sum + (g.value / g.maxValue) * g.weight * 4, 0);
        const totalWeight = studentGrades.reduce((sum, g) => sum + g.weight, 0);
        const gpa = totalWeight > 0 ? totalWeighted / totalWeight : 0;

        updateStudent(studentId, { gpa: Math.round(gpa * 100) / 100 });
      },

      recalculateGroupStats: (groupId) => {
        const { students, grades, attendanceRecords, groups, updateGroup } = get();
        const groupStudents = students.filter((s) => s.groupId === groupId);
        if (groupStudents.length === 0) return;

        const avgGPA = groupStudents.reduce((sum, s) => sum + s.gpa, 0) / groupStudents.length;

        const groupStudentIds = groupStudents.map((s) => s.id);
        const groupAttendance = attendanceRecords.filter((a) => groupStudentIds.includes(a.studentId));
        const presentCount = groupAttendance.filter((a) => a.status === "present").length;
        const attendanceRate = groupAttendance.length > 0 ? (presentCount / groupAttendance.length) * 100 : 0;

        updateGroup(groupId, {
          // These fields don't exist in Group type but could be added
        });
      },

      recalculateAnalytics: () => {
        const { students, teachers, groups, subjects, grades, attendanceRecords, assignments, setAnalytics } = get();

        const totalStudents = students.filter((s) => s.status === "active").length;
        const totalTeachers = teachers.filter((t) => t.status === "active").length;
        const totalGroups = groups.length;
        const totalSubjects = subjects.length;

        const activeStudents = students.filter((s) => s.status === "active");
        const averageGPA = activeStudents.length > 0
          ? activeStudents.reduce((sum, s) => sum + s.gpa, 0) / activeStudents.length
          : 0;

        const totalAttendance = attendanceRecords.length;
        const presentAttendance = attendanceRecords.filter((a) => a.status === "present").length;
        const attendanceRate = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

        const activeUsers = totalStudents + totalTeachers;

        const studentsByFaculty = [...new Set(students.map((s) => s.facultyId).filter(Boolean))].map((facultyId) => ({
          faculty: facultyId || "Unknown",
          count: students.filter((s) => s.facultyId === facultyId).length,
        }));

        const studentsByYear = [...new Set(students.map((s) => s.groupId).filter(Boolean))].map((groupId) => {
          const group = groups.find((g) => g.id === groupId);
          return { year: group?.year || 1, count: students.filter((s) => s.groupId === groupId).length };
        });

        const gpaTrends = [
          { period: "Sep 2024", averageGPA: 3.45 },
          { period: "Oct 2024", averageGPA: 3.52 },
          { period: "Nov 2024", averageGPA: 3.58 },
          { period: "Dec 2024", averageGPA: 3.61 },
          { period: "Jan 2025", averageGPA: 3.67 },
          { period: "Feb 2025", averageGPA: 3.72 },
        ];

        const attendanceTrends = [
          { period: "Sep 2024", rate: 88 },
          { period: "Oct 2024", rate: 90 },
          { period: "Nov 2024", rate: 89 },
          { period: "Dec 2024", rate: 91 },
          { period: "Jan 2025", rate: 92 },
          { period: "Feb 2025", rate: 92 },
        ];

        const facultyPerformance = studentsByFaculty.map((f) => {
          const facultyStudents = students.filter((s) => s.facultyId === f.faculty);
          const avgGPA = facultyStudents.length > 0
            ? facultyStudents.reduce((sum, s) => sum + s.gpa, 0) / facultyStudents.length
            : 0;
          const facultyAttendance = attendanceRecords.filter((a) =>
            facultyStudents.some((s) => s.id === a.studentId)
          );
          const presentCount = facultyAttendance.filter((a) => a.status === "present").length;
          const attendance = facultyAttendance.length > 0 ? (presentCount / facultyAttendance.length) * 100 : 0;
          return { faculty: f.faculty, gpa: Math.round(avgGPA * 100) / 100, attendance: Math.round(attendance), students: f.count };
        });

        const teacherWorkload = teachers.map((t) => ({
          teacher: `${t.firstName} ${t.lastName}`,
          hours: t.subjects.length * 4,
          students: students.filter((s) => t.groups.includes(s.groupId || "")).length,
          subjects: t.subjects.length,
        }));

        const assignmentCompletion = subjects.map((subj) => {
          const subjectAssignments = assignments.filter((a) => a.subjectId === subj.id);
          const completed = subjectAssignments.reduce((sum, a) => sum + a.submissions.filter((sub) => sub.status === "submitted" || sub.status === "graded").length, 0);
          const total = subjectAssignments.reduce((sum, a) => sum + a.submissions.length, 0);
          return { subject: subj.name, completed, total };
        });

        const lowAttendanceGroups = groups.map((g) => {
          const groupStudents = students.filter((s) => s.groupId === g.id);
          const groupAttendance = attendanceRecords.filter((a) => groupStudents.some((s) => s.id === a.studentId));
          const presentCount = groupAttendance.filter((a) => a.status === "present").length;
          const rate = groupAttendance.length > 0 ? (presentCount / groupAttendance.length) * 100 : 100;
          return { group: g.name, rate: Math.round(rate), students: groupStudents.length };
        }).filter((g) => g.rate < 85).sort((a, b) => a.rate - b.rate);

        const failingStudents = students
          .map((s) => {
            const studentGrades = grades.filter((g) => g.studentId === s.id);
            const failedSubjects = studentGrades.filter((g) => g.value < g.maxValue * 0.6).length;
            return { student: `${s.firstName} ${s.lastName}`, group: s.groupId || "", failedSubjects };
          })
          .filter((s) => s.failedSubjects > 0)
          .sort((a, b) => b.failedSubjects - a.failedSubjects);

        setAnalytics({
          overview: {
            totalStudents,
            totalTeachers,
            totalGroups,
            totalSubjects,
            averageGPA: Math.round(averageGPA * 100) / 100,
            attendanceRate: Math.round(attendanceRate),
            activeUsers,
          },
          studentsByFaculty,
          studentsByYear,
          gpaTrends,
          attendanceTrends,
          facultyPerformance,
          teacherWorkload,
          assignmentCompletion,
          lowAttendanceGroups,
          failingStudents,
        });
      },

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setSort: (sort) => set({ sort }),
      resetFilters: () => set({ filters: initialFilters, sort: initialSort }),

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: "unios-data",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        grades: state.grades,
        attendanceRecords: state.attendanceRecords,
        assignments: state.assignments,
        exams: state.exams,
        scheduleItems: state.scheduleItems,
        messages: state.messages,
        conversations: state.conversations,
        notifications: state.notifications,
        documents: state.documents,
        newsEvents: state.newsEvents,
        requests: state.requests,
        students: state.students,
        teachers: state.teachers,
        groups: state.groups,
        subjects: state.subjects,
        aiChatMessages: state.aiChatMessages,
        dashboardStats: state.dashboardStats,
      }),
    }
  )
);