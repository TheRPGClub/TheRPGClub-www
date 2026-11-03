import type {
  BotJob,
  BotJobKind,
  Nomination,
  VoteTallyRow,
  VotingCategory,
  VotingRound,
} from "@/lib/api/types";
import type { ApiErrorBody } from "@/lib/api/errors";

// Pure helpers behind /admin/voting, the voting console. The API decides
// every action; these lay out the date ruler, word the round's state, and
// keep the forms honest before a request goes out.

export const DAY_MS = 86_400_000;

export const CATEGORY_SHORT: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

// An API refusal in words. Sign-in and role refusals get fixed copy; every
// other one (each 422) reads as the API's own `message` made a sentence
// ("Voting for round 3 has not ended."), else its code, so a new refusal
// code needs no copy here.
export function consoleErrorText(err: ApiErrorBody): string {
  if (err.status === 401) return "Your session has ended. Sign in again.";
  if (err.status === 403) return "Only Admins and Superadmins can run the voting console.";
  const raw =
    err.message?.trim() || err.code?.trim().replace(/_/g, " ") || `Request failed (HTTP ${err.status})`;
  const sentence = raw.charAt(0).toUpperCase() + raw.slice(1);
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

// One line of a private tally: a game and its votes across every
// nomination of it (two members can nominate the same game).
export interface TallyLine {
  gameId: number;
  title: string;
  count: number;
}

// The tally merged onto the ballot, most votes first, games with no votes
// kept (at 0) so the whole ballot shows. `games` limits it to a runoff's
// tied games.
export function tallyLines(
  nominations: readonly Nomination[],
  rows: readonly VoteTallyRow[],
  games?: readonly { game_id: number; title: string }[],
): TallyLine[] {
  const counts = new Map<number, number>();
  for (const row of rows) {
    if (row.gamedb_game_id === null) continue;
    counts.set(row.gamedb_game_id, (counts.get(row.gamedb_game_id) ?? 0) + row.vote_count);
  }
  const titles = new Map<number, string>();
  if (games) {
    for (const g of games) titles.set(g.game_id, g.title);
  } else {
    for (const n of nominations) {
      if (n.gamedb_game_id !== null && !titles.has(n.gamedb_game_id)) {
        titles.set(n.gamedb_game_id, n.game?.title ?? "Unknown game");
      }
    }
  }
  return [...titles.entries()]
    .map(([gameId, title]) => ({ gameId, title, count: counts.get(gameId) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
}

export function totalVotes(lines: readonly TallyLine[]): number {
  return lines.reduce((n, l) => n + l.count, 0);
}

// Which ballot the reset and the tally address in each phase: the runoff's
// while it is open (or once it has run), the main vote's otherwise.
export function hasRunoff(round: VotingRound, category: VotingCategory): boolean {
  return (round.runoff_ties?.[category]?.length ?? 0) > 0;
}

// The tie break shows, as the bot's prompt does, once voting (and any
// runoff) is over and a category is still tied.
export function tiedCategories(round: VotingRound): VotingCategory[] {
  if (round.phase !== "tie") return [];
  return (["gotm", "nr_gotm"] as const).filter((c) => (round.pending_ties[c]?.length ?? 0) > 0);
}

// Votes can be reset while there is a ballot to reset: from the vote
// opening until the round is decided.
export function canResetVotes(round: VotingRound): boolean {
  return round.phase !== "nominating" && round.phase !== "decided";
}

const PHASE_WORDS: Record<VotingRound["phase"], string> = {
  nominating: "Nominations open",
  voting: "Voting open",
  closed: "Voting closed",
  runoff: "Runoff open",
  tie: "Tie break",
  decided: "Decided",
};

function inDays(ms: number): string {
  const days = Math.max(0, Math.ceil(ms / DAY_MS));
  if (days === 0) return "today";
  return days === 1 ? "in 1 day" : `in ${days} days`;
}

// "Round 3 · Voting open · 54 votes · closes in 4 days", under the numeral.
export function roundStatusLine(
  round: VotingRound,
  votes: number | null,
  now: number,
): string {
  const parts = [`Round ${round.round_number}`, PHASE_WORDS[round.phase]];
  if (votes !== null && round.phase !== "nominating") {
    parts.push(`${votes} ${votes === 1 ? "vote" : "votes"}`);
  }
  if (round.phase === "nominating") {
    parts.push(`vote opens ${inDays(Date.parse(round.voting_opens_at) - now)}`);
  } else if (round.phase === "voting") {
    parts.push(`closes ${inDays(Date.parse(round.voting_closes_at) - now)}`);
  } else if (round.phase === "runoff" && round.runoff_closes_at) {
    parts.push(`runoff closes ${inDays(Date.parse(round.runoff_closes_at) - now)}`);
  }
  return parts.join(" · ");
}

// Why the next vote date can't move, or null when it can. Same rules as the
// bot's /admin set-nextvote: only before this round's vote opens, and only
// to a time still ahead.
export function nextVoteRefusal(
  round: VotingRound,
  opensAt: number | null,
  now: number,
): string | null {
  if (round.voting_ended) {
    return `Voting for Round ${round.round_number} has ended. The next round's vote date can be set once it is decided.`;
  }
  if (round.voting_open) {
    return `Voting for Round ${round.round_number} is already open. Close it early instead.`;
  }
  if (opensAt === null || Number.isNaN(opensAt)) return "Pick a date and time.";
  if (opensAt <= now) return "Pick a time that is still ahead.";
  return null;
}

// The newest job of `kind` for this round on a newest-first page of the
// wire. The summary names the round ("... round 3 ..."); the payload is
// bot-only.
export function latestJobFor(
  jobs: readonly BotJob[],
  kind: BotJobKind,
  roundNumber: number,
): BotJob | null {
  const pattern = new RegExp(`\\bround ${roundNumber}\\b`, "i");
  return jobs.find((j) => j.kind === kind && pattern.test(j.summary ?? "")) ?? null;
}

// --- The date ruler ---------------------------------------------------------

export type RulerTone = "plain" | "now" | "pin";

export interface RulerTick {
  key: string;
  at: number;
  // The bold line (a date, or "Today") and the caption under it.
  label: string;
  caption: string;
  tone: RulerTone;
}

export interface RulerScale {
  start: number;
  end: number;
}

// The ruler spans the round from nominations opening to the end of its
// vote, plus room on the right to drag the next vote out (six weeks past
// today while it can still move).
export function rulerScale(points: readonly number[], now: number, movable: boolean): RulerScale {
  const known = points.filter((p) => Number.isFinite(p));
  const first = Math.min(now, ...known);
  const last = Math.max(now, ...known, movable ? now + 42 * DAY_MS : now);
  const span = Math.max(last - first, 7 * DAY_MS);
  return { start: first - span * 0.03, end: first + span * 1.06 };
}

// Where an instant sits on the ruler, 0 to 100.
export function rulerPct(at: number, scale: RulerScale): number {
  const pct = ((at - scale.start) / (scale.end - scale.start)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function rulerTime(pct: number, scale: RulerScale): number {
  return scale.start + (Math.min(100, Math.max(0, pct)) / 100) * (scale.end - scale.start);
}

// Labels closer than this (in % of the ruler) to the one before go on the
// lower row, so "Today" doesn't print over "Vote opens".
const CROWDED_PCT = 7;

export function rulerRows(ticks: readonly RulerTick[], scale: RulerScale): Map<string, 0 | 1> {
  const rows = new Map<string, 0 | 1>();
  const sorted = [...ticks].sort((a, b) => a.at - b.at);
  let lastTop = -Infinity;
  for (const t of sorted) {
    const pct = rulerPct(t.at, scale);
    if (pct - lastTop < CROWDED_PCT && t.tone !== "pin") {
      rows.set(t.key, 1);
    } else {
      rows.set(t.key, 0);
      lastTop = pct;
    }
  }
  return rows;
}

// --- Times, in the browser's zone and the club's ------------------------------
// Client-only where no zone is passed: the server's zone isn't the admin's.

export function dayAndClock(at: number, timeZone?: string): string {
  const d = new Date(at);
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  return `${day} · ${clock}`;
}

export function shortDay(at: number, timeZone?: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric" }).format(
    new Date(at),
  );
}

export function clubClock(at: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(at));
}

// The same clock time on the day `pct` lands on (browser zone): the pin
// snaps to whole days so a drag never nudges the hour.
export function snapToDay(candidate: number, keepClockOf: number): number {
  const day = new Date(candidate);
  const clock = new Date(keepClockOf);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    clock.getHours(),
    clock.getMinutes(),
  ).getTime();
}

export function shiftDays(at: number, days: number): number {
  const d = new Date(at);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate() + days,
    d.getHours(),
    d.getMinutes(),
  ).getTime();
}
