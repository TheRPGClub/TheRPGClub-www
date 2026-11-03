import type { JournaledGame } from "@/lib/api/types";

// Pure helpers for the Game Journal surfaces (the profile's Journal tab, the
// game page's section and /journals). The API decides every write; these
// keep the editor to the bot's limits and lay the book out.

// The API's title column and the bot's modal body limit.
export const JOURNAL_TITLE_MAX = 120;
export const JOURNAL_BODY_MAX = 2000;

export interface JournalEntryInput {
  entry_title: string | null;
  entry_body: string;
}

// Trim the title and body as the bot does, send an empty title as null, and
// hold both to their limits. Returns the clean payload or the first problem.
export function cleanJournalInput(raw: {
  title: string;
  body: string;
}): { ok: true; data: JournalEntryInput } | { ok: false; error: string } {
  const title = raw.title.replace(/\s+/g, " ").trim();
  const body = raw.body.trim();
  if (!body) return { ok: false, error: "Write something in the entry." };
  if (title.length > JOURNAL_TITLE_MAX) {
    return { ok: false, error: `Keep the title to ${JOURNAL_TITLE_MAX} characters.` };
  }
  if (body.length > JOURNAL_BODY_MAX) {
    return { ok: false, error: `Keep the entry to ${JOURNAL_BODY_MAX} characters.` };
  }
  return { ok: true, data: { entry_title: title || null, entry_body: body } };
}

// Only the author gets Edit and Delete (staff can't write someone else's
// entry either; the API answers 403).
export function isJournalOwner(
  entry: { user_id: string },
  viewerId: string | null | undefined,
): boolean {
  return !!viewerId && entry.user_id === viewerId;
}

// "Entry #N" as the bot numbers it (oldest = 1), on a newest-first page of
// one member's entries for one game.
export function entryNumber(
  count: number,
  page: number,
  per: number,
  index: number,
): number {
  return count - (page - 1) * per - index;
}

