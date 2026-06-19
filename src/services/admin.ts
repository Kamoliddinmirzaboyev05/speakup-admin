/**
 * Admin data service — talks to the real backend admin API.
 */
import { api } from "@/api/client";
import type { AdminStats, AdminUser, AdminUserList, AdminSessionList } from "@/types";

export interface UserQuery {
  search?: string;
  limit?: number;
  offset?: number;
}

export const adminService = {
  getStats: () => api.get<AdminStats>("/api/admin/stats"),

  getUsers: (params?: UserQuery) =>
    api.get<AdminUserList>("/api/admin/users", params),

  getUser: (id: number) => api.get<AdminUser>(`/api/admin/users/${id}`),

  getSessions: (params?: { limit?: number; offset?: number }) =>
    api.get<AdminSessionList>("/api/admin/sessions", params),
};
