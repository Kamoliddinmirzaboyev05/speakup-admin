import { useEffect, useState } from "react";
import { Search, X, Trash2, Loader2 } from "lucide-react";
import { useUsers, useDeleteUser } from "@/hooks/queries";
import { adminService } from "@/services/admin";
import { SkeletonTableRows } from "@/components/Skeleton";
import type { AdminUser, UserLevel } from "@/types";

const levelLabel: Record<UserLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
const levelBadge: Record<UserLevel, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  intermediate: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  advanced: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

function initials(name: string) {
  return (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Shows the user's Telegram profile photo when available (fetched as an authed
// blob), falling back to initials. The object URL is revoked on unmount.
function UserAvatar({ user, size = 32 }: { user: AdminUser; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!user.has_photo) { setUrl(null); return; }
    let alive = true;
    let obj: string | null = null;
    adminService
      .getUserPhoto(user.id)
      .then((u) => { if (alive) { obj = u; setUrl(u); } else { URL.revokeObjectURL(u); } })
      .catch(() => {});
    return () => { alive = false; if (obj) URL.revokeObjectURL(obj); };
  }, [user.id, user.has_photo]);

  const name = user.first_name || user.username || `#${user.id}`;
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary/15 flex items-center justify-center font-semibold text-primary shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
    >
      {initials(name)}
    </div>
  );
}

function UserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const name = user.first_name || user.username || `#${user.id}`;
  const del = useDeleteUser();
  const [confirm, setConfirm] = useState(false);
  const onDelete = async () => {
    try {
      await del.mutateAsync(user.id);
      onClose();
    } catch {
      /* surfaced by the disabled state; keep modal open */
    }
  };
  const rows: [string, string | number][] = [
    ["Telegram ID", user.telegram_id],
    ["Username", user.username ? `@${user.username}` : "—"],
    ["Phone", user.phone ?? "—"],
    ["Level", user.level ? levelLabel[user.level] : "—"],
    ["Gender", user.gender ?? "—"],
    ["Location", user.location ?? "—"],
    ["Goal", user.goal ?? "—"],
    ["Challenge", user.challenge ?? "—"],
    ["Total minutes", user.total_minutes],
    ["Streak", `${user.streak} days`],
    ["Sessions", user.sessions_count],
    ["Onboarding", user.onboarded ? "Onboarded" : "Not onboarded"],
    ["Registered", new Date(user.created_at).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">User profile</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size={56} />
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

          <div className="pt-1">
            {!confirm ? (
              <button
                onClick={() => setConfirm(true)}
                className="flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} /> Delete user
              </button>
            ) : (
              <div className="space-y-2.5 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                <p className="text-xs text-muted-foreground">
                  Permanently delete <span className="text-foreground font-medium">{name}</span> and all their
                  sessions, ratings and feedback? This can't be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirm(false)}
                    disabled={del.isPending}
                    className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    disabled={del.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {del.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Confirm delete
                  </button>
                </div>
              </div>
            )}
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

  const del = useDeleteUser();
  const removeUser = (e: { stopPropagation: () => void }, u: AdminUser) => {
    e.stopPropagation();
    const name = u.first_name || u.username || `#${u.id}`;
    if (window.confirm(`Delete ${name}? This permanently removes the user and all their data.`)) {
      del.mutate(u.id);
    }
  };

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
          placeholder="Search by name, username or Telegram ID…"
          className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground flex-1"
        />
        {search && <button onClick={() => { setSearch(""); setPage(0); }}><X size={12} className="text-muted-foreground" /></button>}
        <span className="text-xs text-muted-foreground">{total}</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["User", "Level", "Phone", "Location", "Minutes", "Streak", "Sessions", "Registered"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
                <th className="px-4 py-3" />
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
                        <UserAvatar user={u} />
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
                    <td className="px-4 py-3 text-muted-foreground font-mono">{new Date(u.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "2-digit" })}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => removeUser(e, u)}
                        disabled={del.isPending}
                        title="Delete user"
                        className="text-muted-foreground hover:text-red-400 disabled:opacity-40 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!isLoading && items.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">No users found</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{page + 1} / {pageCount} pages · {total} results</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Previous</button>
            <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
