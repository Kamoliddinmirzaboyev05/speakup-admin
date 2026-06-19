/**
 * Admin-account management — talks to the real backend (superadmin only).
 * GET/POST /api/admin/admins, PATCH/DELETE /api/admin/admins/{id}
 */
import { api } from "@/api/client";

export type AdminRole = "superadmin" | "admin";

export interface AdminAccount {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
}

export interface AdminCreateInput {
  email: string;
  name: string;
  password: string;
  role: AdminRole;
}

export interface AdminUpdateInput {
  name?: string;
  password?: string;
  role?: AdminRole;
  is_active?: boolean;
}

export const adminsService = {
  list: () => api.get<AdminAccount[]>("/api/admin/admins"),
  create: (input: AdminCreateInput) =>
    api.post<AdminAccount>("/api/admin/admins", input),
  update: (id: number, input: AdminUpdateInput) =>
    api.patch<AdminAccount>(`/api/admin/admins/${id}`, input),
  remove: (id: number) => api.delete<void>(`/api/admin/admins/${id}`),
};
