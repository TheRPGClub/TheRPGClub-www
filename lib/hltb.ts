import { CLUB_TIME_ZONE } from "@/lib/public-reminders";

// HowLongToBeat times for the game page's "Time to beat" card. Pure helpers:
// the API scrapes and saves (POST /games/:id/hltb/lookup); these read its
// strings ("62 Hours", "62½ Hours", "45 Mins") into bars on one hour scale.

// The API's Hltb schema (saved row, or an unsaved lookup result).
export interface Hltb {
  name: string | null;
  url: string | null;
  image_url: string | null;
  main: string | null;
  main_sides: string | null;
  completionist: string | null;
  single_player: string | null;
  co_op: string | null;
  vs: string | null;
  source_query: string | null;
  scraped_at: string | null;
  updated_at: string | null;
}

export interface HltbLookupMeta {
  source: "cache" | "hltb";
  saved: boolean;
}

// Play styles in HowLongToBeat's own order and words.
const STYLES = [
  { key: "main", label: "Main Story" },
  { key: "main_sides", label: "Main + Sides" },
  { key: "completionist", label: "Completionist" },
  { key: "single_player", label: "Single-Player" },
  { key: "co_op", label: "Co-Op" },
  { key: "vs", label: "Vs." },
] as const;

// Reads an HLTB time as hours, or null for blanks and placeholders like "--".
// Same reading as the bot's parseHltbHours and the API's BacklogPicker.
export function parseHltbHours(value: string | null | undefined): number | null {
  if (!value) return null;
  const text = value.replace(/½/g, ".5").toLowerCase();
  const match = /(\d+(?:\.\d+)?)/.exec(text);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return /min/.test(text) ? amount / 60 : amount;
}

export interface HltbBar {
  key: string;
  label: string;
  // The figure as HLTB wrote it ("62½") and its unit ("h", "m"), or the raw
  // text with no unit when it can't be read.
  figure: string;
  unit: string;
  // Share of the card's shared scale, 0 to 100; 0 when unreadable.
  percent: number;
}

// One bar per play style HLTB gave a time for, all on the same scale: the
// longest time plus a little headroom, rounded up to 5 hours.
export function hltbBars(hltb: Hltb): HltbBar[] {
  const rows = STYLES.flatMap(({ key, label }) => {
    const raw = hltb[key]?.trim();
    if (!raw) return [];
    return [{ key, label, raw, hours: parseHltbHours(raw) }];
  });
  const longest = Math.max(0, ...rows.map((r) => r.hours ?? 0));
  const scale = longest > 0 ? Math.ceil((longest * 1.08) / 5) * 5 : 0;
  return rows.map(({ key, label, raw, hours }) => ({
    key,
    label,
    ...splitFigure(raw),
    percent: hours && scale ? Math.min(100, (hours / scale) * 100) : 0,
  }));
}

function splitFigure(raw: string): { figure: string; unit: string } {
  const match = /^([\d½.]+)\s*(hours?|mins?)$/i.exec(raw);
  if (!match) return { figure: raw, unit: "" };
  return {
    figure: match[1],
    unit: match[2].toLowerCase().startsWith("min") ? "m" : "h",
  };
}

// "14 Mar 2025", or null. Instants read in the club's time zone; release
// dates are calendar dates stored at UTC midnight, so they read in UTC.
function clubDate(
  iso: string | null | undefined,
  timeZone: string = CLUB_TIME_ZONE,
): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  });
}

// The card's foot: when these times were looked up.
export function hltbLookedUpLabel(hltb: Hltb): string | null {
  const date = clubDate(hltb.scraped_at ?? hltb.updated_at);
  return date ? `Looked up ${date}` : null;
}

// Why a lookup's times weren't saved: the API saves them only once the game's
// initial release is six months old (undated games never).
export function hltbNotSavedNote(releaseDate: string | null): string {
  const released = clubDate(releaseDate, "UTC");
  if (!releaseDate || !released) {
    return "This game has no release date, so these times aren't saved.";
  }
  const after = new Date(releaseDate);
  after.setUTCMonth(after.getUTCMonth() + 6);
  return `Released ${released}. Times are saved once a game is six months old; look up again after ${clubDate(after.toISOString(), "UTC")}.`;
}

// HowLongToBeat's own search, for a title it had no match for.
export function hltbSearchUrl(title: string): string {
  return `https://howlongtobeat.com/?q=${encodeURIComponent(title)}`;
}

// The lookup's outcomes the card shows, from the API's error codes.
export type HltbLookupFailure =
  | "no_match"
  | "failed"
  | "not_configured"
  | "forbidden"
  | "other";

export function hltbFailureKind(
  status: number,
  code: string | undefined,
): HltbLookupFailure {
  if (code === "hltb_no_match") return "no_match";
  if (code === "hltb_lookup_failed") return "failed";
  if (code === "hltb_not_configured") return "not_configured";
  if (status === 403) return "forbidden";
  return "other";
}

export const HLTB_FAILURE_COPY: Record<
  HltbLookupFailure,
  { title: string; body: string }
> = {
  no_match: {
    title: "No match on HowLongToBeat.",
    body: "Nothing was saved for this title.",
  },
  failed: {
    title: "The lookup failed.",
    body: "HowLongToBeat didn't answer.",
  },
  not_configured: {
    title: "Lookups are switched off.",
    body: "The club's server isn't set up to search HowLongToBeat yet.",
  },
  forbidden: {
    title: "Members only.",
    body: "Only members with the Members role, and staff, can look up times.",
  },
  other: {
    title: "The lookup didn't work.",
    body: "Try again in a moment.",
  },
};
