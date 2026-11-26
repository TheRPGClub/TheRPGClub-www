import { requireAuth, requireFeature } from "@/lib/session";
import { fetchRoadmap } from "@/lib/api/roadmap";
import { FEEDBACK_BOARD } from "@/lib/roadmap/board";
import { isAdminOrAbove } from "@/lib/staff";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { RoadmapPage } from "@/components/roadmap/roadmap-page";
import { RoadmapEditorProvider } from "@/components/roadmap/edit/editor-context";
import { EditingToggle } from "@/components/roadmap/edit/editing-toggle";
import { EditableTree } from "@/components/roadmap/edit/editable-tree";

// The members' Roadmap (spec api#505): open Milestones as the Skill Tree's
// tiers, Reached ones on the shelf below, and the way to the Feedback Board.
// Admins and Superadmins also get the Editing toggle and edit in place
// (www#232); everyone else reads it.
export default async function RoadmapRoute() {
  const session = await requireAuth();
  const features = await requireFeature("roadmap");
  const roadmap = await fetchRoadmap();
  const page = {
    roadmap,
    boardHref: features.canOpen(FEEDBACK_BOARD.feature) ? FEEDBACK_BOARD.href : null,
    badge: features.preview("roadmap") && <PreviewBadge />,
  };

  if (!roadmap || !isAdminOrAbove(session.membership)) return <RoadmapPage {...page} />;
  return (
    <RoadmapEditorProvider initial={roadmap}>
      <RoadmapPage {...page} actions={<EditingToggle />} tree={<EditableTree />} />
    </RoadmapEditorProvider>
  );
}
