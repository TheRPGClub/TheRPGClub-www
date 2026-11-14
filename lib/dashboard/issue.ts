import { fetchCurrentGotmRound, fetchGotmRounds } from "@/lib/api/gotm-rounds";
import { fetchNominations, fetchVotingRound } from "@/lib/api/voting-round";
import type { GotmRound, GotmRoundBlock, Nomination, VotingRound } from "@/lib/api/types";
import { fetchGameCounts, type GameCounts } from "@/lib/api/game-counts";
import type { FeatureView } from "@/lib/features";
import type { TrackedNomination } from "@/components/issue/round-panel";

// The dashboard is the current issue: the round's GOTM as the cover story,
// its NR-GOTM as the feature beside it, the club's open business (nominations
// or the vote) in yellow under that, and the previous rounds below.

const PREVIOUS_ROUNDS = 3;

// The round's winning tracks (`gotm_rounds/current` is the GOTM round with
// the same round's NR-GOTM, N/A placeholders already dropped; a track with
// no games is no winner) and the rounds before it.
export function currentIssue(round: GotmRound | null, history: GotmRound[]) {
  return {
    gotm: round?.gotm?.games.length ? round.gotm : null,
    nrGotm: round?.nr_gotm?.games.length ? round.nr_gotm : null,
    previous: history.filter((r) => r.round_number !== round?.round_number).slice(0, PREVIOUS_ROUNDS),
  };
}

// Each GameDB id among the winners, once.
export function winnerIds(blocks: (GotmRoundBlock | null | undefined)[]): number[] {
  return [
    ...new Set(
      blocks.flatMap((block) =>
        (block?.games ?? []).flatMap((g) => (g.gamedb_game_id != null ? [g.gamedb_game_id] : [])),
      ),
    ),
  ];
}

// Both tracks' nominations, newest first, each tagged with its track.
export function sortNominations(gotm: Nomination[], nr: Nomination[]): TrackedNomination[] {
  return [
    ...gotm.map((n) => ({ ...n, category: "gotm" as const })),
    ...nr.map((n) => ({ ...n, category: "nr_gotm" as const })),
  ].sort((a, b) => new Date(b.nominated_at).getTime() - new Date(a.nominated_at).getTime());
}

// The club's Playing / Completed / Reviews numbers for each of the round's
// winners, keyed by GameDB id, each kept only when its Feature is shown. A
// failed read leaves its game out.
async function fetchWinnerCounts(
  blocks: (GotmRoundBlock | null | undefined)[],
  features: FeatureView,
): Promise<Record<number, GameCounts>> {
  const ids = winnerIds(blocks);
  const results = await Promise.all(ids.map((id) => fetchGameCounts(id, features)));
  return Object.fromEntries(ids.flatMap((id, i) => (results[i] ? [[id, results[i]]] : [])));
}

// The panel's nominations, stamped with the time they were read so the
// days-left count is taken against the same moment.
async function fetchRoundNominations(
  voting: VotingRound | null,
): Promise<{ nominations: TrackedNomination[]; now: number }> {
  if (!voting || !["nominating", "voting"].includes(voting.phase)) {
    return { nominations: [], now: Date.now() };
  }
  const [gotm, nr] = await Promise.all([
    fetchNominations("gotm", voting.round_number),
    fetchNominations("nr_gotm", voting.round_number),
  ]);
  return { nominations: sortNominations(gotm, nr), now: Date.now() };
}

export async function loadDashboard(features: FeatureView) {
  const [round, history, voting] = await Promise.all([
    fetchCurrentGotmRound(),
    fetchGotmRounds({ kind: "both", year: null, q: "", sort: "desc", page: 1 }),
    fetchVotingRound(),
  ]);
  const [{ nominations, now }, counts] = await Promise.all([
    fetchRoundNominations(voting),
    fetchWinnerCounts([round?.gotm, round?.nr_gotm], features),
  ]);
  return { round, voting, nominations, now, counts, ...currentIssue(round, history?.rounds ?? []) };
}

export type DashboardIssue = Awaited<ReturnType<typeof loadDashboard>>;
