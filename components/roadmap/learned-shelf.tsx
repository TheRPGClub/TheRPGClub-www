import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { reachedHeading } from "@/lib/roadmap/tree";
import type { RoadmapMilestone } from "@/lib/roadmap/types";

// The Shipped shelf at the foot of the trunk ("Already learned" in the Skill
// Tree): each Reached Milestone, newest first, headed "Shipped at <name> ·
// <month>", with the items that shipped with it. `controls` takes a
// Milestone and returns staff editing's Un-reach chip.
export function LearnedShelf({
  reached,
  controls,
}: {
  reached: readonly RoadmapMilestone[];
  controls?: (milestone: RoadmapMilestone) => ReactNode;
}) {
  if (reached.length === 0) return null;
  return (
    <section
      aria-labelledby="already-learned"
      className="relative z-10 mt-6 border-t-2 border-foreground bg-card px-4 py-3.5 md:mx-auto md:max-w-[44rem] md:px-5"
    >
      <h2 id="already-learned" className="font-headline text-xl leading-none">
        Already learned
      </h2>
      <ol className="mt-3 space-y-3.5">
        {reached.map((m) => (
          <li key={m.id} aria-labelledby={`reached-${m.id}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 id={`reached-${m.id}`} className="font-label text-[0.8rem] tracking-[0.07em] text-foreground">
                {reachedHeading(m)}
              </h3>
              <span className="font-label text-[0.8rem] tracking-[0.06em] text-faint-foreground">
                {m.items.length} {m.items.length === 1 ? "item" : "items"}
              </span>
              {controls?.(m)}
            </div>
            {m.items.length > 0 && (
              <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                {m.items.map((item) => (
                  <li key={item.id} className="inline-flex items-center gap-1.5 text-sm text-dim-foreground">
                    <Check aria-hidden className="size-3.5 shrink-0 stroke-[3] text-ok" />
                    {item.title}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
