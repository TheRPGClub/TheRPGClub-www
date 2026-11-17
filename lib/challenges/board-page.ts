import {
  fetchChallenge,
  fetchChallenges,
  fetchFinishedCount,
  fetchMemberRuns,
  fetchPoolPreview,
  savedPoolDefinition,
} from "@/lib/api/challenges";
import {
  applyFilters,
  arrangeBoard,
  viewerRuns,
  type Board,
  type BoardFilters,
  type FlyerExtras,
} from "@/lib/challenges/board";
import { clubToday, type IsoDay } from "@/lib/challenges/dates";
import { runActionFor, yourRunsOf, type RunAction } from "@/lib/challenges/run-action";
import type { Challenge, ChallengeRun } from "@/lib/challenges/types";

// The Challenges index's data (server only): every Challenge the viewer may
// see, arranged as the pinboard, with what each flyer shows beyond the list
// (its Runs, the first Pool covers, a billboard's Finished count) and the
// viewer's own Runs.

export interface BoardPage {
  all: Challenge[];
  shown: Challenge[];
  board: Board;
  extras: Map<number, FlyerExtras>;
  yourRuns: Map<number, ChallengeRun>;
  // What the viewer can do about each shown Challenge (Start a Run...).
  actions: Map<number, RunAction>;
  today: IsoDay;
}

// The list carries each Challenge's Run and Finished counts and its first
// Pool games. From an older API without them, each shown Challenge is read
// once more instead.
async function extrasFor(challenge: Challenge, billboard: boolean): Promise<FlyerExtras> {
  if (challenge.run_count != null && challenge.finished_count != null && challenge.pool_games != null) {
    return {
      runCount: challenge.run_count,
      finished: challenge.finished_count,
      covers: challenge.pool_games.slice(0, 3),
    };
  }
  const definition = savedPoolDefinition(challenge);
  const [show, finished, preview] = await Promise.all([
    fetchChallenge(challenge.id),
    billboard ? fetchFinishedCount(challenge.id) : Promise.resolve(null),
    definition ? fetchPoolPreview(definition, 3) : Promise.resolve(null),
  ]);
  return {
    runCount: show.ok ? (show.data.run_count ?? null) : null,
    finished,
    covers: preview?.games ?? [],
  };
}

export async function loadBoardPage(filters: BoardFilters, viewerId: string): Promise<BoardPage | null> {
  const [all, runs] = await Promise.all([fetchChallenges(), fetchMemberRuns(viewerId)]);
  if (!all) return null;
  const today = clubToday();
  const shown = applyFilters(all, filters);
  const billboards = new Set(arrangeBoard(shown, today).billboards.map((c) => c.id));
  const extras = new Map(
    await Promise.all(shown.map(async (c) => [c.id, await extrasFor(c, billboards.has(c.id))] as const)),
  );
  const runCounts = new Map([...extras].map(([id, e]) => [id, e.runCount ?? 0]));
  return {
    all,
    shown,
    board: arrangeBoard(shown, today, runCounts),
    extras,
    yourRuns: viewerRuns(runs ?? []),
    // Without the viewer's Runs nothing is offered, rather than a Start the
    // API would refuse.
    actions: new Map(
      runs
        ? shown.map((c) => [c.id, runActionFor(c, yourRunsOf(runs, c.id, viewerId), today)] as const)
        : [],
    ),
    today,
  };
}
