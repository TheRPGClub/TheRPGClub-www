"use client";

import Link from "next/link";
import { Pencil, ThumbsUp, Undo2 } from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import { editFeedbackHref, upvoteLabel } from "@/lib/feedback";
import { Button, ButtonLink } from "@/components/ui/button";
import { FOOT_ACTION, FOOT_ACTION_OUTLINED } from "./card-foot";

// A board card's footer controls: Edit and Withdraw for the author of a
// Pending Feedback (Withdraw with an inline confirm), and the upvote toggle
// ("I hit this too" on a Bug Report).
export function BoardCardActions({
  feedback,
  withdrawable,
  editable,
  upvotable,
  canVote,
  confirming,
  pending,
  onConfirm,
  onWithdraw,
  onUpvote,
}: {
  feedback: Feedback;
  withdrawable: boolean;
  editable: boolean;
  upvotable: boolean;
  canVote: boolean;
  confirming: boolean;
  pending: boolean;
  onConfirm: (confirming: boolean) => void;
  onWithdraw: () => void;
  onUpvote: () => void;
}) {
  if (confirming) {
    return (
      <span className="flex items-center gap-1">
        <span className="text-[0.82rem] text-dim-foreground">Withdraw it?</span>
        <Button type="button" variant="card-action-destructive" onClick={onWithdraw} disabled={pending} className={FOOT_ACTION}>
          Yes
        </Button>
        <Button type="button" variant="card-action" onClick={() => onConfirm(false)} disabled={pending} className={FOOT_ACTION}>
          Keep
        </Button>
      </span>
    );
  }
  const upvoted = feedback.viewer_upvoted;
  return (
    <>
      {editable && (
        <ButtonLink
          href={editFeedbackHref(feedback)}
          render={<Link href={editFeedbackHref(feedback)} scroll={false} />}
          variant="card-action"
          className={FOOT_ACTION}
        >
          <Pencil aria-hidden />
          Edit
        </ButtonLink>
      )}
      {withdrawable && (
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
      )}
      {upvotable && !withdrawable && (
        <Button
          type="button"
          variant={upvoted ? "highlight" : "outline"}
          onClick={onUpvote}
          disabled={pending || !canVote}
          aria-pressed={upvoted}
          title={canVote ? undefined : "Only Members role holders and staff can upvote."}
          className={upvoted ? `${FOOT_ACTION} border-0 px-2.5 text-[0.85rem]` : `${FOOT_ACTION_OUTLINED} text-[0.85rem]`}
        >
          <ThumbsUp aria-hidden className="size-[15px]!" />
          {upvoteLabel(feedback.kind, upvoted)}
        </Button>
      )}
    </>
  );
}
