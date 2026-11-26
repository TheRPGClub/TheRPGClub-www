import type { ReactNode } from "react";
import { roadmapEmpty } from "@/lib/roadmap/tree";
import type { Roadmap } from "@/lib/roadmap/types";
import { LearnedShelf } from "./learned-shelf";
import { SkillTree, Tier } from "./skill-tree";

// The read-only tree: open Milestones as tiers, the Shipped shelf at its
// foot, or a note when there is nothing (or it couldn't be read). Staff
// editing shows it too while not editing. Server-import-free.
export function RoadmapBody({ roadmap }: { roadmap: Roadmap | null }) {
  if (!roadmap) {
    return <RoadmapNote>Couldn&apos;t load the Roadmap. Try again in a moment.</RoadmapNote>;
  }
  if (roadmapEmpty(roadmap)) {
    return (
      <RoadmapNote>
        No Milestones yet. Staff are still drawing up the tree; check back soon.
      </RoadmapNote>
    );
  }
  return (
    <SkillTree foot={<LearnedShelf reached={roadmap.reached} />}>
      {roadmap.milestones.map((m, i) => (
        <Tier key={m.id} milestone={m} first={i === 0} />
      ))}
    </SkillTree>
  );
}

// The dashed empty-state box (DESIGN.md, Cards / Containers).
export function RoadmapNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-5 py-8 text-center text-dim-foreground">
      {children}
    </p>
  );
}
