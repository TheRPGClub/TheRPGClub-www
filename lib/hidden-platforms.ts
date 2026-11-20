// A member's Hidden Platforms (spec api#421, ticket api#427): platforms they
// never want on their Release Calendar or their Upcoming Releases panel. The
// API keeps the set and filters `GET /upcoming_releases` by it; /releases
// ("Hide for good", "Show all" for the visit) and /settings change the same
// list. Website only: the bot's release posts don't change.
// Client-safe: no server imports.

// One Hidden Platform (`GET /users/:id/hidden_platforms` -> data.platforms[]).
export interface HiddenPlatform {
  platform_id: number;
  platform_name: string;
  platform_abbreviation: string | null;
}

export interface HiddenPlatforms {
  user_id: string;
  // In platform name order, as `platforms`.
  platform_ids: number[];
  platforms: HiddenPlatform[];
}

// A platform a member can pick: the Release Calendar's filter options and
// the /settings picker's choices.
export interface PlatformChoice {
  id: number;
  name: string;
}

export const HIDDEN_PLATFORMS_NOT_SAVED = "Couldn't save your Hidden Platforms. Try again.";

// The body a save sends: the whole set, which the API replaces.
export function isPlatformIdList(ids: unknown): ids is number[] {
  return Array.isArray(ids) && ids.every((id) => Number.isInteger(id) && id > 0);
}

// The set with one more platform, each id once, ascending.
export function withHidden(ids: readonly number[], id: number): number[] {
  return [...new Set([...ids, id])].sort((a, b) => a - b);
}

// The set without one platform.
export function withoutHidden(ids: readonly number[], id: number): number[] {
  return ids.filter((x) => x !== id);
}

// "PS4", "PS4 and Xbox One", "PS4, Xbox One and Switch".
export function platformNames(names: readonly string[]): string {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names.join("");
}

// "1 platform hidden", "2 platforms hidden".
export function hiddenCount(n: number): string {
  return `${n} ${n === 1 ? "platform" : "platforms"} hidden`;
}

// The choices a member can still hide: the ones not hidden yet.
export function hideableChoices(
  choices: readonly PlatformChoice[],
  hidden: readonly number[],
): PlatformChoice[] {
  return choices.filter((c) => !hidden.includes(c.id));
}

// The cache tag on one member's `GET /upcoming_releases` reads. A save
// expires it, so /releases drops (or regains) the platform on the next load
// rather than after the read's revalidate window.
export function upcomingReleasesTag(userId: string): string {
  return `upcoming-releases:${userId}`;
}
