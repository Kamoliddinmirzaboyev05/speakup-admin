import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Clock, Gift, Users2, CreditCard, Check } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/queries";
import { Skeleton } from "@/components/Skeleton";
import type { AdminSettings } from "@/types";

const inputCls = "w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40";
const labelCls = "text-xs font-medium text-foreground block mb-1";

function Section({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon size={15} /></div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {desc && <p className="text-[11px] text-muted-foreground">{desc}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { data, isLoading } = useSettings();
  const save = useUpdateSettings();
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm({ ...data, referral_tiers: data.referral_tiers.map((t) => [...t] as [number, number]) });
  }, [data]);

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const setTier = (i: number, idx: 0 | 1, v: number) =>
    setForm((f) => {
      if (!f) return f;
      const tiers = f.referral_tiers.map((t) => [...t] as [number, number]);
      tiers[i][idx] = v;
      return { ...f, referral_tiers: tiers };
    });

  const addTier = () => setForm((f) => (f ? { ...f, referral_tiers: [...f.referral_tiers, [1, 1]] } : f));
  const removeTier = (i: number) =>
    setForm((f) => (f ? { ...f, referral_tiers: f.referral_tiers.filter((_, j) => j !== i) } : f));

  const onSave = async () => {
    if (!form) return;
    await save.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading || !form) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <Section icon={Clock} title="Bepul daqiqalar" desc="Har kunlik bepul limit">
        <label className={labelCls}>Kunlik bepul daqiqalar</label>
        <input type="number" value={form.free_daily_minutes} onChange={(e) => set("free_daily_minutes", Number(e.target.value))} className={inputCls} />
      </Section>

      <Section icon={Gift} title="Bonus" desc="Kanalga obuna uchun bonus">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Kunlik bonus daqiqalar</label>
            <input type="number" value={form.daily_bonus_minutes} onChange={(e) => set("daily_bonus_minutes", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Bonus kanal username</label>
            <input value={form.bonus_channel_username} onChange={(e) => set("bonus_channel_username", e.target.value)} className={inputCls} placeholder="@speakup" />
          </div>
        </div>
      </Section>

      <Section icon={Users2} title="Referal darajalari" desc="[do'stlar soni, beriladigan kunlar]">
        <div className="space-y-2">
          {form.referral_tiers.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <input type="number" value={t[0]} onChange={(e) => setTier(i, 0, Number(e.target.value))} className={inputCls} placeholder="do'stlar" />
              </div>
              <span className="text-muted-foreground text-xs shrink-0">do'st →</span>
              <div className="flex-1">
                <input type="number" value={t[1]} onChange={(e) => setTier(i, 1, Number(e.target.value))} className={inputCls} placeholder="kun" />
              </div>
              <button onClick={() => removeTier(i)} className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          ))}
          <button onClick={addTier} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-1">
            <Plus size={13} /> Daraja qo'shish
          </button>
        </div>
      </Section>

      <Section icon={CreditCard} title="Karta ma'lumotlari" desc="Karta orqali to'lov uchun">
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Karta raqami</label>
            <input value={form.card_number} onChange={(e) => set("card_number", e.target.value)} className={inputCls} placeholder="8600 0000 0000 0000" />
          </div>
          <div>
            <label className={labelCls}>Karta egasi</label>
            <input value={form.card_holder} onChange={(e) => set("card_holder", e.target.value)} className={inputCls} placeholder="ISM FAMILIYA" />
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={onSave} disabled={save.isPending} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-60">
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saqlandi" : save.isPending ? "Saqlanmoqda…" : "Saqlash"}
        </button>
      </div>
    </div>
  );
}
