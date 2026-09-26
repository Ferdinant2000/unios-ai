export type Role = 'student' | 'teacher' | 'admin' | 'director';

export type UserStatus = 'active' | 'inactive' | 'pending';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface University extends BaseEntity {
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  faculties: Faculty[];
}

export interface Faculty extends BaseEntity {
  id: string;
  universityId: string;
  name: string;
  code: string;
  deanId?: string;
  departments: Department[];
}

export interface Department extends BaseEntity {
  id: string;
  facultyId: string;
  name: string;
  code: string;
  headId?: string;
  groups: Group[];
}

export interface Group extends BaseEntity {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  year: number;
  studentIds: string[];
  curatorId?: string;
  schedule: ScheduleItem[];
}

export interface User extends BaseEntity {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  role: Role;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  universityId: string;
  facultyId?: string;
  departmentId?: string;
  groupId?: string;
  lastLoginAt?: string;
}

export interface Student extends User {
  role: 'student';
  groupId: string;
  studentNumber: string;
  enrollmentDate: string;
  gpa: number;
  credits: number;
  attendanceRate: number;
}

export interface Teacher extends User {
  role: 'teacher';
  departmentId: string;
  position: string;
  hireDate: string;
  subjects: string[];
  groups: string[];
  office?: string;
  officeHours?: string;
}

export interface Admin extends User {
  role: 'admin';
  permissions: AdminPermission[];
}

export interface Director extends User {
  role: 'director';
  facultyId?: string;
}

export type AdminPermission =
  | 'manage_users'
  | 'manage_groups'
  | 'manage_subjects'
  | 'manage_schedule'
  | 'manage_documents'
  | 'manage_requests'
  | 'manage_announcements'
  | 'view_analytics'
  | 'manage_settings';

export interface Subject extends BaseEntity {
  id: string;
  name: string;
  code: string;
  description: string;
  credits: number;
  semester: number;
  teacherId: string;
  groupIds: string[];
  departmentId: string;
  type: 'lecture' | 'practice' | 'lab' | 'seminar';
  hoursPerWeek: number;
}

export interface Course extends BaseEntity {
  id: string;
  subjectId: string;
  teacherId: string;
  groupId: string;
  semester: number;
  year: number;
  schedule: ScheduleItem[];
}

export interface ScheduleItem extends BaseEntity {
  id: string;
  courseId?: string;
  subjectId: string;
  teacherId: string;
  groupId: string;
  roomId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'practice' | 'lab' | 'seminar' | 'exam';
  weekType: 'all' | 'odd' | 'even';
}

export interface Room extends BaseEntity {
  id: string;
  name: string;
  code: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'lecture' | 'lab' | 'computer' | 'conference';
  equipment: string[];
}

export interface Grade extends BaseEntity {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  type: 'homework' | 'quiz' | 'midterm' | 'final' | 'project' | 'participation';
  value: number;
  maxValue: number;
  weight: number;
  date: string;
  comment?: string;
  semester: number;
}

export interface AttendanceRecord extends BaseEntity {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  scheduleItemId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  comment?: string;
}

