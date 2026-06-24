/**
 * Admin data service — talks to the real backend admin API.
 */
import { api, apiClient } from "@/api/client";
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

  // Profile photo is auth-gated, so <img src> can't load it directly — fetch
  // the bytes with the Bearer token and wrap them in an object URL.
  getUserPhoto: async (id: number): Promise<string> => {
    const res = await apiClient.get(`/api/admin/users/${id}/photo`, {
      responseType: "blob",
    });
    return URL.createObjectURL(res.data as Blob);
  },

  deleteUser: (id: number) => api.delete<void>(`/api/admin/users/${id}`),
};
