import {
  fetchChallenge,
  fetchChallengeRuns,
  fetchPoolPreview,
  savedPoolDefinition,
  type PoolPreview,
} from "@/lib/api/challenges";
import { clubToday, daysLeft, type IsoDay } from "@/lib/challenges/dates";
import { bannerArt, challengeFacts, scheduleChip, type Fact } from "@/lib/challenges/facts";
import { coverMap, runCardView, seasonRuns, sortRuns, type RunCardView } from "@/lib/challenges/runs";
import { challengeTint } from "@/lib/challenges/tint";
import type { Challenge, ChallengeTint } from "@/lib/challenges/types";

// A Challenge page's data (server only): the Challenge, its Runs of the
// Season shown, and its Pool's games (for the covers on Run cards and the
// Pool view).

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
  viewerHasRun: boolean;
}

export type ChallengePageRead = { ok: true; page: ChallengePage } | { ok: false; status: number };

export async function loadChallengePage(id: number, viewerId: string): Promise<ChallengePageRead> {
  const read = await fetchChallenge(id);
  if (!read.ok) return read;
  const challenge = read.data;
  const definition = savedPoolDefinition(challenge);
  const [runs, pool] = await Promise.all([
    fetchChallengeRuns(id),
    definition ? fetchPoolPreview(definition) : Promise.resolve(null),
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
      facts: challengeFacts(challenge, today, pool?.total ?? challenge.pool?.game_count ?? null),
      daysLeft: daysLeft(challenge, today),
      runs: shown?.map((run) => runCardView(run, viewerId, covers, today)) ?? null,
      runCount: shown?.length ?? 0,
      finished: shown?.filter((run) => run.status === "finished").length ?? 0,
      pool,
      viewerHasRun: shown?.some((run) => run.user.user_id === viewerId) ?? false,
    },
  };
}
