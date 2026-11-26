import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, headingLinkClass } from "@/components/templates/page-header";
import { roadmapEmpty } from "@/lib/roadmap/tree";
import type { Roadmap } from "@/lib/roadmap/types";
import { LearnedShelf } from "./learned-shelf";
import { SkillTree, Tier } from "./skill-tree";

// The members' Roadmap (spec api#505, www#231): the page header with the
// way to the Feedback Board, then the Skill Tree of open Milestones with the
// Shipped shelf at its foot. `roadmap` is null when it couldn't be read.
// `boardHref` is null when the viewer can't open the board. `actions` is
// where staff editing puts its Editing toggle, and `tree` replaces the
// read-only tree with its editable one (built from the same parts).
export function RoadmapPage({
  roadmap,
  boardHref,
  badge,
  actions,
  tree,
}: {
  roadmap: Roadmap | null;
  boardHref: string | null;
  badge?: ReactNode;
  actions?: ReactNode;
  tree?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Roadmap"
        badge={badge}
        actions={
          (boardHref || actions) && (
            <>
              {boardHref && (
                <Link href={boardHref} className={headingLinkClass}>
                  Want something? Ask on the Feedback Board
                  <ArrowRight aria-hidden />
                </Link>
              )}
              {actions}
            </>
          )
        }
      />
      {tree ?? <RoadmapBody roadmap={roadmap} />}
    </div>
  );
}

function RoadmapBody({ roadmap }: { roadmap: Roadmap | null }) {
  if (!roadmap) {
    return <Note>Couldn&apos;t load the Roadmap. Try again in a moment.</Note>;
  }
  if (roadmapEmpty(roadmap)) {
    return (
      <Note>
        No Milestones yet. Staff are still drawing up the tree; check back soon.
      </Note>
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
function Note({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border-strong px-5 py-8 text-center text-dim-foreground">
      {children}
    </p>
  );
}
