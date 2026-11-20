import { apiFetch } from "@/lib/api";
import { fetchFacet } from "@/lib/games/games-index";
import type { HiddenPlatforms, PlatformChoice } from "@/lib/hidden-platforms";

// A member's Hidden Platforms (ticket api#427). They belong to the Release
// Calendar Feature: the API 404s for a member who can't use it, and the
// website then leaves the list out. "not_found" for that, null when the read
// failed. Never cached: /releases and /settings both change the list.
export async function fetchHiddenPlatforms(userId: string): Promise<HiddenPlatforms | "not_found" | null> {
  try {
    const res = await apiFetch(`/api/v1/users/${encodeURIComponent(userId)}/hidden_platforms`, {
      cache: "no-store",
    });
    if (res.status === 404) return "not_found";
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: HiddenPlatforms };
    return body.data ?? null;
  } catch {
    return null;
  }
}

// Every platform some GameDB game is on, by name: what /settings offers to
// hide. IGDB knows hundreds more, none of which can be on the calendar.
// The Game Index's platform facet, so the two can't drift apart. Empty when
// the read failed.
export function fetchPlatformChoices(): Promise<PlatformChoice[]> {
  return fetchFacet("platform");
}
