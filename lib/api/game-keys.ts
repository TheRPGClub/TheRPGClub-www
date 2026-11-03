import { apiFetch } from "@/lib/api";
import { memberName } from "@/lib/achievements";
import { MEMBERS_REVALIDATE_SECONDS } from "@/lib/api/members";
import type { ApiCollection, GameKey, UserSummary } from "@/lib/api/types";

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

// user_id -> display name, from the cached member directory. Empty when it
// can't be read; callers fall back to a plain "a member".
export async function fetchMemberNames(): Promise<Map<string, string>> {
  try {
    const res = await apiFetch(`/api/v1/users?per=500`, {
      next: { revalidate: MEMBERS_REVALIDATE_SECONDS, tags: ["members"] },
    });
    if (!res.ok) return new Map();
    const { data }: ApiCollection<UserSummary> = await res.json();
    return new Map(data.map((user) => [user.user_id, memberName(user)]));
  } catch {
    return new Map();
  }
}
