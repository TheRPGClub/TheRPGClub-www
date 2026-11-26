import { CLUB_TIME_ZONE } from "@/lib/public-reminders";
import type { Patch } from "./types";

// How Patch Notes words a Patch (www#236). Client-safe and pure.

type Dated = Pick<Patch, "published_at">;

function format(at: string | null, options: Intl.DateTimeFormatOptions): string {
  if (!at) return "";
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { timeZone: CLUB_TIME_ZONE, ...options }).format(date);
}

// "26 Nov 2026": the card, the slips and the left bar.
export function patchDate(patch: Dated): string {
  return format(patch.published_at, { day: "numeric", month: "short", year: "numeric" }).replace("Sept", "Sep");
}

// "26 Nov": the Patches list and the page note.
export function patchDay(patch: Dated): string {
  return format(patch.published_at, { day: "numeric", month: "short" }).replace("Sept", "Sep");
}

// "26 November 2026": the cover band.
export function patchLongDate(patch: Dated): string {
  return format(patch.published_at, { day: "numeric", month: "long", year: "numeric" });
}

// A Patch's title, or "Patch 2" when it has none.
export function patchTitle(patch: Pick<Patch, "number" | "title">): string {
  const title = patch.title?.trim();
  return title ? title : `Patch ${patch.number}`;
}

// The cover's two-line title: the second line holds at least a quarter of
// the letters, in whole words. One word stays one line.
export function titleLines(title: string): [string, string | null] {
  const words = title.trim().split(/\s+/);
  if (words.length < 2) return [title.trim(), null];
  const total = words.join(" ").length;
  for (let at = words.length - 1; at > 0; at--) {
    const second = words.slice(at).join(" ");
    if (second.length * 4 >= total) return [words.slice(0, at).join(" "), second];
  }
  return [words[0], words.slice(1).join(" ")];
}

// The index's note on its rule: "4 Patches · newest 26 Nov".
export function stackNote(patches: readonly Patch[]): string {
  const count = `${patches.length} ${patches.length === 1 ? "Patch" : "Patches"}`;
  const newest = patches[0] ? patchDay(patches[0]) : "";
  return newest ? `${count} · newest ${newest}` : count;
}
