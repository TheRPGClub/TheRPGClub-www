import type { DatePrecision, UpcomingRelease } from "@/lib/api/types";
import {
  MONTH_NAMES,
  MONTHS,
  WEEKDAY_NAMES,
  WEEKDAYS,
  isoDay,
  periodTitle,
  precisionSpan,
  releaseDateLabel,
  utcDay,
} from "@/lib/releases";
import { firstParam } from "@/lib/search-params";

// The Release Calendar page (www#114): a month grid on top, then every other
// Upcoming Release from today on, listed by the API's `section`. Dates are
// plain UTC calendar days, the club's day, as on the game page (www#115);
// their wording lives in `lib/releases.ts`.

export const RELEASES_PATH = "/releases";

export interface CalendarFilters {
  // The grid's month, YYYY-MM.
  month: string;
  // Platform ids the member picked; empty is every platform.
  platforms: number[];
  // "Show all" for this visit: the member's Hidden Platforms are read too
  // (`show_hidden=1`, ticket api#427). The address keeps it while they move
  // between months.
  showHidden: boolean;
}

// An Upcoming Release as the calendar draws it: `hiddenOnly` while "Show
// all" brings back one whose every Release is on a Hidden Platform, so it
// is marked.
export type CalendarEntry = UpcomingRelease & { hiddenOnly?: boolean };

// "2026-11" for a YYYY-MM-DD day.
export function monthOf(day: string): string {
  return day.slice(0, 7);
}

// A month before today's.
export function isPastMonth(month: string, today: string): boolean {
  return month < monthOf(today);
}

