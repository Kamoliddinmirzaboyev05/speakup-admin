/**
 * react-query hooks over the admin data service. Pages consume these instead
 * of importing mock data directly, so the data source is swappable in one place.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin";
import {
  adminsService,
  type AdminCreateInput,
  type AdminUpdateInput,
} from "@/services/admins";

export const queryKeys = {
  users: ["users"] as const,
  sessions: ["sessions"] as const,
  payments: ["payments"] as const,
  plans: ["plans"] as const,
  questions: ["questions"] as const,
  leaderboard: ["leaderboard"] as const,
  promoCodes: ["promo-codes"] as const,
  activity: ["activity"] as const,
  dashboard: ["dashboard"] as const,
  admins: ["admins"] as const,
};

export const useUsers = () =>
  useQuery({ queryKey: queryKeys.users, queryFn: adminService.getUsers });

export const useSessions = () =>
  useQuery({ queryKey: queryKeys.sessions, queryFn: adminService.getSessions });

export const usePayments = () =>
  useQuery({ queryKey: queryKeys.payments, queryFn: adminService.getPayments });

export const usePlans = () =>
  useQuery({ queryKey: queryKeys.plans, queryFn: adminService.getPlans });

export const useQuestions = () =>
  useQuery({ queryKey: queryKeys.questions, queryFn: adminService.getQuestions });

export const useLeaderboard = () =>
  useQuery({ queryKey: queryKeys.leaderboard, queryFn: adminService.getLeaderboard });

export const usePromoCodes = () =>
  useQuery({ queryKey: queryKeys.promoCodes, queryFn: adminService.getPromoCodes });

export const useActivityLog = () =>
  useQuery({ queryKey: queryKeys.activity, queryFn: adminService.getActivityLog });

export const useDashboard = () =>
  useQuery({ queryKey: queryKeys.dashboard, queryFn: adminService.getDashboard });

// ── Admin accounts (real backend) ────────────────────────────────────────────

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
