export type UserLevel = "beginner" | "intermediate" | "advanced";
export type UserStatus = "active" | "banned" | "inactive";
export type SessionStatus = "completed" | "ongoing" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type PaymentProvider = "telegram_stars" | "payme" | "click" | "stripe";
export type PlanType = "free" | "premium_monthly" | "premium_yearly";

export interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  level: UserLevel;
  status: UserStatus;
  gender: "male" | "female" | "other";
  country: string;
  totalMinutes: number;
  weeklyMinutes: number;
  currentStreak: number;
  longestStreak: number;
  plan: PlanType;
  bonusMinutes: number;
  registeredAt: string;
  lastActiveAt: string;
  sessionsCount: number;
  referralCode: string;
  referredBy?: string;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  partnerId?: string;
  partnerName?: string;
  duration: number;
  status: SessionStatus;
  startedAt: string;
  endedAt?: string;
  topic: string;
  level: UserLevel;
  rating?: number;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  plan: PlanType;
  status: PaymentStatus;
  provider: PaymentProvider;
  createdAt: string;
  paidAt?: string;
}

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  features: string[];
  minutesPerDay: number;
  isActive: boolean;
}

export interface Question {
  id: string;
  topic: string;
  level: UserLevel;
  prompt: string;
  aiPrompt: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  usageCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  weeklyMinutes: number;
  totalMinutes: number;
  streak: number;
  level: UserLevel;
  country: string;
}

export interface PromoCode {
  id: string;
  code: string;
  bonusMinutes: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsersToday: number;
  totalMinutesThisWeek: number;
  totalRevenue: number;
  newUsersToday: number;
  sessionsToday: number;
  avgSessionDuration: number;
  premiumUsers: number;
}

export interface ChartPoint {
  date: string;
  value: number;
  secondary?: number;
}
