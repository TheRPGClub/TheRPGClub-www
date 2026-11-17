import {
  fetchChallenge,
  fetchChallengeRuns,
  fetchPoolPreview,
  savedPoolDefinition,
  type PoolPreview,
} from "@/lib/api/challenges";
import { fetchBirthDate } from "@/lib/api/birth-date";
import { clubToday, daysLeft, type IsoDay } from "@/lib/challenges/dates";
import { slotSquares, type SlotSquares } from "@/lib/challenges/board";
import { yourSlotsRun } from "@/lib/challenges/slots";
import { bannerArt, challengeFacts, scheduleChip, type Fact } from "@/lib/challenges/facts";
import { runActionFor, yourRunsOf, type RunAction } from "@/lib/challenges/run-action";
import { coverMap, runCardView, seasonRuns, sortRuns, type RunCardView } from "@/lib/challenges/runs";
import { challengeTint } from "@/lib/challenges/tint";
import type { Challenge, ChallengeRun, ChallengeTint } from "@/lib/challenges/types";

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

export async function loadChallengePage(id: number, viewerId: string): Promise<ChallengePageRead> {
  const read = await fetchChallenge(id);
  if (!read.ok) return read;
  const challenge = read.data;
  const definition = savedPoolDefinition(challenge);
  const slots = challenge.challenge_format === "slots";
  const [runs, pool, birth] = await Promise.all([
    fetchChallengeRuns(id),
    definition ? fetchPoolPreview(definition) : Promise.resolve(null),
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
      facts: challengeFacts(challenge, today, pool?.total ?? challenge.pool?.game_count ?? null),
      daysLeft: daysLeft(challenge, today),
      runs: shown?.map((run) => runCardView(run, viewerId, covers, today)) ?? null,
      runCount: shown?.length ?? 0,
      finished: shown?.filter((run) => run.status === "finished").length ?? 0,
      pool,
      viewerHasRun: shown?.some((run) => run.user.user_id === viewerId) ?? false,
      // Without the Runs there is no knowing; the API still refuses a second.
      runAction: runActionFor(challenge, yourRunsOf(runs ?? [], id, viewerId), today),
      slotRuns: slots ? shown : null,
      slotPicture: slots ? slotSquares(challenge, yourSlotsRun(shown ?? [], viewerId) ?? undefined, today, 40) : null,
      caughtUp: shown?.filter((run) => run.progress.caught_up).length ?? 0,
      birthYear: birth?.birth_date ? Number(birth.birth_date.slice(0, 4)) : null,
    },
  };
}
