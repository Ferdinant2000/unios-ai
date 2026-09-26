"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Role, Student, Teacher, Admin, Director } from "@/types";

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User, role: Role) => void;
  switchRole: (role: Role) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const DEMO_CREDENTIALS: Record<string, { password: string; role: Role; user: User }> = {
  "student@unios.ai": {
    password: "demo123",
    role: "student",
    user: {
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
    } as Student,
  },
  "teacher@unios.ai": {
    password: "demo123",
    role: "teacher",
    user: {
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
    } as Teacher,
  },
  "admin@unios.ai": {
    password: "demo123",
    role: "admin",
    user: {
      id: "admin-1",
      email: "admin@unios.ai",
      password: "demo123",
      firstName: "Malika",
      lastName: "Toshpulatova",
      middleName: "Safarovna",
      role: "admin",
      avatar: "MT",
      phone: "+998901234569",
      status: "active",
      universityId: "univ-1",
      facultyId: "fac-1",
      lastLoginAt: new Date().toISOString(),
      createdAt: "2018-01-15T00:00:00Z",
      updatedAt: new Date().toISOString(),
      permissions: [
        "manage_users",
        "manage_groups",
        "manage_subjects",
        "manage_schedule",
        "manage_documents",
        "manage_requests",
        "manage_announcements",
        "view_analytics",
        "manage_settings",
      ],
    } as Admin,
  },
  "director@unios.ai": {
    password: "demo123",
    role: "director",
    user: {
      id: "director-1",
      email: "director@unios.ai",
      password: "demo123",
      firstName: "Ravshan",
      lastName: "Murodov",
      middleName: "Alisherovich",
      role: "director",
      avatar: "RM",
      phone: "+998901234570",
      status: "active",
      universityId: "univ-1",
      facultyId: "fac-1",
      lastLoginAt: new Date().toISOString(),
      createdAt: "2015-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    } as Director,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 500));

        const demoUser = DEMO_CREDENTIALS[email.toLowerCase()];
        if (demoUser && demoUser.password === password) {
          const user = { ...demoUser.user, lastLoginAt: new Date().toISOString() };
          set({ user, role: demoUser.role, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ user: null, role: null, isAuthenticated: false });
      },

      setUser: (user: User, role: Role) => {
        set({ user, role, isAuthenticated: true });
      },

      switchRole: async (role: Role) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));

        const emails: Record<Role, string> = {
          student: "student@unios.ai",
          teacher: "teacher@unios.ai",
          admin: "admin@unios.ai",
          director: "director@unios.ai",
        };

        const demoUser = DEMO_CREDENTIALS[emails[role]];
        if (demoUser) {
          const user = { ...demoUser.user, lastLoginAt: new Date().toISOString() };
          set({ user, role: demoUser.role, isAuthenticated: true, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates, updatedAt: new Date().toISOString() } });
        }
      },
    }),
    {
      name: "unios-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);