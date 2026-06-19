import { Users, Mic, Clock, UserPlus, Zap, CheckCircle, Activity, Calendar } from "lucide-react";
import { useStats, useSessions } from "@/hooks/queries";

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

export default function Dashboard() {
  const { data: s, isLoading } = useStats();
  const { data: sessions } = useSessions({ limit: 8 });

  if (isLoading || !s) return <div className="p-6 text-sm text-muted-foreground">Yuklanmoqda…</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jami foydalanuvchilar" value={s.total_users} color="bg-blue-500/10 text-blue-400" />
        <StatCard icon={CheckCircle} label="Onboarding tugatgan" value={s.onboarded_users} color="bg-emerald-500/10 text-emerald-400" />
        <StatCard icon={Activity} label="Bugun faol" value={s.active_today} color="bg-purple-500/10 text-purple-400" />
        <StatCard icon={UserPlus} label="Bugun yangi" value={s.new_users_today} color="bg-amber-500/10 text-amber-400" />
        <StatCard icon={Mic} label="Bugungi sessiyalar" value={s.sessions_today} color="bg-pink-500/10 text-pink-400" />
        <StatCard icon={Mic} label="Jami sessiyalar" value={s.total_sessions} color="bg-cyan-500/10 text-cyan-400" />
        <StatCard icon={Clock} label="Haftalik daqiqa" value={s.total_minutes_week} color="bg-indigo-500/10 text-indigo-400" />
        <StatCard icon={Zap} label="O'rtacha sessiya (daq)" value={s.avg_session_min} color="bg-orange-500/10 text-orange-400" />
      </div>

      {/* Recent sessions */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">So'nggi sessiyalar</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Foydalanuvchi", "Hamroh", "Mavzu", "Davomiyligi", "Vaqt"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sessions?.items ?? []).map((ss) => (
                <tr key={ss.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-foreground font-medium">{ss.user_name ?? `#${ss.user_id}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ss.partner_name ?? "—"}{ss.is_ai ? " · AI" : ""}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ss.topic ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{fmtDur(ss.duration_sec)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {new Date(ss.start_time).toLocaleString("uz", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
              {(sessions?.items ?? []).length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Sessiyalar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
