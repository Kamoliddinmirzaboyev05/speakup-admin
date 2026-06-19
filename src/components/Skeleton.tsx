/** Reusable shimmer skeleton primitives used across data pages while loading. */

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

/** A skeleton block sized like a stat card (Dashboard / billing stats). */
export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <Skeleton className="w-9 h-9 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

/** A skeleton table body. Renders `rows` x `cols` shimmering cells. */
export function SkeletonTableRows({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-border/50">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className="h-3.5 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** A skeleton row sized like a list item (Questions groups, feedback). */
export function SkeletonListRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/5" />
          </div>
        </div>
      ))}
    </>
  );
}
