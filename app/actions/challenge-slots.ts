"use server";

import { refresh, revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import {
  pastPickRequest,
  pastPlayPath,
  slotMoveRequest,
  slotRefusal,
  type PastPlay,
  type SlotRequest,
} from "@/lib/challenges/slot-requests";

// A member's own Slots Run (www#109): move a Cleared game to another year it
// was released in, pick a Game Completion from before the Run for an open
// year (Counts past play), and the list of those Game Completions. The API
// owns every rule; its refusals are shown as given.

export interface SlotActionResult {
  ok: boolean;
  error?: string;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

async function send(request: SlotRequest | null): Promise<SlotActionResult> {
  if (!request) return { ok: false, error: "That game or year can't be used." };
  let res: Response;
  try {
    res = await apiFetch(request.path, { method: "POST", cache: "no-store", body: JSON.stringify(request.body) });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: slotRefusal(await readApiError(res)) };
  // The Challenge page draws the Run; the index and profiles show its score.
  revalidatePath("/challenges", "layout");
  revalidatePath("/members/[id]", "page");
  refresh();
  return { ok: true };
}

export async function moveSlotAction(runId: number, gameId: number, year: number): Promise<SlotActionResult> {
  return send(slotMoveRequest(runId, gameId, year));
}

export async function pastPickAction(runId: number, completionId: number, year: number): Promise<SlotActionResult> {
  return send(pastPickRequest(runId, completionId, year));
}

export type PastPlayResult = { ok: true; data: PastPlay[] } | { ok: false; error: string };

// The member's Game Completions from before their Run that fit an open year,
// oldest first and undated last, narrowed by title.
export async function pastPlayAction(runId: number, q: string): Promise<PastPlayResult> {
  if (!Number.isInteger(runId) || runId <= 0) return { ok: false, error: "That Run no longer exists." };
  let res: Response;
  try {
    res = await apiFetch(pastPlayPath(runId, q.slice(0, 100)), { cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) return { ok: false, error: slotRefusal(await readApiError(res)) };
  const body = (await res.json()) as { data?: PastPlay[] };
  return { ok: true, data: body.data ?? [] };
}
