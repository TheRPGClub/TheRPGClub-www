import type { GameList } from "@/lib/game-lists/types";
import { SORT_LABEL } from "@/lib/game-lists/types";

// The few words Game Lists print about themselves. Days are UTC days, as
// across the club's pages. Client-safe.

const DAY = 86_400_000;

function utcDay(at: Date): number {
  return Math.floor(at.getTime() / DAY);
}

function shortDate(at: Date, now: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: at.getUTCFullYear() === now.getUTCFullYear() ? undefined : "numeric",
  }).format(at);
}

// "today", "yesterday", "3 days ago", "2 weeks ago", else "4 Oct".
export function updatedText(iso: string, now: Date): string {
  const at = new Date(iso);
  const days = utcDay(now) - utcDay(at);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 28) return `${Math.floor(days / 7)} week${days < 14 ? "" : "s"} ago`;
  return shortDate(at, now);
}

// A game's tag on a list sorted by date added: "Today", else "3 Nov".
export function addedTag(iso: string, now: Date): string {
  const at = new Date(iso);
  return utcDay(now) - utcDay(at) <= 0 ? "Today" : shortDate(at, now);
}

// "1 game", "12 games".
export function gamesCount(n: number): string {
  return `${n} ${n === 1 ? "game" : "games"}`;
}

// A list's place line on a game page card: "No. 2" over "of 10" when the
// list is ranked, else the order's name over its size.
export function placeLabel(list: Pick<GameList, "sort">, place: number, of: number): { big: string; small: string } {
  if (list.sort === "ranked") return { big: `No. ${place}`, small: `of ${of}` };
  return { big: SORT_LABEL[list.sort], small: gamesCount(of) };
}

// The Profile shelf's note under its count.
export function privateNote(lists: readonly Pick<GameList, "visibility">[], own: boolean): string {
  if (!own) return "Members-visible lists";
  const hidden = lists.filter((l) => l.visibility === "private").length;
  if (hidden === 0) return "All seen by members";
  return `${hidden} Private, only you see ${hidden === 1 ? "it" : "them"}`;
}
