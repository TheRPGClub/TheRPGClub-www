import type { Value } from "platejs";
import { emptyRichTextValue } from "@/lib/rich-text/text";
import { LONG_MONTHS, dateParts } from "./codex-date";
import { discordToStory } from "./discord-story";
import { withCurrentNames } from "./lore-story";
import { HISTORY_PATH, historyEventAnchor } from "./paths";
import { DESCRIPTION_SCHEMA, sanitizeStory } from "./story-schema";
import type { CodexEntry, HistoryKind } from "./types";

export type { HistoryKind } from "./types";

// Club History (www#126, design 2B): the History Event Kinds and their inks,
// and the timeline laid out as a book of year chapters.

export const HISTORY_KINDS = ["founding", "staff", "platform", "rules", "milestone"] as const satisfies readonly HistoryKind[];

export const KIND_NAME: Record<HistoryKind, string> = {
  founding: "Founding",
  staff: "Staff",
  platform: "Platform",
  rules: "Rules",
  milestone: "Milestone",
};

export function isHistoryKind(value: unknown): value is HistoryKind {
  return typeof value === "string" && (HISTORY_KINDS as readonly string[]).includes(value);
}

// A History Event Kind's ink (codex-inks.md), as a CSS colour for `--ink`.
// An unknown kind reads as Milestone parchment, the quietest of them.
export function kindInk(kind: HistoryKind | null): string {
  return `var(--color-kind-${isHistoryKind(kind) ? kind : "milestone"})`;
}

export function kindName(kind: HistoryKind | null): string {
  return isHistoryKind(kind) ? KIND_NAME[kind] : "History Event";
}

export type HistoryOrder = "oldest" | "newest";

// The timeline's page size: History Events a page of the book.
export const HISTORY_PER_PAGE = 40;

// The timeline's URL: `?kind=staff&order=newest&page=2`, each left out at
// its default.
export interface HistoryQuery {
  kind: HistoryKind | null;
  order: HistoryOrder;
  page: number;
}

export function historyQuery(params: { kind?: string; order?: string; page?: string }): HistoryQuery {
  const page = Number(params.page);
  return {
    kind: isHistoryKind(params.kind) ? params.kind : null,
    order: params.order === "newest" ? "newest" : "oldest",
    page: Number.isInteger(page) && page >= 1 && page <= 10_000 ? page : 1,
  };
}

// `?event=<id>` (www#127): a link to one History Event from elsewhere in
// the Club Codex (a See also, the contents page), which opens the page of
// the book holding it whatever `page` says.
export function historyEventParam(value: string | undefined): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// The page of `events` (as shown) holding History Event `id`, or null.
export function eventPage(events: readonly Pick<CodexEntry, "id">[], id: number, per: number): number | null {
  const index = events.findIndex((event) => event.id === id);
  return index < 0 ? null : Math.floor(index / per) + 1;
}

// The query with its page moved to the one holding `event`, when it is shown.
export function focusQuery(
  query: HistoryQuery,
  events: readonly CodexEntry[],
  event: number | null,
  per = HISTORY_PER_PAGE,
): HistoryQuery {
  if (event === null) return query;
  const page = eventPage(orderedEvents(events, query.kind, query.order), event, per);
  return page === null ? query : { ...query, page };
}

// Where a See also on the timeline takes the reader to History Event `id`:
// its anchor when it is on this page, else the page holding it under the
// same Kind filter and order (without the filter when the filter hides it).
// One the timeline doesn't hold goes through `?event=`.
export function timelineHref(
  events: readonly CodexEntry[],
  query: HistoryQuery,
  id: number,
  per = HISTORY_PER_PAGE,
): string {
  const anchor = `#${historyEventAnchor(id)}`;
  const page = eventPage(orderedEvents(events, query.kind, query.order), id, per);
  if (page === query.page) return anchor;
  if (page !== null) return `${historyHref(HISTORY_PATH, { ...query, page })}${anchor}`;
  const unfiltered = eventPage(orderedEvents(events, null, query.order), id, per);
  if (unfiltered !== null) return `${historyHref(HISTORY_PATH, { order: query.order, page: unfiltered })}${anchor}`;
  return `${HISTORY_PATH}?event=${id}${anchor}`;
}

export function historyHref(base: string, query: Partial<HistoryQuery>): string {
  const qs = new URLSearchParams();
  if (query.kind) qs.set("kind", query.kind);
  if (query.order === "newest") qs.set("order", "newest");
  if (query.page && query.page > 1) qs.set("page", String(query.page));
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
}

