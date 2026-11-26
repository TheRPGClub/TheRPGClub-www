import { requireAuth, requireFeature } from "@/lib/session";
import { fetchRoadmap } from "@/lib/api/roadmap";
import { FEEDBACK_BOARD } from "@/lib/roadmap/board";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { RoadmapPage } from "@/components/roadmap/roadmap-page";

// The members' Roadmap (spec api#505): open Milestones as the Skill Tree's
// tiers, Reached ones on the shelf below, and the way to the Feedback Board.
export default async function RoadmapRoute() {
  await requireAuth();
  const features = await requireFeature("roadmap");
  const roadmap = await fetchRoadmap();

  return (
    <RoadmapPage
      roadmap={roadmap}
      boardHref={features.canOpen(FEEDBACK_BOARD.feature) ? FEEDBACK_BOARD.href : null}
      badge={features.preview("roadmap") && <PreviewBadge />}
    />
  );
}
