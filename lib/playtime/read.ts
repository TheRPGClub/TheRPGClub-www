import { apiFetch } from "@/lib/api";
import type { GamePlaytime } from "./types";

// The member's Playtime for one game (GET /users/:id/games/:game_id/
// playtime), or null when it can't be read: the game page then leaves the
// Playtime control out rather than show a wrong figure.
export async function readGamePlaytime(userId: string, gameId: number): Promise<GamePlaytime | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${userId}/games/${gameId}/playtime`, { cache: "no-store" });
    if (!res.ok) return null;
    return ((await res.json()) as { data: GamePlaytime }).data;
  } catch {
    return null;
  }
}
