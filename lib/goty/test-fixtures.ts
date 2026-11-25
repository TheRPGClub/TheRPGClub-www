import type { GotyAward, GotyAwardKey, GotyNomination, GotyVote } from "./types";

// API-shaped GOTY Vote fixtures for the /goty tests: a 2026 vote whose
// phase and Awards each test sets.

export const games = (ids: number[]) => ids.map((id) => ({ game_id: id, title: `Game ${id}`, cover_url: null }));

export function award(key: GotyAwardKey, over: Partial<GotyAward> = {}): GotyAward {
  const name = { gotm: "GOTM of the Year", nr_gotm: "NR-GOTM of the Year", game_of_the_year: "Game of the Year" }[key];
  return {
    award: key,
    name,
    ballot: games([1, 2, 3, 4]),
    cap: 2,
    runoff_ballot: [],
    pending_tie: [],
    own_votes: [],
    own_runoff_votes: [],
    tally: { counts_hidden: true, runoff_counts_hidden: true, games: [] },
    result: null,
    winner: null,
    ...over,
  };
}

export function gotyVote(over: Partial<GotyVote> = {}, awards: Partial<Record<GotyAwardKey, Partial<GotyAward>>> = {}): GotyVote {
  return {
    year: 2026,
    name: "GOTY Vote 2026",
    nominations_open_at: "2027-01-01T05:00:00Z",
    voting_opens_at: "2027-01-15T17:00:00Z",
    voting_closes_at: "2027-01-18T04:59:59Z",
    phase: "voting",
    nominations_open: false,
    voting_open: true,
    runoff_open: false,
    candidates_frozen_at: "2027-01-15T17:00:00Z",
    pending_ties: {},
    runoff_ties: {},
    winners: [],
    ...over,
    awards: (["gotm", "nr_gotm", "game_of_the_year"] as const).map((k) => award(k, awards[k])),
  };
}

export function nomination(id: number, gameId: number, userId: string, name = `Member ${userId}`): GotyNomination {
  return {
    id,
    year: 2026,
    user_id: userId,
    gamedb_game_id: gameId,
    nominated_at: "2027-01-02T00:00:00Z",
    user: { user_id: userId, username: name.toLowerCase(), global_name: name, is_bot: false, role_admin: false, role_moderator: false, role_regular: true },
    game: { game_id: gameId, title: `Game ${gameId}`, cover_url: null },
  };
}
