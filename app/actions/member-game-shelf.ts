"use server";

import { apiFetch } from "@/lib/api";
import type { ApiCollection, GameCompletion, UserNowPlaying } from "@/lib/api/types";
import { readGamePlaytime } from "@/lib/playtime/read";

// Where one game already is on a member's lists, for a Game Completion
// logged from the Completed page (spec api#451): their earlier completions
// of it (the dialog's timeline and "2nd time") and their Now Playing entry
// (Started comes from it), and their open Playthrough's time (the hours start
// there, spec api#457). A list that can't be read counts as empty.
export async function memberGameShelfAction(
  userId: string,
  gameId: number,
): Promise<{ completions: GameCompletion[]; nowPlaying: UserNowPlaying | null; playthroughMinutes: number | null }> {
  const [completions, nowPlaying, playtime] = await Promise.all([
    readList<GameCompletion>(`/api/v1/users/${userId}/completions?game_id=${gameId}&per=100`),
    readList<UserNowPlaying>(`/api/v1/users/${userId}/now_playing?per=500`),
    readGamePlaytime(userId, gameId),
  ]);
  return {
    completions,
    playthroughMinutes: playtime?.playthrough?.minutes ?? null,
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
