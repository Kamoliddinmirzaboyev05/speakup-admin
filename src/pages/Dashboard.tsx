import { Users, Mic, TrendingUp, DollarSign, UserPlus, Clock, Star, Zap } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useDashboard } from "@/hooks/queries";

function StatCard({
  icon: Icon, label, value, sub, color, trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  trend?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/20 transition-colors group">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={17} />
        </div>
        {trend && (
          <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" },
  labelStyle: { color: "#94a3b8" },
};

const levelBadge: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-purple-400 bg-purple-400/10",
};

export default function Dashboard() {
  const { data } = useDashboard();
  if (!data) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  const { stats: s, userGrowth, sessionsChart, leaderboard, activity } = data;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users} label="Total Users" color="bg-blue-500/10 text-blue-400"
          value={s.totalUsers.toLocaleString()} sub={`+${s.newUsersToday} today`} trend="+3.2%"
        />
        <StatCard
          icon={Zap} label="Active Today" color="bg-emerald-500/10 text-emerald-400"
          value={s.activeUsersToday.toLocaleString()} sub={`${((s.activeUsersToday / s.totalUsers) * 100).toFixed(1)}% of total`} trend="+8.1%"
        />
        <StatCard
          icon={Mic} label="Minutes This Week" color="bg-violet-500/10 text-violet-400"
          value={s.totalMinutesThisWeek.toLocaleString()} sub={`${s.sessionsToday} sessions today`} trend="+12.4%"
        />
        <StatCard
          icon={DollarSign} label="Total Revenue" color="bg-amber-500/10 text-amber-400"
          value={`$${s.totalRevenue.toLocaleString("en", { minimumFractionDigits: 2 })}`}
          sub={`${s.premiumUsers.toLocaleString()} premium users`} trend="+5.7%"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserPlus} label="New Users Today" color="bg-cyan-500/10 text-cyan-400" value={String(s.newUsersToday)} />
        <StatCard icon={Clock} label="Avg Session" color="bg-rose-500/10 text-rose-400" value={`${s.avgSessionDuration}m`} />
        <StatCard icon={Star} label="Premium Users" color="bg-amber-500/10 text-amber-400" value={s.premiumUsers.toLocaleString()} />
        <StatCard icon={TrendingUp} label="Sessions Today" color="bg-indigo-500/10 text-indigo-400" value={String(s.sessionsToday)} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User growth */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">User Growth</div>
            <div className="text-xs text-muted-foreground">New registrations — last 7 days</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="value" name="New Users" stroke="#3b82f6" strokeWidth={2} fill="url(#gBlue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">Practice Sessions</div>
            <div className="text-xs text-muted-foreground">Sessions & unique users — last 7 days</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessionsChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="value" name="Sessions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="secondary" name="Active Users" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: leaderboard + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Streak leaders */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-foreground">Streak Leaders</div>
              <div className="text-xs text-muted-foreground">Top 5 by weekly minutes</div>
            </div>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((u) => (
              <div key={u.userId} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors">
                <span className={`font-mono text-xs font-bold w-5 text-center ${u.rank <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                  {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : u.rank}
                </span>
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                  {u.userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground truncate">{u.userName}</div>
                  <div className="text-[11px] text-muted-foreground">{u.country}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelBadge[u.level]}`}>
                  {u.level.slice(0, 3).toUpperCase()}
                </span>
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-foreground">{u.weeklyMinutes}m</div>
                  <div className="text-[11px] text-amber-400">🔥 {u.streak}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="mb-4">
            <div className="text-sm font-semibold text-foreground">Recent Activity</div>
            <div className="text-xs text-muted-foreground">Latest admin actions</div>
          </div>
          <div className="space-y-3">
            {activity.slice(0, 6).map((log) => {
              const actionColor: Record<string, string> = {
                ban_user: "text-red-400 bg-red-400/10",
                give_bonus: "text-emerald-400 bg-emerald-400/10",
                create_promo: "text-violet-400 bg-violet-400/10",
                update_plan: "text-blue-400 bg-blue-400/10",
                reset_leaderboard: "text-amber-400 bg-amber-400/10",
                add_question: "text-cyan-400 bg-cyan-400/10",
                refund: "text-rose-400 bg-rose-400/10",
              };
              const color = actionColor[log.action] ?? "text-muted-foreground bg-muted";
              const d = new Date(log.createdAt);
              const when = d.toLocaleDateString("en", { month: "short", day: "numeric" });
              return (
                <div key={log.id} className="flex items-start gap-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium mt-0.5 whitespace-nowrap ${color}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground truncate">{log.details}</div>
                    <div className="text-[11px] text-muted-foreground">{log.adminName} · {when}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
