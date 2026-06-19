import { useEffect, useState } from "react";
import {
  Wallet, Crown, Clock, Star, CreditCard, Image as ImageIcon, X,
  Check, Ban, Loader2, Coins, MessageSquare,
} from "lucide-react";
import {
  usePayments, useBillingStats, usePaymentMutations,
  useFeedback, useFeedbackMutations,
} from "@/hooks/queries";
import { billingService } from "@/services/billing";
import { SkeletonCard, SkeletonTableRows, SkeletonListRows } from "@/components/Skeleton";
import type { Payment, PaymentStatus } from "@/types";

const fmtUzs = (n: number | null) =>
  n == null ? "—" : new Intl.NumberFormat("uz").format(n) + " so'm";

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("uz", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const STATUS_TABS: { key: PaymentStatus; label: string }[] = [
  { key: "pending", label: "Kutilmoqda" },
  { key: "confirmed", label: "Tasdiqlangan" },
  { key: "rejected", label: "Rad etilgan" },
];

const statusBadge: Record<PaymentStatus, string> = {
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  confirmed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

// ── Screenshot modal (blob-fetched so the Bearer header is sent) ──────────────
function ScreenshotModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(false);
    billingService
      .paymentScreenshot(payment.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [payment.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground">To'lov cheki</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{payment.user_name ?? `#${payment.telegram_id}`} · {payment.plan ?? "—"}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-5 flex items-center justify-center min-h-[240px] bg-muted/20">
          {error ? (
            <p className="text-xs text-red-400">Chekni yuklab bo'lmadi</p>
          ) : url ? (
            <img src={url} alt="screenshot" className="max-h-[60vh] w-auto rounded-lg" />
          ) : (
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Billing stat card ─────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={17} /></div>
      <div>
        <div className="text-2xl font-bold text-foreground font-mono tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── Feedback moderation panel ─────────────────────────────────────────────────
function FeedbackPanel() {
  const { data, isLoading } = useFeedback();
  const m = useFeedbackMutations();
  const items = data ?? [];

  return (
    <div className="space-y-2">
      {isLoading && <SkeletonListRows rows={4} />}
      {!isLoading && items.map((f) => (
        <div key={f.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{f.name || "Anonim"}</span>
              <span className="text-amber-400 text-xs">{"★".repeat(Math.max(0, Math.min(5, f.rating)))}</span>
              {f.approved
                ? <span className="text-[10px] px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 font-medium">tasdiqlangan</span>
                : <span className="text-[10px] px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/20 font-medium">kutilmoqda</span>}
            </div>
            <p className="text-xs text-foreground mt-1.5">{f.text}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{fmtDate(f.created_at)}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            {!f.approved && (
              <button onClick={() => m.approve.mutate(f.id)} title="Tasdiqlash" className="p-2 rounded-lg hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400"><Check size={15} /></button>
            )}
            <button onClick={() => m.reject.mutate(f.id)} title="Rad etish / o'chirish" className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Ban size={15} /></button>
          </div>
        </div>
      ))}
      {!isLoading && items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Sharhlar yo'q</p>}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Payments() {
  const [tab, setTab] = useState<PaymentStatus | "feedback">("pending");
  const [shot, setShot] = useState<Payment | null>(null);

  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const isPaymentTab = tab !== "feedback";
  const { data, isLoading } = usePayments(isPaymentTab ? (tab as PaymentStatus) : undefined);
  const pm = usePaymentMutations();

  // Default-focus pending card payments first (what admins act on).
  const payments = [...(data ?? [])].sort((a, b) => {
    if (a.method !== b.method) return a.method === "card" ? -1 : 1;
    return +new Date(b.created_at) - +new Date(a.created_at);
  });

  return (
    <div className="space-y-5">
      {/* Billing stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading || !stats ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <StatCard icon={Wallet} label="Daromad (so'm)" value={new Intl.NumberFormat("uz").format(stats.revenue_uzs)} color="bg-emerald-500/10 text-emerald-400" />
            <StatCard icon={Star} label="Daromad (Stars)" value={stats.revenue_stars} color="bg-amber-500/10 text-amber-400" />
            <StatCard icon={Crown} label="Premium foydalanuvchilar" value={stats.premium_users} color="bg-purple-500/10 text-purple-400" />
            <StatCard icon={Clock} label="Kutilayotgan to'lovlar" value={stats.pending_payments} color="bg-pink-500/10 text-pink-400" />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-secondary/50 border border-border rounded-xl p-1 flex flex-wrap gap-1">
        {STATUS_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === t.key ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
        <button onClick={() => setTab("feedback")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${tab === "feedback" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
          <MessageSquare size={13} /> Sharhlar
        </button>
      </div>

      {tab === "feedback" ? (
        <FeedbackPanel />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Foydalanuvchi", "Tarif", "Usul", "Summa", "Holat", "Sana", "Amal"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && <SkeletonTableRows rows={6} cols={7} />}
                {!isLoading && payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.user_name ?? `#${p.telegram_id}`}</div>
                      <div className="text-muted-foreground font-mono text-[11px]">{p.telegram_id}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.plan ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${p.method === "stars" ? "text-amber-400 bg-amber-400/10" : "text-cyan-400 bg-cyan-400/10"}`}>
                        {p.method === "stars" ? <Coins size={11} /> : <CreditCard size={11} />}
                        {p.method === "stars" ? "Stars" : "Karta"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground whitespace-nowrap">
                      {p.method === "stars" ? `${p.amount_stars ?? 0} ⭐` : fmtUzs(p.amount_uzs)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusBadge[p.status]}`}>
                        {STATUS_TABS.find((t) => t.key === p.status)?.label ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {p.method === "card" && p.screenshot_file_id && (
                          <button onClick={() => setShot(p)} title="Chekni ko'rish" className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"><ImageIcon size={15} /></button>
                        )}
                        {p.status === "pending" && (
                          <>
                            <button onClick={() => pm.confirm.mutate(p.id)} disabled={pm.confirm.isPending} title="Tasdiqlash" className="p-1.5 rounded-lg hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400 disabled:opacity-50"><Check size={15} /></button>
                            <button onClick={() => pm.reject.mutate(p.id)} disabled={pm.reject.isPending} title="Rad etish" className="p-1.5 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500 disabled:opacity-50"><Ban size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && payments.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">To'lovlar yo'q</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {shot && <ScreenshotModal payment={shot} onClose={() => setShot(null)} />}
    </div>
  );
}
