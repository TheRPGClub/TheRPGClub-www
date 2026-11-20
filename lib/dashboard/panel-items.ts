import type { DatePrecision, UpcomingRelease } from "@/lib/api/types";
import { daysBetween, type IsoDay } from "@/lib/challenges/dates";
import { weekdayOf } from "@/lib/release-calendar";
import { MONTHS, precisionNote, shortDateLabel, utcDay } from "@/lib/releases";
import type { ChallengeEvent, PanelSuggestion } from "@/lib/dashboard/panel-sources";

// Pure helpers behind the Dashboard Panels' item rows: how long ago, a
// release's date block, a Challenge event's sentence, what moved a
// Suggestion. Client-safe.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// "now", "5m", "2h", "3d", then the day ("21 Nov") from a week on. A time
// in the future (a clock ahead of ours) reads as now.
export function ageLabel(iso: string, now: number): string {
  const at = Date.parse(iso);
  if (Number.isNaN(at)) return "";
  const ago = now - at;
  if (ago < MINUTE) return "now";
  if (ago < HOUR) return `${Math.floor(ago / MINUTE)}m`;
  if (ago < DAY) return `${Math.floor(ago / HOUR)}h`;
  if (ago < 7 * DAY) return `${Math.floor(ago / DAY)}d`;
  const d = new Date(at);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

// A club day's age: "Today", "1d"... then the day. For events that only
// know their date (a Cleared game, sign-ups opening, a reveal).
export function dayAgeLabel(day: IsoDay, today: IsoDay): string {
  const ago = daysBetween(day, today);
  if (ago <= 0) return "Today";
  if (ago < 7) return `${ago}d`;
  const d = utcDay(day);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

// When a Challenge event happened, as its row prints it.
export function eventAge(event: Pick<ChallengeEvent, "occurred_at" | "occurred_on">, now: number, today: IsoDay): string {
  return event.occurred_at ? ageLabel(event.occurred_at, now) : dayAgeLabel(event.occurred_on, today);
}

// The date block beside an Upcoming Release: an exact day as its number
// over "Nov · Thu"; a vague date as what is known ("Dec", "Q3", "2027",
// "TBA") over the dashed chip saying what isn't.
export interface ReleaseDateBlock {
  big: string;
  small: string;
  vague: boolean;
}

export function releaseDateBlock(upcoming: Pick<UpcomingRelease, "date" | "date_precision">): ReleaseDateBlock {
  const { date, date_precision: precision } = upcoming;
  if (precision === "day" && date) {
    const d = utcDay(date);
    return { big: String(d.getUTCDate()), small: `${MONTHS[d.getUTCMonth()]} · ${weekdayOf(date)}`, vague: false };
  }
  const vague: DatePrecision = date ? precision : "tba";
  return { big: shortDateLabel(date, vague), small: precisionNote(vague) ?? "", vague: true };
}

// The platforms of an Upcoming Release, once each: "PS5 · Xbox Series · PC".
export function releasePlatforms(upcoming: Pick<UpcomingRelease, "releases">): string {
  const names = upcoming.releases.map((r) => r.platform_abbreviation || r.platform_name);
  return [...new Set(names)].join(" · ");
}

// A Challenge event as a sentence: the parts in bold are its actors and
// objects ("**Mara** started a Run", "Sign-ups opened for **Secret Santa
// 2026**").
export interface SentencePart {
  text: string;
  strong: boolean;
}

const b = (text: string): SentencePart => ({ text, strong: true });
const t = (text: string): SentencePart => ({ text, strong: false });

export function eventSentence(event: Pick<ChallengeEvent, "kind" | "user" | "game" | "challenge" | "edition">): SentencePart[] {
  const who = event.user ? event.user.global_name || event.user.username : "Someone";
  const edition = event.edition ? `${event.challenge.name} ${event.edition.year}` : event.challenge.name;
  switch (event.kind) {
    case "run_started":
      return event.game ? [b(who), t(" started a Run with "), b(event.game.title)] : [b(who), t(" started a Run")];
    case "game_cleared":
      return event.game ? [b(who), t(" cleared "), b(event.game.title)] : [b(who), t(" cleared a game")];
    case "run_finished":
      return [b(who), t(" finished their Run")];
    case "signups_opened":
      return [t("Sign-ups opened for "), b(edition)];
    case "edition_revealed":
      return [t("Gifts revealed for "), b(edition)];
  }
}

// What last moved a Suggestion (the time `sort=recent` orders by): its
// submission, its review, a withdrawal, or else an upvote.
export type SuggestionActivity = "submitted" | "approved" | "rejected" | "withdrawn" | "upvoted";

export function suggestionActivity(s: Pick<PanelSuggestion, "created_at" | "reviewed_at" | "status" | "last_activity_at">): SuggestionActivity {
  const at = s.last_activity_at ?? s.created_at;
  if (s.status === "withdrawn") return "withdrawn";
  if (s.reviewed_at && Date.parse(at) === Date.parse(s.reviewed_at)) return s.status === "rejected" ? "rejected" : "approved";
  if (Date.parse(at) === Date.parse(s.created_at)) return "submitted";
  return "upvoted";
}

export const SUGGESTION_ACTIVITY_LABEL: Record<SuggestionActivity, string> = {
  submitted: "New",
  approved: "Approved",
  rejected: "Declined",
  withdrawn: "Withdrawn",
  upvoted: "Upvoted",
};
