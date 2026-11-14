"use client";

import { ThumbsUp, Undo2 } from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { FOOT_ACTION, FOOT_ACTION_OUTLINED } from "./card-foot";

// A board card's footer controls: withdraw for the author of a Pending
// Suggestion (with an inline confirm), and the upvote toggle.
export function BoardCardActions({
  suggestion,
  withdrawable,
  upvotable,
  canVote,
  confirming,
  pending,
  onConfirm,
  onWithdraw,
  onUpvote,
}: {
  suggestion: Suggestion;
  withdrawable: boolean;
  upvotable: boolean;
  canVote: boolean;
  confirming: boolean;
  pending: boolean;
  onConfirm: (confirming: boolean) => void;
  onWithdraw: () => void;
  onUpvote: () => void;
}) {
  return (
    <>
      {withdrawable &&
        (confirming ? (
          <span className="flex items-center gap-1">
            <span className="text-[0.82rem] text-dim-foreground">Withdraw it?</span>
            <Button
              type="button"
              variant="card-action-destructive"
              onClick={onWithdraw}
              disabled={pending}
              className={FOOT_ACTION}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant="card-action"
              onClick={() => onConfirm(false)}
              disabled={pending}
              className={FOOT_ACTION}
            >
              Keep
            </Button>
          </span>
        ) : (
          <Button
            type="button"
            variant="card-action-destructive"
            onClick={() => onConfirm(true)}
            disabled={pending}
            className={FOOT_ACTION}
          >
            <Undo2 aria-hidden />
            Withdraw
          </Button>
        ))}
      {upvotable && !confirming && (
        <Button
          type="button"
          variant={suggestion.viewer_upvoted ? "highlight" : "outline"}
          onClick={onUpvote}
          disabled={pending || !canVote}
          aria-pressed={suggestion.viewer_upvoted}
          title={canVote ? undefined : "Only Members role holders and staff can upvote."}
          className={
            suggestion.viewer_upvoted
              ? `${FOOT_ACTION} border-0 px-2.5 text-[0.85rem]`
              : `${FOOT_ACTION_OUTLINED} text-[0.85rem]`
          }
        >
          <ThumbsUp aria-hidden className="size-[15px]!" />
          {suggestion.viewer_upvoted ? "Upvoted" : "Upvote"}
        </Button>
      )}
    </>
  );
}