// Chapter numerals: I, II, III ... (plain digits past 3999).
export function romanNumeral(n: number): string {
  if (!Number.isInteger(n) || n <= 0 || n > 3999) return String(n);
  const table: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  let rest = n;
  for (const [value, glyph] of table) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

function validDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "Oct 31", or "Oct 31, 2026" with the year; UTC like the rest of the site.
export function journalDate(
  iso: string | null | undefined,
  withYear = false,
): string | null {
  const date = validDate(iso);
  if (!date) return null;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

// A chapter's span: "Oct 3 – Oct 31, 2026", "Dec 30, 2025 – Jan 4, 2026",
// or one date when it opened and closed the same day.
export function journalDateRange(
  firstIso: string | null | undefined,
  lastIso: string | null | undefined,
): string | null {
  const first = validDate(firstIso);
  const last = validDate(lastIso);
  if (!first || !last) return journalDate(lastIso ?? firstIso, true);
  const sameDay = first.toISOString().slice(0, 10) === last.toISOString().slice(0, 10);
  if (sameDay) return journalDate(lastIso, true);
  const sameYear = first.getUTCFullYear() === last.getUTCFullYear();
  return `${journalDate(firstIso, !sameYear)} – ${journalDate(lastIso, true)}`;
}

// "Edited Nov 1" when the entry changed after it was written (a minute's
// grace so the create itself never reads as an edit).
export function editedLabel(entry: {
  created_at: string;
  updated_at: string;
}): string | null {
  const created = validDate(entry.created_at);
  const updated = validDate(entry.updated_at);
  if (!created || !updated) return null;
  if (updated.getTime() - created.getTime() < 60_000) return null;
  return `Edited ${journalDate(entry.updated_at)}`;
}

// The Contents page runs newest chapter first: the game the member last wrote
// about, then back. Undated rows sink, ties fall to the title.
export function sortChapters(rows: JournaledGame[]): JournaledGame[] {
  return [...rows].sort((a, b) => {
    const at = a.last_entry_at ?? "";
    const bt = b.last_entry_at ?? "";
    if (at !== bt) return at < bt ? 1 : -1;
    return (a.game?.title ?? "").localeCompare(b.game?.title ?? "");
  });
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

// The journal member inks (DESIGN.md, "Journal member inks"): bright marks
// for ink grounds, each over 6:1 on ink-2 and ink-3, kept off the track
// inks, the highlighter yellow and the destructive orange.
export const JOURNAL_INKS: readonly string[] = [
  "#6dd17f", // fern
  "#43d3cc", // lagoon
  "#f077c0", // orchid
  "#86d3f6", // sky
  "#fab6ba", // peony
  "#719def", // cornflower
];

// A member's ink on the chronology plate and their spine on the shelf,
// picked by id so a member keeps theirs on every journal surface.
export function memberInk(userId: string): string {
  return JOURNAL_INKS[hash(userId) % JOURNAL_INKS.length];
}

// A spine's height on the /journals shelf: uneven but stable, so the shelf
// never reads as a bar chart.
export function spineHeight(userId: string): number {
  return 190 + (hash(`spine:${userId}`) % 47);
}

// ----- Chronology (the game page's plate) -----

export interface ChronologyMark {
  entryId: number;
  // 0-100 across the plate.
  at: number;
  // A Game Completion was logged the same UTC day.
  completion: boolean;
}

export interface ChronologyLine {
  userId: string;
  marks: ChronologyMark[];
  // The line runs from the first entry to the latest.
  start: number;
  end: number;
  firstAt: string;
  lastAt: string;
}

export interface Chronology {
  lines: ChronologyLine[];
  ticks: { label: string; at: number }[];
  // "Aug – Nov 2026", "Dec 2025 – Feb 2026".
  span: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY = 86_400_000;
// Marks sit inside the plate's edges.
const INSET = 3;

// Lays one line per member across the game's journal. Lines run latest
// writer first. `completions` mark the entries written the day a Game
// Completion was logged.
export function buildChronology(
  entries: { entry_id: number; user_id: string; created_at: string }[],
  completions: { user_id: string; completed_at: string | null }[],
): Chronology | null {
  const dated = entries
    .map((e) => ({ ...e, t: validDate(e.created_at)?.getTime() ?? NaN }))
    .filter((e) => Number.isFinite(e.t));
  if (dated.length === 0) return null;

  let min = Math.min(...dated.map((e) => e.t));
  let max = Math.max(...dated.map((e) => e.t));
  // A journal written in a week still gets a readable plate.
  if (max - min < 28 * DAY) {
    const pad = (28 * DAY - (max - min)) / 2;
    min -= pad;
    max += pad;
  }
  const pos = (t: number) =>
    Math.round((INSET + ((t - min) / (max - min)) * (100 - 2 * INSET)) * 10) / 10;

  const doneDays = new Set(
    completions
      .filter((c) => c.completed_at)
      .map((c) => `${c.user_id}:${c.completed_at!.slice(0, 10)}`),
  );

  const byUser = new Map<string, typeof dated>();
  for (const e of dated) {
    const list = byUser.get(e.user_id) ?? [];
    list.push(e);
    byUser.set(e.user_id, list);
  }
  const lines: ChronologyLine[] = [...byUser.entries()].map(([userId, list]) => {
    const sorted = [...list].sort((a, b) => a.t - b.t);
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    return {
      userId,
      marks: sorted.map((e) => ({
        entryId: e.entry_id,
        at: pos(e.t),
        completion: doneDays.has(
          `${userId}:${new Date(e.t).toISOString().slice(0, 10)}`,
        ),
      })),
      start: pos(first.t),
      end: pos(last.t),
      firstAt: first.created_at,
      lastAt: last.created_at,
    };
  });
  lines.sort((a, b) => (a.lastAt < b.lastAt ? 1 : a.lastAt > b.lastAt ? -1 : 0));

  // A tick at each month's first day inside the span, thinned to about six.
  const months: number[] = [];
  const start = new Date(min);
  let cursor = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1);
  while (cursor <= max) {
    months.push(cursor);
    const d = new Date(cursor);
    cursor = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
  }
  const step = Math.max(1, Math.ceil(months.length / 6));
  const multiYear = new Date(min).getUTCFullYear() !== new Date(max).getUTCFullYear();
  const ticks = months
    .filter((_, i) => i % step === 0)
    .map((t) => {
      const d = new Date(t);
      const m = MONTHS[d.getUTCMonth()];
      const label = multiYear && d.getUTCMonth() === 0 ? `${m} ${d.getUTCFullYear()}` : m;
      return { label, at: pos(t) };
    });
  // The opening month labels the left edge when its first tick is far in.
  if (step === 1 && (ticks[0]?.at ?? 100) > 12) {
    ticks.unshift({ label: MONTHS[start.getUTCMonth()], at: INSET });
  }

  const firstEntry = new Date(Math.min(...dated.map((e) => e.t)));
  const lastEntry = new Date(Math.max(...dated.map((e) => e.t)));
  const sameYear = firstEntry.getUTCFullYear() === lastEntry.getUTCFullYear();
  const fm = MONTHS[firstEntry.getUTCMonth()];
  const lm = MONTHS[lastEntry.getUTCMonth()];
  const span =
    sameYear && fm === lm
      ? `${lm} ${lastEntry.getUTCFullYear()}`
      : sameYear
        ? `${fm} – ${lm} ${lastEntry.getUTCFullYear()}`
        : `${fm} ${firstEntry.getUTCFullYear()} – ${lm} ${lastEntry.getUTCFullYear()}`;

  return { lines, ticks, span };
}

// ----- Search (the /journals catalogue) -----

// A stretch of the entry around the first match, so the hit is on screen.
export function searchSnippet(text: string, q: string, length = 200): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= length) return flat;
  const needle = q.trim().toLowerCase();
  const hit = needle ? flat.toLowerCase().indexOf(needle) : -1;
  if (hit < 0) return `${flat.slice(0, length).trimEnd()}…`;
  let start = Math.max(0, hit - Math.floor(length / 3));
  if (start > 0) {
    const space = flat.indexOf(" ", start);
    if (space > 0 && space < hit) start = space + 1;
  }
  const end = Math.min(flat.length, start + length);
  return `${start > 0 ? "…" : ""}${flat.slice(start, end).trim()}${end < flat.length ? "…" : ""}`;
}

// Splits text into plain and matching runs (case-insensitive, like the API's
// ILIKE search) so the matches can be marked.
export function highlightRuns(
  text: string,
  q: string,
): { text: string; hit: boolean }[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [{ text, hit: false }];
  const lower = text.toLowerCase();
  const runs: { text: string; hit: boolean }[] = [];
  let from = 0;
  for (let at = lower.indexOf(needle); at >= 0; at = lower.indexOf(needle, from)) {
    if (at > from) runs.push({ text: text.slice(from, at), hit: false });
    runs.push({ text: text.slice(at, at + needle.length), hit: true });
    from = at + needle.length;
  }
  if (from < text.length) runs.push({ text: text.slice(from), hit: false });
  return runs;
}

// The profile Journal tab's address for one chapter.
export function chapterHref(
  userId: string,
  gameId: number,
  extra: Record<string, string> = {},
): string {
  const qs = new URLSearchParams({ game: String(gameId), ...extra });
  return `/members/${userId}/journal?${qs}`;
}
