import { statLabel, type CountStat } from "@/lib/api/game-counts";
import { cn } from "@/lib/utils";

// The club's numbers on the NR-GOTM feature card.
export function NrFeatureStats({ stats }: { stats: CountStat[] }) {
  return (
    <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {stats.map((stat) => (
        <div key={stat.key} className="flex items-baseline gap-1.5">
          <dt className="font-label order-2 text-[0.8rem] font-extrabold text-dim-foreground">
            {statLabel(stat, "cover")}
          </dt>
          <dd
            className={cn(
              "font-headline text-[1.5rem] leading-none",
              stat.key === "playing" && "text-nr-soft",
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
