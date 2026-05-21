"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { GameListKind } from "@/lib/api/game-list-entry";

export type { GameListKind } from "@/lib/api/game-list-entry";

// One server-actions module shared by all six profile lists. They all have the
// same wire shape: a list scoped to a user, individual entries identified by
// per-resource PKs, and a payload with `gamedb_game_id` + optional
// `platform_id` + list-specific extras (note, ownership_type, completion_date).

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

interface ListConfig {
  // Path segment under /users/:id used for create + listing.
  userCollection: string;
  // Path segment used for entry operations (get/update/destroy).
  entryResource: string;
  // Profile-page section the entry appears in (for revalidation).
  profileSubpath: string;
}

const LISTS: Record<GameListKind, ListConfig> = {
  favorite: {
    userCollection: "favorites",
    entryResource: "favorites",
    profileSubpath: "favorite-games",
  },
  backlog: {
    userCollection: "backlog",
    entryResource: "backlog",
    profileSubpath: "backlogged-games",
  },
  now_playing: {
    userCollection: "now_playing",
    entryResource: "now_playing",
    profileSubpath: "now-playing-games",
  },
  completed: {
    userCollection: "completions",
    entryResource: "completions",
    profileSubpath: "completed-games",
  },
  collection: {
    userCollection: "collections",
    entryResource: "collections",
    profileSubpath: "collected-games",
  },
};

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`;
  } catch {
    return `Request failed (HTTP ${response.status}).`;
  }
}

function revalidateMemberPages(userId: string, kind: GameListKind) {
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/${LISTS[kind].profileSubpath}`);
}

export interface GameListPayload {
  gamedb_game_id: number;
  platform_id?: number | null;
  note?: string | null;
  // Required for the "collection" list, validated as one of
  // Digital | Physical | Subscription | Other.
  ownership_type?: string | null;
  // Required for the "completed" list, validated as one of
  // Main Story | Main Story + Side Content | Completionist.
  completion_type?: string | null;
  completion_date?: string | null;
  is_shared?: boolean;
  sort_order?: number | null;
}

// Favorites are platform-agnostic on the backend — sending platform_id makes
// the request fail validation. The other lists do accept it.
const FORBIDDEN_FIELDS: Partial<Record<GameListKind, ReadonlyArray<keyof GameListPayload>>> = {
  favorite: ["platform_id"],
};

function sanitizePayload(
  kind: GameListKind,
  input: Partial<GameListPayload>,
): Partial<GameListPayload> {
  const forbidden = FORBIDDEN_FIELDS[kind];
  if (!forbidden || forbidden.length === 0) return input;
  const cleaned: Partial<GameListPayload> = { ...input };
  for (const field of forbidden) delete cleaned[field];
  return cleaned;
}

export async function addGameToListAction(
  userId: string,
  kind: GameListKind,
  input: GameListPayload,
): Promise<ActionResult<{ entry_id: number }>> {
  if (!input.gamedb_game_id) {
    return { ok: false, error: "Pick a game first." };
  }

  const res = await apiFetch(
    `/api/v1/users/${userId}/${LISTS[kind].userCollection}`,
    {
      method: "POST",
      body: JSON.stringify({ data: sanitizePayload(kind, input) }),
    },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: { entry_id: number } };
  revalidateMemberPages(userId, kind);
  return { ok: true, data: body.data };
}

export async function updateGameListEntryAction(
  userId: string,
  kind: GameListKind,
  entryId: number,
  input: Partial<GameListPayload>,
): Promise<ActionResult<{ entry_id: number }>> {
  const res = await apiFetch(
    `/api/v1/${LISTS[kind].entryResource}/${entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: sanitizePayload(kind, input) }),
    },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  const body = (await res.json()) as { data: { entry_id: number } };
  revalidateMemberPages(userId, kind);
  return { ok: true, data: body.data };
}

export async function removeGameListEntryAction(
  userId: string,
  kind: GameListKind,
  entryId: number,
): Promise<ActionResult<null>> {
  const res = await apiFetch(
    `/api/v1/${LISTS[kind].entryResource}/${entryId}`,
    { method: "DELETE" },
  );

  if (!res.ok) return { ok: false, error: await errorMessage(res) };

  revalidateMemberPages(userId, kind);
  return { ok: true, data: null };
}

// Convenience helper for the "move" action — swaps an entry between two lists
// in one round-trip from the client's perspective. We can't make this truly
// atomic without a backend endpoint, so the client should handle partial
// failures (e.g. show an error if the add succeeded but the delete failed).
export async function moveGameListEntryAction(
  userId: string,
  source: { kind: GameListKind; entryId: number },
  target: { kind: GameListKind; payload: GameListPayload },
): Promise<ActionResult<{ entry_id: number }>> {
  const added = await addGameToListAction(userId, target.kind, target.payload);
  if (!added.ok) return added;

  const removed = await removeGameListEntryAction(
    userId,
    source.kind,
    source.entryId,
  );
  if (!removed.ok) {
    return {
      ok: false,
      error: `Added to ${target.kind} but failed to remove from ${source.kind}: ${removed.error ?? "unknown error"}`,
    };
  }
  return added;
}
