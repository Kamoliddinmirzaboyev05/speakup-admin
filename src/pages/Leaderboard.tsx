import { Trophy } from "lucide-react";
import { useUsers } from "@/hooks/queries";
import { SkeletonTableRows } from "@/components/Skeleton";
import type { AdminUser } from "@/types";

function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}`;
}

export default function Leaderboard() {
  // Top users by all-time minutes (real data).
  const { data, isLoading } = useUsers({ limit: 100, offset: 0 });
  const ranked = [...(data?.items ?? [])]
    .sort((a: AdminUser, b: AdminUser) => b.total_minutes - a.total_minutes)
    .slice(0, 50);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-foreground">Leaderboard — users with the most minutes</h3>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Rank", "User", "Total minutes", "Streak", "Sessions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && <SkeletonTableRows rows={10} cols={5} />}
              {!isLoading && ranked.map((u, i) => {
                const name = u.first_name || u.username || `#${u.id}`;
                return (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3 font-mono text-foreground w-16">{medal(i + 1)}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{name}{u.username && <span className="text-muted-foreground"> @{u.username}</span>}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{u.total_minutes}</td>
                    <td className="px-4 py-3"><span className="text-amber-400">🔥 {u.streak}</span></td>
                    <td className="px-4 py-3 font-mono text-muted-foreground">{u.sessions_count}</td>
                  </tr>
                );
              })}
              {!isLoading && ranked.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
