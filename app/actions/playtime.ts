"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import type { GamePlaytime, ManualPlaytimeMode, MismatchKeep } from "@/lib/playtime/types";

// The game page's Playtime writes (spec api#457, www#185). Every write
// answers with the member's whole Playtime document for the game, so the
// control redraws from the answer without a second read.

export interface PlaytimeResult {
  ok: boolean;
  data?: GamePlaytime;
  error?: string;
  code?: string;
}

const MESSAGES: Record<string, string> = {
  playthrough_open: "A Playthrough of this game is already open.",
  playthrough_closed: "That Playthrough has already ended.",
  invalid_total_minutes: "Hours must be a number, 0 or more.",
  no_mismatch: "That mismatch is already settled.",
};

async function send(userId: string, path: string, method: string, data?: Record<string, unknown>): Promise<PlaytimeResult> {
  try {
    const res = await apiFetch(path, { method, ...(data ? { body: JSON.stringify({ data }) } : {}) });
    if (!res.ok) {
      const err = await readApiError(res);
      return { ok: false, code: err.code, error: (err.code && MESSAGES[err.code]) || err.message || `Couldn't save it (HTTP ${res.status}).` };
    }
    const body = (await res.json()) as { data: GamePlaytime };
    revalidatePath(`/members/${userId}`);
    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
}

// Add time to, or set the total of, the member's Manual Playtime on one
// platform (null is "Other"). It makes the entry when there is none.
export async function saveManualPlaytimeAction(
  userId: string,
  gameId: number,
  input: { platformId: number | null; minutes: number; mode: ManualPlaytimeMode; note?: string | null },
): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/users/${userId}/games/${gameId}/manual_playtimes`, "POST", {
    platform_id: input.platformId,
    minutes: input.minutes,
    mode: input.mode,
    ...(input.note !== undefined ? { note: input.note } : {}),
  });
}

export async function updateManualPlaytimeAction(
  userId: string,
  entryId: number,
  input: { minutes?: number; note?: string | null },
): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/manual_playtimes/${entryId}`, "PATCH", input);
}

export async function deleteManualPlaytimeAction(userId: string, entryId: number): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/manual_playtimes/${entryId}`, "DELETE");
}

// Settle a mismatch: keep the Manual entry (the Provider's figure on that
// platform stops counting), the Provider's (the Manual entry goes), or both
// (both count and it is no longer flagged).
export async function settlePlaytimeMismatchAction(
  userId: string,
  gameId: number,
  platformId: number,
  keep: MismatchKeep,
): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/users/${userId}/games/${gameId}/playtime/mismatches`, "POST", { platform_id: platformId, keep });
}

export async function startPlaythroughAction(userId: string, gameId: number): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/users/${userId}/games/${gameId}/playthroughs`, "POST");
}

// Set the open Playthrough's time by hand, or null to go back to the time
// measured since it started.
export async function setPlaythroughTotalAction(userId: string, playthroughId: number, totalMinutes: number | null): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/playthroughs/${playthroughId}`, "PATCH", { total_minutes: totalMinutes });
}

export async function abandonPlaythroughAction(userId: string, playthroughId: number): Promise<PlaytimeResult> {
  return send(userId, `/api/v1/playthroughs/${playthroughId}/abandon`, "POST");
}
