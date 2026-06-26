import { Users, Mic, Clock, UserPlus, Zap, CheckCircle, Activity, Calendar, BarChart3, Megaphone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useStats, useSessions, useBroadcasts } from "@/hooks/queries";
import { surveysService } from "@/services/surveys";
import { SkeletonCard, SkeletonTableRows } from "@/components/Skeleton";

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={17} />
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function pct(n: number) {
  return Math.min(Math.max(n, 0), 100);
}

export default function Dashboard() {
  const { data: s, isLoading } = useStats();
  const { data: sessions, isLoading: sessionsLoading } = useSessions({ limit: 8 });
  const { data: surveys, isLoading: surveysLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: surveysService.list,
    staleTime: 10_000,
  });
  const { data: broadcasts, isLoading: broadcastsLoading } = useBroadcasts(1);

  const latestSurvey = surveys?.[0] ?? null;
  const latestBroadcast = broadcasts?.[0] ?? null;

  if (isLoading || !s) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value={s.total_users} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={CheckCircle} label="Completed onboarding" value={s.onboarded_users} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Activity} label="Active today" value={s.active_today} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={UserPlus} label="New today" value={s.new_users_today} color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Mic} label="Sessions today" value={s.sessions_today} color="bg-pink-500/10 text-pink-400" />
        <StatCard icon={Mic} label="Total sessions" value={s.total_sessions} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard icon={Clock} label="Weekly minutes" value={s.total_minutes_week} color="bg-indigo-500/10 text-indigo-400" />
        <StatCard icon={Zap} label="Avg session (min)" value={s.avg_session_min} color="bg-orange-500/10 text-orange-400" />
      </div>

      {/* Latest survey + last broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-400">
              <BarChart3 size={17} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Latest survey</div>
              <div className="text-xs text-muted-foreground">Most recent poll</div>
            </div>
          </div>
          {latestSurvey ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{latestSurvey.question}</div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground tracking-tight">{latestSurvey.response_rate}%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">response rate</div>
                </div>
                <div className="text-right text-xs text-muted-foreground font-mono">
                  {latestSurvey.responses}/{latestSurvey.eligible} responses
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct(latestSurvey.response_rate)}%` }} />
              </div>
            </div>
          ) : surveysLoading ? (
            <div className="h-12 rounded-lg bg-muted/40 animate-pulse" />
          ) : (
            <div className="text-sm text-muted-foreground py-4">No surveys yet</div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-sky-500/10 text-sky-400">
              <Megaphone size={17} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Last broadcast</div>
              <div className="text-xs text-muted-foreground">Most recent send</div>
            </div>
          </div>
          {latestBroadcast ? (
            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{latestBroadcast.title}</div>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-2xl font-bold font-mono text-foreground tracking-tight">
                    {latestBroadcast.sent}<span className="text-base text-muted-foreground">/{latestBroadcast.eligible}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">delivered · {latestBroadcast.audience}</div>
                </div>
                <div className="text-right">
                  {latestBroadcast.failed > 0 && (
                    <div className="text-xs font-semibold text-amber-400">{latestBroadcast.failed} failed</div>
                  )}
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">{fmtDate(latestBroadcast.created_at)}</div>
                </div>
              </div>
            </div>
          ) : broadcastsLoading ? (
            <div className="h-12 rounded-lg bg-muted/40 animate-pulse" />
          ) : (
            <div className="text-sm text-muted-foreground py-4">No broadcasts yet</div>
          )}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Recent sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Partner", "Duration", "Time"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessionsLoading && <SkeletonTableRows rows={6} cols={4} />}
              {!sessionsLoading && (sessions?.items ?? []).map((ss) => (
                <tr key={ss.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-foreground font-medium">{ss.user_name ?? `#${ss.user_id}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ss.partner_name ?? "—"}{ss.is_ai ? " · AI" : ""}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{fmtDur(ss.duration_sec)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {new Date(ss.start_time).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {!sessionsLoading && (sessions?.items ?? []).length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No sessions</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
