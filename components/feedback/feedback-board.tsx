import type { ReactNode } from "react";
import { MessageSquarePlus, Pin } from "lucide-react";
import type { BoardData } from "@/lib/feedback-board";
import { giveFeedbackHref, kindMeta } from "@/lib/feedback";
import { ButtonLink } from "@/components/ui/button";
import { BoardKindTabs } from "./board-kind-tabs";
import { BoardList } from "./board-list";
import { BoardStatusSwitch } from "./board-status-switch";

// The Feedback Board: today's pinned wall, straightened and split by kind.
// One kind at a time behind its tab, Open (Approved, then Pending, then Done)
// or Closed (Rejected, Duplicate and Withdrawn, each with its slip).
export function FeedbackBoard({
  board,
  viewerId,
  canVote,
  pinned,
  badge,
}: {
  board: BoardData;
  viewerId: string;
  // Members role holders and staff can give feedback and upvote.
  canVote: boolean;
  pinned: number;
  badge: ReactNode;
}) {
  const { kind, status, totals } = board;

  return (
    <div>
      <header className="flex flex-wrap items-end gap-x-5 gap-y-3 pb-3">
        <h1 className="font-headline flex-1 text-5xl text-balance sm:text-6xl">Feedback Board</h1>
        {badge && <div className="pb-2">{badge}</div>}
        {canVote && (
          <ButtonLink href={giveFeedbackHref(kind)} variant="highlight" className="mb-1">
            <MessageSquarePlus aria-hidden />
            Give feedback
          </ButtonLink>
        )}
      </header>

      <BoardKindTabs kind={kind} totals={totals} />

      <div className="mt-4 mb-1 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-dim-foreground">{kindMeta(kind).blurb}</p>
        <BoardStatusSwitch kind={kind} status={status} totals={totals} />
      </div>

      {!canVote && status === "open" && (
        <p className="mt-3 text-sm text-faint-foreground">
          Only Members role holders and staff can give feedback and upvote. If you think your role
          is out of date, sign out and back in to refresh it from Discord.
        </p>
      )}

      {board.pinnedIsViewersPending && (
        <p
          role="status"
          className="mt-4 inline-flex items-center gap-2.5 rounded-md bg-highlight px-3.5 py-2.5 text-[0.92rem] font-semibold text-highlight-foreground shadow-[0_12px_30px_rgb(0_0_0/0.5)]"
        >
          <Pin aria-hidden className="size-[18px]" />
          Pinned. Your {kindMeta(kind).label} is Pending.
        </p>
      )}

      <BoardList board={board} viewerId={viewerId} canVote={canVote} pinned={pinned} />
    </div>
  );
}
