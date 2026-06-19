import { useState } from "react";
import { Plus, Pencil, Trash2, X, Star, Coins, CalendarDays, BadgeCheck, EyeOff } from "lucide-react";
import { usePlans, usePlanMutations } from "@/hooks/queries";
import { Skeleton } from "@/components/Skeleton";
import type { Plan, PlanInput } from "@/types";

const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40";
const labelCls = "text-xs text-muted-foreground block mb-1";

const fmtUzs = (n: number) => new Intl.NumberFormat("uz").format(n);

const emptyPlan: PlanInput = {
  key: "", title: "", price_uzs: 0, price_stars: 0,
  duration_days: 30, is_popular: false, active: true, sort_order: 0,
};

function PlanModal({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const m = usePlanMutations();
  const [form, setForm] = useState<PlanInput>(plan ? { ...plan } : { ...emptyPlan });
  const set = <K extends keyof PlanInput>(k: K, v: PlanInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.key.trim() || !form.title.trim()) return;
    if (plan) await m.update.mutateAsync({ id: plan.id, d: form });
    else await m.create.mutateAsync(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{plan ? "Tarifni tahrirlash" : "Yangi tarif"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kalit (key)</label>
              <input value={form.key} onChange={(e) => set("key", e.target.value)} className={inputCls} placeholder="monthly" autoFocus />
            </div>
            <div>
              <label className={labelCls}>Sarlavha</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} placeholder="1 oylik Premium" />
            </div>
            <div>
              <label className={labelCls}>Narx (so'm)</label>
              <input type="number" value={form.price_uzs} onChange={(e) => set("price_uzs", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Narx (Stars)</label>
              <input type="number" value={form.price_stars} onChange={(e) => set("price_stars", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Davomiyligi (kun)</label>
              <input type="number" value={form.duration_days} onChange={(e) => set("duration_days", Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tartib (sort)</label>
              <input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center gap-5 pt-1">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input type="checkbox" checked={form.is_popular} onChange={(e) => set("is_popular", e.target.checked)} className="accent-primary" />
              Mashhur (popular)
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="accent-primary" />
              Faol
            </label>
          </div>
          <div className="flex gap-2 pt-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground">Bekor</button>
            <button onClick={save} disabled={m.create.isPending || m.update.isPending} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60">Saqlash</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Plans() {
  const { data, isLoading } = usePlans();
  const m = usePlanMutations();
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);

  const plans = [...(data ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{plans.length} ta tarif</p>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90">
          <Plus size={14} /> Tarif qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
        {!isLoading && plans.map((p) => (
          <div key={p.id} className={`relative bg-card border rounded-xl p-5 ${p.is_popular ? "border-primary/60" : "border-border"} ${!p.active ? "opacity-60" : ""}`}>
            {p.is_popular && (
              <span className="absolute -top-2.5 left-5 text-[10px] px-2 py-0.5 rounded-full bg-primary text-white font-semibold flex items-center gap-1">
                <Star size={10} /> Mashhur
              </span>
            )}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                <code className="text-[11px] text-muted-foreground">{p.key}</code>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(p)} title="Tahrirlash" className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"><Pencil size={14} /></button>
                <button onClick={() => { if (confirm(`"${p.title}" tarifini o'chirasizmi?`)) m.remove.mutate(p.id); }} title="O'chirish" className="p-1.5 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-foreground"><Coins size={13} className="text-emerald-400" /><span className="font-mono font-semibold">{fmtUzs(p.price_uzs)} so'm</span></div>
              <div className="flex items-center gap-2 text-foreground"><Star size={13} className="text-amber-400" /><span className="font-mono">{p.price_stars} Stars</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays size={13} /><span>{p.duration_days} kun</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              {p.active
                ? <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 font-medium"><BadgeCheck size={11} /> Faol</span>
                : <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full text-muted-foreground bg-muted border border-border font-medium"><EyeOff size={11} /> Nofaol</span>}
            </div>
          </div>
        ))}
        {!isLoading && plans.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full text-center py-8">Tariflar yo'q. "Tarif qo'shish" bosing.</p>
        )}
      </div>

      {(creating || editing) && <PlanModal plan={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
    </div>
  );
}
