"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, Undo2 } from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import { canUpvote, canWithdraw } from "@/lib/suggestions";
import {
  setSuggestionUpvoteAction,
  withdrawSuggestionAction,
} from "@/app/actions/suggestions";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { cn } from "@/lib/utils";

// The small footer controls on a card (also the review page's).
export const FOOT_LINK =
  "font-label inline-flex h-[30px] items-center gap-1.5 rounded-sm px-2 text-[0.82rem] font-extrabold transition-colors disabled:opacity-50 [&_svg]:size-3.5";

// A board card with the member's controls: upvote (one each, removable) and,
// for the author of a Pending Suggestion, withdraw with an inline confirm.
// The count follows the row the API sends back.
export function BoardCard({
  suggestion: initial,
  viewerId,
  canVote,
  highlight = false,
}: {
  suggestion: Suggestion;
  viewerId: string;
  // Members role holders and staff; others see the count only.
  canVote: boolean;
  highlight?: boolean;
}) {
  const [suggestion, setSuggestion] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const mine = !!suggestion.created_by && suggestion.created_by === viewerId;
  const withdrawable = canWithdraw(suggestion, viewerId);

  function toggleUpvote() {
    setError(null);
    startTransition(async () => {
      const res = await setSuggestionUpvoteAction(
        suggestion.suggestion_id,
        !suggestion.viewer_upvoted,
      );
      if (res.ok && res.data) setSuggestion(res.data);
      else setError(res.error ?? "Couldn't save your upvote.");
    });
  }

  function withdraw() {
    setError(null);
    startTransition(async () => {
      const res = await withdrawSuggestionAction(suggestion.suggestion_id);
      if (res.ok) {
        // Withdrawn Suggestions leave the board; the action's revalidatePath
        // re-renders it with the new counts.
        if (res.data) setSuggestion(res.data);
      } else {
        setConfirming(false);
        setError(res.error ?? "Couldn't withdraw it.");
      }
    });
  }

  if (suggestion.status === "withdrawn") return null;

  const actions = (
    <>
      {withdrawable &&
        (confirming ? (
          <span className="flex items-center gap-1">
            <span className="text-[0.82rem] text-dim-foreground">Withdraw it?</span>
            <button
              type="button"
              onClick={withdraw}
              disabled={pending}
              className={cn(FOOT_LINK, "text-destructive hover:bg-destructive/15")}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className={cn(FOOT_LINK, "text-dim-foreground hover:bg-muted")}
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={pending}
            className={cn(FOOT_LINK, "text-destructive hover:bg-destructive/15")}
          >
            <Undo2 aria-hidden />
            Withdraw
          </button>
        ))}
      {canUpvote(suggestion) && !confirming && (
        <button
          type="button"
          onClick={toggleUpvote}
          disabled={pending || !canVote}
          aria-pressed={suggestion.viewer_upvoted}
          title={
            canVote
              ? undefined
              : "Only Members role holders and staff can upvote."
          }
          className={cn(
            FOOT_LINK,
            "px-2.5 text-[0.85rem]",
            suggestion.viewer_upvoted
              ? "bg-highlight text-highlight-foreground hover:bg-highlight/85"
              : "text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-faint-foreground)_60%,transparent)] hover:bg-muted hover:shadow-[inset_0_0_0_1px_var(--color-foreground)]",
          )}
        >
          <ThumbsUp aria-hidden className="size-[15px]!" />
          {suggestion.viewer_upvoted ? "Upvoted" : "Upvote"}
        </button>
      )}
    </>
  );

  return (
    <div>
      <SuggestionCard
        suggestion={suggestion}
        mine={mine}
        highlight={highlight}
        actions={actions}
      />
      {error && (
        <p role="alert" className="mt-3 px-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
