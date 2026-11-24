"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { FranchiseColumns } from "@/lib/franchises/types";

// Franchise editing (spec api#442). The API decides who may do what:
// Regulars and above link, unlink, set Mainline, create and undo; Admins and
// above rename, merge and delete.

export type FranchiseResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const MESSAGES: Record<string, string> = {
  franchise_merged: "This Franchise was merged into another one. Open that one to change it.",
  invalid_merge: "Pick another Franchise to merge into.",
  already_undone: "That change was already undone.",
  superseded: "A later change touched the same game or name, so this one can't be undone now.",
  not_undoable: "Creating, merging and deleting can't be undone.",
};

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const validId = (id: number) => Number.isInteger(id) && id > 0;

async function send<T>(path: string, init: RequestInit): Promise<FranchiseResult<T>> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    if (err.status === 404) return { ok: false, error: "That Franchise or game no longer exists." };
    return { ok: false, error: apiErrorMessage(err, MESSAGES) };
  }
  if (res.status === 204) return { ok: true };
  try {
    const body = (await res.json()) as { data?: T };
    return { ok: true, data: body.data };
  } catch {
    return { ok: true };
  }
}

function touched(franchiseId: number, gameId?: number) {
  revalidatePath(`/franchises/${franchiseId}`);
  if (gameId) revalidatePath(`/games/${gameId}`);
}

// Links `gameId` (as a hand link when it wasn't linked), and sets Mainline
// when `mainline` is given.
export async function linkFranchiseGameAction(franchiseId: number, gameId: number, mainline?: boolean): Promise<FranchiseResult> {
  if (!validId(franchiseId) || !validId(gameId)) return { ok: false, error: "Pick a game to link." };
  const data = mainline === undefined ? {} : { mainline };
  const result = await send(`/api/v1/franchises/${franchiseId}/games/${gameId}`, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
  if (result.ok) touched(franchiseId, gameId);
  return result.ok ? { ok: true } : result;
}

export async function unlinkFranchiseGameAction(franchiseId: number, gameId: number): Promise<FranchiseResult> {
  if (!validId(franchiseId) || !validId(gameId)) return { ok: false, error: "That game is no longer linked." };
  const result = await send(`/api/v1/franchises/${franchiseId}/games/${gameId}`, { method: "DELETE" });
  if (result.ok) touched(franchiseId, gameId);
  return result.ok ? { ok: true } : result;
}

// A Franchise IGDB doesn't have (Regulars and above).
export async function createFranchiseAction(name: string): Promise<FranchiseResult<FranchiseColumns>> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Give the Franchise a name." };
  if (trimmed.length > 255) return { ok: false, error: "Keep the name under 255 characters." };
  return send<FranchiseColumns>("/api/v1/franchises", { method: "POST", body: JSON.stringify({ data: { name: trimmed } }) });
}

// Creates a Franchise and links `gameId` to it (the Game Edit page's
// "Create a Franchise" result, saved with Save all).
export async function createFranchiseWithGameAction(name: string, gameId: number, mainline: boolean): Promise<FranchiseResult> {
  const created = await createFranchiseAction(name);
  if (!created.ok) return created;
  if (!created.data) return { ok: false, error: "The Franchise was made, but its id didn't come back. Refresh to link it." };
  return linkFranchiseGameAction(created.data.franchise_id, gameId, mainline || undefined);
}

export async function renameFranchiseAction(franchiseId: number, name: string): Promise<FranchiseResult> {
  const trimmed = name.trim();
  if (!validId(franchiseId)) return { ok: false, error: "That Franchise no longer exists." };
  if (!trimmed) return { ok: false, error: "Give the Franchise a name." };
  const result = await send(`/api/v1/franchises/${franchiseId}`, { method: "PATCH", body: JSON.stringify({ data: { name: trimmed } }) });
  if (result.ok) touched(franchiseId);
  return result.ok ? { ok: true } : result;
}

export async function mergeFranchiseAction(franchiseId: number, intoId: number): Promise<FranchiseResult> {
  if (!validId(franchiseId) || !validId(intoId)) return { ok: false, error: "Pick a Franchise to merge into." };
  if (franchiseId === intoId) return { ok: false, error: MESSAGES.invalid_merge };
  const result = await send(`/api/v1/franchises/${franchiseId}/merge`, {
    method: "POST",
    body: JSON.stringify({ data: { into_id: intoId } }),
  });
  if (result.ok) {
    touched(franchiseId);
    touched(intoId);
  }
  return result.ok ? { ok: true } : result;
}

export async function deleteFranchiseAction(franchiseId: number): Promise<FranchiseResult> {
  if (!validId(franchiseId)) return { ok: false, error: "That Franchise no longer exists." };
  const result = await send(`/api/v1/franchises/${franchiseId}`, { method: "DELETE" });
  if (result.ok) touched(franchiseId);
  return result.ok ? { ok: true } : result;
}

export async function undoFranchiseChangeAction(franchiseId: number, changeId: number): Promise<FranchiseResult> {
  if (!validId(changeId)) return { ok: false, error: "That change no longer exists." };
  const result = await send(`/api/v1/franchise_changes/${changeId}/undo`, { method: "POST", body: JSON.stringify({ data: {} }) });
  if (result.ok) touched(franchiseId);
  return result.ok ? { ok: true } : result;
}
