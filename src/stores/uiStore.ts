"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Role } from "@/types";

interface UIState {
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  language: "ru" | "uz" | "en";
  activeModal: string | null;
  modalData: Record<string, unknown>;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    duration?: number;
  }>;
  searchQuery: string;
  searchResults: Array<{ id: string; type: string; title: string; subtitle: string; url: string }>;
  isSearchOpen: boolean;
  demoMode: boolean;
  currentDemoRole: Role | null;
  breadcrumbs: Array<{ label: string; href?: string }>;
  pageTitle: string;
  pageSubtitle: string;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: "ru" | "uz" | "en") => void;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<UIState["notifications"][0], "id">) => void;
  removeNotification: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: UIState["searchResults"]) => void;
  setSearchOpen: (open: boolean) => void;
  setDemoMode: (enabled: boolean) => void;
  setCurrentDemoRole: (role: Role | null) => void;
  setBreadcrumbs: (breadcrumbs: UIState["breadcrumbs"]) => void;
  setPageTitle: (title: string, subtitle?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      mobileSidebarOpen: false,
      theme: "dark",
      language: "ru",
      activeModal: null,
      modalData: {},
      notifications: [],
      searchQuery: "",
      searchResults: [],
      isSearchOpen: false,
      demoMode: false,
      currentDemoRole: null,
      breadcrumbs: [],
      pageTitle: "",
      pageSubtitle: "",

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: {} }),
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = { ...notification, id };
        set((state) => ({ notifications: [...state.notifications, newNotification] }));
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, notification.duration || 5000);
        }
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setDemoMode: (enabled) => set({ demoMode: enabled }),
      setCurrentDemoRole: (role) => set({ currentDemoRole: role }),
      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      setPageTitle: (title, subtitle = "") => set({ pageTitle: title, pageSubtitle: subtitle }),
    }),
    {
      name: "unios-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        language: state.language,
        demoMode: state.demoMode,
      }),
    }
  )
);