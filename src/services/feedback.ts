/**
 * Feedback moderation admin service. Talks to the real backend admin API.
 */
import { api } from "@/api/client";
import type { Feedback } from "@/types";

export const feedbackService = {
  feedback: () => api.get<Feedback[]>("/api/admin/feedback"),
  approveFeedback: (id: number) =>
    api.post<void>(`/api/admin/feedback/${id}/approve`),
  rejectFeedback: (id: number) =>
    api.post<void>(`/api/admin/feedback/${id}/reject`),
};
