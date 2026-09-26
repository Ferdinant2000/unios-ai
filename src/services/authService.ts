import type { User, Student, Teacher, Admin, Director, Role } from '@/types';

const DEMO_USERS: Record<string, { password: string; role: Role; user: User }> = {
  'student@unios.ai': {
    password: 'demo123',
    role: 'student',
    user: {
      id: 'student-1',
      email: 'student@unios.ai',
      password: 'demo123',
      firstName: 'Ahmed',
      lastName: 'Karimov',
      middleName: 'Rustamovich',
      role: 'student',
      avatar: 'AK',
      phone: '+998901234567',
      status: 'active',
      universityId: 'univ-1',
      facultyId: 'fac-1',
      departmentId: 'dept-1',
      groupId: 'group-1',
      lastLoginAt: new Date().toISOString(),
      createdAt: '2024-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      studentNumber: 'STU-2024-001',
      enrollmentDate: '2024-09-01',
      gpa: 3.72,
      credits: 96,
      attendanceRate: 92,
    } as Student,
  },
  'teacher@unios.ai': {
    password: 'demo123',
    role: 'teacher',
    user: {
      id: 'teacher-1',
      email: 'teacher@unios.ai',
      password: 'demo123',
      firstName: 'Dilshod',
      lastName: 'Abdullayev',
      middleName: 'Bakhtiyarovich',
      role: 'teacher',
      avatar: 'DA',
      phone: '+998901234568',
      status: 'active',
      universityId: 'univ-1',
      facultyId: 'fac-1',
      departmentId: 'dept-1',
      lastLoginAt: new Date().toISOString(),
      createdAt: '2020-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
      position: 'Senior Lecturer',
      hireDate: '2020-09-01',
      subjects: ['subj-1', 'subj-2', 'subj-3'],
      groups: ['group-1', 'group-2'],
      office: 'Room 305, Building A',
      officeHours: 'Mon-Wed 14:00-16:00',
    } as Teacher,
  },
  'admin@unios.ai': {
    password: 'demo123',
    role: 'admin',
    user: {
      id: 'admin-1',
      email: 'admin@unios.ai',
      password: 'demo123',
      firstName: 'Malika',
      lastName: 'Toshpulatova',
      middleName: 'Safarovna',
      role: 'admin',
      avatar: 'MT',
      phone: '+998901234569',
      status: 'active',
      universityId: 'univ-1',
      facultyId: 'fac-1',
      lastLoginAt: new Date().toISOString(),
      createdAt: '2018-01-15T00:00:00Z',
      updatedAt: new Date().toISOString(),
      permissions: [
        'manage_users',
        'manage_groups',
        'manage_subjects',
        'manage_schedule',
        'manage_documents',
        'manage_requests',
        'manage_announcements',
        'view_analytics',
        'manage_settings',
      ],
    } as Admin,
  },
  'director@unios.ai': {
    password: 'demo123',
    role: 'director',
    user: {
      id: 'director-1',
      email: 'director@unios.ai',
      password: 'demo123',
      firstName: 'Ravshan',
      lastName: 'Murodov',
      middleName: 'Alisherovich',
      role: 'director',
      avatar: 'RM',
      phone: '+998901234570',
      status: 'active',
      universityId: 'univ-1',
      facultyId: 'fac-1',
      lastLoginAt: new Date().toISOString(),
      createdAt: '2015-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    } as Director,
  },
};

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; role: Role } | null> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const demoUser = DEMO_USERS[email.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      return { user: demoUser.user, role: demoUser.role };
    }
    return null;
  },

  async getUserById(id: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    for (const demoUser of Object.values(DEMO_USERS)) {
      if (demoUser.user.id === id) {
        return demoUser.user;
      }
    }
    return null;
  },

  async getDemoUsers(): Promise<Array<{ email: string; role: Role; name: string }>> {
    return Object.entries(DEMO_USERS).map(([email, data]) => ({
      email,
      role: data.role,
      name: `${data.user.firstName} ${data.user.lastName}`,
    }));
  },

  getRoleFromEmail(email: string): Role | null {
    const demoUser = DEMO_USERS[email.toLowerCase()];
    return demoUser?.role || null;
  },
};