// How many History Events each Kind has, for the filter's chips.
export function kindCounts(events: readonly CodexEntry[]): Record<HistoryKind, number> {
  const counts = Object.fromEntries(HISTORY_KINDS.map((kind) => [kind, 0])) as Record<HistoryKind, number>;
  for (const event of events) if (isHistoryKind(event.kind)) counts[event.kind] += 1;
  return counts;
}

export function eventYear(event: Pick<CodexEntry, "occurred_on">): number | null {
  return dateParts(event.occurred_on)?.y ?? null;
}

// The date inside its year's chapter, which already names the year: "14
// March" or "June". Null for a year-only date, which reads "Some time in
// 2016" instead.
export function chapterDate(occurredOn: string | null, precision: CodexEntry["date_precision"]): string | null {
  const date = dateParts(occurredOn);
  if (!date || precision === "year" || !precision) return null;
  const month = LONG_MONTHS[date.m - 1] ?? "";
  return precision === "month" ? month : `${date.d} ${month}`;
}

export type BookItem =
  | { type: "chapter"; year: number; count: number; events: CodexEntry[] }
  | { type: "gap"; year: number };

// The History Events in the order asked: the API sends them oldest first
// (by date, then id), so newest first is that order reversed. Undated ones
// (the API doesn't allow any) are left out.
export function orderedEvents(events: readonly CodexEntry[], kind: HistoryKind | null, order: HistoryOrder): CodexEntry[] {
  const kept = events.filter((event) => eventYear(event) !== null && (kind === null || event.kind === kind));
  return order === "newest" ? kept.reverse() : kept;
}

// One page of the book: a chapter per year with History Events on the page
// (a year split across pages repeats its numeral, with the year's whole
// count), and a one-line gap for each year between two chapters with
// nothing in it.
export function bookPage(events: readonly CodexEntry[], page: number, per: number): BookItem[] {
  const totals = new Map<number, number>();
  for (const event of events) {
    const year = eventYear(event)!;
    totals.set(year, (totals.get(year) ?? 0) + 1);
  }
  type Chapter = Extract<BookItem, { type: "chapter" }>;
  const items: BookItem[] = [];
  let last: Chapter | undefined;
  for (const event of events.slice((page - 1) * per, page * per)) {
    const year: number = eventYear(event)!;
    if (last !== undefined && last.year === year) {
      last.events.push(event);
      continue;
    }
    if (last !== undefined) {
      const from: number = last.year;
      const step = year > from ? 1 : -1;
      for (let gap = from + step; gap !== year; gap += step) items.push({ type: "gap", year: gap });
    }
    const chapter: Chapter = { type: "chapter", year, count: totals.get(year) ?? 1, events: [event] };
    items.push(chapter);
    last = chapter;
  }
  return items;
}

const NUMBER_WORDS = [
  "No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];

// How long the club has been going, from the year of its first History
// Event to the club's year now, for the front page's band: "Ten years",
// "One year", "21 years".
export function clubYears(since: number, thisYear: number): string {
  const years = Math.max(thisYear - since, 0);
  return `${NUMBER_WORDS[years] ?? years} year${years === 1 ? "" : "s"}`;
}

// "1 History Event", "2 History Events".
export function eventCount(n: number): string {
  return `${n} History Event${n === 1 ? "" : "s"}`;
}

// A chapter's photos, pinned up in event order, each tilted -2.2deg, then
// 1.6deg, then alternating.
export function chapterPhotos(events: readonly CodexEntry[]): { id: number; url: string; title: string; tilt: number }[] {
  const photos = events.flatMap((event) =>
    [...event.images].sort((a, b) => a.position - b.position).map((image) => ({ id: image.id, url: image.url, title: event.title ?? "" })),
  );
  return photos.map((photo, i) => ({ ...photo, tilt: i % 2 === 0 ? -2.2 : 1.6 }));
}

// The description the History Event desk opens with: the History Event's
// (mentions under current names), one saved without rich text read back
// from its Discord markdown `body`, or an empty page.
export function readDescription(entry: CodexEntry | null): Value {
  if (!entry) return emptyRichTextValue();
  const value =
    sanitizeStory(entry.rich_body, DESCRIPTION_SCHEMA) ?? (entry.body ? discordToStory(entry.body, DESCRIPTION_SCHEMA) : null);
  return value ? withCurrentNames(value, entry.mentions) : emptyRichTextValue();
}
