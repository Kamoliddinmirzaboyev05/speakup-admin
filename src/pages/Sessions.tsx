import { useState, useMemo } from "react";
import { Search, Filter, Download, X, Clock, CheckCircle, XCircle, Radio, Star } from "lucide-react";
import { mockSessions } from "../data/mock";
import type { Session, SessionStatus, UserLevel } from "../types";

const statusBadge: Record<SessionStatus, { cls: string; icon: React.ElementType; label: string }> = {
  completed: { cls: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle, label: "Completed" },
  ongoing: { cls: "text-blue-400 bg-blue-400/10 animate-pulse", icon: Radio, label: "Live" },
  cancelled: { cls: "text-red-400 bg-red-400/10", icon: XCircle, label: "Cancelled" },
};
const levelBadge: Record<UserLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-purple-400 bg-purple-400/10",
};

function SessionModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const st = statusBadge[session.status];
  const StIcon = st.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Session Details</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${st.cls}`}>
              <StIcon size={11} /> {st.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{session.id}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Topic", session.topic],
              ["Level", session.level],
              ["Duration", session.duration ? `${session.duration} min` : "—"],
              ["Rating", session.rating ? `${"★".repeat(session.rating)}${"☆".repeat(5 - session.rating)}` : "—"],
              ["Started", new Date(session.startedAt).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })],
              ["Ended", session.endedAt ? new Date(session.endedAt).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"],
            ].map(([k, v]) => (
              <div key={String(k)} className="bg-muted/30 rounded-lg p-3">
                <div className="text-[10px] text-muted-foreground">{k}</div>
                <div className="text-xs font-medium text-foreground mt-0.5">{v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary">
                {session.userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{session.userName}</div>
                <div className="text-[10px] text-muted-foreground">{session.userId}</div>
              </div>
            </div>
            {session.partnerName && (
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center text-[10px] font-semibold text-violet-400">
                  {session.partnerName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">{session.partnerName}</div>
                  <div className="text-[10px] text-muted-foreground">Partner</div>
                </div>
              </div>
            )}
            {!session.partnerName && (
              <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/15 flex items-center justify-center text-[10px] text-indigo-400">🤖</div>
                <div className="text-xs text-muted-foreground">AI Partner</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function exportCSV(sessions: Session[]) {
  const rows = [
    ["ID", "User", "Partner", "Duration", "Status", "Topic", "Level", "Rating", "Started"],
    ...sessions.map((s) => [s.id, s.userName, s.partnerName ?? "AI", s.duration, s.status, s.topic, s.level, s.rating ?? "", new Date(s.startedAt).toISOString()]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "sessions.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Sessions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() =>
    mockSessions.filter((s) => {
      if (search && !`${s.userName} ${s.partnerName ?? ""} ${s.topic}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (levelFilter !== "all" && s.level !== levelFilter) return false;
      return true;
    }),
    [search, statusFilter, levelFilter]
  );

  const pageCount = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalMinutes = filtered.reduce((sum, s) => sum + (s.duration || 0), 0);
  const avgRating = filtered.filter((s) => s.rating).reduce((sum, s, _, arr) => sum + (s.rating ?? 0) / arr.length, 0);

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total Sessions", value: filtered.length, color: "text-blue-400" },
          { label: "Live Now", value: filtered.filter((s) => s.status === "ongoing").length, color: "text-emerald-400" },
          { label: "Total Minutes", value: `${totalMinutes.toLocaleString()}m`, color: "text-violet-400" },
          { label: "Avg Rating", value: avgRating ? avgRating.toFixed(1) + " ★" : "—", color: "text-amber-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${color}`}>{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2 flex-1">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user, partner, topic…"
            className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground" /></button>}
        </div>
        <div className="flex gap-2">
          {[
            { value: statusFilter, set: (v: string) => { setStatusFilter(v); setPage(1); }, options: ["all", "completed", "ongoing", "cancelled"], prefix: "Status" },
            { value: levelFilter, set: (v: string) => { setLevelFilter(v); setPage(1); }, options: ["all", "beginner", "intermediate", "advanced"], prefix: "Level" },
          ].map(({ value, set, options, prefix }) => (
            <select key={prefix} value={value} onChange={(e) => set(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
              {options.map((o) => <option key={o} value={o}>{o === "all" ? `All ${prefix}` : o}</option>)}
            </select>
          ))}
          <button onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Download size={12} /> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Partner", "Topic", "Level", "Duration", "Rating", "Status", "Started"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => {
                const st = statusBadge[s.status];
                const StIcon = st.icon;
                return (
                  <tr key={s.id} onClick={() => setSelectedSession(s)} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-semibold text-primary">
                          {s.userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </div>
                        <span className="text-foreground font-medium">{s.userName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.partnerName ?? <span className="text-indigo-400">🤖 AI</span>}
                    </td>
                    <td className="px-4 py-3 text-foreground max-w-32 truncate">{s.topic}</td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${levelBadge[s.level]}`}>{s.level.slice(0, 3).toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">
                      <span className="flex items-center gap-1"><Clock size={10} className="text-muted-foreground" /> {s.duration}m</span>
                    </td>
                    <td className="px-4 py-3 text-amber-400">
                      {s.rating ? <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {s.rating}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${st.cls}`}>
                        <StIcon size={9} /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">
                      {new Date(s.startedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Page {page} of {pageCount} · {filtered.length} sessions</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Prev</button>
            <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      </div>

      {selectedSession && <SessionModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  );
}
