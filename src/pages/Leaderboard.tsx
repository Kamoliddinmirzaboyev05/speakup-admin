import { useState } from "react";
import { Trophy, RefreshCw, Plus, Minus, X, CheckCircle, Globe } from "lucide-react";
import { mockLeaderboard } from "../data/mock";
import type { LeaderboardEntry } from "../types";

const levelBadge: Record<string, string> = {
  beginner: "text-emerald-400 bg-emerald-400/10",
  intermediate: "text-amber-400 bg-amber-400/10",
  advanced: "text-purple-400 bg-purple-400/10",
};

function AdjustModal({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
  const [delta, setDelta] = useState(0);
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);
  const apply = () => { setDone(true); setTimeout(onClose, 1200); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Adjust Minutes</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={15} /></button>
        </div>
        {done ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <CheckCircle size={30} className="text-emerald-400" />
            <p className="text-sm text-foreground">Adjusted successfully!</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4">
              Adjusting weekly minutes for <span className="text-foreground font-medium">{entry.userName}</span>
              {" "}(current: <span className="font-mono text-foreground">{entry.weeklyMinutes}m</span>)
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-2">Delta (minutes)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDelta((d) => d - 5)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                    <Minus size={13} />
                  </button>
                  <div className={`flex-1 text-center text-lg font-mono font-bold ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-foreground"}`}>
                    {delta > 0 ? "+" : ""}{delta}m
                  </div>
                  <button onClick={() => setDelta((d) => d + 5)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
                    <Plus size={13} />
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  {[-30, -15, 15, 30, 60].map((v) => (
                    <button key={v} onClick={() => setDelta(v)}
                      className={`flex-1 py-1 rounded text-[10px] border transition-all ${delta === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/80"}`}>
                      {v > 0 ? "+" : ""}{v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Admin note</label>
                <input value={note} onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Reason for adjustment…" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={apply} disabled={delta === 0} className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Apply</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [adjustEntry, setAdjustEntry] = useState<LeaderboardEntry | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleReset = () => {
    if (!confirm("Reset the weekly leaderboard? All weekly minutes will be set to 0.")) return;
    setResetting(true);
    setTimeout(() => {
      setEntries((prev) => prev.map((e) => ({ ...e, weeklyMinutes: 0 })).sort((a, b) => b.weeklyMinutes - a.weeklyMinutes).map((e, i) => ({ ...e, rank: i + 1 })));
      setResetting(false);
    }, 1000);
  };

  const maxMinutes = Math.max(...entries.map((e) => e.weeklyMinutes), 1);

  return (
    <div className="space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Week of Jun 11 – Jun 17, 2025 · {entries.length} participants
        </div>
        <button onClick={handleReset} disabled={resetting}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-all">
          <RefreshCw size={13} className={resetting ? "animate-spin" : ""} />
          Reset Week
        </button>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {entries.slice(0, 3).map((e, i) => {
          const medals = ["🥇", "🥈", "🥉"];
          const sizes = ["order-2 pt-0", "order-1 pt-4", "order-3 pt-8"];
          const rings = ["ring-2 ring-amber-400/40", "ring-2 ring-slate-400/40", "ring-2 ring-amber-700/40"];
          return (
            <div key={e.userId} className={`${sizes[i]} bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 text-center`}>
              <div className={`w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary ${rings[i]}`}>
                {e.userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div className="text-lg">{medals[i]}</div>
              <div className="text-xs font-semibold text-foreground leading-tight">{e.userName}</div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Globe size={9} /> {e.country}
              </div>
              <div className="text-base font-mono font-bold text-foreground">{e.weeklyMinutes}m</div>
              <div className="text-[10px] text-amber-400">🔥 {e.streak} streak</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelBadge[e.level]}`}>{e.level}</span>
            </div>
          );
        })}
      </div>

      {/* Full table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <Trophy size={15} className="text-amber-400" />
          <span className="text-sm font-semibold text-foreground">Full Ranking</span>
        </div>
        <div className="divide-y divide-border/50">
          {entries.map((e) => (
            <div key={e.userId} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors group">
              <span className={`font-mono text-sm font-bold w-6 text-center shrink-0 ${e.rank <= 3 ? "text-amber-400" : "text-muted-foreground"}`}>
                {e.rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-semibold text-primary shrink-0">
                {e.userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{e.userName}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Globe size={9} /> {e.country}
                </div>
              </div>
              {/* Progress bar */}
              <div className="hidden sm:flex flex-1 max-w-32 items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(e.weeklyMinutes / maxMinutes) * 100}%` }} />
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelBadge[e.level]} hidden sm:inline`}>{e.level}</span>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-bold text-foreground">{e.weeklyMinutes}m</div>
                <div className="text-[11px] text-amber-400">🔥 {e.streak}</div>
              </div>
              <button onClick={() => setAdjustEntry(e)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all">
                <Plus size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {adjustEntry && <AdjustModal entry={adjustEntry} onClose={() => setAdjustEntry(null)} />}
    </div>
  );
}
