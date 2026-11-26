import { requireAuth, requireFeature } from "@/lib/session";
import { canGiveFeedback } from "@/lib/feedback";
import { loadBoard } from "@/lib/feedback-board";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FeedbackBoard } from "@/components/feedback/feedback-board";

// The Feedback Board: one kind (`kind`) at a time, Open or Closed (`status`).
// `pinned` opens the pinned Feedback's kind tab and rings it in yellow (the
// one the member just gave, or a link from Discord).
export default async function FeedbackBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string; pinned?: string }>;
}) {
  const session = await requireAuth();
  const features = await requireFeature("feedback");
  const { kind, status, pinned: rawPinned } = await searchParams;
  const pinned = Number(rawPinned) || 0;
  const viewerId = session.principal.discord_id;
  const board = await loadBoard({ kind, status, pinned, viewerId });

  return (
    <FeedbackBoard
      board={board}
      viewerId={viewerId}
      canVote={canGiveFeedback(session.membership)}
      pinned={pinned}
      badge={features.preview("feedback") && <PreviewBadge />}
    />
  );
}
