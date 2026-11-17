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
  today: IsoDay;
}

// The list carries no Run count or Pool games, so each shown Challenge is
// read once more (an API follow-up would put them on the list).
async function extrasFor(challenge: Challenge, billboard: boolean): Promise<FlyerExtras> {
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
    today,
  };
}
