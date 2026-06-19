/**
 * react-query hooks over the real admin API.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService, type UserQuery } from "@/services/admin";
import {
  adminsService,
  type AdminCreateInput,
  type AdminUpdateInput,
} from "@/services/admins";

export const queryKeys = {
  stats: ["stats"] as const,
  users: ["users"] as const,
  sessions: ["sessions"] as const,
  admins: ["admins"] as const,
};

export const useStats = () =>
  useQuery({ queryKey: queryKeys.stats, queryFn: adminService.getStats });

export const useUsers = (params?: UserQuery) =>
  useQuery({
    queryKey: [...queryKeys.users, params ?? {}],
    queryFn: () => adminService.getUsers(params),
  });

export const useSessions = (params?: { limit?: number; offset?: number }) =>
  useQuery({
    queryKey: [...queryKeys.sessions, params ?? {}],
    queryFn: () => adminService.getSessions(params),
  });

// ── Admin accounts ───────────────────────────────────────────────────────────

export const useAdmins = () =>
  useQuery({ queryKey: queryKeys.admins, queryFn: adminsService.list });

export const useCreateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminCreateInput) => adminsService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};

export const useUpdateAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AdminUpdateInput }) =>
      adminsService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};

export const useDeleteAdmin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminsService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.admins }),
  });
};
