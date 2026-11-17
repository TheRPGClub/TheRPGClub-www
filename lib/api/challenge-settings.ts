import { apiFetch } from "@/lib/api";
import type { ChallengeSettings } from "@/lib/challenge-settings";

// The member's own Challenge settings for /settings, read fresh. Null when
// the read failed (including the API's 404 while Challenges is unavailable
// to them).
export async function fetchChallengeSettings(userId: string): Promise<ChallengeSettings | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/challenge_settings`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: ChallengeSettings };
    return body.data ?? null;
  } catch {
    return null;
  }
}
