import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginAdmin } from "@/services/auth";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin";
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  sidebarCollapsed: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      admin: null,
      token: null,
      sidebarCollapsed: false,

      login: async (email: string, password: string) => {
        try {
          const { token, admin } = await loginAdmin(email, password);
          set({ isAuthenticated: true, token, admin });
          return true;
        } catch {
          return false;
        }
      },

      logout: () => set({ isAuthenticated: false, admin: null, token: null }),

      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
    }),
    {
      name: "speakup-admin-auth",
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        admin: s.admin,
        token: s.token,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
    }
  )
);
