"use client";

import { useState, useTransition } from "react";
import type { Feedback } from "@/lib/api/types";
import { canEdit, canUpvote, canWithdraw, type DuplicateOriginal } from "@/lib/feedback";
import { setFeedbackUpvoteAction, withdrawFeedbackAction } from "@/app/actions/feedback";
import { BoardCardActions } from "./board-card-actions";
import { FeedbackCard } from "./feedback-card";

// A board card with the member's controls: upvote (one each, removable)
// while it takes upvotes, and for the author of a Pending one Edit and
// Withdraw (with an inline confirm). The count follows the row the API sends
// back.
export function BoardCard({
  feedback: initial,
  viewerId,
  canVote,
  highlight = false,
  reviewerName,
  original,
}: {
  feedback: Feedback;
  viewerId: string;
  // Members role holders and staff; others see the count only.
  canVote: boolean;
  highlight?: boolean;
  reviewerName?: string | null;
  original?: DuplicateOriginal | null;
}) {
  const [feedback, setFeedback] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleUpvote() {
    setError(null);
    startTransition(async () => {
      const res = await setFeedbackUpvoteAction(feedback.feedback_id, !feedback.viewer_upvoted);
      if (res.ok && res.data) setFeedback(res.data);
      else setError(res.error ?? "Couldn't save your upvote.");
    });
  }

  function withdraw() {
    setError(null);
    startTransition(async () => {
      const res = await withdrawFeedbackAction(feedback.feedback_id);
      if (res.ok) {
        // Withdrawn Feedback leaves the Open wall; the action's
        // revalidatePath re-renders it with the new counts.
        if (res.data) setFeedback(res.data);
      } else {
        setConfirming(false);
        setError(res.error ?? "Couldn't withdraw it.");
      }
    });
  }

  if (feedback.status === "withdrawn" && initial.status !== "withdrawn") return null;

  const withdrawable = canWithdraw(feedback, viewerId);
  const upvotable = canUpvote(feedback);
  const hasActions = withdrawable || upvotable;

  return (
    <div>
      <FeedbackCard
        feedback={feedback}
        mine={!!feedback.created_by && feedback.created_by === viewerId}
        highlight={highlight}
        reviewerName={reviewerName}
        original={original}
        actions={
          hasActions && (
            <BoardCardActions
              feedback={feedback}
              withdrawable={withdrawable}
              editable={canEdit(feedback, viewerId)}
              upvotable={upvotable}
              canVote={canVote}
              confirming={confirming}
              pending={pending}
              onConfirm={setConfirming}
              onWithdraw={withdraw}
              onUpvote={toggleUpvote}
            />
          )
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
