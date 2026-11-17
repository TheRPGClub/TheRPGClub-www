import { FORMAT_NAME } from "@/lib/challenges/board";
import { clubDayOf, daysBetween, formatDay, formatFullDay, type IsoDay } from "@/lib/challenges/dates";
import { runSegments } from "@/lib/challenges/runs";
import { challengeTint } from "@/lib/challenges/tint";
import type {
  ChallengeFormat,
  ChallengeOpenSignup,
  ChallengeRun,
  ChallengeTint,
  RunStatus,
} from "@/lib/challenges/types";

// A member's Runs as a sheet of stamps (surface brief challenges-profile-runs,
// 7C arranged like 7A): the Active ones large on top, nearest deadline first,
// and the past ones below, newest outcome first. Pure and client-safe.

export interface StampCover {
  gameId: number;
  title: string;
  coverUrl: string | null;
  label: "In Progress" | "Assigned";
}

export interface StampView {
  // "run-12", or "signup-4" for an Edition sign-up.
  key: string;
  // The Run's id (the Edition's for a sign-up).
  id: number;
  // A sign-up waiting for its Edition's draw: no score yet.
  signedUp: boolean;
  challengeId: number;
  name: string;
  format: ChallengeFormat;
  status: RunStatus;
  tint: ChallengeTint;
  tilt: number;
  cleared: number;
  target: number;
  // A segment per game to Clear; null for Slots, which show the score only.
  segments: boolean[] | null;
  caughtUp: boolean;
  // Current stamps: "Season 2026 · 33 days left", "from 1988 · Always Open".
  whenLine: string;
  cover: StampCover | null;
  // Past stamps: "Pool · Season 2026" and "Finished 30 Aug 2026".
  formatLine: string;
  outcomeLine: string;
}

export interface ProfileRuns {
  current: StampView[];
  past: StampView[];
  finished: number;
  // "3 current · 5 past".
  countLine: string;
}

const TILTS = [-1.2, 0.8, -0.5, 1.2, -1, 0.6, 1.3, -0.8];

// A stamp's stable tilt from its Run's id, within ±1.3deg.
export function stampTilt(id: number): number {
  return TILTS[Math.abs(id) % TILTS.length];
}

const OUTCOME: Record<Exclude<RunStatus, "active">, string> = {
  finished: "Finished",
  expired: "Expired",
  abandoned: "Abandoned",
};

function daysLeftLine(endsOn: IsoDay, today: IsoDay): string {
  const days = Math.max(daysBetween(today, endsOn) + 1, 0);
  return days === 1 ? "1 day left" : `${days} days left`;
}

// "Season 2026", "Edition 2025", or "Always Open".
function periodOf(run: ChallengeRun): string {
  if (run.edition) return `Edition ${run.edition.year}`;
  if (run.challenge.schedule === "seasonal") return `Season ${run.window.starts_on.slice(0, 4)}`;
  return "Always Open";
}

function whenLine(run: ChallengeRun, today: IsoDay): string {
  const ends = run.window.ends_on ?? null;
  if (run.edition && ends) return `Edition ${run.edition.year} · until ${formatDay(ends, today)} · ${daysLeftLine(ends, today)}`;
  if (run.challenge.schedule === "seasonal" && ends) return `${periodOf(run)} · ${daysLeftLine(ends, today)}`;
  const lead = run.slots
    ? `from ${run.slots.first_year}`
    : `Started ${formatDay(clubDayOf(run.started_at), today)}`;
  return `${lead} · ${ends ? `until ${formatDay(ends, today)}` : "Always Open"}`;
}

function coverOf(run: ChallengeRun): StampCover | null {
  const assigned = run.assignment?.game;
  if (assigned) {
    return { gameId: assigned.game_id, title: assigned.title, coverUrl: assigned.cover_url ?? null, label: "Assigned" };
  }
  const playing = (run.entries ?? []).find((e) => e.state === "in_progress");
  if (!playing) return null;
  return { gameId: playing.game_id, title: playing.title, coverUrl: playing.cover_url ?? null, label: "In Progress" };
}

