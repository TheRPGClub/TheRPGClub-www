import { requireAuth, requireFeature } from "@/lib/session";
import { canSuggest } from "@/lib/suggestions";
import { boardTab, loadBoard } from "@/lib/suggestion-board";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { SuggestionBoard } from "@/components/suggestions/suggestion-board";

// The Suggestion Board, on its Open or Rejected tab. `pinned` marks the
// Suggestion the member just submitted.
export default async function SuggestionBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; pinned?: string }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("suggestions");
  const { tab, pinned: rawPinned } = await searchParams;
  const pinned = Number(rawPinned);
  const viewerId = session.principal.discord_id;
  const board = await loadBoard(boardTab(tab), pinned, viewerId);

  return (
    <SuggestionBoard
      board={board}
      viewerId={viewerId}
      canVote={canSuggest(session.membership)}
      pinned={pinned}
      badge={features.preview("suggestions") && <PreviewBadge />}
    />
  );
}
