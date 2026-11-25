import type {
  Game,
  GotmRoundCategory,
  GotmRoundDetail,
  GotmRoundNomination,
  GotmRoundWinner,
} from "@/lib/api/types";
import { gotmLinks, type DiscordLinkConfig, type GotmCardLink } from "@/lib/gotm-links";

// The Round Page's reading of one Category: who won, every game in the
// running in order, and how the vote went (spec api#483).

// One game in a Category's column: a winner (with its own Nomination when it
// had one) or another Nomination.
export interface RoundRow {
  key: string;
  won: boolean;
  gameId: number | null;
  game: Game | null;
  nomination: GotmRoundNomination | null;
  // The winner's entry, for its Reddit post and Discord thread.
  winner: GotmRoundWinner | null;
}

const nominatedAt = (n: GotmRoundNomination) => Date.parse(n.nominated_at) || 0;

// By votes when the Category had a vote (a runoff breaks a tie), otherwise
// by when the game was nominated.
export function sortedNominations(category: GotmRoundCategory): GotmRoundNomination[] {
  return [...category.nominations].sort(
    (a, b) =>
      (category.voted
        ? (b.votes ?? 0) - (a.votes ?? 0) || (b.runoff_votes ?? 0) - (a.runoff_votes ?? 0)
        : 0) || nominatedAt(a) - nominatedAt(b),
  );
}

// Winners first, in `game_index` order, then the rest.
export function categoryRows(category: GotmRoundCategory): RoundRow[] {
  const winners = [...category.winners]
    .sort((a, b) => a.game_index - b.game_index)
    .map((w) => ({
      key: `w${w.game_index}`,
      won: true,
      gameId: w.gamedb_game_id,
      game: w.game ?? w.nomination?.game ?? null,
      nomination: w.nomination,
      winner: w,
    }));
  const others = sortedNominations(category).map((n) => ({
    key: `n${n.nomination_id}`,
    won: false,
    gameId: n.gamedb_game_id,
    game: n.game ?? null,
    nomination: n,
    winner: null,
  }));
  return [...winners, ...others];
}

// A row's vote count, only when the Category had a vote.
export function rowVotes(category: GotmRoundCategory, row: RoundRow): number | null {
  return category.voted ? (row.nomination?.votes ?? null) : null;
}

export function voteTotals(category: GotmRoundCategory): { total: number; max: number } {
  const counts = categoryRows(category).map((r) => rowVotes(category, r) ?? 0);
  return { total: counts.reduce((a, b) => a + b, 0), max: Math.max(0, ...counts) };
}

export function nomineeCount(category: GotmRoundCategory): number {
  return categoryRows(category).filter((r) => r.nomination).length;
}

// True for a round from before Nominations were recorded (before 133).
export function roundHasNominations(round: GotmRoundDetail): boolean {
  return nomineeCount(round.gotm) + nomineeCount(round.nr_gotm) > 0;
}

export interface RunoffSummary {
  // Whether a game in the runoff won the Category (an admin may have picked
  // a winner outside it, or none).
  won: boolean;
  // The runoff counts, the winner's first: "6–5".
  score: string;
  // "A and B tied on 5", when the runoff games shared a first-round count.
  tie: string | null;
}

const LIST = new Intl.ListFormat("en-GB", { type: "conjunction" });

export function runoffSummary(category: GotmRoundCategory): RunoffSummary | null {
  if (!category.runoff) return null;
  const inRunoff = categoryRows(category)
    .filter((r) => r.nomination?.runoff_votes != null)
    .sort((a, b) => Number(b.won) - Number(a.won) || b.nomination!.runoff_votes! - a.nomination!.runoff_votes!);
  if (inRunoff.length === 0) return null;
  const score = inRunoff.map((r) => r.nomination!.runoff_votes).join("–");
  const firstRound = new Set(inRunoff.map((r) => r.nomination!.votes));
  const [votes] = [...firstRound];
  const tie =
    inRunoff.length > 1 && firstRound.size === 1 && votes != null
      ? `${LIST.format(inRunoff.map((r) => r.game?.title ?? "Unknown game"))} tied on ${votes}`
      : null;
  return { won: inRunoff.some((r) => r.won), score, tie };
}

export function votesLabel(count: number): string {
  return `${count} ${count === 1 ? "vote" : "votes"}`;
}

// The outbound links a winner panel carries: the game's Reddit post and
// Discord thread, and on the Category's first panel its voting results.
export function winnerLinks(
  category: GotmRoundCategory,
  row: RoundRow,
  first: boolean,
  config: DiscordLinkConfig,
): GotmCardLink[] {
  return gotmLinks(
    {
      redditUrl: row.winner?.reddit_url,
      threadId: row.winner?.thread_id,
      votingResultsMessageId: first ? category.voting_results_message_id : null,
    },
    config,
  );
}

