import type { CSSProperties, ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { readyCount, tierLabel } from "@/lib/roadmap/tree";
import type { RoadmapMilestone } from "@/lib/roadmap/types";

const OK_INK = { "--progress-ink": "var(--color-ok)" } as CSSProperties;

// An open Milestone as a tier band across the trunk: its Anton name, the
// label line ("Next up · Dec 2026 · 3 of 5 ready"), its blurb and a green
// bar of how much is ready. It sits on the page ground, so the trunk breaks
// behind it. `controls` is where staff editing puts its chips.
export function TierBand({
  milestone,
  first,
  headingId,
  controls,
}: {
  milestone: RoadmapMilestone;
  // The first open Milestone reads "Next up".
  first: boolean;
  headingId: string;
  controls?: ReactNode;
}) {
  const { ready, total } = readyCount(milestone);
  const [lead, ...rest] = tierLabel(milestone, first);
  return (
    <div className="relative z-10 mb-3 bg-background py-1.5 pr-2 md:mx-auto md:w-fit md:max-w-[30rem] md:px-6 md:text-center">
      <h2 id={headingId} className="font-headline text-3xl leading-none text-balance md:text-4xl">
        {milestone.name}
      </h2>
      <p className="font-label mt-1 text-[0.8rem] tracking-[0.08em] text-dim-foreground">
        <span className={first ? "text-foreground" : undefined}>{lead}</span>
        {rest.map((part) => (
          <span key={part}> · {part}</span>
        ))}
      </p>
      {milestone.blurb && (
        <p className="mt-1 max-w-[48ch] text-sm text-dim-foreground md:mx-auto">{milestone.blurb}</p>
      )}
      {total > 0 && (
        <Progress
          value={(ready / total) * 100}
          tone="tint"
          aria-label={`${ready} of ${total} ready`}
          style={OK_INK}
          className="mt-2 w-full max-w-60 md:mx-auto"
          trackClassName="h-1.5"
        />
      )}
      {controls}
    </div>
  );
}
