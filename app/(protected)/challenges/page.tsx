import { requireAuth, requireFeature } from "@/lib/session";
import { parseBoardFilters } from "@/lib/challenges/board";
import { loadBoardPage } from "@/lib/challenges/board-page";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { ChallengeBoard } from "@/components/challenges/challenge-board";

// The Challenges index: Open / Closed and Format filters in the address.
// Any member may create a Challenge (spec api#442).
export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string; format?: string }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("challenges");
  const filters = parseBoardFilters(await searchParams);
  const page = await loadBoardPage(filters, session.principal.discord_id);
  return (
    <ChallengeBoard
      page={page}
      filters={filters}
      canCreate
      badge={features.preview("challenges") && <PreviewBadge />}
    />
  );
}
