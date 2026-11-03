"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import type { JournalEntryGame } from "@/lib/api/types";
import { cleanJournalInput } from "@/lib/journals";

export interface JournalActionResult {
  ok: boolean;
  data?: JournalEntryGame;
  error?: string;
}

type JournalAction = "create" | "update" | "delete";

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// Refusals in the member's words, by HTTP status.
async function errorMessage(res: Response, action: JournalAction): Promise<string> {
  const err = await readApiError(res);
  if (res.status === 401) return "Your session has ended. Sign in again.";
  if (res.status === 403) {
    return action === "create"
      ? "You can only write in your own journal."
      : "Only the entry's author can change it.";
  }
  if (res.status === 404) return "That entry no longer exists.";
  return apiErrorMessage(err);
}

function revalidate(userId: string | undefined, gameIds: (number | undefined)[]) {
  if (userId) revalidatePath(`/members/${userId}/journal`);
  for (const id of new Set(gameIds)) if (id) revalidatePath(`/games/${id}`);
  revalidatePath("/journals");
}

async function send(
  path: string,
  init: RequestInit,
  action: JournalAction,
): Promise<{ res: Response } | { error: string }> {
  try {
    const res = await apiFetch(path, { ...init, cache: "no-store" });
    if (!res.ok) return { error: await errorMessage(res, action) };
    return { res };
  } catch {
    return { error: "Couldn't reach the club's server. Try again." };
  }
}

// Writes the next entry in `userId`'s journal (the API refuses anyone but
// that member).
export async function createJournalEntryAction(input: {
  userId: string;
  gameId: number;
  title: string;
  body: string;
}): Promise<JournalActionResult> {
  if (!validId(input.gameId)) return { ok: false, error: "Pick a game for the entry." };
  const checked = cleanJournalInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  const sent = await send(
    `/api/v1/users/${encodeURIComponent(input.userId)}/journal`,
    {
      method: "POST",
      body: JSON.stringify({ data: { gamedb_game_id: input.gameId, ...checked.data } }),
    },
    "create",
  );
  if ("error" in sent) return { ok: false, error: sent.error };
  const { data } = (await sent.res.json()) as { data: JournalEntryGame };
  revalidate(data.user_id, [data.gamedb_game_id]);
  return { ok: true, data };
}

// Rewrites an entry, and moves it to `gameId` when that differs.
export async function updateJournalEntryAction(input: {
  entryId: number;
  gameId: number;
  title: string;
  body: string;
  previousGameId?: number;
}): Promise<JournalActionResult> {
  if (!validId(input.entryId)) return { ok: false, error: "That entry no longer exists." };
  if (!validId(input.gameId)) return { ok: false, error: "Pick a game for the entry." };
  const checked = cleanJournalInput(input);
  if (!checked.ok) return { ok: false, error: checked.error };
  const sent = await send(
    `/api/v1/journal_entries/${input.entryId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ data: { gamedb_game_id: input.gameId, ...checked.data } }),
    },
    "update",
  );
  if ("error" in sent) return { ok: false, error: sent.error };
  const { data } = (await sent.res.json()) as { data: JournalEntryGame };
  revalidate(data.user_id, [data.gamedb_game_id, input.previousGameId]);
  return { ok: true, data };
}

export async function deleteJournalEntryAction(input: {
  entryId: number;
  userId: string;
  gameId: number;
}): Promise<JournalActionResult> {
  if (!validId(input.entryId)) return { ok: false, error: "That entry no longer exists." };
  const sent = await send(
    `/api/v1/journal_entries/${input.entryId}`,
    { method: "DELETE" },
    "delete",
  );
  if ("error" in sent) return { ok: false, error: sent.error };
  revalidate(input.userId, [input.gameId]);
  return { ok: true };
}