// The page's address: `month` (absent on today's month), `platform` as a
// comma list and `show_hidden=1`. Any year from 0001 on is a month, as the
// API reads it.
export function parseCalendarFilters(
  params: Record<string, string | string[] | undefined>,
  today: string,
): CalendarFilters {
  const raw = firstParam(params.month) ?? "";
  const match = /^(\d{4})-(\d{2})$/.exec(raw);
  const valid = match && +match[2] >= 1 && +match[2] <= 12 && +match[1] >= 1;
  const ids = [params.platform].flat().flatMap((v) => (v ?? "").split(","));
  const platforms = [...new Set(ids.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  const showHidden = ["1", "true"].includes(firstParam(params.show_hidden) ?? "");
  return { month: valid ? raw : monthOf(today), platforms, showHidden };
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
  if (next.showHidden) ps.set("show_hidden", "1");
  const qs = ps.toString().replaceAll("%2C", ",");
  return qs ? `${RELEASES_PATH}?${qs}` : RELEASES_PATH;
}

export function shiftMonth(month: string, by: number): string {
  const day = utcDay(`${month}-01`);
  day.setUTCMonth(day.getUTCMonth() + by);
  return monthOf(isoDay(day));
}

// "November 2026".
export function monthTitle(month: string): string {
  return periodTitle(`${month}-01`, "month");
}

// "Thu".
export function weekdayOf(day: string): string {
  return WEEKDAYS[utcDay(day).getUTCDay()];
}

// "Tuesday 17 November", what a screen reader hears for a day of the grid.
export function fullDayLabel(day: string): string {
  const d = utcDay(day);
  return `${WEEKDAY_NAMES[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
}

// "Today · Tue 17 Nov".
export function todayLabel(today: string): string {
  const d = utcDay(today);
  return `Today · ${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

// The grid's weekday headings, Monday first: "Mon" ... "Sun".
export const GRID_WEEKDAYS = [...WEEKDAYS.slice(1), WEEKDAYS[0]];

// The list's anchor for a day, which the phone's month grid links to.
export function dayAnchor(day: string): string {
  return `rc-day-${day}`;
}

export interface GridDay {
  day: string;
  inMonth: boolean;
  weekend: boolean;
}

// The month's weeks, Monday first, padded with the days either side.
export function monthGrid(month: string): GridDay[] {
  const first = utcDay(`${month}-01`);
  const lead = (first.getUTCDay() + 6) % 7;
  const last = utcDay(`${month}-01`);
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  const cells = Math.ceil((lead + last.getUTCDate()) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => {
    const d = utcDay(`${month}-01`);
    d.setUTCDate(1 - lead + i);
    const day = isoDay(d);
    return { day, inMonth: monthOf(day) === month, weekend: i % 7 >= 5 };
  });
}

// One Upcoming Release's identity across the two reads.
export function upcomingReleaseKey(upcoming: UpcomingRelease): string {
  return `${upcoming.game.game_id}|${upcoming.date ?? "tba"}|${upcoming.date_precision}`;
}

// The API's platform filter: kept when any of its Releases is on one of them.
export function onPlatforms(upcoming: UpcomingRelease, platforms: number[]): boolean {
  return platforms.length === 0 || upcoming.releases.some((r) => platforms.includes(r.platform_id));
}

// Every Release of it is on one of the member's Hidden Platforms.
export function hiddenOnly(upcoming: UpcomingRelease, hidden: readonly number[]): boolean {
  return (
    hidden.length > 0 &&
    upcoming.releases.length > 0 &&
    upcoming.releases.every((r) => hidden.includes(r.platform_id))
  );
}

export interface PlatformOption {
  id: number;
  name: string;
}

// Every platform on the calendar's Upcoming Releases, by name.
export function calendarPlatforms(upcomingReleases: UpcomingRelease[]): PlatformOption[] {
  const byId = new Map<number, string>();
  for (const u of upcomingReleases) for (const r of u.releases) byId.set(r.platform_id, r.platform_name);
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

// An Upcoming Release's Releases by region, in the API's order, each listing
// its platforms once by their short name.
export function regionGroups(upcoming: UpcomingRelease): RegionGroup[] {
  const groups = new Map<string, RegionGroup>();
  for (const r of upcoming.releases) {
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

// "Sep 2025" for "First released Sep 2025": a day reads as its month, a
// vague date at its own Date Precision. Null unless the API set it.
export function firstReleasedLabel(upcoming: UpcomingRelease): string | null {
  const { first_released_on: date, first_released_precision: precision } = upcoming;
  if (!date || !precision) return null;
  return releaseDateLabel(date, precision === "day" ? "month" : precision);
}

export interface DateGroup {
  key: string;
  date: string | null;
  precision: DatePrecision;
  upcomingReleases: UpcomingRelease[];
}

export interface CalendarSection {
  title: string;
  precision: DatePrecision;
  // The section's first date; its month (YYYY-MM) for day and month ones.
  date: string | null;
  month: string | null;
  groups: DateGroup[];
  count: number;
}

// Consecutive Upcoming Releases under one `section`, each split into its
// dates (a month's own "Day TBA" group leads, as the API places it).
export function calendarSections(upcomingReleases: UpcomingRelease[]): CalendarSection[] {
  const sections: CalendarSection[] = [];
  for (const upcoming of upcomingReleases) {
    let section = sections.at(-1);
    if (!section || section.title !== upcoming.section) {
      const { date } = upcoming;
      const precision = upcoming.date_precision === "day" ? "month" : upcoming.date_precision;
      const month = date && precision === "month" ? monthOf(date) : null;
      section = { title: upcoming.section, precision, date, month, groups: [], count: 0 };
      sections.push(section);
    }
    section.count += 1;
    addToGroups(section.groups, upcoming);
  }
  return sections;
}

function addToGroups(groups: DateGroup[], upcoming: UpcomingRelease) {
  const key = `${upcoming.date ?? "tba"}|${upcoming.date_precision}`;
  const group = groups.at(-1);
  if (group && group.key === key) group.upcomingReleases.push(upcoming);
  else groups.push({ key, date: upcoming.date, precision: upcoming.date_precision, upcomingReleases: [upcoming] });
}

// Consecutive Upcoming Releases sharing a date and Date Precision.
export function dateGroups(upcomingReleases: UpcomingRelease[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const upcoming of upcomingReleases) addToGroups(groups, upcoming);
  return groups;
}

// What a section heading adds after its count: "July to September", "any
// month", "no date announced".
export function sectionNote(section: Pick<CalendarSection, "date" | "precision">): string | null {
  return precisionSpan(section.date, section.precision);
}

// Where the Today rule goes in a month's groups: before the first day on or
// after today, or after the last group; null when the month isn't today's.
export function todayRuleAt(groups: DateGroup[], month: string | null, today: string): number | null {
  if (month !== monthOf(today)) return null;
  const at = groups.findIndex((g) => g.precision === "day" && g.date !== null && g.date >= today);
  return at === -1 ? groups.length : at;
}

const releasesNoun = (n: number) => (n === 1 ? "Release" : "Releases");

// "1 Upcoming Release", "42 Upcoming Releases".
export function upcomingCount(n: number): string {
  return `${n} Upcoming ${releasesNoun(n)}`;
}

// A month's count: "8 Upcoming Releases" from today's month on, "8 Releases"
// for a month before it, which is all out.
export function monthCount(n: number, month: string, today: string): string {
  return isPastMonth(month, today) ? `${n} ${releasesNoun(n)}` : upcomingCount(n);
}

export interface CalendarView {
  // The grid month's Upcoming Releases after the filter.
  grid: CalendarEntry[];
  // How many the grid month has before the filter.
  gridUnfilteredCount: number;
  // Day Upcoming Releases by date, for the grid.
  byDay: Map<string, CalendarEntry[]>;
  // The list: everything from today on, less what the grid shows, filtered.
  list: CalendarEntry[];
  // How many the list has before the filter.
  listUnfilteredCount: number;
  // Everything from today on after the filter (the header's count).
  fromTodayCount: number;
  options: PlatformOption[];
}

// Both reads (the grid's month, and everything from today on), shaped for
// the page. Either may be null (it failed): the page says so in that place
// and draws the rest. `hidden` are the member's Hidden Platforms when "Show
// all" brought them back: an Upcoming Release only on those is marked.
export function calendarView(
  monthRead: UpcomingRelease[] | null,
  fromTodayRead: UpcomingRelease[] | null,
  platforms: number[],
  hidden: readonly number[] = [],
): CalendarView {
  const mark = (u: UpcomingRelease): CalendarEntry =>
    hiddenOnly(u, hidden) ? { ...u, hiddenOnly: true } : u;
  const month = (monthRead ?? []).map(mark);
  const fromToday = (fromTodayRead ?? []).map(mark);
  const inGrid = new Set(month.map(upcomingReleaseKey));
  const rest = fromToday.filter((u) => !inGrid.has(upcomingReleaseKey(u)));
  const keep = (u: CalendarEntry) => onPlatforms(u, platforms);
  const shown = month.filter(keep);
  const byDay = new Map<string, CalendarEntry[]>();
  for (const u of shown) {
    if (u.date_precision !== "day" || !u.date) continue;
    byDay.set(u.date, [...(byDay.get(u.date) ?? []), u]);
  }
  return {
    grid: shown,
    gridUnfilteredCount: month.length,
    byDay,
    list: rest.filter(keep),
    listUnfilteredCount: rest.length,
    fromTodayCount: fromToday.filter(keep).length,
    options: calendarPlatforms([...month, ...fromToday]),
  };
}

export interface CalendarNoteCopy {
  title: string;
  body: string;
  // Offer "Show all platforms".
  clear: boolean;
}

// What the grid says when its month shows nothing: the filter left nothing,
// or the month has no Upcoming Releases at all. Null when it shows some. A
// month before today's speaks of Releases, which are all out by then.
export function monthNote(
  view: Pick<CalendarView, "grid" | "gridUnfilteredCount" | "options">,
  filters: CalendarFilters,
  today: string,
): CalendarNoteCopy | null {
  if (view.grid.length > 0) return null;
  const month = monthTitle(filters.month);
  const past = isPastMonth(filters.month, today);
  const unfiltered = view.gridUnfilteredCount;
  if (unfiltered > 0) {
    const noun = past ? "Release" : "Upcoming Release";
    return {
      title: `Nothing on ${platformsPhrase(filters.platforms, view.options)} in ${month}`,
      body:
        unfiltered === 1
          ? `The one ${noun} in ${month} is on another platform.`
          : `The ${unfiltered} ${noun}s in ${month} are all on other platforms.`,
      clear: true,
    };
  }
  if (past) {
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
  view: Pick<CalendarView, "list" | "listUnfilteredCount" | "options">,
  filters: CalendarFilters,
): CalendarNoteCopy | null {
  if (view.list.length > 0) return null;
  const unfiltered = view.listUnfilteredCount;
  if (unfiltered > 0) {
    return {
      title: `Nothing else on ${platformsPhrase(filters.platforms, view.options)} from today`,
      body:
        unfiltered === 1
          ? "The one other Upcoming Release is on another platform."
          : `The ${unfiltered} other Upcoming Releases are all on other platforms.`,
      clear: true,
    };
  }
  return {
    title: "Nothing else coming up",
    body: "No other Upcoming Releases are on the Release Calendar yet. Games join it when they are added to GameDB.",
    clear: false,
  };
}
