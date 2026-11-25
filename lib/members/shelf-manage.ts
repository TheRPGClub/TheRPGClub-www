import type { Platform } from "@/lib/api/types";
import { igdbAddBlockedReason } from "@/lib/igdb";
import { getSession } from "@/lib/session";
import { fetchPlatforms } from "@/lib/api/shared";

// What a list page's owner needs to manage it (spec api#451, pick 3A): the
// platforms the forms offer and whether they may add a game from IGDB.
// Null for anyone else, who gets the page as it always was.
export interface ShelfOwner {
  userId: string;
  platforms: Platform[];
  igdbBlockedReason: string | null;
}

export async function loadShelfOwner(userId: string): Promise<ShelfOwner | null> {
  const session = await getSession();
  if (session?.principal.discord_id !== userId) return null;
  return {
    userId,
    platforms: await loadPlatforms(),
    igdbBlockedReason: igdbAddBlockedReason(true, session.membership),
  };
}

// Every platform, for the forms' Platform field. A failed read leaves the
// field with "No platform" only, so the rest of a form still saves.
async function loadPlatforms(): Promise<Platform[]> {
  return (await fetchPlatforms()) ?? [];
}
