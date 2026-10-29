"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";
import type { ActionResult } from "@/app/actions/game-lists";
import { apiErrorMessage, readApiError } from "@/lib/api/errors";
import { isMemberId } from "@/lib/imports/kinds";

export interface StartPlayingResult extends ActionResult<null> {
  // The API error code, so the form can link to Now Playing on 409
  // `already_playing`.
  code?: string;
}

const START_PLAYING_ERRORS: Record<string, string> = {
  already_playing: "This game is already on your Now Playing list.",
};

// "Start playing" from a backlog pick. One POST does the whole move: the API
// creates the now-playing entry, drops every backlog row for the game and
// carries the backlog note over in a single transaction, so no note is sent
// here. A pick with no platform has to be given one first; the form sends it
// as `platform_id`.
export async function startPlayingFromPickAction(
  userId: string,
  pick: { gamedb_game_id: number; platform_id: number | null },
  _state: StartPlayingResult,
  formData: FormData,
): Promise<StartPlayingResult> {
  if (!isMemberId(userId)) return { ok: false, error: "Invalid request." };

  const chosen = Number(formData.get("platform_id"));
  const platformId =
    pick.platform_id ?? (Number.isInteger(chosen) && chosen > 0 ? chosen : null);
  if (platformId === null) {
    return { ok: false, error: "Choose the platform you're playing it on." };
  }

  const res = await apiFetch(`/api/v1/users/${userId}/now_playing`, {
    method: "POST",
    body: JSON.stringify({
      data: { gamedb_game_id: pick.gamedb_game_id, platform_id: platformId },
    }),
  });
  if (!res.ok) {
    const err = await readApiError(res);
    return { ok: false, code: err.code, error: apiErrorMessage(err, START_PLAYING_ERRORS) };
  }

  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/now-playing-games`);
  revalidatePath(`/members/${userId}/backlogged-games`);
  redirect(`/members/${userId}/now-playing-games`);
}
