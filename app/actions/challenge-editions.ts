"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiSingle } from "@/lib/api/types";
import { editionRefusal } from "@/lib/challenges/edition";
import { pickRefusal } from "@/lib/challenges/santa-pick";
import type { SantaView } from "@/lib/challenges/types";

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

export interface PickActionResult extends EditionActionResult {
  // The pick as the API now holds it.
  pick?: SantaView["pick"];
}

// The signed-in Santa picks (or changes) their recipient's game. Refusals:
// 403 `not_a_santa`, 409 `picks_closed` (from the deadline day), 422
// `not_eligible` (left the backlog or Cleared), shown as the API words them.
export async function pickGameAction(editionId: number, gameId: number): Promise<PickActionResult> {
  if (!Number.isInteger(editionId) || editionId <= 0) return { ok: false, error: "That Edition no longer exists." };
  if (!Number.isInteger(gameId) || gameId <= 0) return { ok: false, error: "Pick a game from the list." };
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/challenge_editions/${editionId}/santa/pick`, {
      method: "PUT",
      body: JSON.stringify({ data: { game_id: gameId } }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // non-JSON body
  }
  if (!res.ok) {
    const code = body && typeof body === "object" ? (body as { error?: unknown }).error : undefined;
    return { ok: false, error: pickRefusal(res.status, body), code: typeof code === "string" ? code : undefined };
  }
  // The Edition page's yellow panel says what was picked.
  revalidatePath("/challenges/[id]", "page");
  return { ok: true, pick: (body as ApiSingle<SantaView> | null)?.data?.pick ?? null };
}
