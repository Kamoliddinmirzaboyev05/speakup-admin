/**
 * Admin auth service — talks to the real backend.
 * POST {VITE_API_URL}/api/admin/auth/login -> { token, admin }.
 */
import type { Admin } from "@/store/authStore";
import { api } from "@/api/client";

export interface LoginResult {
  token: string;
  admin: Admin;
}

interface AdminLoginResponse {
  token: string;
  admin: {
    id: number;
    name: string;
    email: string;
    role: "superadmin" | "admin";
  };
}

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const res = await api.post<AdminLoginResponse>("/api/admin/auth/login", {
    email: email.trim().toLowerCase(),
    password,
  });
  return {
    token: res.token,
    admin: {
      id: String(res.admin.id),
      name: res.admin.name,
      email: res.admin.email,
      role: res.admin.role,
    },
  };
}
