import type { DatePrecision, UpcomingRelease } from "@/lib/api/types";
import { periodEnd, releaseDateLabel } from "@/lib/games/releases";
import { firstParam } from "@/lib/search-params";

// The Release Calendar page (www#114): a month grid on top, then every other
// Upcoming Release from today on, listed by the API's `section`. Dates are
// plain UTC calendar days, the club's day, as on the game page (www#115).

export const RELEASES_PATH = "/releases";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface CalendarFilters {
  // The grid's month, YYYY-MM.
  month: string;
  // Platform ids the member picked; empty is every platform.
  platforms: number[];
}

// "2026-11" for a YYYY-MM-DD day.
export function monthOf(day: string): string {
  return day.slice(0, 7);
}

// The page's address: `month` (absent on today's month) and `platform`
// as a comma list.
export function parseCalendarFilters(
  params: Record<string, string | string[] | undefined>,
  today: string,
): CalendarFilters {
  const raw = firstParam(params.month) ?? "";
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  const valid = match && +match[2] >= 1 && +match[2] <= 12 && +match[1] >= 1970;
  const ids = [params.platform].flat().flatMap((v) => (v ?? "").split(","));
  const platforms = [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  return { month: valid ? raw : monthOf(today), platforms };
}

export function calendarHref(
  filters: CalendarFilters,
  change: Partial<CalendarFilters>,
  today: string,
): string {
  const next = { ...filters, ...change };
  const ps = new URLSearchParams();
  if (next.month !== monthOf(today)) ps.set("month", next.month);
  if (next.platforms.length) ps.set("platform", next.platforms.join(","));
  const qs = ps.toString().replaceAll("%2C", ",");
  return qs ? `${RELEASES_PATH}?${qs}` : RELEASES_PATH;
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

// "November 2026".
export function monthTitle(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function utcDate(day: string): Date {
  const [y, m, d] = day.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// "Thu".
export function weekdayOf(day: string): string {
  return WEEKDAYS[utcDate(day).getUTCDay()];
}

// "Today · Tue 17 Nov".
export function todayLabel(today: string): string {
  const d = utcDate(today);
  return `Today · ${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()].slice(0, 3)}`;
}

export interface GridDay {
  day: string;
  inMonth: boolean;
  weekend: boolean;
}

// The month's weeks, Monday first, padded with the days either side.
export function monthGrid(month: string): GridDay[] {
  const first = utcDate(`${month}-01`);
  const lead = (first.getUTCDay() + 6) % 7;
  const start = first.getTime() - lead * 86_400_000;
  const [y, m] = month.split("-").map(Number);
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Math.ceil((lead + length) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => {
    const d = new Date(start + i * 86_400_000);
    const day = d.toISOString().slice(0, 10);
    return { day, inMonth: monthOf(day) === month, weekend: i % 7 >= 5 };
  });
}

// One Upcoming Release's identity across the two reads.
export function entryKey(entry: UpcomingRelease): string {
  return `${entry.game.game_id}|${entry.date ?? "tba"}|${entry.date_precision}`;
}

// The API's platform filter: kept when any of its Releases is on one of them.
export function onPlatforms(entry: UpcomingRelease, platforms: number[]): boolean {
  return platforms.length === 0 || entry.releases.some((r) => platforms.includes(r.platform_id));
}

export interface PlatformOption {
  id: number;
  name: string;
}

// Every platform on the calendar's Upcoming Releases, by name.
export function calendarPlatforms(entries: UpcomingRelease[]): PlatformOption[] {
  const byId = new Map<number, string>();
  for (const e of entries) for (const r of e.releases) byId.set(r.platform_id, r.platform_name);
  return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

// "Nintendo Switch", "PS5 or PC", "3 platforms".
export function platformsPhrase(platforms: number[], options: PlatformOption[]): string {
  const names = platforms.map((id) => options.find((o) => o.id === id)?.name ?? "that platform");
  if (names.length <= 2) return names.join(" or ");
  return `${names.length} platforms`;
}

export interface RegionGroup {
  code: string;
  name: string;
  platforms: string[];
}

// An entry's Releases by region, in the API's order, each listing its
// platforms once by their short name.
export function regionGroups(entry: UpcomingRelease): RegionGroup[] {
  const groups = new Map<string, RegionGroup>();
  for (const r of entry.releases) {
    let group = groups.get(r.region_code);
    if (!group) {
      group = { code: r.region_code, name: r.region_name, platforms: [] };
      groups.set(r.region_code, group);
    }
    const label = r.platform_abbreviation || r.platform_name;
    if (!group.platforms.includes(label)) group.platforms.push(label);
  }
  return [...groups.values()];
}

// "First released Sep 2025": a day reads as its month, a vague date at its
// own Date Precision. Null unless the API set it.
export function firstReleasedLabel(entry: UpcomingRelease): string | null {
  const { first_released_on: date, first_released_precision: precision } = entry;
  if (!date || !precision) return null;
  return releaseDateLabel(date, precision === "day" ? "month" : precision);
}

// Its whole period ended before today; TBA never has.
export function isPastEntry(entry: UpcomingRelease, today: string): boolean {
  const end = periodEnd(entry.date, entry.date_precision);
  return end !== null && end < today;
}

export interface DateGroup {
  key: string;
  date: string | null;
  precision: DatePrecision;
  entries: UpcomingRelease[];
}

export interface CalendarSection {
  title: string;
  precision: DatePrecision;
  // The section's month (YYYY-MM) for day and month entries.
  month: string | null;
  groups: DateGroup[];
  count: number;
}

// Consecutive entries under one `section`, each split into its dates (a
// month's own "Day TBA" group leads, as the API places it).
export function calendarSections(entries: UpcomingRelease[]): CalendarSection[] {
  const sections: CalendarSection[] = [];
  for (const entry of entries) {
    let section = sections.at(-1);
    if (!section || section.title !== entry.section) {
      const precision = entry.date_precision === "day" ? "month" : entry.date_precision;
      const month = entry.date && precision === "month" ? monthOf(entry.date) : null;
      section = { title: entry.section, precision, month, groups: [], count: 0 };
      sections.push(section);
    }
    section.count += 1;
    addToGroups(section.groups, entry);
  }
  return sections;
}

function addToGroups(groups: DateGroup[], entry: UpcomingRelease) {
  const key = `${entry.date ?? "tba"}|${entry.date_precision}`;
  const group = groups.at(-1);
  if (group && group.key === key) group.entries.push(entry);
  else groups.push({ key, date: entry.date, precision: entry.date_precision, entries: [entry] });
}

// Consecutive entries sharing a date and Date Precision.
export function dateGroups(entries: UpcomingRelease[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const entry of entries) addToGroups(groups, entry);
  return groups;
}

// What the grid's band names a vague group by: "November 2026", "Q3 2027",
// "2027".
export function periodTitle(date: string, precision: DatePrecision): string {
  return precision === "month" ? monthTitle(monthOf(date)) : (releaseDateLabel(date, precision) ?? "");
}

// What a section heading adds after its count.
export function sectionNote(precision: DatePrecision, title: string): string | null {
  if (precision === "quarter") {
    const q = Number(/^Q(\d)/.exec(title)?.[1] ?? 0);
    if (q < 1 || q > 4) return null;
    return `${MONTH_NAMES[(q - 1) * 3]} to ${MONTH_NAMES[(q - 1) * 3 + 2]}`;
  }
  if (precision === "year") return "any month";
  if (precision === "tba") return "no date announced";
  return null;
}

// Where the Today rule goes in a month's groups: before the first day on or
// after today, or after the last group; null when the month isn't today's.
export function todayRuleAt(groups: DateGroup[], month: string | null, today: string): number | null {
  if (month !== monthOf(today)) return null;
  const at = groups.findIndex((g) => g.precision === "day" && g.date !== null && g.date >= today);
  return at === -1 ? groups.length : at;
}

// "1 Upcoming Release", "42 Upcoming Releases".
export function upcomingCount(n: number): string {
  return `${n} Upcoming ${n === 1 ? "Release" : "Releases"}`;
}

export interface CalendarView {
  // The grid month's Upcoming Releases after the filter, and before it.
  grid: UpcomingRelease[];
  gridAll: number;
  // Day entries by date, for the grid.
  byDay: Map<string, UpcomingRelease[]>;
  // The list: the window from today, less what the grid shows, filtered.
  list: UpcomingRelease[];
  listAll: number;
  // Everything from today on after the filter (the header's count).
  fromToday: number;
  options: PlatformOption[];
}

// Both reads, shaped for the page. Either may be null (it failed): the page
// says so in that place and draws the rest.
export function calendarView(
  grid: UpcomingRelease[] | null,
  window: UpcomingRelease[] | null,
  platforms: number[],
): CalendarView {
  const inGrid = new Set((grid ?? []).map(entryKey));
  const rest = (window ?? []).filter((e) => !inGrid.has(entryKey(e)));
  const keep = (e: UpcomingRelease) => onPlatforms(e, platforms);
  const shown = (grid ?? []).filter(keep);
  const byDay = new Map<string, UpcomingRelease[]>();
  for (const e of shown) {
    if (e.date_precision !== "day" || !e.date) continue;
    byDay.set(e.date, [...(byDay.get(e.date) ?? []), e]);
  }
  return {
    grid: shown,
    gridAll: grid?.length ?? 0,
    byDay,
    list: rest.filter(keep),
    listAll: rest.length,
    fromToday: (window ?? []).filter(keep).length,
    options: calendarPlatforms([...(grid ?? []), ...(window ?? [])]),
  };
}

export interface CalendarNoteCopy {
  title: string;
  body: string;
  // Offer "Show all platforms".
  clear: boolean;
}

// What the grid says when its month shows nothing: the filter left nothing,
// or the month has no Upcoming Releases at all. Null when it shows some.
export function monthNote(
  view: Pick<CalendarView, "grid" | "gridAll" | "options">,
  filters: CalendarFilters,
  today: string,
): CalendarNoteCopy | null {
  if (view.grid.length > 0) return null;
  const month = monthTitle(filters.month);
  if (view.gridAll > 0) {
    return {
      title: `Nothing on ${platformsPhrase(filters.platforms, view.options)} in ${month}`,
      body:
        view.gridAll === 1
          ? `The one Upcoming Release in ${month} is on another platform.`
          : `The ${view.gridAll} Upcoming Releases in ${month} are all on other platforms.`,
      clear: true,
    };
  }
  if (filters.month < monthOf(today)) {
    return { title: `No Releases in ${month}`, body: "GameDB has no Releases dated in this month.", clear: false };
  }
  return {
    title: `No Releases in ${month} yet`,
    body: "Games join the Release Calendar when they are added to GameDB, and IGDB dates are refreshed every week, so this month can still fill up.",
    clear: false,
  };
}

// What the list says when it shows nothing. Null when it shows some.
export function listNote(
  view: Pick<CalendarView, "list" | "listAll" | "options">,
  filters: CalendarFilters,
): CalendarNoteCopy | null {
  if (view.list.length > 0) return null;
  if (view.listAll > 0) {
    return {
      title: `Nothing else on ${platformsPhrase(filters.platforms, view.options)} from today`,
      body:
        view.listAll === 1
          ? "The one other Upcoming Release is on another platform."
          : `The ${view.listAll} other Upcoming Releases are all on other platforms.`,
      clear: true,
    };
  }
  return {
    title: "Nothing else coming up",
    body: "No other Upcoming Releases are on the Release Calendar yet. Games join it when they are added to GameDB.",
    clear: false,
  };
}
