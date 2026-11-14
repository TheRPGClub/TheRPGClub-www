"use client";

import { useState, useTransition } from "react";
import type { Suggestion } from "@/lib/api/types";
import { canUpvote, canWithdraw } from "@/lib/suggestions";
import {
  setSuggestionUpvoteAction,
  withdrawSuggestionAction,
} from "@/app/actions/suggestions";
import { BoardCardActions } from "./board-card-actions";
import { SuggestionCard } from "./suggestion-card";

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

  return (
    <div>
      <SuggestionCard
        suggestion={suggestion}
        mine={!!suggestion.created_by && suggestion.created_by === viewerId}
        highlight={highlight}
        actions={
          <BoardCardActions
            suggestion={suggestion}
            withdrawable={canWithdraw(suggestion, viewerId)}
            upvotable={canUpvote(suggestion)}
            canVote={canVote}
            confirming={confirming}
            pending={pending}
            onConfirm={setConfirming}
            onWithdraw={withdraw}
            onUpvote={toggleUpvote}
          />
        }
      />
      {error && (
        <p role="alert" className="mt-3 px-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
