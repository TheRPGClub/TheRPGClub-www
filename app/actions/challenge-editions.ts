"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { editionRefusal } from "@/lib/challenges/edition";

// Signing the signed-in member up for an Edition of an Assignment (Secret
// Santa) Challenge, and taking them off it: before the cutoff a plain
// withdrawal; after the draw, until the pick deadline, leaving drops their
// pick and Abandons their Run (the API decides which). The API owns every
// rule (the cutoff, the 5-game backlog minimum) and writes its refusals for
// members, so those are shown as given.

export interface EditionActionResult {
  ok: boolean;
  error?: string;
  // The refusal's code (`backlog_too_small`, `signup_closed`...).
  code?: string;
}

async function change(editionId: number, method: "POST" | "DELETE"): Promise<EditionActionResult> {
  if (!Number.isInteger(editionId) || editionId <= 0) return { ok: false, error: "That Edition no longer exists." };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/challenge_editions/${editionId}/signup`, { method, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON error body
    }
    const code = body && typeof body === "object" ? (body as { error?: unknown }).error : undefined;
    return { ok: false, error: editionRefusal(res.status, body), code: typeof code === "string" ? code : undefined };
  }
  // The index, the Challenge page and every profile show sign-ups and Runs.
  revalidatePath("/challenges", "layout");
  revalidatePath("/members/[id]", "page");
  refresh();
  return { ok: true };
}

export async function signUpAction(editionId: number): Promise<EditionActionResult> {
  return change(editionId, "POST");
}

export async function leaveEditionAction(editionId: number): Promise<EditionActionResult> {
  return change(editionId, "DELETE");
}
