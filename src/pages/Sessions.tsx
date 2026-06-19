import { useState } from "react";
import { useSessions } from "@/hooks/queries";

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const PER_PAGE = 25;

export default function Sessions() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useSessions({ limit: PER_PAGE, offset: page * PER_PAGE });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">{total} ta sessiya</div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["#", "Foydalanuvchi", "Hamroh", "Tur", "Mavzu", "Davomiyligi", "Boshlandi", "Tugadi"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Yuklanmoqda…</td></tr>}
              {!isLoading && items.map((ss) => (
                <tr key={ss.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-muted-foreground">{ss.id}</td>
                  <td className="px-4 py-3 text-foreground font-medium">{ss.user_name ?? `#${ss.user_id}`}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ss.partner_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${ss.is_ai ? "text-cyan-400 bg-cyan-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                      {ss.is_ai ? "AI" : "Real"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{ss.topic ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{fmtDur(ss.duration_sec)}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{new Date(ss.start_time).toLocaleString("uz", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{ss.end_time ? new Date(ss.end_time).toLocaleString("uz", { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                </tr>
              ))}
              {!isLoading && items.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Sessiyalar yo'q</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{page + 1} / {pageCount} sahifa</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Oldingi</button>
            <button onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
              className="px-3 py-1.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors">Keyingi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
