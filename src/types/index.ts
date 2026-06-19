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

// ── Billing ───────────────────────────────────────────────────────────────────

export interface Plan {
  id: number;
  key: string;
  title: string;
  price_uzs: number;
  price_stars: number;
  duration_days: number;
  is_popular: boolean;
  active: boolean;
  sort_order: number;
}

export type PlanInput = Omit<Plan, "id">;

export type PaymentStatus = "pending" | "confirmed" | "rejected";
export type PaymentMethod = "stars" | "card";

export interface Payment {
  id: number;
  user_name: string | null;
  telegram_id: number;
  plan: string | null;
  method: PaymentMethod;
  status: PaymentStatus;
  amount_uzs: number | null;
  amount_stars: number | null;
  screenshot_file_id: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface BillingStats {
  revenue_uzs: number;
  revenue_stars: number;
  premium_users: number;
  pending_payments: number;
}

export interface AdminSettings {
  free_daily_minutes: number;
  daily_bonus_minutes: number;
  bonus_channel_username: string;
  referral_tiers: [number, number][];
  card_number: string;
  card_holder: string;
}

export interface Feedback {
  id: number;
  name: string | null;
  rating: number;
  text: string;
  approved: boolean;
  created_at: string;
}
