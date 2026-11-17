import { clubDayOf, formatDay, type IsoDay } from "@/lib/challenges/dates";
import type { ChallengeRun, ChallengeRunEntry } from "@/lib/challenges/types";

// A Slots Run as the decade matrix of the Challenge page (surface brief
// challenges-slots, 3A): a row per decade, a tile per year, each Cleared
// (its game's cover, tagged Past or Moved), open (naming an In Progress game
// that fits it), or outside the Run. Pure and client-safe; the API decides
// which game fills which year, so this only lays its answer out.

export interface SlotGame {
  game_id: number;
  title: string;
  cover_url: string | null;
}

export type YearTile =
  // Before the Run's first year, or after a fixed range's last.
  | { kind: "none" }
  // A year still to come (a growing Run's decade, or a Run not started yet).
  | { kind: "ghost"; year: number }
  | {
      kind: "cleared";
      year: number;
      game: SlotGame;
      // Past: a Game Completion from before the Run, picked by the member.
      // Moved: the member moved it here from another year it fits.
      tag: "past" | "moved" | null;
      // The Run's other open years it was released in.
      moveYears: number[];
    }
  // `fits`: an In Progress game released that year. `thisYear`: the slot the
  // last 1 January opened.
  | { kind: "open"; year: number; fits: string | null; thisYear: boolean };

export interface DecadeRow {
  decade: number;
  // "80s", "00s".
  label: string;
  tiles: YearTile[];
}

export interface MovableGame extends SlotGame {
  // The year it fills, or null while it waits for an open one.
  year: number | null;
  moveYears: number[];
}

export interface RunMatrix {
  rows: DecadeRow[];
  cleared: number;
  target: number;
  openYears: number[];
  // "Cleared · 1 In Progress · 4 open years" (after the score).
  line: string;
  // Cleared games that fit a year of the Run but find them all filled.
  waiting: SlotGame[];
  // Which tags the legend explains.
  tags: { past: boolean; moved: boolean };
  // Cleared games that can move to an open year (Move a game).
  movable: MovableGame[];
}

const gameOf = (e: Pick<ChallengeRunEntry, "game_id" | "title" | "cover_url">): SlotGame => ({
  game_id: e.game_id,
  title: e.title,
  cover_url: e.cover_url ?? null,
});

const decadeLabel = (decade: number) => `${String(decade % 100).padStart(2, "0")}s`;

