import type {
  User,
  Student,
  Teacher,
  Admin,
  Director,
  Role,
  University,
  Faculty,
  Department,
  Group,
  Subject,
  Course,
  Grade,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Exam,
  ScheduleItem,
  Room,
  Message,
  Conversation,
  Notification,
  Document,
  NewsEvent,
  Request,
  AnalyticsData,
  AIInsight,
  DashboardStats,
  FilterState,
  SortState,
  PaginationState,
  TableState,
} from "@/types";

export const generateId = (prefix = "") => `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const formatDate = (date: Date | string, format: "short" | "long" | "time" | "datetime" = "short"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const options = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    time: { hour: "2-digit", minute: "2-digit" },
    datetime: { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" },
  }[format] as Intl.DateTimeFormatOptions;
  return d.toLocaleDateString("ru-RU", options);
};

export const calculateGPA = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const totalWeighted = grades.reduce((sum, g) => sum + (g.value / g.maxValue) * g.weight * 4, 0);
  const totalWeight = grades.reduce((sum, g) => sum + g.weight, 0);
  return totalWeight > 0 ? Math.round((totalWeighted / totalWeight) * 100) / 100 : 0;
};

export const calculateAttendanceRate = (records: AttendanceRecord[]): number => {
  if (records.length === 0) return 100;
  const present = records.filter((r) => r.status === "present").length;
  return Math.round((present / records.length) * 100);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    inactive: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
    pending: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    present: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    absent: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    late: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
    excused: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    submitted: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    graded: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    returned: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
    approved: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    rejected: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    processing: "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30",
    draft: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
    expired: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    revoked: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  };
  return colors[status] || colors.inactive;
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30",
    medium: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    high: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30",
    urgent: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
  };
  return colors[priority] || colors.medium;
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
};

export const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(" ");
};

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const filterData = <T extends Record<string, unknown>>(
  data: T[],
  filters: FilterState,
  searchFields: (keyof T)[]
): T[] => {
  return data.filter((item) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return typeof value === "string" && value.toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }
    if (filters.semester && (item as { semester?: number }).semester !== filters.semester) return false;
    if (filters.subject && (item as { subjectId?: string }).subjectId !== filters.subject) return false;
    if (filters.status && (item as { status?: string }).status !== filters.status) return false;
    if (filters.groupId && (item as { groupId?: string }).groupId !== filters.groupId) return false;
    if (filters.teacherId && (item as { teacherId?: string }).teacherId !== filters.teacherId) return false;
    if (filters.dateFrom && item.date && new Date(item.date as string) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && item.date && new Date(item.date as string) > new Date(filters.dateTo)) return false;
    return true;
  });
};

export const sortData = <T extends Record<string, unknown>>(
  data: T[],
  sort: SortState
): T[] => {
  return [...data].sort((a, b) => {
    const aVal = a[sort.field];
    const bVal = b[sort.field];
    if (aVal == null || bVal == null) return 0;
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sort.direction === "asc" ? comparison : -comparison;
  });
};

export const paginateData = <T>(data: T[], pagination: PaginationState): { data: T[]; pagination: PaginationState } => {
  const start = (pagination.page - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return {
    data: data.slice(start, end),
    pagination: { ...pagination, total: data.length },
  };
};

export const createTableState = <T extends Record<string, unknown>>(
  data: T[],
  filters: FilterState,
  sort: SortState,
  pagination: PaginationState,
  searchFields: (keyof T)[]
): TableState<T> => {
  const filtered = filterData(data, filters, searchFields);
  const sorted = sortData(filtered, sort);
  const { data: paginatedData, pagination: newPagination } = paginateData(sorted, pagination);
  return {
    data: paginatedData,
    filters,
    pagination: newPagination,
    sort,
    loading: false,
  };
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone.replace(/\s/g, ""));
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    student: "Студент",
    teacher: "Преподаватель",
    admin: "Администратор",
    director: "Директор",
  };
  return labels[role];
};

export const getRoleColor = (role: Role): string => {
  const colors: Record<Role, string> = {
    student: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
    teacher: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30",
    admin: "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
    director: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  };
  return colors[role];
};

export const hasPermission = (user: User, permission: string): boolean => {
  if (user.role === "admin") {
    return (user as Admin).permissions.includes(permission as any);
  }
  if (user.role === "director") return true;
  return false;
};

export const canAccessRoute = (userRole: Role, allowedRoles: Role[]): boolean => {
  return allowedRoles.includes(userRole);
};

export const formatNumber = (num: number, decimals = 0): string => {
  return num.toLocaleString("ru-RU", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const getRelativeTime = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return formatDate(d, "short");
};

export const generateMockId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};