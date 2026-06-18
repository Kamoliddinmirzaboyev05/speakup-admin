import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Admin {
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
        // Mock auth — replace with real API call
        if (email === "admin@sayra.ai" && password === "admin123") {
          set({
            isAuthenticated: true,
            token: "mock-jwt-token-xxx",
            admin: {
              id: "adm_001",
              name: "Azizbek Karimov",
              email: "admin@sayra.ai",
              role: "superadmin",
            },
          });
          return true;
        }
        return false;
      },

      logout: () =>
        set({ isAuthenticated: false, admin: null, token: null }),

      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      setSidebarCollapsed: (v: boolean) =>
        set({ sidebarCollapsed: v }),
    }),
    { name: "sayra-admin-auth" }
  )
);
