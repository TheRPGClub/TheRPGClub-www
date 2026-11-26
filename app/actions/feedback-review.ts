"use server";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { Feedback } from "@/lib/api/types";
import {
  isFeedbackTargetRepo,
  validateRejectionReason,
} from "@/lib/feedback";

// Superadmin review of a Pending Feedback. The API decides who may review;
// these only shape the request and put refusals in the reviewer's words.

export interface FeedbackReviewResult {
  ok: boolean;
  data?: Feedback;
  // The feedback_outcome bot job: the bot's announcement of the decision.
  outcomeJobId?: number;
  error?: string;
  // Someone else got there first (or it was withdrawn): the queue is stale.
  stale?: boolean;
}

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function failure(
  res: Response,
  action: "approve" | "reject",
): Promise<FeedbackReviewResult> {
  const err = await readApiError(res);
  switch (res.status) {
    case 401:
      return { ok: false, error: "Your session has ended. Sign in again." };
    case 403:
      return { ok: false, error: "Only Superadmins can review Feedback." };
    case 404:
      return { ok: false, error: "That Feedback no longer exists.", stale: true };
    case 409:
      if (err.code === "approval_in_progress") {
        return {
          ok: false,
          error:
            "Another approval of this Feedback is talking to GitHub right now. Refresh in a moment.",
        };
      }
      return {
        ok: false,
        error: "It is no longer Pending: someone reviewed it or its author withdrew it.",
        stale: true,
      };
    case 502:
      return {
        ok: false,
        error: `GitHub didn't open the issue, so nothing changed. ${apiErrorMessage(err)}`,
      };
    case 503:
      return {
        ok: false,
        error:
          action === "approve"
            ? "GitHub isn't set up on the club's server, so nothing was approved. Rejecting still works."
            : apiErrorMessage(err),
      };
    default:
      return { ok: false, error: apiErrorMessage(err) };
  }
}

async function review(
  id: number,
  action: "approve" | "reject",
  data: Record<string, string>,
): Promise<FeedbackReviewResult> {
  if (!validId(id)) {
    return { ok: false, error: "That Feedback no longer exists.", stale: true };
  }
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/feedback/${id}/${action}`, {
      method: "POST",
      body: JSON.stringify({ data }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return failure(res, action);
  // No revalidatePath: in a Server Function it re-renders the page in view,
  // which would drop the reviewed card (and its job status) from the queue.
  // Both pages read with no-store, so the next visit is fresh anyway.
  const body = (await res.json()) as {
    data: Feedback;
    meta?: { outcome_job_id?: number };
  };
  return { ok: true, data: body.data, outcomeJobId: body.meta?.outcome_job_id };
}

// Open the GitHub issue in `targetRepo` and mark the Feedback Approved.
export async function approveFeedbackAction(
  id: number,
  targetRepo: string,
): Promise<FeedbackReviewResult> {
  if (!isFeedbackTargetRepo(targetRepo)) {
    return { ok: false, error: "Pick the repo its issue goes in." };
  }
  return review(id, "approve", { target_repo: targetRepo });
}

// Mark the Feedback Rejected with the reason its author will see.
export async function rejectFeedbackAction(
  id: number,
  rawReason: string,
): Promise<FeedbackReviewResult> {
  const checked = validateRejectionReason(rawReason);
  if (!checked.ok) return { ok: false, error: checked.error };
  return review(id, "reject", { rejection_reason: checked.reason });
}
