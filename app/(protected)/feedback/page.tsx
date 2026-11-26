import { requireAuth, requireFeature } from "@/lib/session";
import { canGiveFeedback, dialogClosedHref, feedbackDialogState } from "@/lib/feedback";
import { fetchFeedbackItem } from "@/lib/api/feedback";
import { loadBoard } from "@/lib/feedback-board";
import { PreviewBadge } from "@/components/feature/preview-badge";
import { FeedbackBoard } from "@/components/feedback/feedback-board";
import { FeedbackDialog } from "@/components/feedback/feedback-dialog";

type Params = { kind?: string; status?: string; pinned?: string; new?: string; edit?: string };

// The Feedback Board: one kind (`kind`) at a time, Open or Closed (`status`).
// `pinned` opens the pinned Feedback's kind tab, rings it in yellow and
// scrolls to it (the one the member just gave, or a link from Discord).
// `new=1` opens the Give feedback dialog on the shown kind; `edit=<id>` opens
// it on the author's own Pending Feedback.
export default async function FeedbackBoardPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await requireAuth();
  const features = await requireFeature("feedback");
  const params = await searchParams;
  const pinned = Number(params.pinned) || 0;
  const editId = Number(params.edit) || 0;
  const viewerId = session.principal.discord_id;
  const canGive = canGiveFeedback(session.membership);
  const [board, editItem] = await Promise.all([
    loadBoard({ kind: params.kind, status: params.status, pinned, viewerId }),
    editId > 0 ? fetchFeedbackItem(editId) : null,
  ]);
  const dialog = feedbackDialogState({
    isNew: params.new === "1",
    editId,
    editItem,
    kind: board.kind,
    canGive,
    viewerId,
  });
  const query = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"),
  );

  return (
    <>
      <FeedbackBoard
        board={board}
        viewerId={viewerId}
        canVote={canGive}
        pinned={pinned}
        badge={features.preview("feedback") && <PreviewBadge />}
      />
      <FeedbackDialog state={dialog} closeHref={dialogClosedHref(query)} />
    </>
  );
}
