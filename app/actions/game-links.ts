"use server";

import { revalidatePath } from "next/cache";
import { apiFetch } from "@/lib/api";
import { readApiError } from "@/lib/api/errors";
import { gameLinkErrorMessage, type GameLinkAction } from "@/lib/game-links";

export interface GameLinkResult {
  ok: boolean;
  error?: string;
}

function validId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

// Discord snowflakes are digit strings.
function validThreadId(id: string): boolean {
  return /^\d{1,25}$/.test(id);
}

async function send(
  action: GameLinkAction,
  path: string,
  init: RequestInit,
): Promise<GameLinkResult> {
  let res: Response;
  try {
    res = await apiFetch(path, { ...init, cache: "no-store" });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) {
    const err = await readApiError(res);
    return {
      ok: false,
      error: gameLinkErrorMessage(action, res.status, err.message ?? err.code),
    };
  }
  return { ok: true };
}

// Links `altGameId` as an alternate version of `gameId` (Admins). The link is
// symmetric, so both games' pages change.
export async function linkVersionAction(
  gameId: number,
  altGameId: number,
): Promise<GameLinkResult> {
  if (!validId(gameId) || !validId(altGameId)) {
    return { ok: false, error: "Pick a game to link." };
  }
  if (gameId === altGameId) {
    return { ok: false, error: "That's this game. Pick another one." };
  }
  const result = await send("version", `/api/v1/games/${gameId}/alternates`, {
    method: "POST",
    body: JSON.stringify({ data: { alt_game_id: altGameId } }),
  });
  if (result.ok) {
    revalidatePath(`/games/${gameId}`);
    revalidatePath(`/games/${altGameId}`);
  }
  return result;
}

// Links a Discord thread to the game (Regulars, or Moderator and up).
export async function linkThreadAction(
  threadId: string,
  gameId: number,
): Promise<GameLinkResult> {
  if (!validThreadId(threadId) || !validId(gameId)) {
    return { ok: false, error: "Pick a thread to link." };
  }
  const result = await send("thread-link", `/api/v1/threads/${threadId}/links`, {
    method: "POST",
    body: JSON.stringify({ data: { gamedb_game_id: gameId } }),
  });
  if (result.ok) revalidatePath(`/games/${gameId}`);
  return result;
}

// Removes one thread's link to the game, leaving its other links.
export async function unlinkThreadAction(
  threadId: string,
  gameId: number,
): Promise<GameLinkResult> {
  if (!validThreadId(threadId) || !validId(gameId)) {
    return { ok: false, error: "That thread no longer exists." };
  }
  const result = await send(
    "thread-unlink",
    `/api/v1/threads/${threadId}/links/${gameId}`,
    { method: "DELETE" },
  );
  if (result.ok) revalidatePath(`/games/${gameId}`);
  return result;
}