function stampView(run: ChallengeRun, tints: ReadonlyMap<number, ChallengeTint>, today: IsoDay): StampView {
  const { challenge, progress } = run;
  const ended = run.status === "active" ? null : OUTCOME[run.status];
  return {
    key: `run-${run.id}`,
    id: run.id,
    signedUp: false,
    challengeId: challenge.id,
    name: challenge.name,
    format: challenge.challenge_format,
    status: run.status,
    tint: tints.get(challenge.id) ?? challengeTint({ id: challenge.id, challenge_format: challenge.challenge_format }),
    tilt: stampTilt(run.id),
    cleared: progress.cleared,
    target: progress.target,
    segments: challenge.challenge_format === "slots" ? null : runSegments(progress.cleared, progress.target),
    caughtUp: progress.caught_up === true,
    whenLine: whenLine(run, today),
    cover: coverOf(run),
    formatLine: `${FORMAT_NAME[challenge.challenge_format]} · ${periodOf(run)}`,
    outcomeLine: ended && run.ended_at ? `${ended} ${formatFullDay(clubDayOf(run.ended_at))}` : (ended ?? ""),
  };
}

function signupView(signup: ChallengeOpenSignup, tints: ReadonlyMap<number, ChallengeTint>, today: IsoDay): StampView {
  const { challenge } = signup;
  const days = Math.max(daysBetween(today, signup.signup_cutoff_on), 0);
  return {
    key: `signup-${signup.edition_id}`,
    id: signup.edition_id,
    signedUp: true,
    challengeId: challenge.id,
    name: challenge.name,
    format: "assignment",
    status: "active",
    tint: tints.get(challenge.id) ?? challengeTint({ id: challenge.id, challenge_format: "assignment" }),
    tilt: stampTilt(signup.edition_id + 3),
    cleared: 0,
    target: 0,
    segments: null,
    caughtUp: false,
    whenLine: `Edition ${signup.year} · draw on ${formatDay(signup.signup_cutoff_on, today)} · ${days === 1 ? "1 day" : `${days} days`} to go`,
    cover: null,
    formatLine: `${FORMAT_NAME.assignment} · Edition ${signup.year}`,
    outcomeLine: "",
  };
}

// The newest day the Run saw play: its latest Clear, else its start.
function lastActivity(run: ChallengeRun): string {
  return (run.entries ?? []).reduce(
    (latest, e) => (e.cleared_on && e.cleared_on > latest ? e.cleared_on : latest),
    clubDayOf(run.started_at),
  );
}

// Seasonal and Edition ends first (nearest first), then the rest by latest
// play.
function byDeadline(a: ChallengeRun, b: ChallengeRun): number {
  const ae = a.window.ends_on ?? null;
  const be = b.window.ends_on ?? null;
  if (ae && be) return ae < be ? -1 : ae > be ? 1 : a.id - b.id;
  if (ae || be) return ae ? -1 : 1;
  const al = lastActivity(a);
  const bl = lastActivity(b);
  return al > bl ? -1 : al < bl ? 1 : b.id - a.id;
}

function byNewestOutcome(a: ChallengeRun, b: ChallengeRun): number {
  const ae = a.ended_at ?? a.started_at;
  const be = b.ended_at ?? b.started_at;
  return ae > be ? -1 : ae < be ? 1 : b.id - a.id;
}

// A sign-up stands among the current Runs by its draw day; the Runs keep
// their own order.
function withSignups(
  runs: StampView[],
  deadlines: (string | null)[],
  signups: readonly ChallengeOpenSignup[],
  views: StampView[],
): StampView[] {
  const out: StampView[] = [];
  const queue = [...signups].sort((a, b) => (a.signup_cutoff_on < b.signup_cutoff_on ? -1 : 1));
  let next = 0;
  runs.forEach((view, i) => {
    const due = deadlines[i];
    while (next < queue.length && (due === null || queue[next].signup_cutoff_on <= due)) {
      out.push(views[signups.indexOf(queue[next])]);
      next++;
    }
    out.push(view);
  });
  while (next < queue.length) out.push(views[signups.indexOf(queue[next++])]);
  return out;
}

export function profileRuns(
  runs: readonly ChallengeRun[],
  tints: ReadonlyMap<number, ChallengeTint>,
  today: IsoDay,
  signups: readonly ChallengeOpenSignup[] = [],
): ProfileRuns {
  const current = runs.filter((r) => r.status === "active").sort(byDeadline);
  const past = runs.filter((r) => r.status !== "active").sort(byNewestOutcome);
  const signed = signups.map((s) => signupView(s, tints, today));
  const waiting = signups.length > 0 ? ` · ${signups.length} signed up` : "";
  return {
    current: withSignups(
      current.map((r) => stampView(r, tints, today)),
      current.map((r) => r.window.ends_on ?? null),
      signups,
      signed,
    ),
    past: past.map((r) => stampView(r, tints, today)),
    finished: past.filter((r) => r.status === "finished").length,
    countLine: `${current.length} current${waiting} · ${past.length} past`,
  };
}
