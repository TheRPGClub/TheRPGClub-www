import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader, headingLinkClass } from "@/components/templates/page-header";
import type { Roadmap } from "@/lib/roadmap/types";
import { RoadmapBody } from "./roadmap-body";

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
