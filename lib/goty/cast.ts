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

// The ballot's local votes against the API's list from a refresh. The
// API's list is taken only while no vote is in flight; one that lands
// mid-flight is noted as seen but not applied, so a refresh started by an
// earlier vote can't overwrite the vote being cast (the in-flight vote's
// own answer settles the list). Null when nothing changes.
export function syncFromServer(
  local: { votes: number[]; synced: string },
  server: readonly number[],
  inFlight: boolean,
): { votes: number[]; synced: string } | null {
  const key = server.join(",");
  if (key === local.synced) return null;
  return { votes: inFlight ? local.votes : [...server], synced: key };
}
