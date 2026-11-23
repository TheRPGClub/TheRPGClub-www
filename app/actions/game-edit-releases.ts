"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { Release } from "@/lib/api/types";
import type { ReleaseFields, StepResult } from "@/lib/games/game-edit";

// The Game Edit page's Releases steps (spec api#437, www#161): create, edit
// and delete Manual Releases (Admins), and the section's reload after a
// save or an IGDB refresh.

const MESSAGES: Record<string, string> = {
  forbidden: "Only Admins can change a game's Releases.",
  not_found: "That Release is no longer in GameDB.",
  igdb_release: "That Release comes from IGDB; only an IGDB refresh changes it.",
};
const UNREACHABLE = "Couldn't reach the club's server. Try again.";

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

function revalidateGame(gameId: number) {
  revalidatePath(`/games/${gameId}`);
  revalidatePath(`/games/${gameId}/edit`);
  updateTag("games");
}

async function send(gameId: number, path: string, init: RequestInit): Promise<StepResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    const code = err.code ?? (res.status === 403 ? "forbidden" : res.status === 404 ? "not_found" : undefined);
    return { ok: false, error: apiErrorMessage({ ...err, code }, MESSAGES) };
  }
  revalidateGame(gameId);
  return { ok: true };
}

export async function createReleaseAction(gameId: number, fields: ReleaseFields): Promise<StepResult> {
  if (!validId(gameId)) return { ok: false, error: "That game can't be edited." };
  return send(gameId, `/api/v1/games/${gameId}/releases`, { method: "POST", body: JSON.stringify({ data: fields }) });
}

export async function updateReleaseAction(
  gameId: number,
  releaseId: number,
  fields: Partial<ReleaseFields>,
): Promise<StepResult> {
  if (!validId(gameId) || !validId(releaseId)) return { ok: false, error: "That Release can't be edited." };
  return send(gameId, `/api/v1/releases/${releaseId}`, { method: "PATCH", body: JSON.stringify({ data: fields }) });
}

export async function deleteReleaseAction(gameId: number, releaseId: number): Promise<StepResult> {
  if (!validId(gameId) || !validId(releaseId)) return { ok: false, error: "That Release can't be deleted." };
  return send(gameId, `/api/v1/releases/${releaseId}`, { method: "DELETE" });
}

// The game's Releases as they stand, or null when they can't be read.
export async function loadReleasesAction(gameId: number): Promise<Release[] | null> {
  if (!validId(gameId)) return null;
  try {
    const res = await apiFetch(`/api/v1/games/${gameId}/releases`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { data?: Release[] }).data ?? [];
  } catch {
    return null;
  }
}
