import type { IsoDay } from "@/lib/challenges/dates";
import { memberAvatar, memberName } from "@/lib/challenges/runs";
import { yourSlotsRun } from "@/lib/challenges/slots";
import type { ChallengeRun } from "@/lib/challenges/types";

// The other members' Slots Runs on one shared year axis (surface brief
// challenges-slots, 3B): a lane per member, a cell per year. The viewer's own
// Run is the panel above, so it has no lane. Pure and client-safe.

export type LaneCell = "cleared" | "open" | "fits" | "none";

export interface TimelineLane {
  runId: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  // Their first year: the birth year for a birth-year Run, which the member
  // was told would show.
  firstYear: number;
  firstIndex: number;
  cells: LaneCell[];
  cleared: number;
  target: number;
  caughtUp: boolean;
  status: ChallengeRun["status"];
}

export interface Timeline {
  start: number;
  end: number;
  labels: { year: number; index: number }[];
  lanes: TimelineLane[];
}

// One Run per member: their Active one, else their newest.
function oneEach(runs: readonly ChallengeRun[], viewerId: string): ChallengeRun[] {
  const members = [...new Set(runs.map((r) => r.user.user_id))].filter((id) => id !== viewerId);
  return members.map((id) => yourSlotsRun(runs, id)!).filter((r) => r.slots);
}

const RANK: Record<ChallengeRun["status"], number> = { finished: 0, active: 1, expired: 2, abandoned: 3 };

function laneOf(run: ChallengeRun, start: number, end: number): TimelineLane {
  const slots = run.slots!;
  const filled = new Set((slots.years ?? []).filter((y) => y.game_id != null).map((y) => y.year));
  const playing = (run.entries ?? []).filter((e) => e.state === "in_progress");
  const cells = Array.from({ length: end - start + 1 }, (_, i): LaneCell => {
    const year = start + i;
    if (year < slots.first_year || year > slots.last_year) return "none";
    if (filled.has(year)) return "cleared";
    return playing.some((e) => e.release_years?.includes(year)) ? "fits" : "open";
  });
  return {
    runId: run.id,
    userId: run.user.user_id,
    name: memberName(run.user),
    avatarUrl: memberAvatar(run.user),
    firstYear: slots.first_year,
    firstIndex: slots.first_year - start,
    cells,
    cleared: run.progress.cleared,
    target: run.progress.target,
    caughtUp: run.progress.caught_up === true,
    status: run.status,
  };
}

const done = (l: TimelineLane) => l.caughtUp || l.status === "finished";
const share = (l: TimelineLane) => (l.target > 0 ? l.cleared / l.target : 0);

export function runsTimeline(runs: readonly ChallengeRun[], viewerId: string, today: IsoDay): Timeline {
  const shown = oneEach(runs, viewerId);
  const thisYear = Number(today.slice(0, 4));
  const start = Math.min(...shown.map((r) => r.slots!.first_year), thisYear);
  const end = Math.max(...shown.map((r) => r.slots!.last_year), shown.length ? start : thisYear);
  const labels = [];
  for (let year = Math.ceil(start / 5) * 5; year <= end; year += 5) labels.push({ year, index: year - start });
  const lanes = shown
    .map((r) => laneOf(r, start, end))
    .sort(
      (a, b) =>
        Number(done(b)) - Number(done(a)) ||
        (RANK[a.status] >= 2 ? 1 : 0) - (RANK[b.status] >= 2 ? 1 : 0) ||
        share(b) - share(a) ||
        a.name.localeCompare(b.name),
    );
  return { start, end, labels, lanes };
}
