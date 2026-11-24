"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { MemberShelfKind } from "@/lib/api/member-shelf-entry";
import { readApiError } from "@/lib/api/errors";
import type { SortOrderPatch } from "@/lib/shelf-forms/reorder";
import type { MemberShelfPayload } from "@/lib/shelf-forms/values";

export type { MemberShelfKind } from "@/lib/api/member-shelf-entry";

// One server-actions module shared by all six profile lists. They all have the
// same wire shape: a list scoped to a user, individual entries identified by
// per-resource PKs, and a payload with `gamedb_game_id` + optional
// `platform_id` + list-specific extras (note, ownership_type, completion_type,
// started_at, completed_at, leave_now_playing, added_at).

export interface ActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  // The API's refusal code (422 `started_after_finished`...), so a form can
  // put the message on its field.
  code?: string;
}

interface ListConfig {
  // Path segment under /users/:id used for create + listing.
  userCollection: string;
  // Path segment used for entry operations (get/update/destroy).
  entryResource: string;
  // Profile-page section the entry appears in (for revalidation).
  profileSubpath: string;
}

const LISTS: Record<MemberShelfKind, ListConfig> = {
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

// A refused request: the API's prose and its code.
async function refusal(response: Response): Promise<{ ok: false; error: string; code?: string }> {
  const err = await readApiError(response);
  return {
    ok: false,
    code: err.code,
    error: err.message ?? err.code ?? `Request failed (HTTP ${response.status}).`,
  };
}

function revalidateMemberPages(userId: string, kind: MemberShelfKind) {
  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/${LISTS[kind].profileSubpath}`);
}

// The payload lives in lib so the shared list forms can build it.
export type { MemberShelfPayload };

// Favorites are platform-agnostic on the backend — sending platform_id makes
// the request fail validation. The other lists do accept it.
// Each list's own extras are dropped from the others, so a shared form can't
// send a field another list would refuse.
const FORBIDDEN_FIELDS: Partial<Record<MemberShelfKind, ReadonlyArray<keyof MemberShelfPayload>>> = {
  favorite: ["platform_id", "started_at", "leave_now_playing", "added_at"],
  backlog: ["started_at", "leave_now_playing", "added_at"],
  now_playing: ["started_at", "leave_now_playing"],
  collection: ["started_at", "leave_now_playing", "added_at"],
  completed: ["added_at"],
};

function sanitizePayload(
  kind: MemberShelfKind,
  input: Partial<MemberShelfPayload>,
): Partial<MemberShelfPayload> {
  const forbidden = FORBIDDEN_FIELDS[kind];
  if (!forbidden || forbidden.length === 0) return input;
  const cleaned: Partial<MemberShelfPayload> = { ...input };
  for (const field of forbidden) delete cleaned[field];
  return cleaned;
}

export async function addToMemberShelfAction(
  userId: string,
  kind: MemberShelfKind,
  input: MemberShelfPayload,
): Promise<ActionResult<{ entry_id: number; left_now_playing?: boolean }>> {
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

  if (!res.ok) return refusal(res);

  // A completion answers `meta.left_now_playing` when it was asked to leave
  // Now Playing (api#452).
  const body = (await res.json()) as {
    data: { entry_id?: number; completion_id?: number };
    meta?: { left_now_playing?: boolean };
  };
  revalidateMemberPages(userId, kind);
  const left = body.meta?.left_now_playing === true;
  if (left) revalidateMemberPages(userId, "now_playing");
  return {
    ok: true,
    data: {
      entry_id: body.data.entry_id ?? body.data.completion_id ?? 0,
      ...(input.leave_now_playing ? { left_now_playing: left } : {}),
    },
  };
}

export async function updateMemberShelfEntryAction(
  userId: string,
  kind: MemberShelfKind,
  entryId: number,
  input: Partial<MemberShelfPayload>,
): Promise<ActionResult<{ entry_id: number }>> {
  const res = await apiFetch(
    `/api/v1/${LISTS[kind].entryResource}/${entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: sanitizePayload(kind, input) }),
    },
  );

  if (!res.ok) return refusal(res);

  const body = (await res.json()) as { data: { entry_id?: number; completion_id?: number } };
  revalidateMemberPages(userId, kind);
  return { ok: true, data: { entry_id: body.data.entry_id ?? body.data.completion_id ?? entryId } };
}

export async function removeMemberShelfEntryAction(
  userId: string,
  kind: MemberShelfKind,
  entryId: number,
): Promise<ActionResult<null>> {
  const res = await apiFetch(
    `/api/v1/${LISTS[kind].entryResource}/${entryId}`,
    { method: "DELETE" },
  );

  if (!res.ok) return refusal(res);

  revalidateMemberPages(userId, kind);
  return { ok: true, data: null };
}

// Convenience helper for the "move" action — swaps an entry between two lists
// in one round-trip from the client's perspective. We can't make this truly
// atomic without a backend endpoint, so the client should handle partial
// failures (e.g. show an error if the add succeeded but the delete failed).
export async function moveMemberShelfEntryAction(
  userId: string,
  source: { kind: MemberShelfKind; entryId: number },
  target: { kind: MemberShelfKind; payload: MemberShelfPayload },
): Promise<ActionResult<{ entry_id: number }>> {
  const added = await addToMemberShelfAction(userId, target.kind, target.payload);
  if (!added.ok) return added;

  const removed = await removeMemberShelfEntryAction(
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

// Stores a new order for one of the ordered lists (Now Playing, Backlog,
// Favorites): each patch writes an entry's `sort_order`. Built by
// `sortOrderPatches`, which renumbers only what it must. Sent in parallel;
// a refusal stops nothing already sent, so the page re-reads either way.
export async function reorderMemberShelfAction(
  userId: string,
  kind: MemberShelfKind,
  patches: SortOrderPatch[],
): Promise<ActionResult<null>> {
  if (kind === "completed" || kind === "collection") {
    return { ok: false, error: "This list isn't ordered." };
  }
  const results = await Promise.all(
    patches.map((patch) =>
      apiFetch(`/api/v1/${LISTS[kind].entryResource}/${patch.entryId}`, {
        method: "PATCH",
        body: JSON.stringify({ data: { sort_order: patch.sortOrder } }),
      }),
    ),
  );
  revalidateMemberPages(userId, kind);
  const failed = results.find((res) => !res.ok);
  return failed ? refusal(failed) : { ok: true, data: null };
}
