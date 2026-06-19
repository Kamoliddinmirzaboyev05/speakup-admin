import { useState, useMemo, useEffect } from "react";
import {
  Search, Filter, Download, Ban, Gift, RotateCcw, Trash2,
  ChevronUp, ChevronDown, X, CheckCircle, Clock, AlertCircle,
  User as UserIcon, Mic, Calendar,
} from "lucide-react";
import { useUsers } from "@/hooks/queries";
import type { User, UserLevel, UserStatus } from "../types";

// ─── Utilities ────────────────────────────────────────────────────────────────
const levelBadge: Record<UserLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};
const statusBadge: Record<UserStatus, { cls: string; icon: React.ElementType; label: string }> = {
  active: { cls: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle, label: "Active" },
  banned: { cls: "text-red-400 bg-red-400/10", icon: Ban, label: "Banned" },
  inactive: { cls: "text-muted-foreground bg-muted/50", icon: Clock, label: "Inactive" },
};
const planBadge: Record<string, string> = {
  free: "text-muted-foreground bg-muted/50",
  premium_monthly: "text-blue-400 bg-blue-400/10",
  premium_yearly: "text-amber-400 bg-amber-400/10",
};

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
      {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

// ─── Bonus Modal ──────────────────────────────────────────────────────────────
function BonusModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [minutes, setMinutes] = useState(30);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const handle = () => { setDone(true); setTimeout(onClose, 1200); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Give Bonus Minutes</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle size={32} className="text-emerald-400" />
            <p className="text-sm text-foreground">Bonus granted!</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Granting bonus to <span className="text-foreground font-medium">{user.firstName} {user.lastName}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Minutes</label>
                <div className="flex gap-2">
                  {[15, 30, 60, 120].map((m) => (
                    <button key={m} onClick={() => setMinutes(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${minutes === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/60"}`}>
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Reason (optional)</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="e.g. Compensation for downtime" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handle} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">Grant {minutes}m</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserModal({ user, onClose }: { user: User; onClose: () => void }) {
  const s = statusBadge[user.status];
  const SIcon = s.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">User Profile</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-muted-foreground">@{user.username}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${levelBadge[user.level]}`}>
                  {user.level}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.cls}`}>
                  <SIcon size={9} /> {s.label}
                </span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total Minutes", value: user.totalMinutes, icon: Mic },
              { label: "Current Streak", value: `${user.currentStreak}d`, icon: AlertCircle },
              { label: "Sessions", value: user.sessionsCount, icon: UserIcon },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-lg font-bold font-mono text-foreground">{value}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs">
            {[
              ["Telegram ID", user.telegramId],
              ["Country", user.country],
              ["Gender", user.gender],
              ["Plan", user.plan.replace(/_/g, " ")],
              ["Bonus Minutes", user.bonusMinutes],
              ["Longest Streak", `${user.longestStreak} days`],
              ["Referral Code", user.referralCode],
              ["Registered", new Date(user.registeredAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })],
              ["Last Active", new Date(user.lastActiveAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Export ────────────────────────────────────────────────────────────────
function exportCSV(users: User[]) {
  const headers = ["ID", "Username", "Name", "Level", "Status", "Country", "Plan", "Total Minutes", "Streak", "Registered"];
  const rows = users.map((u) => [
    u.id, u.username, `${u.firstName} ${u.lastName}`, u.level, u.status,
    u.country, u.plan, u.totalMinutes, u.currentStreak,
    new Date(u.registeredAt).toISOString().split("T")[0],
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "sayra_users.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type SortKey = "name" | "totalMinutes" | "weeklyMinutes" | "currentStreak" | "registeredAt";

export default function Users() {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("registeredAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bonusUser, setBonusUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const { data } = useUsers();
  const [userList, setUserList] = useState<User[]>([]);
  useEffect(() => { if (data) setUserList(data); }, [data]);

  const sort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    return userList
      .filter((u) => {
        const q = search.toLowerCase();
        if (q && !`${u.firstName} ${u.lastName} ${u.username} ${u.telegramId}`.toLowerCase().includes(q)) return false;
        if (levelFilter !== "all" && u.level !== levelFilter) return false;
        if (statusFilter !== "all" && u.status !== statusFilter) return false;
        if (planFilter !== "all" && u.plan !== planFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let av: number | string, bv: number | string;
        if (sortKey === "name") { av = `${a.firstName} ${a.lastName}`; bv = `${b.firstName} ${b.lastName}`; }
        else if (sortKey === "registeredAt") { av = a.registeredAt; bv = b.registeredAt; }
        else { av = a[sortKey] as number; bv = b[sortKey] as number; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
  }, [userList, search, levelFilter, statusFilter, planFilter, sortKey, sortDir]);

  const pageCount = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k
      ? sortDir === "asc" ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-muted-foreground/40" />
  );

  const handleBan = (u: User) => {
    setUserList((prev) => prev.map((x) => x.id === u.id ? { ...x, status: x.status === "banned" ? "active" : "banned" } : x));
  };
  const handleResetStreak = (u: User) => {
    setUserList((prev) => prev.map((x) => x.id === u.id ? { ...x, currentStreak: 0 } : x));
  };
  const handleDelete = (u: User) => {
    if (confirm(`Delete user ${u.firstName} ${u.lastName}?`))
      setUserList((prev) => prev.filter((x) => x.id !== u.id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2 flex-1">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, username, Telegram ID…"
            className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1"
          />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground" /></button>}
        </div>
        <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Level", value: levelFilter, set: (v: string) => { setLevelFilter(v); setPage(1); }, options: ["all", "beginner", "intermediate", "advanced"] },
          { label: "Status", value: statusFilter, set: (v: string) => { setStatusFilter(v); setPage(1); }, options: ["all", "active", "banned", "inactive"] },
          { label: "Plan", value: planFilter, set: (v: string) => { setPlanFilter(v); setPage(1); }, options: ["all", "free", "premium_monthly", "premium_yearly"] },
        ].map(({ label, value, set, options }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Filter size={12} className="text-muted-foreground" />
            <select value={value} onChange={(e) => set(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
              {options.map((o) => <option key={o} value={o}>{o === "all" ? `All ${label}s` : o.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        ))}
        <div className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} users</div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  { label: "User", key: "name" as SortKey },
                  { label: "Level", key: null },
                  { label: "Status", key: null },
                  { label: "Plan", key: null },
                  { label: "Minutes", key: "totalMinutes" as SortKey },
                  { label: "Weekly", key: "weeklyMinutes" as SortKey },
                  { label: "Streak", key: "currentStreak" as SortKey },
                  { label: "Registered", key: "registeredAt" as SortKey },
                  { label: "Actions", key: null },
                ].map(({ label, key }) => (
                  <th key={label}
                    onClick={key ? () => sort(key) : undefined}
                    className={`text-left px-4 py-3 text-muted-foreground font-medium ${key ? "cursor-pointer hover:text-foreground" : ""}`}>
                    <div className="flex items-center gap-1">
                      {label} {key && <SortIcon k={key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((u) => {
                const st = statusBadge[u.status];
                const StIcon = st.icon;
                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedUser(u)} className="flex items-center gap-2.5 text-left hover:opacity-80 transition-opacity">
                        <Avatar name={`${u.firstName} ${u.lastName}`} />
                        <div>
                          <div className="font-medium text-foreground">{u.firstName} {u.lastName}</div>
                          <div className="text-muted-foreground">@{u.username}</div>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${levelBadge[u.level]}`}>
                        {u.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${st.cls}`}>
                        <StIcon size={9} /> {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${planBadge[u.plan]}`}>
                        {u.plan.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">{u.totalMinutes.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{u.weeklyMinutes}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-400">🔥 {u.currentStreak}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {new Date(u.registeredAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setBonusUser(u)} title="Give bonus" className="p-1.5 rounded hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400 transition-colors"><Gift size={13} /></button>
                        <button onClick={() => handleBan(u)} title={u.status === "banned" ? "Unban" : "Ban"} className="p-1.5 rounded hover:bg-red-400/10 text-muted-foreground hover:text-red-400 transition-colors"><Ban size={13} /></button>
                        <button onClick={() => handleResetStreak(u)} title="Reset streak" className="p-1.5 rounded hover:bg-amber-400/10 text-muted-foreground hover:text-amber-400 transition-colors"><RotateCcw size={13} /></button>
                        <button onClick={() => handleDelete(u)} title="Delete" className="p-1.5 rounded hover:bg-red-400/10 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {page} of {pageCount} · {filtered.length} results
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {bonusUser && <BonusModal user={bonusUser} onClose={() => setBonusUser(null)} />}
    </div>
  );
}
