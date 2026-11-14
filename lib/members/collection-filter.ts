// The collected-games list's platform filter, read from and written to its
// URL. Client-safe.

// The `platform_id` filter value: a gamedb platform id, or "none" for entries
// with no platform. null means unfiltered.
export type PlatformFilter = string | null;

// Only a numeric id or "none" reaches the API; anything else reads as "All"
// rather than being passed through into the query string.
export function parsePlatformFilter(raw: string | undefined): PlatformFilter {
  if (raw === "none") return "none";
  if (raw && /^\d+$/.test(raw)) return raw;
  return null;
}

// The collected-games URL for a page and filter. Page 1 and "All" stay off the
// query string so the canonical URL is the bare path.
export function collectedGamesHref(
  userId: string,
  { page = 1, platformId = null }: { page?: number; platformId?: PlatformFilter },
): string {
  const ps = new URLSearchParams();
  if (platformId) ps.set("platform_id", platformId);
  if (page > 1) ps.set("page", String(page));
  return `/members/${userId}/collected-games${ps.size ? `?${ps}` : ""}`;
}
