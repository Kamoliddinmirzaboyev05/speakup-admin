/**
 * Admin data service — the single seam between the UI and the data source.
 *
 * Today every function resolves from the in-memory mock dataset. When the
 * backend admin API lands, swap each body for an `api.get(...)` call (see
 * `@/api/client`) and the pages/hooks above stay untouched.
 */
import type {
  User, Session, Payment, Plan, Question,
  LeaderboardEntry, PromoCode, ActivityLog,
  DashboardStats, ChartPoint,
} from "@/types";
import {
  mockUsers, mockSessions, mockPayments, mockPlans, mockQuestions,
  mockLeaderboard, mockPromoCodes, mockActivityLog,
  mockStats, mockUserGrowth, mockSessionsChart, mockRevenueChart,
} from "@/data/mock";
// import { api } from "@/api/client"; // ← uncomment when wiring the real API

/** Simulate network latency so loading states behave like production. */
function mock<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export interface DashboardData {
  stats: DashboardStats;
  userGrowth: ChartPoint[];
  sessionsChart: ChartPoint[];
  revenueChart: ChartPoint[];
  leaderboard: LeaderboardEntry[];
  activity: ActivityLog[];
}

export const adminService = {
  getUsers: (): Promise<User[]> => mock(mockUsers),
  // real: () => api.get<User[]>("/admin/users")

  getSessions: (): Promise<Session[]> => mock(mockSessions),
  // real: () => api.get<Session[]>("/admin/sessions")

  getPayments: (): Promise<Payment[]> => mock(mockPayments),
  getPlans: (): Promise<Plan[]> => mock(mockPlans),

  getQuestions: (): Promise<Question[]> => mock(mockQuestions),

  getLeaderboard: (): Promise<LeaderboardEntry[]> => mock(mockLeaderboard),

  getPromoCodes: (): Promise<PromoCode[]> => mock(mockPromoCodes),

  getActivityLog: (): Promise<ActivityLog[]> => mock(mockActivityLog),

  getDashboard: (): Promise<DashboardData> =>
    mock({
      stats: mockStats,
      userGrowth: mockUserGrowth,
      sessionsChart: mockSessionsChart,
      revenueChart: mockRevenueChart,
      leaderboard: mockLeaderboard,
      activity: mockActivityLog,
    }),
};
