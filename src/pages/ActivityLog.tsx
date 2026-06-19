import { useMemo, useState } from "react";
import { Activity, Ban, Gift, Percent, RefreshCw, BookOpen, CreditCard, Search, X } from "lucide-react";
import { useActivityLog } from "@/hooks/queries";
import type { ActivityLog } from "../types";

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ban_user: { label: "Ban User", icon: Ban, color: "text-red-400 bg-red-400/10" },
  give_bonus: { label: "Give Bonus", icon: Gift, color: "text-emerald-400 bg-emerald-400/10" },
  create_promo: { label: "Create Promo", icon: Percent, color: "text-violet-400 bg-violet-400/10" },
  update_plan: { label: "Update Plan", icon: CreditCard, color: "text-blue-400 bg-blue-400/10" },
  reset_leaderboard: { label: "Reset Board", icon: RefreshCw, color: "text-amber-400 bg-amber-400/10" },
  add_question: { label: "Add Question", icon: BookOpen, color: "text-cyan-400 bg-cyan-400/10" },
  refund: { label: "Refund", icon: CreditCard, color: "text-rose-400 bg-rose-400/10" },
};

// Extend with more mock entries for a richer log
const EXTRA_LOG: ActivityLog[] = [
  { id: "log_008", adminName: "Azizbek Karimov", action: "give_bonus", target: "All Users", targetId: "all", details: "Gave 15 min to all users — Eid celebration", createdAt: new Date(Date.now() - 86400000 * 12).toISOString() },
  { id: "log_009", adminName: "Azizbek Karimov", action: "update_plan", target: "Plan", targetId: "plan_py", details: "Updated Premium Yearly price to $39.99", createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { id: "log_010", adminName: "Azizbek Karimov", action: "add_question", target: "Question", targetId: "qst_019", details: "Added 3 new Intermediate questions on Career Goals", createdAt: new Date(Date.now() - 86400000 * 18).toISOString() },
  { id: "log_011", adminName: "Azizbek Karimov", action: "ban_user", target: "User", targetId: "usr_013", details: "Banned for abusive language in sessions", createdAt: new Date(Date.now() - 86400000 * 20).toISOString() },
  { id: "log_012", adminName: "Azizbek Karimov", action: "create_promo", target: "PromoCode", targetId: "promo_002", details: "Created SUMMER2025 promo code", createdAt: new Date(Date.now() - 86400000 * 22).toISOString() },
];

export default function ActivityLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const { data: base = [] } = useActivityLog();
  const fullLog = useMemo(() => [...base, ...EXTRA_LOG], [base]);

  const filtered = fullLog.filter((l) => {
    if (search && !`${l.details} ${l.adminName} ${l.action}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2 flex-1">
          <Search size={13} className="text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actions, details, admin…"
            className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1" />
          {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground" /></button>}
        </div>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="bg-muted/40 border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer">
          <option value="all">All Actions</option>
          {Object.entries(ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Activity size={14} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">Admin Activity</span>
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} entries</span>
        </div>
        <div className="divide-y divide-border/50">
          {filtered.map((log) => {
            const meta = ACTION_META[log.action] ?? { label: log.action, icon: Activity, color: "text-muted-foreground bg-muted" };
            const MetaIcon = meta.icon;
            const dt = new Date(log.createdAt);
            return (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.color}`}>
                  <MetaIcon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                    <span className="text-[10px] text-muted-foreground">{log.target} · {log.targetId}</span>
                  </div>
                  <div className="text-xs text-foreground">{log.details}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    by <span className="text-foreground">{log.adminName}</span> · {dt.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} at {dt.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Activity size={24} className="text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No activity found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
