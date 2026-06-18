import { useState } from "react";
import {
  Gift, Plus, Trash2, Copy, CheckCircle, Users, Zap, X,
  RefreshCw, Percent,
} from "lucide-react";
import { mockPromoCodes, mockUsers } from "../data/mock";
import type { PromoCode } from "../types";

function GiveBonusModal({ onClose }: { onClose: () => void }) {
  const [target, setTarget] = useState<"specific" | "all" | "premium">("specific");
  const [userId, setUserId] = useState("");
  const [minutes, setMinutes] = useState(30);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);
  const userSearch = mockUsers.filter((u) =>
    userId.length > 1 && `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase().includes(userId.toLowerCase())
  ).slice(0, 5);

  const handle = () => { setDone(true); setTimeout(onClose, 1200); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Give Bonus Minutes</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-10"><CheckCircle size={32} className="text-emerald-400" /><p className="text-sm text-foreground">Bonus granted!</p></div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Target</label>
              <div className="grid grid-cols-3 gap-2">
                {([["specific", "Specific User", Users], ["all", "All Users", Zap], ["premium", "Premium Only", Percent]] as const).map(([val, label, Icon]) => (
                  <button key={val} onClick={() => setTarget(val)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all ${target === val ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>
            {target === "specific" && (
              <div className="relative">
                <label className="text-xs text-muted-foreground block mb-1">Search User</label>
                <input value={userId} onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Name or username…" />
                {userSearch.length > 0 && (
                  <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-lg overflow-hidden z-10 shadow-xl">
                    {userSearch.map((u) => (
                      <button key={u.id} onClick={() => { setUserId(`${u.firstName} ${u.lastName}`); }}
                        className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary">{u.firstName[0]}</div>
                        {u.firstName} {u.lastName} <span className="text-muted-foreground">@{u.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground block mb-2">Minutes</label>
              <div className="flex gap-2">
                {[15, 30, 60, 120, 240].map((m) => (
                  <button key={m} onClick={() => setMinutes(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${minutes === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                placeholder="e.g. System downtime compensation" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handle} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                Grant {minutes}m {target === "all" ? "to All" : target === "premium" ? "to Premium" : ""}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreatePromoModal({ onClose, onSave }: { onClose: () => void; onSave: (p: PromoCode) => void }) {
  const [form, setForm] = useState({ code: "", bonusMinutes: 30, maxUses: 100, expiresInDays: 30 });
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof form, v: unknown) => setForm((f) => ({ ...f, [k]: v }));
  const genCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    setForm((f) => ({ ...f, code: Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("") }));
  };
  const handle = () => {
    setDone(true);
    const exp = new Date(); exp.setDate(exp.getDate() + form.expiresInDays);
    setTimeout(() => {
      onSave({
        id: `promo_${Date.now()}`,
        code: form.code,
        bonusMinutes: form.bonusMinutes,
        maxUses: form.maxUses,
        usedCount: 0,
        expiresAt: exp.toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      onClose();
    }, 900);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Create Promo Code</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-10"><CheckCircle size={32} className="text-emerald-400" /><p className="text-sm text-foreground">Promo code created!</p></div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Code</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())}
                  className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 uppercase"
                  placeholder="PROMO2025" maxLength={16} />
                <button onClick={genCode} className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors" title="Generate">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            {[
              { label: "Bonus Minutes", key: "bonusMinutes", min: 1, max: 999 },
              { label: "Max Uses", key: "maxUses", min: 1, max: 100000 },
              { label: "Expires In (days)", key: "expiresInDays", min: 1, max: 365 },
            ].map(({ label, key, min, max }) => (
              <div key={key}>
                <label className="text-xs text-muted-foreground block mb-1">{label}</label>
                <input type="number" min={min} max={max} value={(form as unknown as Record<string, number>)[key]}
                  onChange={(e) => set(key as keyof typeof form, parseInt(e.target.value) as never)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handle} disabled={!form.code} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Create</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Bonuses() {
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [codes, setCodes] = useState<PromoCode[]>(mockPromoCodes);
  const [copied, setCopied] = useState<string | null>(null);
  const [referralBonus, setReferralBonus] = useState(15);
  const [referredBonus, setReferredBonus] = useState(10);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(null), 1500); });
  };

  const toggleCode = (id: string) => setCodes((prev) => prev.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
  const deleteCode = (id: string) => setCodes((prev) => prev.filter((c) => c.id !== id));

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => setShowBonusModal(true)}
          className="bg-card border border-border hover:border-primary/30 rounded-xl p-5 flex items-center gap-4 text-left transition-all group">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gift size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Give Bonus Minutes</div>
            <div className="text-xs text-muted-foreground mt-0.5">Grant minutes to specific user or all users</div>
          </div>
        </button>
        <button onClick={() => setShowPromoModal(true)}
          className="bg-card border border-border hover:border-primary/30 rounded-xl p-5 flex items-center gap-4 text-left transition-all group">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Percent size={18} className="text-violet-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Create Promo Code</div>
            <div className="text-xs text-muted-foreground mt-0.5">Generate redeemable codes with bonus minutes</div>
          </div>
        </button>
      </div>

      {/* Referral settings */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <div className="text-sm font-semibold text-foreground">Referral Rewards</div>
          <div className="text-xs text-muted-foreground mt-0.5">Bonus minutes awarded for referrals</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Referrer gets (minutes)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={referralBonus} onChange={(e) => setReferralBonus(parseInt(e.target.value))}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">Referred user gets (minutes)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={referredBonus} onChange={(e) => setReferredBonus(parseInt(e.target.value))}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">
          Save Referral Settings
        </button>
      </div>

      {/* Promo codes */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="text-sm font-semibold text-foreground">Promo Codes</div>
          <button onClick={() => setShowPromoModal(true)} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
            <Plus size={13} /> New Code
          </button>
        </div>
        <div className="divide-y divide-border/50">
          {codes.map((code) => {
            const isExpired = new Date(code.expiresAt) < new Date();
            const usagePct = (code.usedCount / code.maxUses) * 100;
            return (
              <div key={code.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors ${!code.isActive || isExpired ? "opacity-50" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-sm text-foreground">{code.code}</span>
                    <button onClick={() => copyCode(code.code)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {copied === code.code ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${code.isActive && !isExpired ? "text-emerald-400 bg-emerald-400/10" : "text-muted-foreground bg-muted/50"}`}>
                      {isExpired ? "Expired" : code.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="text-emerald-400 font-medium">+{code.bonusMinutes}m</span>
                    <span>{code.usedCount} / {code.maxUses} uses</span>
                    <span>Expires {new Date(code.expiresAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="mt-2 w-48 bg-muted rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleCode(code.id)} className={`p-1.5 rounded text-xs transition-colors ${code.isActive ? "text-amber-400 hover:bg-amber-400/10" : "text-muted-foreground hover:bg-muted"}`}>
                    {code.isActive ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => deleteCode(code.id)} className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showBonusModal && <GiveBonusModal onClose={() => setShowBonusModal(false)} />}
      {showPromoModal && (
        <CreatePromoModal
          onClose={() => setShowPromoModal(false)}
          onSave={(p) => setCodes((prev) => [p, ...prev])}
        />
      )}
    </div>
  );
}
