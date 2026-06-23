import { Check, Ban } from "lucide-react";
import { useFeedback, useFeedbackMutations } from "@/hooks/queries";
import { SkeletonListRows } from "@/components/Skeleton";

const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleString("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function Feedback() {
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
              <span className="text-sm font-medium text-foreground">{f.name || "Anonymous"}</span>
              <span className="text-amber-400 text-xs">{"★".repeat(Math.max(0, Math.min(5, f.rating)))}</span>
              {f.approved
                ? <span className="text-[10px] px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20 font-medium">approved</span>
                : <span className="text-[10px] px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/20 font-medium">pending</span>}
            </div>
            <p className="text-xs text-foreground mt-1.5">{f.text}</p>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">{fmtDate(f.created_at)}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            {!f.approved && (
              <button onClick={() => m.approve.mutate(f.id)} title="Approve" className="p-2 rounded-lg hover:bg-emerald-400/10 text-muted-foreground hover:text-emerald-400"><Check size={15} /></button>
            )}
            <button onClick={() => m.reject.mutate(f.id)} title="Reject / delete" className="p-2 rounded-lg hover:bg-red-400/10 text-muted-foreground hover:text-red-500"><Ban size={15} /></button>
          </div>
        </div>
      ))}
      {!isLoading && items.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reviews</p>}
    </div>
  );
}
