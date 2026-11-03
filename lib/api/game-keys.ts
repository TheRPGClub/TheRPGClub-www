import { apiFetch } from "@/lib/api";
import type { ApiCollection, GameKey } from "@/lib/api/types";

// Giveaway reads for the server. Each returns null when the list can't be
// read, so a page can say so rather than show an empty shelf.

async function readKeys(path: string): Promise<GameKey[] | null> {
  try {
    const res = await apiFetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as ApiCollection<GameKey>;
    return body.data;
  } catch {
    return null;
  }
}

// The unclaimed keys on the shelf, by title.
export function fetchShelfKeys(): Promise<GameKey[] | null> {
  return readKeys("/api/v1/game_keys?per=500");
}

// The keys a member donated, claimed or not, newest first. No secrets.
export function fetchDonatedKeys(userId: string): Promise<GameKey[] | null> {
  return readKeys(`/api/v1/users/${encodeURIComponent(userId)}/game_keys?per=500`);
}

// The keys a member claimed, newest claim first. Carries `key_value` when the
// viewer is the claimer.
export function fetchClaimedKeys(userId: string): Promise<GameKey[] | null> {
  return readKeys(`/api/v1/users/${encodeURIComponent(userId)}/claimed_game_keys?per=500`);
}

// One key with its secret, for its claimer, donor, Admins and Superadmins.
export async function fetchGameKey(id: number): Promise<GameKey | null> {
  try {
    const res = await apiFetch(`/api/v1/game_keys/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { data: GameKey };
    return body.data;
  } catch {
    return null;
  }
}
