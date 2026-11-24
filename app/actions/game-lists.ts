"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type {
  GameList,
  GameListEntry,
  GameListSort,
  GameListVisibility,
  ListFeedsChallenges,
} from "@/lib/game-lists/types";

// Making and changing Game Lists as the signed-in member (spec api#442,
// api#446). The API owns every rule and writes its refusals for members, so
// those are shown as given. A delete, or a change to Private, of a list that
// feeds a Challenge comes back as `feeds` until it is sent again confirmed.

export interface GameListResult<T = undefined> {
  ok: boolean;
  data?: T;
  error?: string;
  // 409 list_feeds_challenges: what confirming would do.
  feeds?: ListFeedsChallenges;
}

export interface GameListFields {
  name?: string;
  description?: string | null;
  sort?: GameListSort;
  visibility?: GameListVisibility;
}

const UNREACHABLE = "Couldn't reach the club's server. Try again.";

const MESSAGES: Record<string, string> = {
  already_in_list: "That game is already on this list.",
  list_full: "A list holds 500 games. Remove one first.",
};

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function send<T>(path: string, init: RequestInit): Promise<GameListResult<T>> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: UNREACHABLE };
  }
  if (!res.ok) {
    if (res.status === 401) return { ok: false, error: "Your session has ended. Sign in again." };
    if (res.status === 404) return { ok: false, error: "That Game List no longer exists." };
    const err = await readApiError(res);
    if (err.code === "list_feeds_challenges") {
      const challenges = (err.body?.challenges as ListFeedsChallenges["challenges"] | undefined) ?? [];
      return { ok: false, feeds: { message: err.message ?? "", challenges } };
    }
    if (res.status === 403 && !err.message) return { ok: false, error: "You can't change this Game List." };
    return { ok: false, error: apiErrorMessage(err, MESSAGES) };
  }
  revalidatePath("/lists", "layout");
  const body = (await res.json()) as { data: T };
  return { ok: true, data: body.data };
}

const json = (method: string, data: Record<string, unknown>): RequestInit => ({
  method,
  body: JSON.stringify({ data }),
});

// A new list, then its first games in the order they were picked. A game
// that won't go in is reported, the list stays made.
export async function createGameListAction(
  fields: Required<Pick<GameListFields, "name">> & GameListFields,
  gameIds: readonly number[] = [],
): Promise<GameListResult<GameList>> {
  if (!fields.name.trim()) return { ok: false, error: "Give the list a name." };
  const made = await send<GameList>("/api/v1/game_lists", json("POST", { ...fields }));
  if (!made.ok || !made.data) return made;
  for (const gameId of gameIds) {
    const added = await send<GameListEntry>(`/api/v1/game_lists/${made.data.id}/entries/${gameId}`, json("POST", {}));
    if (!added.ok) return { ok: true, data: made.data, error: `Made the list, but not every game went in: ${added.error}` };
  }
  return made;
}

export async function updateGameListAction(
  id: number,
  fields: GameListFields,
  confirm = false,
): Promise<GameListResult<GameList>> {
  if (!validId(id)) return { ok: false, error: "That Game List no longer exists." };
  return send<GameList>(`/api/v1/game_lists/${id}`, json("PATCH", { ...fields, ...(confirm ? { confirm: true } : {}) }));
}

export async function deleteGameListAction(
  id: number,
  confirm = false,
): Promise<GameListResult<{ taken_over: boolean }>> {
  if (!validId(id)) return { ok: false, error: "That Game List no longer exists." };
  return send(`/api/v1/game_lists/${id}${confirm ? "?confirm=true" : ""}`, { method: "DELETE" });
}

export async function addGameToListAction(id: number, gameId: number): Promise<GameListResult<GameListEntry>> {
  if (!validId(id) || !validId(gameId)) return { ok: false, error: "That game can't be added." };
  return send<GameListEntry>(`/api/v1/game_lists/${id}/entries/${gameId}`, json("POST", {}));
}

export async function removeGameFromListAction(id: number, gameId: number): Promise<GameListResult> {
  if (!validId(id) || !validId(gameId)) return { ok: false, error: "That game isn't on the list." };
  return send(`/api/v1/game_lists/${id}/entries/${gameId}`, { method: "DELETE" });
}

export async function noteGameAction(id: number, gameId: number, note: string): Promise<GameListResult<GameListEntry>> {
  if (!validId(id) || !validId(gameId)) return { ok: false, error: "That game isn't on the list." };
  const text = note.trim();
  return send<GameListEntry>(`/api/v1/game_lists/${id}/entries/${gameId}`, json("PATCH", { note: text || null }));
}

export async function orderGameListAction(id: number, gameIds: readonly number[]): Promise<GameListResult<GameList>> {
  if (!validId(id)) return { ok: false, error: "That Game List no longer exists." };
  return send<GameList>(`/api/v1/game_lists/${id}/entries/order`, json("PUT", { game_ids: gameIds }));
}
