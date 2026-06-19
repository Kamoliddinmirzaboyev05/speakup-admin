import { useState } from "react";
import { Search, X } from "lucide-react";
import { useUsers } from "@/hooks/queries";
import { SkeletonTableRows } from "@/components/Skeleton";
import type { AdminUser, UserLevel } from "@/types";

const levelLabel: Record<UserLevel, string> = {
  beginner: "Boshlang'ich",
  intermediate: "O'rta",
  advanced: "Yuqori",
};
const levelBadge: Record<UserLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
      {(name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
    </div>
  );
}

function UserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const name = user.first_name || user.username || `#${user.id}`;
  const rows: [string, string | number][] = [
    ["Telegram ID", user.telegram_id],
    ["Username", user.username ? `@${user.username}` : "—"],
    ["Telefon", user.phone ?? "—"],
    ["Daraja", user.level ? levelLabel[user.level] : "—"],
    ["Jins", user.gender ?? "—"],
    ["Joylashuv", user.location ?? "—"],
    ["Maqsad", user.goal ?? "—"],
    ["Qiyinchilik", user.challenge ?? "—"],
    ["Jami daqiqa", user.total_minutes],
    ["Streak", `${user.streak} kun`],
    ["Sessiyalar", user.sessions_count],
    ["Onboarding", user.onboarded ? "Tugatgan" : "Tugatmagan"],
    ["Ro'yxatdan o'tgan", new Date(user.created_at).toLocaleDateString("uz", { year: "numeric", month: "short", day: "numeric" })],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Foydalanuvchi profili</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
              {(name[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">{name}</div>
              {user.username && <div className="text-xs text-muted-foreground">@{user.username}</div>}
              {user.level && (
                <span className={`inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full border font-medium ${levelBadge[user.level]}`}>
                  {levelLabel[user.level]}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2 text-xs">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-border/50">
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

const PER_PAGE = 20;

export default function Users() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AdminUser | null>(null);

  const { data, isLoading } = useUsers({ search: search || undefined, limit: PER_PAGE, offset: page * PER_PAGE });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-lg px-3 py-2">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Ism, username yoki Telegram ID bo'yicha qidirish…"
          className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1"
        />
        {search && <button onClick={() => { setSearch(""); setPage(0); }}><X size={12} className="text-muted-foreground" /></button>}
        <span className="text-xs text-muted-foreground">{total} ta</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Foydalanuvchi", "Daraja", "Telefon", "Joylashuv", "Daqiqa", "Streak", "Sessiya", "Ro'yxat"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTableRows rows={10} cols={8} />}
              {!isLoading && items.map((u) => {
                const name = u.first_name || u.username || `#${u.id}`;
                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 cursor-pointer" onClick={() => setSelected(u)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={name} />
                        <div>
                          <div className="font-medium text-foreground">{name}</div>
                          {u.username && <div className="text-muted-foreground">@{u.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {u.level ? <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${levelBadge[u.level]}`}>{levelLabel[u.level]}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{u.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.location ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{u.total_minutes}</td>
                    <td className="px-4 py-3"><span className="text-amber-400">🔥 {u.streak}</span></td>
                    <td className="px-4 py-3 font-mono text-foreground">{u.sessions_count}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">{new Date(u.created_at).toLocaleDateString("uz", { month: "short", day: "numeric", year: "2-digit" })}</td>
                  </tr>
                );
              })}
              {!isLoading && items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Foydalanuvchi topilmadi</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{page + 1} / {pageCount} sahifa · {total} natija</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Oldingi</button>
            <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Keyingi</button>
          </div>
        </div>
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
