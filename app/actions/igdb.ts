"use server";

import { revalidatePath, updateTag } from "next/cache";
import { apiFetch } from "@/lib/api";
import type { ApiSingle, Game, ReleaseRefreshMeta } from "@/lib/api/types";
import { igdbErrorMessage, type IgdbAction } from "@/lib/igdb";

export interface IgdbActionResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function failure(action: IgdbAction, res: Response): Promise<string> {
  let code: string | null = null;
  try {
    const body = await res.json();
    code = typeof body.error === "string" ? body.error : null;
  } catch {
    // Not JSON: the status alone says enough.
  }
  return igdbErrorMessage(action, res.status, code);
}

// Adds a game from IGDB (`POST /games {igdb_id}`). A game already in the GameDB
// comes back as it is, so the caller lands on it instead of a duplicate; either
// way `data` is the GameDB game.
export async function addGameFromIgdbAction(
  igdbId: number,
): Promise<IgdbActionResult<Game>> {
  if (!Number.isInteger(igdbId) || igdbId <= 0) {
    return { ok: false, error: "That IGDB result has no id." };
  }
  let res: Response;
  try {
    res = await apiFetch("/api/v1/games", {
      method: "POST",
      body: JSON.stringify({ igdb_id: igdbId }),
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await failure("add", res) };

  const body = (await res.json()) as ApiSingle<Game>;
  if (res.status === 201) {
    // A new game: the index, its count and the newest shelf all change.
    updateTag("games");
    revalidatePath("/games");
  }
  return { ok: true, data: body.data };
}

// Re-reads the game's releases from IGDB and reports how many were added.
export async function refreshReleasesAction(
  gameId: number,
): Promise<IgdbActionResult<ReleaseRefreshMeta>> {
  if (!Number.isInteger(gameId) || gameId <= 0) {
    return { ok: false, error: "That game no longer exists." };
  }
  let res: Response;
  try {
    res = await apiFetch(`/api/v1/games/${gameId}/refresh-releases`, {
      method: "POST",
    });
  } catch {
    return { ok: false, error: "Couldn't reach the club's server. Try again." };
  }
  if (!res.ok) return { ok: false, error: await failure("refresh", res) };

  const body = (await res.json()) as { meta: ReleaseRefreshMeta };
  updateTag("games");
  revalidatePath(`/games/${gameId}`);
  return { ok: true, data: body.meta };
}
