"use server";

import { apiFetch } from "@/lib/api";
import type { ApiCollection, GameCompletion, UserNowPlaying } from "@/lib/api/types";

// Where one game already is on a member's lists, for a Game Completion
// logged from the Completed page (spec api#451): their earlier completions
// of it (the dialog's timeline and "2nd time") and their Now Playing entry
// (Started comes from it). A list that can't be read counts as empty.
export async function memberGameShelfAction(
  userId: string,
  gameId: number,
): Promise<{ completions: GameCompletion[]; nowPlaying: UserNowPlaying | null }> {
  const [completions, nowPlaying] = await Promise.all([
    readList<GameCompletion>(`/api/v1/users/${userId}/completions?game_id=${gameId}&per=100`),
    readList<UserNowPlaying>(`/api/v1/users/${userId}/now_playing?per=500`),
  ]);
  return {
    completions,
    nowPlaying: nowPlaying.find((entry) => (entry.game?.game_id ?? entry.gamedb_game_id) === gameId) ?? null,
  };
}

async function readList<T>(path: string): Promise<T[]> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return [];
    return ((await res.json()) as ApiCollection<T>).data;
  } catch {
    return [];
  }
}
