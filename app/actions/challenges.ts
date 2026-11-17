"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { createRequest, editRequest, validateDraft, type ChallengeDraft } from "@/lib/challenges/form";
import type { Challenge, ChallengeWarning } from "@/lib/challenges/types";

// Creating, editing and the staff controls of a Challenge, as the signed-in
// member. The API owns every rule and writes its refusals for members
// (`message`), so those are shown as given.

export interface ChallengeActionResult {
  ok: boolean;
  data?: Challenge;
  warnings?: ChallengeWarning[];
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function refusal(res: Response): Promise<string> {
  if (res.status === 401) return "Your session has ended. Sign in again.";
  if (res.status === 404) return "That Challenge no longer exists, or is hidden.";
  const err = await readApiError(res);
  if (res.status === 403 && !err.message) return "You can't change this Challenge.";
  return apiErrorMessage(err);
}

async function send(path: string, init: RequestInit): Promise<ChallengeActionResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: await refusal(res) };
  revalidatePath("/challenges", "layout");
  refresh();
  if (init.method === "DELETE") return { ok: true };
  const body = (await res.json()) as {
    data: Challenge;
    meta?: { warnings?: ChallengeWarning[] };
  };
  return { ok: true, data: body.data, warnings: body.meta?.warnings ?? [] };
}

// The draft's first problem; once the rules are locked only the name and
// end date are sent, so only theirs count.
function firstError(draft: ChallengeDraft, locked = false): string | null {
  const errors = validateDraft(draft, null);
  return (locked ? [errors.name, errors.endsOn] : Object.values(errors)).find(Boolean) ?? null;
}

export async function createChallengeAction(draft: ChallengeDraft): Promise<ChallengeActionResult> {
  const error = firstError(draft);
  if (error) return { ok: false, error };
  return send("/api/v1/challenges", {
    method: "POST",
    body: JSON.stringify(createRequest(draft)),
  });
}

export async function updateChallengeAction(
  id: number,
  draft: ChallengeDraft,
  options: { locked: boolean; closedForGood: boolean },
): Promise<ChallengeActionResult> {
  if (!validId(id)) return { ok: false, error: "That Challenge no longer exists." };
  const error = firstError(draft, options.locked);
  if (error) return { ok: false, error };
  return send(`/api/v1/challenges/${id}`, {
    method: "PATCH",
    body: JSON.stringify(editRequest(draft, options)),
  });
}

export async function deleteChallengeAction(id: number): Promise<ChallengeActionResult> {
  if (!validId(id)) return { ok: false, error: "That Challenge no longer exists." };
  return send(`/api/v1/challenges/${id}`, { method: "DELETE" });
}

export async function setChallengeHiddenAction(id: number, hidden: boolean): Promise<ChallengeActionResult> {
  if (!validId(id)) return { ok: false, error: "That Challenge no longer exists." };
  return send(`/api/v1/challenges/${id}/${hidden ? "hide" : "unhide"}`, {
    method: "POST",
  });
}

// Hand the Challenge to another member, or to the club (Moderators and up).
export async function changeHostAction(
  id: number,
  host: { userId: string } | { club: true },
): Promise<ChallengeActionResult> {
  if (!validId(id)) return { ok: false, error: "That Challenge no longer exists." };
  const data = "club" in host ? { hosted_by_club: true } : { host_user_id: host.userId };
  if ("userId" in host && !/^\d{1,30}$/.test(host.userId)) return { ok: false, error: "Pick a member." };
  return send(`/api/v1/challenges/${id}/host`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}
