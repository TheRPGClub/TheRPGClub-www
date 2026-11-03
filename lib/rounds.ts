import type { BotJob, BotJobKind, GotmEntry, GotmRound, NrGotmEntry, VotingCategory } from "@/lib/api/types";

// Pure helpers behind the rounds and nominations admin pages
// (/admin/rounds, /admin/nominations).

export const TRACK_NAME: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

// Both tracks, GOTM first.
export const TRACKS: readonly VotingCategory[] = ["gotm", "nr_gotm"];

// The two tracks in URL form, for /admin/rounds/<track>/<round>.
export const TRACK_SLUG: Record<VotingCategory, string> = {
  gotm: "gotm",
  nr_gotm: "nr-gotm",
};

export function trackFromSlug(slug: string | undefined): VotingCategory | null {
  if (slug === "gotm") return "gotm";
  if (slug === "nr-gotm") return "nr_gotm";
  return null;
}

export function roundEditHref(category: VotingCategory, round: number): string {
  return `/admin/rounds/${TRACK_SLUG[category]}/${round}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// "November 2026" -> "December 2026"; "December 2026" -> "January 2027".
// The archive's month_year is free text, so anything else comes back null.
export function nextMonthYear(monthYear: string | null | undefined): string | null {
  const match = /^\s*([A-Za-z]+)\s+(\d{4})\s*$/.exec(monthYear ?? "");
  if (!match) return null;
  const index = MONTHS.findIndex((m) => m.toLowerCase() === match[1].toLowerCase());
  if (index < 0) return null;
  const year = Number(match[2]);
  return index === 11 ? `${MONTHS[0]} ${year + 1}` : `${MONTHS[index + 1]} ${year}`;
}

// The month a date falls in, as the archive spells it ("November 2026").
export function monthYearOf(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export interface RoundDefaults {
  roundNumber: number;
  monthYear: string;
}

// What the add form starts on for a track: the round after that track's
// newest round, in the month after it. `rounds` is the newest-first page
// of /gotm_rounds.
export function nextRoundDefaults(
  rounds: readonly GotmRound[],
  category: VotingCategory,
  now: Date,
): RoundDefaults {
  const latest = rounds.find((r) => r[category] !== null);
  if (!latest) return { roundNumber: 1, monthYear: monthYearOf(now) };
  return {
    roundNumber: latest.round_number + 1,
    monthYear: nextMonthYear(latest[category]?.month_year) ?? monthYearOf(now),
  };
}

// The list with the item at `from` moved to `to` (both clamped).
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const next = [...list];
  if (from < 0 || from >= next.length) return next;
  const target = Math.max(0, Math.min(next.length - 1, to));
  const [item] = next.splice(from, 1);
  next.splice(target, 0, item);
  return next;
}

// A Reddit URL as it is saved: trimmed, blank as null. Anything that isn't
// an http(s) URL is refused with a reason.
export function normalizeRedditUrl(raw: string): { url: string | null; error?: string } {
  const url = raw.trim();
  if (url === "") return { url: null };
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { url: null, error: "The Reddit link must start with https://." };
    }
  } catch {
    return { url: null, error: "That Reddit link isn't a web address." };
  }
  return { url };
}

// The reason an Admin gives for deleting someone else's nomination: the
// bot's modal limit, which the API enforces too.
export const REMOVAL_REASON_MAX = 250;

// The write endpoints answer with the job's id nowhere, so after a write the
// page finds the job it queued on the wire: the newest job of that kind the
// viewer requested since just before the write, whose summary passes
// `matches` (e.g. names the round). Null when it isn't there (yet).
export function findQueuedJob(
  jobs: readonly BotJob[],
  {
    kind,
    requesterId,
    since,
    matches,
  }: {
    kind: BotJobKind;
    requesterId: string;
    since: Date;
    matches?: (summary: string) => boolean;
  },
): BotJob | null {
  // The API's clock and this server's may differ by a little.
  const floor = since.getTime() - 60_000;
  const match = jobs
    .filter(
      (job) =>
        job.kind === kind &&
        job.requested_by_user_id === requesterId &&
        Date.parse(job.created_at) >= floor &&
        (!matches || matches(job.summary)),
    )
    .sort((a, b) => b.id - a.id);
  return match[0] ?? null;
}

// Whether a job summary names this track's round: "Reload GOTM round 143
// (November 2026) ..." names GOTM round 143, not NR-GOTM's and not round 14.
export function summaryNamesRound(
  summary: string,
  category: VotingCategory,
  round: number,
): boolean {
  const pattern = new RegExp(`(^|[^-A-Za-z])${TRACK_NAME[category]} round ${round}(?!\\d)`, "i");
  return pattern.test(summary);
}

// A round entry's id, whichever track's table it is in.
export function roundEntryId(entry: GotmEntry | NrGotmEntry): number {
  return "gotm_id" in entry ? entry.gotm_id : entry.nr_gotm_id;
}
