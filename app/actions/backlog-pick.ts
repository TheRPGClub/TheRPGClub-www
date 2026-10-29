"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api";

export interface StartPlayingState {
  error: string | null;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error ?? body.message ?? `Request failed (HTTP ${response.status}).`;
  } catch {
    return `Request failed (HTTP ${response.status}).`;
  }
}

// "Start playing" from a backlog pick. One POST does the whole move: the API
// creates the now-playing entry, drops every backlog row for the game and
// carries the backlog note over in a single transaction, so no note is sent
// here. A pick with no platform has to be given one first; the form sends it
// as `platform_id`.
export async function startPlayingFromPickAction(
  userId: string,
  pick: { gamedb_game_id: number; platform_id: number | null },
  _state: StartPlayingState,
  formData: FormData,
): Promise<StartPlayingState> {
  const chosen = Number(formData.get("platform_id"));
  const platformId =
    pick.platform_id ?? (Number.isInteger(chosen) && chosen > 0 ? chosen : null);
  if (platformId === null) {
    return { error: "Choose the platform you're playing it on." };
  }

  const res = await apiFetch(`/api/v1/users/${userId}/now_playing`, {
    method: "POST",
    body: JSON.stringify({
      data: { gamedb_game_id: pick.gamedb_game_id, platform_id: platformId },
    }),
  });
  if (!res.ok) return { error: await errorMessage(res) };

  revalidatePath(`/members/${userId}`);
  revalidatePath(`/members/${userId}/now-playing-games`);
  revalidatePath(`/members/${userId}/backlogged-games`);
  redirect(`/members/${userId}/now-playing-games`);
}
