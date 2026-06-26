import { useState } from "react";
import {
  Phone, CheckCircle, Network, Gauge, Activity, Timer, Info,
} from "lucide-react";
import { useCallStats } from "@/hooks/queries";
import { SkeletonCard, SkeletonTableRows } from "@/components/Skeleton";

const cardCls = "bg-card border border-border rounded-xl";
const labelCls = "text-xs text-muted-foreground";

const DAY_OPTIONS = [1, 7, 30];

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

function ms(n: number | null) {
  return n == null ? "—" : `${Math.round(n)} ms`;
}

function pct(n: number | null) {
  return n == null ? "—" : `${n}%`;
}

function num(n: number | null) {
  return n == null ? "—" : Math.round(n);
}

function loss(n: number | null) {
  return n == null ? "—" : `${n}%`;
}

function fmtDur(sec: number | null) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const CHIP_COLORS: Record<string, string> = {
  relay: "text-amber-400 bg-amber-400/10",
  direct: "text-emerald-400 bg-emerald-400/10",
  failed: "text-red-400 bg-red-400/10",
};

function ConnChip({ type }: { type: string }) {
  const cls = CHIP_COLORS[type] ?? "text-muted-foreground bg-muted/40";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cls}`}>
      {type || "unknown"}
    </span>
  );
}

function RttPath({ label, value, max, color }: { label: string; value: number | null; max: number; color: string }) {
  const width = value == null ? 0 : Math.max(2, Math.min((value / max) * 100, 100));
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-lg font-bold font-mono text-foreground">{ms(value)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

const COLS = ["Time", "User", "Path", "RTT", "Loss", "Duration", "Connect", "Result"];

export default function CallQuality() {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useCallStats(days);
  const recent = data?.recent ?? [];
  const maxRtt = Math.max(data?.avg_rtt_relay_ms ?? 0, data?.avg_rtt_direct_ms ?? 0, 1);

  return (
    <div className="space-y-6">
      {/* Header + day selector */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {data ? `${data.total} calls · last ${data.days} days` : "Call quality"}
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                days === d ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d === 1 ? "1 day" : `${d} days`}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={Phone} label="Total calls" value={data.total} color="bg-blue-500/10 text-blue-400" />
            <StatCard icon={CheckCircle} label={`Success rate · ${data.failed} failed`} value={`${data.success_pct}%`} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={Network} label={`Relay · ${data.relay} relay / ${data.direct} direct`} value={`${data.relay_pct}%`} color="bg-amber-500/10 text-amber-400" />
            <StatCard icon={Gauge} label="Avg RTT" value={ms(data.avg_rtt_ms)} color="bg-purple-500/10 text-purple-400" />
            <StatCard icon={Activity} label="Avg loss" value={pct(data.avg_loss_pct)} color="bg-pink-500/10 text-pink-400" />
            <StatCard icon={Timer} label="Avg connect time" value={ms(data.avg_connect_ms)} color="bg-cyan-500/10 text-cyan-400" />
          </>
        )}
      </div>

      {/* RTT by path + interpretation hint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${cardCls} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Network size={15} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">RTT by path</h3>
          </div>
          {isLoading || !data ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
              <div className="h-20 rounded-lg bg-muted/40 animate-pulse" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <RttPath label="Relay" value={data.avg_rtt_relay_ms} max={maxRtt} color="bg-amber-400" />
              <RttPath label="Direct" value={data.avg_rtt_direct_ms} max={maxRtt} color="bg-emerald-400" />
            </div>
          )}
        </div>

        <div className={`${cardCls} p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <Info size={15} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">How to read this</h3>
          </div>
          <ul className={`${labelCls} space-y-1.5 leading-relaxed`}>
            <li>High relay % + high relay RTT → add a TURN relay closer to users.</li>
            <li>High failure rate → carriers blocking TURN (add TURNS / port 443).</li>
            <li>High loss → increase audio redundancy.</li>
          </ul>
        </div>
      </div>

      {/* Recent calls table */}
      <div className={`${cardCls} overflow-hidden`}>
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent calls</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {COLS.map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTableRows rows={10} cols={COLS.length} />}
              {!isLoading && recent.map((c) => (
                <tr key={c.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground font-mono">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{c.user_id != null ? `#${c.user_id}` : "—"}</td>
                  <td className="px-4 py-3"><ConnChip type={c.conn_type} /></td>
                  <td className="px-4 py-3 font-mono text-foreground">{num(c.rtt_ms)}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{loss(c.loss_pct)}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{fmtDur(c.duration_sec)}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{num(c.connect_ms)}</td>
                  <td className="px-4 py-3">
                    <span className={c.success ? "text-emerald-400" : "text-red-400"}>
                      {c.success ? "✓" : "✗"}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && recent.length === 0 && (
                <tr><td colSpan={COLS.length} className="px-4 py-8 text-center text-muted-foreground">No calls</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
