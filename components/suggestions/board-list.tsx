import type { Suggestion } from "@/lib/api/types";
import { byReviewedDesc } from "@/lib/suggestions";
import type { BoardTab } from "@/lib/suggestion-board";
import { BoardCard } from "./board-card";
import { SuggestionCard } from "./suggestion-card";

// The shown tab's Suggestions: the Open wall of cards the member can upvote,
// or the Rejected ones with their reasons, newest first.
export function BoardList({
  tab,
  rows,
  viewerId,
  canVote,
  pinned,
  reviewers,
}: {
  tab: BoardTab;
  rows: Suggestion[] | null;
  viewerId: string;
  canVote: boolean;
  pinned: number;
  reviewers: Map<string, string>;
}) {
  if (rows === null) {
    return (
      <p role="alert" className="text-destructive">
        {"Couldn't load the Suggestions. Refresh to try again."}
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border-strong px-4 py-6 text-faint-foreground">
        {tab === "open" ? "Nothing on the board yet." : "No Suggestions have been rejected."}
      </p>
    );
  }
  if (tab === "open") {
    return (
      <ul className="grid items-start gap-x-[22px] gap-y-6 pt-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((s) => (
          <li key={s.suggestion_id}>
            <BoardCard
              suggestion={s}
              viewerId={viewerId}
              canVote={canVote}
              highlight={s.suggestion_id === pinned}
            />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="grid items-start gap-x-7 gap-y-8 pt-2 lg:grid-cols-2">
      {[...rows].sort(byReviewedDesc).map((s) => (
        <li key={s.suggestion_id}>
          <SuggestionCard
            suggestion={s}
            reviewerName={s.reviewed_by ? reviewers.get(s.reviewed_by) : null}
          />
        </li>
      ))}
    </ul>
  );
}
