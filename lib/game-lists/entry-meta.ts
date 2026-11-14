import type { GameListEntry, GameListKind } from "@/lib/api/game-list-entry";

// Backend validates these as check constraints; the order here drives the
// default selection so the "no choice" path still produces a valid request.
export const COMPLETION_TYPES = [
  "Main Story",
  "Main Story + Side Content",
  "Completionist",
] as const;
export const OWNERSHIP_TYPES = ["Digital", "Physical", "Subscription", "Other"] as const;

const MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

// The one line of facts under a cover: when it was finished, how it's
// owned, or just the platform.
export function entryMeta(kind: GameListKind, entry: GameListEntry): string | null {
  const platform =
    entry.platform?.platform_abbreviation ?? entry.platform?.platform_name ?? null;
  if (kind === "completed" && "completion_id" in entry) {
    const date = entry.completed_at ? new Date(entry.completed_at) : null;
    const when =
      date && !Number.isNaN(date.getTime()) ? MONTH.format(date) : null;
    return [when, platform].filter(Boolean).join(" · ") || entry.completion_type;
  }
  if (kind === "collection" && "ownership_type" in entry) {
    return [platform, entry.ownership_type].filter(Boolean).join(" · ") || null;
  }
  return platform;
}
