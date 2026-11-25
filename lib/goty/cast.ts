// A vote on an Award applied locally the moment it is cast, by the API's
// rules (Voting::CastRules): voting a game again takes the vote back, and
// a vote at the cap drops the oldest. `votes` runs oldest first.

export interface CastOutcome {
  votes: number[];
  // The game whose vote made room, when the cap was full.
  dropped: number | null;
}

export function castLocally(votes: readonly number[], gameId: number, cap: number): CastOutcome {
  if (votes.includes(gameId)) return { votes: votes.filter((v) => v !== gameId), dropped: null };
  if (cap > 0 && votes.length >= cap) {
    const [dropped, ...rest] = votes;
    return { votes: [...rest, gameId], dropped };
  }
  return { votes: [...votes, gameId], dropped: null };
}
