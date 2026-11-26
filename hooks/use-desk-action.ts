"use client";

import { useState, useTransition } from "react";
import type { FeedbackReviewResult } from "@/app/actions/feedback-review";
import type { Feedback } from "@/lib/api/types";

// One review action on the desk's Sheet (kind change, Approve, Reject,
// Duplicate): runs the server action, hands back the saved Feedback and its
// bot job, or keeps the refusal to show. A stale refusal (someone else
// decided it, or its author withdrew it) calls `onGone` so the card leaves.
export function useDeskAction(onGone: () => void) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(
    action: () => Promise<FeedbackReviewResult>,
    onOk: (saved: Feedback, jobId: number | null, res: FeedbackReviewResult) => void,
  ) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.ok && res.data) return onOk(res.data, res.outcomeJobId ?? null, res);
      setError(res.error ?? "Couldn't save the review.");
      if (res.stale) onGone();
    });
  }

  return { pending, error, setError, run };
}
