import { unstable_cache } from "next/cache";
import { apiFetchAs, apiToken } from "@/lib/api";
import type { ApiCollection, Platform, UserSummary } from "@/lib/api/types";

// Club-wide reads whose answer is the same for every member, cached once for
// the club rather than once per member. A `next: { revalidate }` fetch keys
// its cache on the request headers, and every API call carries the member's
// token, so each member missed it on their first visit and it kept a copy
// per member. These key on the path alone.
//
// Only for endpoints with no viewer-dependent fields and no Feature gate (a
// Preview Feature answers staff and 404s everyone else, and the cache would
// hand staff's answer to everyone). Signed out, there's no token to read
// with, so they return null.

async function sharedList<T>(path: string, revalidate: number, tags: string[]): Promise<T[] | null> {
  const token = await apiToken();
  if (!token) return null;
  // The token is the member reading this time; it isn't part of the key.
  const read = unstable_cache(
    async () => {
      const res = await apiFetchAs(token, path, { cache: "no-store" });
      // Thrown, so a failed read isn't cached.
      if (!res.ok) throw new Error(`GET ${path}: ${res.status}`);
      return ((await res.json()) as ApiCollection<T>).data;
    },
    ["shared-api", path],
    { revalidate, tags },
  );
  try {
    return await read();
  } catch {
    return null;
  }
}

export const MEMBERS_TAG = "members";
export const PLATFORMS_TAG = "platforms";

// Members as the users index sends them (UserSummaryResource: the same for
// every viewer, no Feature gate), for a query (`per`, `discord_id`, ...).
export function fetchMembers<T = UserSummary>(query: string, revalidate: number): Promise<T[] | null> {
  return sharedList<T>(`/api/v1/users?${query}`, revalidate, [MEMBERS_TAG]);
}

// Every member (active or not, bots included), by username.
export function fetchMemberDirectory<T = UserSummary>(revalidate: number): Promise<T[] | null> {
  return fetchMembers<T>("per=500", revalidate);
}

// Every GameDB platform. An IGDB import can add one, so its actions refresh
// PLATFORMS_TAG.
export function fetchPlatforms(): Promise<Platform[] | null> {
  return sharedList<Platform>("/api/v1/platforms?per=500", 3600, [PLATFORMS_TAG]);
}
