import { apiClient } from "@/api/client";

export type BroadcastAudience = "all" | "onboarded" | "not_onboarded" | "selected";

export interface BroadcastInput {
  audience: BroadcastAudience;
  title: string;
  body: string;
  button_text?: string;
  button_url?: string;
  button_mode?: "url" | "web_app";
  selected_user_ids?: number[];
  photo?: File | null;
}

export interface BroadcastResult {
  audience: BroadcastAudience;
  eligible: number;
  sent: number;
  failed: number;
  failures: string[];
}

export interface BroadcastAudienceCounts {
  all: number;
  onboarded: number;
  not_onboarded: number;
}

export const broadcastService = {
  counts: () => apiClient.get<BroadcastAudienceCounts>("/api/admin/broadcast/audience-counts").then((res) => res.data),

  send: async (input: BroadcastInput) => {
    const fd = new FormData();
    fd.append("audience", input.audience);
    fd.append("title", input.title);
    fd.append("body", input.body);
    if (input.button_text?.trim()) fd.append("button_text", input.button_text.trim());
    if (input.button_url?.trim()) fd.append("button_url", input.button_url.trim());
    if (input.button_mode) fd.append("button_mode", input.button_mode);
    input.selected_user_ids?.forEach((id) => fd.append("selected_user_ids", String(id)));
    if (input.photo) fd.append("photo", input.photo);

    const res = await apiClient.post<BroadcastResult>("/api/admin/broadcast", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120_000,
    });
    return res.data;
  },
};
