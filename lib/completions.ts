import { todayDate } from "@/lib/imports/completionator";
import type { Game, Platform } from "@/lib/api/types";

// "Mar 2024" for a completion's `completed_at`, or null when the member didn't
// record a date (the API sends `completed_at: null` for those).
export function formatCompletedMonth(
  completedAt: string | null | undefined,
): string | null {
  if (!completedAt) return null;
  const date = new Date(completedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
}

// The bot's note limit on /game-completion add.
export const COMPLETION_NOTE_MAX = 500;

// A YYYY-MM-DD date as the bot prints a completion date (MM/DD/YYYY),
// or null when blank or not a date.
export function completionDateText(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return `${match[2]}/${match[3]}/${match[1]}`;
}

// The year a completion counts towards: the date's year, or the current one
// when no date is given (the bot announces those as of today).
export function completionYear(value: string, now: Date = new Date()): number {
  const match = /^(\d{4})-\d{2}-\d{2}$/.exec(value.trim());
  return match ? Number(match[1]) : now.getFullYear();
}

// Hours as the bot prints them ("12.5 hours"), rounded to two places.
export function playtimeText(hours: number | null): string | null {
  if (hours === null) return null;
  return `${Math.round(hours * 100) / 100} hours`;
}

export interface CompletionAnnouncement {
  // The `###` heading: the member's name.
  heading: string;
  // Who logged it for whom, then the details line.
  lead: string;
  details: string;
  // "Game completion #4 for 2026", or without the number when unknown.
  yearly: string;
}

// The bot's announcement for a completion logged for someone else, as
// buildCompletionAnnouncementText (bot CompletionHelpers.ts) writes it, in
// parts so the proof can set the title in bold. The bot adds each member's
// emoji and the first-in-the-club line itself.
export function completionAnnouncement(input: {
  member: string;
  actor: string;
  title: string;
  completionType: string;
  date: string;
  playtimeHours: number | null;
  yearlyCount: number | null;
  now?: Date;
}): CompletionAnnouncement {
  const now = input.now ?? new Date();
  const dateText = completionDateText(input.date) ?? completionDateText(todayDate(now))!;
  const hours = playtimeText(input.playtimeHours);
  const year = completionYear(input.date, now);
  return {
    heading: input.member,
    lead: `${input.actor} added a game completion for ${input.member}:`,
    details: [input.completionType, dateText, hours].filter(Boolean).join(" - "),
    yearly:
      input.yearlyCount === null
        ? `Game completion for ${year}`
        : `Game completion #${input.yearlyCount} for ${year}`,
  };
}

// The platform select's groups: the picked game's own platforms first,
// under its title, then the rest; one "Platforms" list before a game is
// picked. Values are platform ids as strings.
export function completionPlatformGroups(
  platforms: readonly Platform[],
  game: Pick<Game, "title" | "platforms"> | null,
): { label: string; options: { value: string; label: string }[] }[] {
  const own = new Set((game?.platforms ?? []).map((p) => p.platform_id));
  const option = (p: Platform) => ({ value: String(p.platform_id), label: p.platform_name });
  const gamePlatforms = platforms.filter((p) => own.has(p.platform_id)).map(option);
  const others = platforms.filter((p) => !own.has(p.platform_id)).map(option);
  if (gamePlatforms.length === 0) return [{ label: "Platforms", options: others }];
  return [
    { label: `${game?.title ?? "This game"} is on`, options: gamePlatforms },
    { label: "Other platforms", options: others },
  ];
}

// The platform a freshly picked game starts on: its only one, or none.
export function pickedGamePlatformId(game: Pick<Game, "platforms">): string {
  const ids = (game.platforms ?? []).map((p) => p.platform_id);
  return ids.length === 1 ? String(ids[0]) : "";
}

// Why a staff Game Completion can't be sent yet, or null when it can.
export function completionFormProblem(form: {
  hasMember: boolean;
  hasGame: boolean;
  dateChoice: "today" | "unknown" | "custom";
  customDate: string;
  playtimeOk: boolean;
  note: string;
}): string | null {
  if (!form.hasMember) return "Pick a member first.";
  if (!form.hasGame) return "Pick a game first.";
  if (form.dateChoice === "custom" && !/^\d{4}-\d{2}-\d{2}$/.test(form.customDate)) {
    return "Pick the date they finished it.";
  }
  if (!form.playtimeOk) return "Final playtime must be a non-negative number of hours.";
  if (form.note.trim().length > COMPLETION_NOTE_MAX) {
    return `The note must be ${COMPLETION_NOTE_MAX} characters or fewer.`;
  }
  return null;
}
