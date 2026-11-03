"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { Suggestion } from "@/lib/api/types";
import { validateSuggestionInput } from "@/lib/suggestions";

export interface SuggestionActionResult {
  ok: boolean;
  data?: Suggestion;
  error?: string;
}

const BOARD = "/suggestions";

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
  if (res.status === 404) return "That Suggestion no longer exists.";
  if (res.status === 403) {
    if (action === "withdraw") return "Only its author can withdraw a Suggestion.";
    return action === "create"
      ? "Only Members role holders and staff can suggest something."
      : "Only Members role holders and staff can upvote.";
  }
  if (res.status === 409) {
    return action === "withdraw"
      ? "It has already been reviewed, so it can't be withdrawn."
      : "Only Pending and Approved Suggestions take upvotes.";
  }
  return apiErrorMessage(err);
}

async function send(
  path: string,
  init: RequestInit,
  action: "create" | "withdraw" | "upvote",
): Promise<SuggestionActionResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await errorMessage(res, action) };
  revalidatePath(BOARD);
  const body = (await res.json()) as { data: Suggestion };
  return { ok: true, data: body.data };
}

export async function createSuggestionAction(input: {
  title: string;
  details: string;
  types: string[];
}): Promise<SuggestionActionResult> {
  const checked = validateSuggestionInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  return send(
    "/api/v1/suggestions",
    { method: "POST", body: JSON.stringify({ data: checked.data }) },
    "create",
  );
}

export async function withdrawSuggestionAction(
  id: number,
): Promise<SuggestionActionResult> {
  if (!validId(id)) return { ok: false, error: "That Suggestion no longer exists." };
  return send(`/api/v1/suggestions/${id}/withdraw`, { method: "POST" }, "withdraw");
}

// `on` adds the member's upvote, otherwise takes it back. Both are
// idempotent on the API, so a double click can't double count.
export async function setSuggestionUpvoteAction(
  id: number,
  on: boolean,
): Promise<SuggestionActionResult> {
  if (!validId(id)) return { ok: false, error: "That Suggestion no longer exists." };
  return send(
    `/api/v1/suggestions/${id}/upvote`,
    { method: on ? "POST" : "DELETE" },
    "upvote",
  );
}
