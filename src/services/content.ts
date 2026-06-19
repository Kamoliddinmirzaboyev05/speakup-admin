/** IELTS speaking content management (superadmin via admin auth). */
import { api } from "@/api/client";

export interface TopicGroup {
  id: number;
  part: number;
  title: string;
  tag: string | null;
  sort_order: number;
  is_active: boolean;
  question_count: number;
}

export interface Question {
  id: number;
  text: string;
  sort_order: number;
}

export const contentService = {
  groups: (part?: number) =>
    api.get<TopicGroup[]>("/api/admin/topic-groups", part ? { part } : undefined),
  createGroup: (d: { part: number; title: string; tag?: string | null }) =>
    api.post<TopicGroup>("/api/admin/topic-groups", d),
  updateGroup: (id: number, d: Partial<Pick<TopicGroup, "title" | "tag" | "is_active" | "sort_order">>) =>
    api.patch<TopicGroup>(`/api/admin/topic-groups/${id}`, d),
  deleteGroup: (id: number) => api.delete<void>(`/api/admin/topic-groups/${id}`),

  questions: (groupId: number) =>
    api.get<Question[]>(`/api/admin/topic-groups/${groupId}/questions`),
  createQuestion: (groupId: number, text: string) =>
    api.post<Question>(`/api/admin/topic-groups/${groupId}/questions`, { text }),
  updateQuestion: (id: number, text: string) =>
    api.patch<Question>(`/api/admin/questions/${id}`, { text }),
  deleteQuestion: (id: number) => api.delete<void>(`/api/admin/questions/${id}`),
};
