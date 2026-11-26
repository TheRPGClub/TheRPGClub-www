"use server";

import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { fetchFeedbackItem, fetchFeedbackList } from "@/lib/api/feedback";
import type { Feedback, FeedbackKind } from "@/lib/api/types";
import {
  isFeedbackKind,
  isFeedbackTargetRepo,
  validateRejectionReason,
} from "@/lib/feedback";
import type { DuplicateCandidate } from "@/lib/feedback-desk";

// Superadmin review of a Pending Feedback: change its kind, approve it,
// reject it or mark it a Duplicate. The API decides who may review;
// these only shape the request and put refusals in the reviewer's words.

export interface FeedbackReviewResult {
  ok: boolean;
  data?: Feedback;
  // The feedback_outcome bot job: the bot's announcement of the decision.
  outcomeJobId?: number;
  error?: string;
  // Someone else got there first (or it was withdrawn): the queue is stale.
  stale?: boolean;
  // Duplicate only: its original as it is now, with the moved upvotes; null
  // when it couldn't be read.
  original?: Feedback | null;
}

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

type ReviewAction = "approve" | "reject" | "duplicate" | "kind";

async function failure(
  res: Response,
  action: ReviewAction,
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
    case 422:
      if (action === "duplicate") {
        return {
          ok: false,
          error: `That can't be its original: pick a Pending, Approved or Done Feedback other than itself. ${apiErrorMessage(err)}`,
        };
      }
      return { ok: false, error: apiErrorMessage(err) };
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
  action: ReviewAction,
  data: Record<string, string | number>,
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

// Mark the Feedback a Duplicate of `originalId`; its upvotes move there.
export async function duplicateFeedbackAction(
  id: number,
  originalId: number,
): Promise<FeedbackReviewResult> {
  if (!validId(originalId) || originalId === id) {
    return { ok: false, error: "Pick the Feedback it duplicates." };
  }
  const res = await review(id, "duplicate", { original_id: originalId });
  // The API answers with the Duplicate only; read the original (the API may
  // have resolved the pick to its own original) for its new upvote count.
  if (res.ok && res.data?.duplicate_of_id) {
    res.original = await fetchFeedbackItem(res.data.duplicate_of_id);
  }
  return res;
}

// File the Pending Feedback under another kind. No bot notice.
export async function changeFeedbackKindAction(
  id: number,
  kind: FeedbackKind,
): Promise<FeedbackReviewResult> {
  if (!isFeedbackKind(kind)) return { ok: false, error: "Pick a kind." };
  return review(id, "kind", { kind });
}

// The possible originals for the Duplicate picker: every Open Feedback
// (Pending and Approved, Done included), slimmed to what the picker shows.
// The API has no title search, so the desk filters these itself. Null when
// they can't be read.
export async function listDuplicateOriginalsAction(): Promise<DuplicateCandidate[] | null> {
  const list = await fetchFeedbackList({ statuses: ["open"] });
  if (!list) return null;
  return list.rows.map(({ feedback_id, kind, title, status, done, upvote_count }) => ({
    feedback_id,
    kind,
    title,
    status,
    done,
    upvote_count,
  }));
}
