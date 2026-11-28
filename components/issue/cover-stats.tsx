import { countStats, statLabel, type GameCounts } from "@/lib/api/game-counts";
import { cn } from "@/lib/utils";

// The club's numbers in the masthead voice: Anton numerals over condensed
// caps, Playing in the track's accent. Narrow panels keep two.
export function CoverStats({
  counts,
  accent,
  small,
  compact,
  narrow,
}: {
  counts: GameCounts;
  accent: string;
  small: boolean;
  compact: boolean;
  // A co-winner's narrower panel.
  narrow: boolean;
}) {
  // Compact covers leave Reviews out to keep their two-number line.
  const stats = countStats(compact ? { ...counts, reviews: null } : counts);
  if (stats.length === 0) return null;
  return (
    <dl
      data-slot="cover-stats"
      className={cn(
        // Tighter on co-winner panels so all three counts hold one line and
        // the action rows stay level across the split.
        "flex flex-wrap gap-y-1",
        narrow ? "gap-x-3" : "gap-x-4.5",
        small ? "mt-2.5" : "mt-3.5",
      )}
    >
      {stats.map((stat) => (
        <div key={stat.key} className="flex items-baseline gap-1.5">
          <dt className="font-label order-2 text-[0.82rem] font-extrabold text-dim-foreground">
            {statLabel(stat, "cover")}
          </dt>
          <dd
            data-slot="cover-stat-value"
            data-accent={stat.key === "playing" || undefined}
            className={cn(
              "font-headline leading-none",
              small ? "text-[1.4rem]" : narrow ? "text-[1.55rem]" : "text-[1.75rem]",
              stat.key === "playing" && accent,
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