function rowsOf(first: number, last: number, through: number, tileOf: (year: number) => YearTile): DecadeRow[] {
  const rows: DecadeRow[] = [];
  for (let decade = Math.floor(first / 10) * 10; decade <= through; decade += 10) {
    const tiles = Array.from({ length: 10 }, (_, digit): YearTile => {
      const year = decade + digit;
      if (year < first) return { kind: "none" };
      if (year > last) return year <= through ? { kind: "ghost", year } : { kind: "none" };
      return tileOf(year);
    });
    rows.push({ decade, label: decadeLabel(decade), tiles });
  }
  return rows;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

function summaryLine(inProgress: number, open: number): string {
  return [
    "Cleared",
    inProgress > 0 ? `${inProgress} In Progress` : null,
    open > 0 ? plural(open, "open year", "open years") : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

// A Game Completion from before the Run started (or undated) can only have
// come in by the member's pick.
function tagOf(entry: ChallengeRunEntry, run: ChallengeRun): "past" | "moved" | null {
  if (!entry.picked_by_hand) return null;
  return !entry.cleared_on || entry.cleared_on < run.window.starts_on ? "past" : "moved";
}

export function runMatrix(run: ChallengeRun, today: IsoDay): RunMatrix {
  const thisYear = Number(today.slice(0, 4));
  const slots = run.slots ?? { first_year: thisYear, last_year: thisYear, growing: false, years: [] };
  const years = slots.years ?? [];
  const entries = run.entries ?? [];
  const cleared = entries.filter((e) => e.state === "cleared");
  const playing = entries.filter((e) => e.state === "in_progress");
  const filledBy = new Map(years.filter((y) => y.game_id != null).map((y) => [y.year, y]));
  const openYears = years.filter((y) => y.game_id == null).map((y) => y.year);
  const fitsOpen = (e: ChallengeRunEntry, year: number | null = null) =>
    e.release_years ? openYears.filter((y) => y !== year && e.release_years!.includes(y)) : [...openYears];

  const tileOf = (year: number): YearTile => {
    const filled = filledBy.get(year);
    if (!filled) {
      const fits = playing.find((e) => e.release_years?.includes(year));
      return { kind: "open", year, fits: fits?.title ?? null, thisYear: slots.growing && year === thisYear };
    }
    const e = cleared.find((c) => c.slot_year === year) ?? cleared.find((c) => c.game_id === filled.game_id);
    const game = e ? gameOf(e) : { game_id: filled.game_id!, title: filled.title ?? "", cover_url: null };
    return { kind: "cleared", year, game, tag: e ? tagOf(e, run) : null, moveYears: e ? fitsOpen(e, year) : [] };
  };

  const through = slots.growing ? Math.floor(slots.last_year / 10) * 10 + 9 : slots.last_year;
  const rows = rowsOf(slots.first_year, slots.last_year, through, tileOf);
  const placed = cleared
    .filter((e) => e.slot_year != null)
    .sort((a, b) => a.slot_year! - b.slot_year!)
    .map((e) => ({ ...gameOf(e), year: e.slot_year!, moveYears: fitsOpen(e, e.slot_year!) }));
  const waitingEntries = cleared.filter((e) => e.slot_year == null);
  const waiting = waitingEntries.map((e) => ({ ...gameOf(e), year: null, moveYears: fitsOpen(e) }));
  return {
    rows,
    cleared: run.progress.cleared,
    target: run.progress.target,
    openYears,
    line: summaryLine(run.progress.in_progress, openYears.length),
    waiting: waitingEntries.map(gameOf),
    tags: {
      past: cleared.some((e) => e.slot_year != null && tagOf(e, run) === "past"),
      moved: cleared.some((e) => e.slot_year != null && tagOf(e, run) === "moved"),
    },
    movable: [...placed, ...waiting].filter((g) => g.moveYears.length > 0),
  };
}

// The years a Run would have before it starts: every one a ghost.
export function previewMatrix(first: number, last: number, today: IsoDay): RunMatrix {
  const growing = last === Number(today.slice(0, 4));
  const through = growing ? Math.floor(last / 10) * 10 + 9 : last;
  const rows = rowsOf(first, through, through, (year) => ({ kind: "ghost", year }));
  // Years past a growing range's last stay ghosts too; the count is the range.
  return {
    rows,
    cleared: 0,
    target: Math.max(last - first + 1, 0),
    openYears: [],
    line: "",
    waiting: [],
    tags: { past: false, moved: false },
    movable: [],
  };
}

// The viewer's Run the panel shows: their Active one, else their newest.
export function yourSlotsRun(runs: readonly ChallengeRun[], viewerId: string): ChallengeRun | null {
  const mine = runs.filter((r) => r.user.user_id === viewerId);
  return (
    mine.find((r) => r.status === "active") ??
    [...mine].sort((a, b) => (a.started_at < b.started_at ? 1 : -1))[0] ??
    null
  );
}

// The stamp beside a Run's score.
export function runStamp(run: ChallengeRun): "Caught Up" | "Finished" | "Abandoned" | "Expired" | null {
  if (run.status === "finished") return "Finished";
  if (run.status === "abandoned") return "Abandoned";
  if (run.status === "expired") return "Expired";
  return run.progress.caught_up ? "Caught Up" : null;
}

// "from 1994 · started 3 Mar 2025": the first year shows (the member was
// told a birth year would).
export function runDates(run: ChallengeRun, today: IsoDay): string {
  const from = run.slots ? `from ${run.slots.first_year} · ` : "";
  return `${from}started ${formatDay(clubDayOf(run.started_at), today)}`;
}
