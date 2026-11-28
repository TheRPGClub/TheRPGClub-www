import type { BoardData } from "@/lib/feedback-board";
import { kindMeta } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { BoardCard } from "./board-card";
import { PIN_ROOM } from "./roadmap-pin";

// The shown kind's wall, three across from `xl`, in the API's board order:
// Open is Approved, then Pending, then Done; Closed is its Rejected,
// Duplicate and Withdrawn Feedback, each with its slip. Most upvoted first.
export function BoardList({
  board,
  viewerId,
  canVote,
  pinned,
}: {
  board: BoardData;
  viewerId: string;
  canVote: boolean;
  pinned: number;
}) {
  const { rows, status } = board;
  const noun = kindMeta(board.kind).plural;
  if (rows === null) {
    return (
      <p role="alert" className="mt-5 text-destructive">
        {`Couldn't load the ${noun}. Refresh to try again.`}
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <p data-slot="feedback-wall-empty" className="mt-5 rounded-md border border-dashed border-border-strong px-4 py-6 text-faint-foreground">
        {status === "open" ? `No open ${noun} yet.` : `No ${noun} have been closed.`}
      </p>
    );
  }
  return (
    <ul
      data-slot="feedback-wall"
      className={cn(
        "grid items-start gap-x-[22px] gap-y-6 pt-5 sm:grid-cols-2 xl:grid-cols-3",
        // Room above each row for the Roadmap badges hanging over the cards.
        rows.some((f) => f.roadmap) && PIN_ROOM,
      )}
    >
      {rows.map((f) => {
        const original = f.duplicate_of_id ? board.originals.get(f.duplicate_of_id) : undefined;
        return (
          // Keyed by its last change, so an edit re-seeds the card's state.
          <li key={`${f.feedback_id}-${f.updated_at}`}>
            <BoardCard
              feedback={f}
              viewerId={viewerId}
              canVote={canVote}
              highlight={f.feedback_id === pinned}
              reviewerName={f.reviewed_by ? board.reviewers.get(f.reviewed_by) : null}
              original={original ?? null}
            />
          </li>
        );
      })}
    </ul>
  );
}
