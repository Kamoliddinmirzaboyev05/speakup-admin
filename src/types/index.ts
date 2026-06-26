// Real domain types — mirror the backend admin API (snake_case JSON).

export type UserLevel = "beginner" | "intermediate" | "advanced";
export type Challenge = "grammar" | "fluency" | "vocabulary" | "pronunciation";
export type Gender = "male" | "female" | "other";

export interface AdminUser {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  phone: string | null;
  level: UserLevel | null;
  gender: Gender | null;
  location: string | null;
  goal: string | null;
  challenge: Challenge | null;
  total_minutes: number;
  streak: number;
  onboarded: boolean;
  sessions_count: number;
  has_photo: boolean;
  created_at: string;
  last_practice_date: string | null;
}

export interface AdminUserList {
  items: AdminUser[];
  total: number;
}

export interface AdminSession {
  id: number;
  user_id: number;
  user_name: string | null;
  partner_id: number | null;
  partner_name: string | null;
  is_ai: boolean;
  topic: string | null;
  duration_sec: number;
  start_time: string;
  end_time: string | null;
}

export interface AdminSessionList {
  items: AdminSession[];
  total: number;
}

export interface AdminStats {
  total_users: number;
  onboarded_users: number;
  active_today: number;
  new_users_today: number;
  sessions_today: number;
  total_sessions: number;
  total_minutes_week: number;
  avg_session_min: number;
}

export interface Feedback {
  id: number;
  name: string | null;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
}

export interface AdminBroadcastHistory {
  id: number;
  title: string;
  audience: string;
  has_photo: boolean;
  eligible: number;
  sent: number;
  failed: number;
  created_at: string;
}

export interface AdminCallStatBucket {
  conn_type: string;
  count: number;
  avg_rtt_ms: number | null;
  avg_loss_pct: number | null;
}

export interface AdminCallStatRow {
  id: number;
  user_id: number | null;
  success: boolean;
  conn_type: string;
  rtt_ms: number | null;
  jitter_ms: number | null;
  loss_pct: number | null;
  duration_sec: number | null;
  connect_ms: number | null;
  created_at: string;
}

export interface AdminCallStatsSummary {
  days: number;
  total: number;
  success: number;
  failed: number;
  success_pct: number;
  relay: number;
  direct: number;
  relay_pct: number;
  avg_rtt_ms: number | null;
  avg_rtt_relay_ms: number | null;
  avg_rtt_direct_ms: number | null;
  avg_loss_pct: number | null;
  avg_duration_sec: number | null;
  avg_connect_ms: number | null;
  buckets: AdminCallStatBucket[];
  recent: AdminCallStatRow[];
}