export interface Assignment extends BaseEntity {
  id: string;
  subjectId: string;
  teacherId: string;
  groupId: string;
  title: string;
  description: string;
  type: 'homework' | 'project' | 'essay' | 'lab_report' | 'presentation';
  assignedDate: string;
  dueDate: string;
  maxPoints: number;
  attachments: Attachment[];
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission extends BaseEntity {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string;
  content: string;
  attachments: Attachment[];
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'returned' | 'late';
}

export interface Attachment extends BaseEntity {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
}

export interface Exam extends BaseEntity {
  id: string;
  subjectId: string;
  teacherId: string;
  groupId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  type: 'midterm' | 'final' | 'makeup' | 'quiz';
  maxPoints: number;
  description?: string;
}

export interface Message extends BaseEntity {
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  attachments: Attachment[];
  threadId?: string;
}

export interface Conversation extends BaseEntity {
  id: string;
  participantIds: string[];
  groupId?: string;
  subject?: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
}

export interface Notification extends BaseEntity {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

export type NotificationType =
  | 'grade_added'
  | 'grade_updated'
  | 'assignment_created'
  | 'assignment_due'
  | 'assignment_graded'
  | 'exam_scheduled'
  | 'exam_reminder'
  | 'attendance_warning'
  | 'message_received'
  | 'announcement'
  | 'document_updated'
  | 'schedule_changed'
  | 'system';

export interface Document extends BaseEntity {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: 'id_card' | 'enrollment' | 'certificate' | 'transcript' | 'diploma' | 'medical' | 'other';
  fileUrl: string;
  fileType: string;
  fileSize: number;
  status: 'draft' | 'active' | 'expired' | 'revoked';
  issuedBy?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface NewsEvent extends BaseEntity {
  id: string;
  title: string;
  content: string;
  type: 'news' | 'event' | 'announcement';
  category: 'academic' | 'sports' | 'cultural' | 'administrative' | 'research';
  authorId: string;
  targetAudience: 'all' | 'students' | 'teachers' | 'admins' | 'specific_group';
  targetGroupIds?: string[];
  publishDate: string;
  expiryDate?: string;
  isPinned: boolean;
  attachments: Attachment[];
  views: number;
}

export interface Request extends BaseEntity {
  id: string;
  studentId: string;
  type: 'document' | 'leave' | 'transfer' | 'reinstatement' | 'scholarship' | 'other';
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  title: string;
  description: string;
  assignedTo?: string;
  processedAt?: string;
  processedBy?: string;
  rejectionReason?: string;
  documents: Attachment[];
}

export interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalTeachers: number;
    totalGroups: number;
    totalSubjects: number;
    averageGPA: number;
    attendanceRate: number;
    activeUsers: number;
  };
  studentsByFaculty: { faculty: string; count: number }[];
  studentsByYear: { year: number; count: number }[];
  gpaTrends: { period: string; averageGPA: number }[];
  attendanceTrends: { period: string; rate: number }[];
  facultyPerformance: { faculty: string; gpa: number; attendance: number; students: number }[];
  teacherWorkload: { teacher: string; hours: number; students: number; subjects: number }[];
  assignmentCompletion: { subject: string; completed: number; total: number }[];
  lowAttendanceGroups: { group: string; rate: number; students: number }[];
  failingStudents: { student: string; group: string; failedSubjects: number }[];
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'recommendation';
  category: 'attendance' | 'grades' | 'engagement' | 'workload' | 'retention';
  title: string;
  description: string;
  data: Record<string, unknown>;
  suggestedAction: string;
  confidence: number;
  createdAt: string;
  targetRole: Role[];
  targetEntityIds?: string[];
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sender?: 'user' | 'ai';
  text?: string;
  metadata?: {
    actionType?: 'navigate' | 'show_data' | 'generate' | 'analyze';
    targetPage?: string;
    data?: unknown;
  };
}

export interface AISuggestion {
  id: string;
  text: string;
  category: string;
  icon: string;
}

export interface AskLectureResponse {
  fallback: boolean;
  error?: string;
  answer?: string;
  timestampRef?: string;
  sources?: { timestamp: string; text: string }[];
}

export interface ChatMessage {
  id: string;
  sender?: 'user' | 'ai';
  text?: string;
  role?: 'user' | 'assistant' | 'system';
  content?: string;
  timestamp?: string;
  timestampRef?: string;
}

export interface DashboardStats {
  gpa: number;
  attendanceRate: number;
  pendingAssignments: number;
  upcomingExams: number;
  creditsCompleted: number;
  totalCredits: number;
  currentSemester: number;
}

export type ScheduleViewType = 'day' | 'week' | 'month';

export interface FilterState {
  search: string;
  semester?: number;
  subject?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  groupId?: string;
  teacherId?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableState<T> {
  data: T[];
  filters: FilterState;
  pagination: PaginationState;
  sort: SortState;
  loading: boolean;
  error?: string;
}