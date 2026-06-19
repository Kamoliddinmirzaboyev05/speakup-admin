/**
 * Billing admin service — plans, payments, settings, feedback, billing stats.
 * Talks to the real backend admin API.
 */
import { api, apiClient } from "@/api/client";
import type {
  Plan,
  PlanInput,
  Payment,
  PaymentStatus,
  BillingStats,
  AdminSettings,
  Feedback,
} from "@/types";

export const billingService = {
  // ── Plans (tariffs) ──────────────────────────────────────────────────────
  plans: () => api.get<Plan[]>("/api/admin/plans"),
  createPlan: (d: PlanInput) => api.post<Plan>("/api/admin/plans", d),
  updatePlan: (id: number, d: Partial<PlanInput>) =>
    api.patch<Plan>(`/api/admin/plans/${id}`, d),
  deletePlan: (id: number) => api.delete<void>(`/api/admin/plans/${id}`),

  // ── Payments ─────────────────────────────────────────────────────────────
  payments: (status?: PaymentStatus) =>
    api.get<Payment[]>("/api/admin/payments", status ? { status } : undefined),
  confirmPayment: (id: number) =>
    api.post<void>(`/api/admin/payments/${id}/confirm`),
  rejectPayment: (id: number) =>
    api.post<void>(`/api/admin/payments/${id}/reject`),
  // Screenshot must be fetched as a blob through the axios client so the
  // Bearer header is sent (a plain <img src> would not be authenticated).
  paymentScreenshot: (id: number) =>
    apiClient
      .get(`/api/admin/payments/${id}/screenshot`, { responseType: "blob" })
      .then((r) => r.data as Blob),

  // ── Billing stats ────────────────────────────────────────────────────────
  billingStats: () => api.get<BillingStats>("/api/admin/billing-stats"),

  // ── Settings ─────────────────────────────────────────────────────────────
  settings: () => api.get<AdminSettings>("/api/admin/settings"),
  updateSettings: (d: Partial<AdminSettings>) =>
    api.patch<AdminSettings>("/api/admin/settings", d),

  // ── Feedback moderation ──────────────────────────────────────────────────
  feedback: () => api.get<Feedback[]>("/api/admin/feedback"),
  approveFeedback: (id: number) =>
    api.post<void>(`/api/admin/feedback/${id}/approve`),
  rejectFeedback: (id: number) =>
    api.post<void>(`/api/admin/feedback/${id}/reject`),
};
