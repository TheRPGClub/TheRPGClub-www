import { clubDayOf, formatDay, seasonAround, type IsoDay } from "@/lib/challenges/dates";
import type { Challenge, ChallengeRun, PoolGame } from "@/lib/challenges/types";

// A Challenge page's Runs (surface brief challenges-pool, the Runs view): one
// card per member's Run with their progress. Pure and client-safe.

// The Runs the page shows. A Seasonal Challenge shows one Season: the one
// running now, or, while Closed, the last one anybody played. An Always Open
// Challenge shows every Run.
export function seasonRuns(
  challenge: Pick<Challenge, "schedule" | "season" | "open">,
  runs: readonly ChallengeRun[],
  today: IsoDay,
): ChallengeRun[] {
  if (challenge.schedule !== "seasonal" || !challenge.season) return [...runs];
  const starts = challenge.open
    ? seasonAround(challenge.season, today).starts
    : runs.reduce<string | null>(
        (max, r) => (max === null || r.window.starts_on > max ? r.window.starts_on : max),
        null,
      );
  return runs.filter((r) => r.window.starts_on === starts);
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

const STATUS_RANK: Record<ChallengeRun["status"], number> = {
  finished: 0,
  active: 0,
  expired: 1,
  abandoned: 2,
};

// Who is ahead first: most Cleared, a Finish reached earlier, an earlier
// start. Expired and then Abandoned Runs list last.
export function sortRuns(runs: readonly ChallengeRun[]): ChallengeRun[] {
  return [...runs].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      b.progress.cleared - a.progress.cleared ||
      compare(a.ended_at ?? "~", b.ended_at ?? "~") ||
      compare(a.started_at, b.started_at),
  );
}

export interface RunGame {
  game_id: number;
  title: string;
  cover_url: string | null;
}

export interface RunCardView {
  id: number;
  name: string;
  userId: string;
  you: boolean;
  status: ChallengeRun["status"];
  cleared: number;
  target: number;
  // One segment per game to Clear (at most 20, each standing for a share of
  // a longer target), filled for those Cleared.
  segments: boolean[];
  clearedGames: RunGame[];
  inProgressGames: RunGame[];
  inProgress: number;
  // "Started 23 Sep", "Finished 6 Nov", "Abandoned 3 Oct", "Expired 20 Dec".
  dateLine: string;
}

const MAX_SEGMENTS = 20;

export function runSegments(cleared: number, target: number): boolean[] {
  if (target <= 0) return [];
  const count = Math.min(target, MAX_SEGMENTS);
  const filled =
    target <= MAX_SEGMENTS ? Math.min(cleared, target) : Math.round((Math.min(cleared, target) / target) * count);
  return Array.from({ length: count }, (_, i) => i < filled);
}

const ENDED: Record<Exclude<ChallengeRun["status"], "active">, string> = {
  finished: "Finished",
  abandoned: "Abandoned",
  expired: "Expired",
};

export function memberName(member: { global_name?: string | null; username: string }): string {
  return member.global_name?.trim() || member.username;
}

export function runCardView(
  run: ChallengeRun,
  viewerId: string,
  covers: ReadonlyMap<number, string | null>,
  today: IsoDay,
): RunCardView {
  const games = (state: "cleared" | "in_progress") =>
    (run.entries ?? [])
      .filter((e) => e.state === state)
      .map((e) => ({
        game_id: e.game_id,
        title: e.title,
        cover_url: covers.get(e.game_id) ?? null,
      }));
  const endedAt = run.status === "active" ? null : run.ended_at;
  return {
    id: run.id,
    name: memberName(run.user),
    userId: run.user.user_id,
    you: run.user.user_id === viewerId,
    status: run.status,
    cleared: run.progress.cleared,
    target: run.progress.target,
    segments: runSegments(run.progress.cleared, run.progress.target),
    clearedGames: games("cleared"),
    inProgressGames: games("in_progress"),
    inProgress: run.progress.in_progress,
    dateLine: endedAt
      ? `${ENDED[run.status as keyof typeof ENDED]} ${formatDay(clubDayOf(endedAt), today)}`
      : `Started ${formatDay(clubDayOf(run.started_at), today)}`,
  };
}

// Pool games by id, for the covers on Run cards.
export function coverMap(games: readonly PoolGame[]): Map<number, string | null> {
  return new Map(games.map((g) => [g.game_id, g.cover_url ?? null]));
}

// Two initials for an avatar without a picture ("Crit Fisher" -> "CF").
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/[\s_.-]+/)
    .filter(Boolean);
  const letters = words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}
