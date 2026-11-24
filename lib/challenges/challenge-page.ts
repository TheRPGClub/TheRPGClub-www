import { fetchChallenge, fetchChallengeRuns, fetchPoolProgress, type PoolPreview } from "@/lib/api/challenges";
import { fetchBirthDate } from "@/lib/api/birth-date";
import { birthYearOf } from "@/lib/birth-date";
import { clubToday, daysLeft, type IsoDay } from "@/lib/challenges/dates";
import { slotSquares, type SlotSquares } from "@/lib/challenges/board";
import { yourSlotsRun } from "@/lib/challenges/slots";
import { bannerArt, challengeFacts, scheduleChip, type Fact } from "@/lib/challenges/facts";
import { runActionFor, yourRunsOf, type RunAction } from "@/lib/challenges/run-action";
import { coverMap, runCardView, seasonRuns, sortRuns, type RunCardView } from "@/lib/challenges/runs";
import { challengeTint } from "@/lib/challenges/tint";
import { poolKey, poolWall, type WallTile } from "@/lib/challenges/pool-wall";
import type { Challenge, ChallengeRun, ChallengeTint } from "@/lib/challenges/types";

// A Challenge page's data (server only): the Challenge, its Runs of the
// Season shown, its Pool's games as the Challenge serves them (Core and
// Optional, for the Pool's size and covers for an older API's Run cards)
// and, for The Pool view, the Pool's progress (who Cleared or plays each
// game) in one read.

export interface ChallengePage {
  challenge: Challenge;
  tint: ChallengeTint;
  today: IsoDay;
  art: string | null;
  chip: string;
  facts: Fact[];
  daysLeft: number | null;
  runs: RunCardView[] | null;
  runCount: number;
  finished: number;
  pool: PoolPreview | null;
  // The Pool view's cover wall, from the Pool's progress: read only for
  // that view (null otherwise, or when it couldn't be read).
  poolWall: WallTile[] | null;
  viewerHasRun: boolean;
  // What the viewer can do about their Run (start, abandon, or why not).
  runAction: RunAction;
  // Slots (www#109): the shown Runs as the API serves them (with their
  // years), and the viewer's birth year for a birth-year range (null when
  // unknown), to draw the Run they'd start.
  slotRuns: ChallengeRun[] | null;
  birthYear: number | null;
  // The banner's picture without key art (your Run's years when you have
  // one) and how many Runs are Caught Up.
  slotPicture: SlotSquares | null;
  caughtUp: number;
}

export type ChallengePageRead = { ok: true; page: ChallengePage } | { ok: false; status: number };

// A Pool Challenge's games as the show serves them: Core, then Optional.
function poolOf(challenge: Challenge): PoolPreview | null {
  const pool = challenge.pool;
  if (challenge.challenge_format !== "pool" || !pool) return null;
  const games = [...(pool.core_games ?? []), ...(pool.optional_games ?? [])].map((g) => ({
    game_id: g.game_id,
    title: g.title,
    cover_url: g.cover_url ?? null,
  }));
  return { games, total: pool.game_count ?? games.length };
}

export async function loadChallengePage(
  id: number,
  viewerId: string,
  { poolView = false }: { poolView?: boolean } = {},
): Promise<ChallengePageRead> {
  const read = await fetchChallenge(id);
  if (!read.ok) return read;
  const challenge = read.data;
  const pool = poolOf(challenge);
  const key = poolKey(challenge.pool);
  const slots = challenge.challenge_format === "slots";
  const [runs, poolProgress, birth] = await Promise.all([
    fetchChallengeRuns(id),
    pool && poolView ? fetchPoolProgress(id) : Promise.resolve(null),
    slots && challenge.slots?.first_year === "birth_year" ? fetchBirthDate(viewerId) : Promise.resolve(null),
  ]);
  const today = clubToday();
  const shown = runs ? sortRuns(seasonRuns(challenge, runs, today)) : null;
  const covers = coverMap(pool?.games ?? []);
  return {
    ok: true,
    page: {
      challenge,
      tint: challengeTint(challenge),
      today,
      art: bannerArt(challenge, pool?.games ?? []),
      chip: scheduleChip(challenge, today),
      facts: challengeFacts(challenge, today),
      daysLeft: daysLeft(challenge, today),
      runs: shown?.map((run) => runCardView(run, viewerId, covers, today, key.core)) ?? null,
      runCount: shown?.length ?? 0,
      finished: shown?.filter((run) => run.status === "finished").length ?? 0,
      pool,
      poolWall: poolProgress ? poolWall(poolProgress, viewerId, key) : null,
      viewerHasRun: shown?.some((run) => run.user.user_id === viewerId) ?? false,
      // Without the Runs there is no knowing; the API still refuses a second.
      runAction: runActionFor(challenge, yourRunsOf(runs ?? [], id, viewerId), today),
      slotRuns: slots ? shown : null,
      slotPicture: slots ? slotSquares(challenge, yourSlotsRun(shown ?? [], viewerId) ?? undefined, today, 40) : null,
      caughtUp: shown?.filter((run) => run.progress.caught_up).length ?? 0,
      birthYear: birthYearOf(birth?.birth_date ?? null),
    },
  };
}
