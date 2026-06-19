/**
 * react-query hooks over the admin data service. Pages consume these instead
 * of importing mock data directly, so the data source is swappable in one place.
 */
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin";

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
