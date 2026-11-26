"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { Feedback } from "@/lib/api/types";
import { screenshotProblem, validateFeedbackInput } from "@/lib/feedback";

export interface FeedbackActionResult {
  ok: boolean;
  data?: Feedback;
  error?: string;
}

const BOARD = "/feedback";

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

type Action = "create" | "edit" | "screenshot" | "withdraw" | "upvote";

const MESSAGES: Record<string, string> = {
  approval_in_progress: "It's being approved right now, so it can't be changed.",
  backblaze_not_configured: "Screenshot storage isn't set up on the club's server.",
  backblaze_request_failed: "Screenshot storage didn't answer. Try again.",
};

// Refusals in the member's words, by HTTP status and action.
async function errorMessage(res: Response, action: Action): Promise<string> {
  const err = await readApiError(res);
  if (res.status === 401) return "Your session has ended. Sign in again.";
  if (res.status === 404) return "That Feedback no longer exists.";
  if (err.code && Object.hasOwn(MESSAGES, err.code)) return MESSAGES[err.code];
  if (action === "edit" || action === "screenshot") {
    if (res.status === 403) return "Only its author can change it.";
    if (res.status === 409) return "It has already been reviewed, so it can't be changed.";
    return apiErrorMessage(err);
  }
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
  action: Action,
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

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

// The Give feedback dialog's Post and Save (www#226). `form` carries the
// fields by their API names, `feedback_id` when it edits (the author's own
// Pending Feedback; its kind stays), and on a Bug Report an optional
// `screenshot` file or `remove_screenshot=1`. The screenshot goes after the
// Feedback is saved; when only it fails, the result still carries the saved
// Feedback so the dialog can carry on as its edit.
export async function saveFeedbackAction(form: FormData): Promise<FeedbackActionResult> {
  const id = Number(text(form, "feedback_id")) || 0;
  if (id && !validId(id)) return { ok: false, error: "That Feedback no longer exists." };
  const checked = validateFeedbackInput({
    kind: text(form, "kind"),
    title: text(form, "title"),
    details: text(form, "details"),
    where: text(form, "where"),
    what_happened: text(form, "what_happened"),
    expected: text(form, "expected"),
    steps: text(form, "steps"),
  });
  if (!checked.ok) return { ok: false, error: checked.error };
  const { kind, ...fields } = checked.data;
  const saved = id
    ? await send(`/api/v1/feedback/${id}`, { method: "PATCH", body: JSON.stringify({ data: fields }) }, "edit")
    : await send("/api/v1/feedback", { method: "POST", body: JSON.stringify({ data: checked.data }) }, "create");
  if (!saved.ok || !saved.data || kind !== "bug_report") return saved;

  const shot = await saveScreenshot(saved.data.feedback_id, form, id > 0);
  if (!shot) return saved;
  if (shot.ok) return shot;
  return { ok: false, data: saved.data, error: `Your Bug Report is saved, but its screenshot isn't: ${shot.error}` };
}

// Adds or replaces the screenshot, or removes it; null when there's nothing
// to do.
async function saveScreenshot(id: number, form: FormData, editing: boolean): Promise<FeedbackActionResult | null> {
  const file = form.get("screenshot");
  if (file instanceof File && file.size > 0) {
    const problem = screenshotProblem(file);
    if (problem) return { ok: false, error: problem };
    const body = new FormData();
    body.append("data[file]", file);
    return send(`/api/v1/feedback/${id}/screenshot`, { method: "PUT", body }, "screenshot");
  }
  if (editing && text(form, "remove_screenshot") === "1") {
    return send(`/api/v1/feedback/${id}/screenshot`, { method: "DELETE" }, "screenshot");
  }
  return null;
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
