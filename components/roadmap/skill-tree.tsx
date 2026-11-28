import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { RoadmapMilestone } from "@/lib/roadmap/types";
import { RoadmapNode } from "./roadmap-node";
import { TierBand } from "./tier-band";

// The Skill Tree (design pick 1): a trunk down the page with each open
// Milestone as a tier across it and its Roadmap Items branching left and
// right. Phones fold the branches to one side, with the trunk at the left.
// `foot` closes the tree under the trunk (the "Already learned" shelf).
export function SkillTree({ children, foot }: { children: ReactNode; foot?: ReactNode }) {
  return (
    <div data-slot="skill-tree" className="relative">
      <div
        aria-hidden
        data-slot="skill-tree-trunk"
        className="absolute top-0 bottom-0 left-[15px] w-1 bg-border-strong md:left-1/2 md:-ml-0.5"
      />
      <ol className="relative space-y-6">{children}</ol>
      {foot}
    </div>
  );
}

// A tier's nodes: one column right of the trunk on phones, two columns
// straddling it from md. Staff editing spreads a Make Room zone onto it.
export function Branches({ children, className, ...rest }: React.ComponentProps<"ul">) {
  return (
    <ul data-slot="skill-branches" className={cn("grid gap-y-2.5 pl-10 md:grid-cols-2 md:gap-x-[120px] md:pl-0", className)} {...rest}>
      {children}
    </ul>
  );
}

// One open Milestone, read only: its band over its nodes. Staff editing
// composes TierBand, Branches and RoadmapNode itself.
export function Tier({ milestone, first }: { milestone: RoadmapMilestone; first: boolean }) {
  const headingId = `milestone-${milestone.id}`;
  return (
    <li aria-labelledby={headingId}>
      <TierBand milestone={milestone} first={first} headingId={headingId} />
      {milestone.items.length > 0 && (
        <Branches>
          {milestone.items.map((item) => (
            <RoadmapNode key={item.id} item={item} later={!first} />
          ))}
        </Branches>
      )}
    </li>
  );
}
