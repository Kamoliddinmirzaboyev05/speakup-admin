import type {
  User, Session, Payment, Plan, Question,
  LeaderboardEntry, PromoCode, ActivityLog,
  DashboardStats, ChartPoint,
} from "../types";

const countries = ["Uzbekistan", "Kazakhstan", "Russia", "Turkey", "Germany", "USA", "UAE", "UK"];
const levels = ["beginner", "intermediate", "advanced"] as const;
const topics = [
  "Daily Routines", "Travel & Tourism", "Technology Trends", "Food & Cooking",
  "Career Goals", "Health & Fitness", "Movies & Entertainment", "Business English",
  "Environment", "Education System",
];
const names = [
  ["Azizbek", "Karimov"], ["Dilnoza", "Yusupova"], ["Sardor", "Toshmatov"],
  ["Malika", "Rashidova"], ["Bobur", "Abdullayev"], ["Nilufar", "Xasanova"],
  ["Jasur", "Mirzayev"], ["Zulfiya", "Normatova"], ["Otabek", "Raximov"],
  ["Shahnoza", "Botirov"], ["Kamol", "Ergashev"], ["Feruza", "Islomova"],
  ["Ulugbek", "Sobirov"], ["Barno", "Tursunova"], ["Sanjar", "Qodirov"],
  ["Hulkar", "Nazarova"], ["Firdavs", "Holmatov"], ["Maftuna", "Davlatova"],
  ["Sherzod", "Yunusov"], ["Mohira", "Qosimova"],
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ─── Users ──────────────────────────────────────────────────────────────────
export const mockUsers: User[] = Array.from({ length: 48 }, (_, i) => {
  const [fn, ln] = names[i % names.length];
  const gender = i % 3 === 0 ? "female" : "male";
  return {
    id: `usr_${String(i + 1).padStart(3, "0")}`,
    telegramId: String(100_000_000 + i * 7_777),
    username: `${fn.toLowerCase()}${ln.slice(0, 3).toLowerCase()}${i}`,
    firstName: fn,
    lastName: ln,
    level: levels[i % 3],
    status: i === 5 ? "banned" : i === 12 ? "inactive" : "active",
    gender: gender as "male" | "female",
    country: countries[i % countries.length],
    totalMinutes: randInt(10, 4800),
    weeklyMinutes: randInt(0, 420),
    currentStreak: randInt(0, 90),
    longestStreak: randInt(5, 180),
    plan: i % 7 === 0 ? "premium_yearly" : i % 3 === 0 ? "premium_monthly" : "free",
    bonusMinutes: randInt(0, 60),
    registeredAt: daysAgo(randInt(1, 365)),
    lastActiveAt: daysAgo(randInt(0, 14)),
    sessionsCount: randInt(1, 320),
    referralCode: `SAYRA${(i + 1).toString(16).toUpperCase().padStart(4, "0")}`,
    referredBy: i > 5 && i % 4 === 0 ? `usr_${String(i - 3).padStart(3, "0")}` : undefined,
  };
});

// ─── Sessions ────────────────────────────────────────────────────────────────
export const mockSessions: Session[] = Array.from({ length: 60 }, (_, i) => {
  const user = mockUsers[i % mockUsers.length];
  const partner = i % 3 !== 0 ? mockUsers[(i + 5) % mockUsers.length] : undefined;
  const dur = randInt(5, 45);
  const started = daysAgo(randInt(0, 30));
  return {
    id: `ses_${String(i + 1).padStart(4, "0")}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    userAvatar: undefined,
    partnerId: partner?.id,
    partnerName: partner ? `${partner.firstName} ${partner.lastName}` : undefined,
    duration: dur,
    status: i < 3 ? "ongoing" : i % 9 === 0 ? "cancelled" : "completed",
    startedAt: started,
    endedAt: i >= 3 ? new Date(new Date(started).getTime() + dur * 60000).toISOString() : undefined,
    topic: randFrom(topics),
    level: levels[i % 3],
    rating: i < 3 ? undefined : randInt(3, 5),
  };
});

// ─── Payments ────────────────────────────────────────────────────────────────
const providers = ["telegram_stars", "payme", "click", "stripe"] as const;
const planTypes = ["free", "premium_monthly", "premium_yearly"] as const;
export const mockPayments: Payment[] = Array.from({ length: 40 }, (_, i) => {
  const user = mockUsers[i % mockUsers.length];
  const plan = planTypes[(i % 2) + 1] as "premium_monthly" | "premium_yearly";
  const created = daysAgo(randInt(0, 60));
  return {
    id: `pay_${String(i + 1).padStart(4, "0")}`,
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    amount: plan === "premium_monthly" ? 4.99 : 39.99,
    currency: "USD",
    plan,
    status: i % 8 === 0 ? "failed" : i % 6 === 0 ? "pending" : i === 3 ? "refunded" : "paid",
    provider: randFrom(providers),
    createdAt: created,
    paidAt: i % 8 !== 0 ? created : undefined,
  };
});

// ─── Plans ───────────────────────────────────────────────────────────────────
export const mockPlans: Plan[] = [
  {
    id: "plan_free", type: "free", name: "Free", price: 0, currency: "USD",
    durationDays: 0, minutesPerDay: 10, isActive: true,
    features: ["10 min/day", "Basic topics", "AI partner only"],
  },
  {
    id: "plan_pm", type: "premium_monthly", name: "Premium Monthly", price: 4.99,
    currency: "USD", durationDays: 30, minutesPerDay: 60, isActive: true,
    features: ["60 min/day", "All topics", "AI + Human partners", "Streak rewards", "Progress analytics"],
  },
  {
    id: "plan_py", type: "premium_yearly", name: "Premium Yearly", price: 39.99,
    currency: "USD", durationDays: 365, minutesPerDay: 120, isActive: true,
    features: ["Unlimited minutes", "All topics", "AI + Human partners", "Priority matching", "Certificates", "Streak rewards"],
  },
];

// ─── Questions ───────────────────────────────────────────────────────────────
const qTemplates = [
  { topic: "Daily Routines", prompt: "Describe your morning routine in detail.", aiPrompt: "Ask follow-up questions about their routine and suggest improvements." },
  { topic: "Travel", prompt: "Talk about a memorable trip you have taken.", aiPrompt: "Explore emotions, logistics, and cultural discoveries during the trip." },
  { topic: "Technology", prompt: "How has technology changed your daily life?", aiPrompt: "Discuss both pros and cons, invite comparisons to life without tech." },
  { topic: "Food & Cooking", prompt: "Describe your favorite dish and how to prepare it.", aiPrompt: "Ask about ingredients, cooking steps, and cultural significance." },
  { topic: "Career Goals", prompt: "Where do you see yourself professionally in five years?", aiPrompt: "Ask about current role, obstacles, and specific plans to reach those goals." },
  { topic: "Health & Fitness", prompt: "What habits do you have to maintain your health?", aiPrompt: "Explore exercise routines, diet choices, and mental wellness practices." },
  { topic: "Environment", prompt: "What changes can individuals make to help the environment?", aiPrompt: "Probe for specific examples and discuss effectiveness of each habit." },
  { topic: "Education", prompt: "How should education systems be reformed?", aiPrompt: "Discuss traditional vs modern approaches, technology in classrooms." },
  { topic: "Business English", prompt: "Describe a challenging project you have managed.", aiPrompt: "Ask about team size, obstacles, outcomes, and lessons learned." },
];

export const mockQuestions: Question[] = qTemplates.flatMap((t, qi) =>
  levels.map((level, li) => ({
    id: `qst_${String(qi * 3 + li + 1).padStart(3, "0")}`,
    topic: t.topic,
    level,
    prompt: t.prompt,
    aiPrompt: t.aiPrompt,
    category: t.topic,
    isActive: !(qi === 2 && li === 1),
    createdAt: daysAgo(randInt(10, 200)),
    usageCount: randInt(20, 1200),
  }))
);

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const mockLeaderboard: LeaderboardEntry[] = mockUsers
  .slice()
  .sort((a, b) => b.weeklyMinutes - a.weeklyMinutes)
  .slice(0, 20)
  .map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    userName: `${u.firstName} ${u.lastName}`,
    weeklyMinutes: u.weeklyMinutes,
    totalMinutes: u.totalMinutes,
    streak: u.currentStreak,
    level: u.level,
    country: u.country,
  }));

// ─── Promo Codes ─────────────────────────────────────────────────────────────
export const mockPromoCodes: PromoCode[] = [
  { id: "promo_001", code: "WELCOME30", bonusMinutes: 30, maxUses: 1000, usedCount: 432, expiresAt: daysAgo(-30), isActive: true, createdAt: daysAgo(60) },
  { id: "promo_002", code: "SUMMER2025", bonusMinutes: 60, maxUses: 500, usedCount: 500, expiresAt: daysAgo(5), isActive: false, createdAt: daysAgo(90) },
  { id: "promo_003", code: "LOYALTY50", bonusMinutes: 50, maxUses: 200, usedCount: 87, expiresAt: daysAgo(-60), isActive: true, createdAt: daysAgo(20) },
  { id: "promo_004", code: "VIP100", bonusMinutes: 100, maxUses: 50, usedCount: 12, expiresAt: daysAgo(-14), isActive: true, createdAt: daysAgo(7) },
];

// ─── Activity Log ─────────────────────────────────────────────────────────────
export const mockActivityLog: ActivityLog[] = [
  { id: "log_001", adminName: "Azizbek Karimov", action: "ban_user", target: "User", targetId: "usr_006", details: "Banned for spam behavior", createdAt: daysAgo(0) },
  { id: "log_002", adminName: "Azizbek Karimov", action: "give_bonus", target: "User", targetId: "usr_003", details: "Gave 30 bonus minutes", createdAt: daysAgo(0) },
  { id: "log_003", adminName: "Azizbek Karimov", action: "create_promo", target: "PromoCode", targetId: "promo_004", details: "Created VIP100 promo code", createdAt: daysAgo(1) },
  { id: "log_004", adminName: "Azizbek Karimov", action: "update_plan", target: "Plan", targetId: "plan_pm", details: "Updated Premium Monthly price to $4.99", createdAt: daysAgo(2) },
  { id: "log_005", adminName: "Azizbek Karimov", action: "reset_leaderboard", target: "Leaderboard", targetId: "weekly", details: "Reset weekly leaderboard", createdAt: daysAgo(7) },
  { id: "log_006", adminName: "Azizbek Karimov", action: "add_question", target: "Question", targetId: "qst_027", details: "Added new Business English question", createdAt: daysAgo(8) },
  { id: "log_007", adminName: "Azizbek Karimov", action: "refund", target: "Payment", targetId: "pay_0004", details: "Refunded payment on user request", createdAt: daysAgo(10) },
];

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const mockStats: DashboardStats = {
  totalUsers: 12_847,
  activeUsersToday: 1_234,
  totalMinutesThisWeek: 89_432,
  totalRevenue: 4_521.88,
  newUsersToday: 87,
  sessionsToday: 342,
  avgSessionDuration: 18,
  premiumUsers: 2_104,
};

export const mockUserGrowth: ChartPoint[] = [
  { date: "Jun 11", value: 67 }, { date: "Jun 12", value: 82 },
  { date: "Jun 13", value: 74 }, { date: "Jun 14", value: 95 },
  { date: "Jun 15", value: 110 }, { date: "Jun 16", value: 88 },
  { date: "Jun 17", value: 87 },
];

export const mockSessionsChart: ChartPoint[] = [
  { date: "Jun 11", value: 280, secondary: 42 }, { date: "Jun 12", value: 310, secondary: 58 },
  { date: "Jun 13", value: 290, secondary: 51 }, { date: "Jun 14", value: 380, secondary: 74 },
  { date: "Jun 15", value: 420, secondary: 89 }, { date: "Jun 16", value: 355, secondary: 63 },
  { date: "Jun 17", value: 342, secondary: 55 },
];

export const mockRevenueChart: ChartPoint[] = [
  { date: "Jun 11", value: 520 }, { date: "Jun 12", value: 680 },
  { date: "Jun 13", value: 590 }, { date: "Jun 14", value: 810 },
  { date: "Jun 15", value: 950 }, { date: "Jun 16", value: 720 },
  { date: "Jun 17", value: 452 },
];
