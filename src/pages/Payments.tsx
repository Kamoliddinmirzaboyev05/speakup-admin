import { useState, useMemo, useEffect } from "react";
import {
  Search, Filter, Download, X, CheckCircle, Clock, XCircle,
  RotateCcw, Plus, Edit2, Zap, Star, CreditCard,
} from "lucide-react";
import { usePayments, usePlans } from "@/hooks/queries";
import type { Payment, PaymentStatus, Plan } from "../types";

const statusBadge: Record<PaymentStatus, { cls: string; icon: React.ElementType; label: string }> = {
  paid: { cls: "text-emerald-400 bg-emerald-400/10", icon: CheckCircle, label: "Paid" },
  pending: { cls: "text-amber-400 bg-amber-400/10", icon: Clock, label: "Pending" },
  failed: { cls: "text-red-400 bg-red-400/10", icon: XCircle, label: "Failed" },
  refunded: { cls: "text-blue-400 bg-blue-400/10", icon: RotateCcw, label: "Refunded" },
};

const providerBadge: Record<string, string> = {
  telegram_stars: "text-yellow-400",
  payme: "text-blue-400",
  click: "text-green-400",
  stripe: "text-violet-400",
};

function PlanModal({ plan, onClose, onSave }: { plan: Plan | null; onClose: () => void; onSave: (p: Plan) => void }) {
  const isNew = !plan?.id;
  const [form, setForm] = useState<Plan>(
    plan ?? {
      id: `plan_${Date.now()}`,
      type: "premium_monthly",
      name: "New Plan",
      price: 4.99,
      currency: "USD",
      durationDays: 30,
      minutesPerDay: 60,
      features: ["60 min/day", "All topics"],
      isActive: true,
    }
  );
  const [featInput, setFeatInput] = useState(form.features.join("\n"));
  const [saved, setSaved] = useState(false);
  const handle = () => {
    setSaved(true);
    setTimeout(() => {
      onSave({ ...form, features: featInput.split("\n").filter(Boolean) });
      onClose();
    }, 900);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{isNew ? "New Plan" : "Edit Plan"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        {saved ? (
          <div className="flex flex-col items-center gap-2 py-10"><CheckCircle size={32} className="text-emerald-400" /><p className="text-sm text-foreground">Saved!</p></div>
        ) : (
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Plan Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Price (USD)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Duration (days)</label>
                <input type="number" value={form.durationDays} onChange={(e) => setForm((f) => ({ ...f, durationDays: parseInt(e.target.value) }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Minutes/day</label>
                <input type="number" value={form.minutesPerDay} onChange={(e) => setForm((f) => ({ ...f, minutesPerDay: parseInt(e.target.value) }))}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Features (one per line)</label>
              <textarea value={featInput} onChange={(e) => setFeatInput(e.target.value)} rows={4}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handle} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">Save Plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function exportCSV(payments: Payment[]) {
  const rows = [
    ["ID", "User", "Amount", "Currency", "Plan", "Status", "Provider", "Created"],
    ...payments.map((p) => [p.id, p.userName, p.amount, p.currency, p.plan, p.status, p.provider, p.createdAt]),
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "payments.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Payments() {
  const [tab, setTab] = useState<"transactions" | "plans">("transactions");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const { data: paymentsData } = usePayments();
  const { data: plansData } = usePlans();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  useEffect(() => { if (paymentsData) setPayments(paymentsData); }, [paymentsData]);
  useEffect(() => { if (plansData) setPlans(plansData); }, [plansData]);
  const [editPlan, setEditPlan] = useState<Plan | null | undefined>(undefined);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const filtered = useMemo(() =>
    payments.filter((p) => {
      if (search && !`${p.userName} ${p.id}`.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (providerFilter !== "all" && p.provider !== providerFilter) return false;
      return true;
    }),
    [payments, search, statusFilter, providerFilter]
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pageCount = Math.ceil(filtered.length / PER_PAGE);

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const refundHandler = (id: string) => setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "refunded" as PaymentStatus } : p));

  const planIcons: Record<string, React.ReactNode> = {
    free: <Zap size={14} className="text-muted-foreground" />,
    premium_monthly: <Star size={14} className="text-blue-400" />,
    premium_yearly: <Star size={14} className="text-amber-400" fill="currentColor" />,
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "text-emerald-400" },
          { label: "Paid", value: payments.filter((p) => p.status === "paid").length, color: "text-blue-400" },
          { label: "Pending", value: payments.filter((p) => p.status === "pending").length, color: "text-amber-400" },
          { label: "Failed / Refunded", value: payments.filter((p) => ["failed", "refunded"].includes(p.status)).length, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <CreditCard size={16} className={color} />
            <div>
              <div className={`text-base font-mono font-bold ${color}`}>{value}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["transactions", "plans"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-medium capitalize transition-all border-b-2 -mb-px ${tab === t ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "transactions" && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2 flex-1">
              <Search size={13} className="text-muted-foreground" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by user or payment ID…"
                className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1" />
              {search && <button onClick={() => setSearch("")}><X size={12} className="text-muted-foreground" /></button>}
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="bg-muted/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer">
                {["all", "paid", "pending", "failed", "refunded"].map((o) => <option key={o} value={o}>{o === "all" ? "All Status" : o}</option>)}
              </select>
              <select value={providerFilter} onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
                className="bg-muted/40 border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none cursor-pointer">
                {["all", "telegram_stars", "payme", "click", "stripe"].map((o) => <option key={o} value={o}>{o === "all" ? "All Providers" : o.replace(/_/g, " ")}</option>)}
              </select>
              <button onClick={() => exportCSV(filtered)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Download size={12} /> CSV
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["ID", "User", "Amount", "Plan", "Provider", "Status", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p) => {
                    const st = statusBadge[p.status];
                    const StIcon = st.icon;
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono text-muted-foreground">{p.id}</td>
                        <td className="px-4 py-3 text-foreground font-medium">{p.userName}</td>
                        <td className="px-4 py-3 font-mono font-bold text-foreground">${p.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.plan.replace(/_/g, " ")}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-medium ${providerBadge[p.provider]}`}>
                            {p.provider.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${st.cls}`}>
                            <StIcon size={9} /> {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          {p.status === "paid" && (
                            <button onClick={() => refundHandler(p.id)} className="text-[10px] px-2 py-1 rounded border border-blue-400/30 text-blue-400 hover:bg-blue-400/10 transition-colors">
                              Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Page {page} of {pageCount}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page === pageCount}
                  className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "plans" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setEditPlan(null)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
              <Plus size={13} /> New Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-card border rounded-xl p-5 flex flex-col gap-4 relative ${plan.type === "premium_yearly" ? "border-amber-400/30" : "border-border"}`}>
                {plan.type === "premium_yearly" && (
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 font-medium">Best Value</div>
                )}
                <div className="flex items-center gap-2">
                  {planIcons[plan.type]}
                  <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                </div>
                <div>
                  <span className="text-3xl font-bold font-mono text-foreground">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground ml-1">/{plan.durationDays === 30 ? "mo" : "yr"}</span>}
                </div>
                <div className="text-xs text-muted-foreground">{plan.minutesPerDay === 999 ? "Unlimited" : `${plan.minutesPerDay}`} min/day</div>
                <ul className="space-y-1.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle size={11} className="text-emerald-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${plan.isActive ? "text-emerald-400 bg-emerald-400/10" : "text-muted-foreground bg-muted/50"}`}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={() => setEditPlan(plan)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editPlan !== undefined && (
        <PlanModal
          plan={editPlan}
          onClose={() => setEditPlan(undefined)}
          onSave={(p) => setPlans((prev) => {
            const idx = prev.findIndex((x) => x.id === p.id);
            if (idx >= 0) { const next = [...prev]; next[idx] = p; return next; }
            return [...prev, p];
          })}
        />
      )}
    </div>
  );
}
