import type { Nomination, NominationVote, VoteTallyRow, VotingRound } from "@/lib/api/types";
import type { RoundTally } from "@/lib/api/voting-round";

// The viewer's own votes on a ballot, plus the per-nomination counts they
// affect: the state the board's optimistic layer builds on.
export interface TallyState {
  counts: Map<number, number>;
  votes: { nominationId: number; gameId: number; votedAt: string }[];
}

// The server's state. Votes are kept oldest first so the cap eviction in
// castOnTally can mirror the backend's choice.
export function tallyState(tally: VoteTallyRow[], userVotes: NominationVote[]): TallyState {
  const votes = userVotes
    .filter((vote) => vote.gamedb_game_id !== null)
    .map((vote) => ({
      nominationId: vote.nomination_id,
      gameId: vote.gamedb_game_id as number,
      votedAt: vote.voted_at,
    }))
    .sort((a, b) => a.votedAt.localeCompare(b.votedAt));
  return {
    counts: new Map(tally.map((row) => [row.nomination_id, row.vote_count])),
    votes,
  };
}

// One click on a nomination's vote button. Votes are per game, so voting a
// game already voted (from any of its nominations) takes that vote back.
export function castOnTally(
  prev: TallyState,
  nomination: Nomination,
  cap: number,
  now: string,
): TallyState {
  const gameId = nomination.gamedb_game_id;
  if (gameId === null) return prev;

  const counts = new Map(prev.counts);
  const bump = (id: number, delta: number) =>
    counts.set(id, Math.max(0, (counts.get(id) ?? 0) + delta));

  const existing = prev.votes.find((vote) => vote.gameId === gameId);
  if (existing) {
    bump(existing.nominationId, -1);
    return { counts, votes: prev.votes.filter((vote) => vote.gameId !== gameId) };
  }

  bump(nomination.nomination_id, 1);
  let votes = [...prev.votes, { nominationId: nomination.nomination_id, gameId, votedAt: now }];
  // Mirrors the backend: voting past the cap evicts the oldest vote.
  while (votes.length > cap) {
    const [oldest, ...rest] = votes;
    bump(oldest.nominationId, -1);
    votes = rest;
  }
  return { counts, votes };
}

// The tally as a member-facing ballot may show it: no counts until the vote
// has ended, whoever is looking. The API still hands Admins the live counts
// (the admin console's private tally reads them), so the ballot drops them
// here, before they reach the page, rather than only hiding them on screen.
export function ballotTally(tally: RoundTally, round: Pick<VotingRound, "voting_ended">): RoundTally {
  if (round.voting_ended || !tally.ok) return tally;
  return { ...tally, rows: [], countsHidden: true };
}
