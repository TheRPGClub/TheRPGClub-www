"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { Feedback } from "@/lib/api/types";
import { validateFeedbackInput } from "@/lib/feedback";

export interface FeedbackActionResult {
  ok: boolean;
  data?: Feedback;
  error?: string;
}

const BOARD = "/feedback";

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// Refusals in the member's words, by HTTP status and action.
async function errorMessage(
  res: Response,
  action: "create" | "withdraw" | "upvote",
): Promise<string> {
  const err = await readApiError(res);
  if (res.status === 401) return "Your session has ended. Sign in again.";
  if (res.status === 404) return "That Feedback no longer exists.";
  if (res.status === 403) {
    if (action === "withdraw") return "Only its author can withdraw it.";
    return action === "create"
      ? "Only Members role holders and staff can give feedback."
      : "Only Members role holders and staff can upvote.";
  }
  if (res.status === 409) {
    return action === "withdraw"
      ? "It has already been reviewed, so it can't be withdrawn."
      : "Its upvotes are frozen: only Pending and Approved Feedback that isn't Done takes upvotes.";
  }
  return apiErrorMessage(err);
}

async function send(
  path: string,
  init: RequestInit,
  action: "create" | "withdraw" | "upvote",
): Promise<FeedbackActionResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res, action) };
  revalidatePath(BOARD);
  const body = (await res.json()) as { data: Feedback };
  return { ok: true, data: body.data };
}

export async function createFeedbackAction(input: {
  kind: string | null;
  title: string;
  details: string;
}): Promise<FeedbackActionResult> {
  const checked = validateFeedbackInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  return send(
    "/api/v1/feedback",
    { method: "POST", body: JSON.stringify({ data: checked.data }) },
    "create",
  );
}

export async function withdrawFeedbackAction(
  id: number,
): Promise<FeedbackActionResult> {
  if (!validId(id)) return { ok: false, error: "That Feedback no longer exists." };
  return send(`/api/v1/feedback/${id}/withdraw`, { method: "POST" }, "withdraw");
}

// `on` adds the member's upvote, otherwise takes it back. Both are
// idempotent on the API, so a double click can't double count.
export async function setFeedbackUpvoteAction(
  id: number,
  on: boolean,
): Promise<FeedbackActionResult> {
  if (!validId(id)) return { ok: false, error: "That Feedback no longer exists." };
  return send(
    `/api/v1/feedback/${id}/upvote`,
    { method: on ? "POST" : "DELETE" },
    "upvote",
  );
}
