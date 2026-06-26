import { apiClient } from "@/api/client";

export type SurveyAudience = "all" | "onboarded" | "not_onboarded" | "selected";
export type SurveyStatus = "draft" | "sending" | "sent";

export interface SurveyOptionResult {
  id: number;
  text: string;
  count: number;
  percent: number;
}

export interface AdminSurvey {
  id: number;
  question: string;
  audience: SurveyAudience;
  status: SurveyStatus;
  eligible: number;
  sent: number;
  failed: number;
  responses: number;
  response_rate: number;
  created_at: string;
  sent_at: string | null;
  options: SurveyOptionResult[];
}

export interface SurveyCreateInput {
  question: string;
  options: string[];
  audience: SurveyAudience;
  selected_user_ids?: number[];
}

export interface SurveyResponseRow {
  id: number;
  user_id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  onboarded: boolean;
  option_id: number;
  option_text: string;
  answered_at: string;
}

export interface SurveyResponseList {
  items: SurveyResponseRow[];
  total: number;
}

export const surveysService = {
  list: () => apiClient.get<AdminSurvey[]>("/api/admin/surveys").then((res) => res.data),

  create: (input: SurveyCreateInput) =>
    apiClient.post<AdminSurvey>("/api/admin/surveys", input).then((res) => res.data),

  get: (id: number) =>
    apiClient.get<AdminSurvey>(`/api/admin/surveys/${id}`).then((res) => res.data),

  responses: (id: number, params?: { option_id?: number; search?: string; limit?: number; offset?: number }) =>
    apiClient
      .get<SurveyResponseList>(`/api/admin/surveys/${id}/responses`, { params })
      .then((res) => res.data),
};
