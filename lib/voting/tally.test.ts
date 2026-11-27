import { describe, expect, it } from "vitest";

import type { Nomination, NominationVote, VoteTallyRow } from "@/lib/api/types";
import type { RoundTally } from "@/lib/api/voting-round";
import { ballotTally, castOnTally, tallyState } from "@/lib/voting/tally";

const nom = (id: number, gameId: number | null) =>
  ({ nomination_id: id, gamedb_game_id: gameId }) as Nomination;
const vote = (nominationId: number, gameId: number | null, at: string) =>
  ({ nomination_id: nominationId, gamedb_game_id: gameId, voted_at: at }) as NominationVote;
const row = (nominationId: number, count: number) =>
  ({ nomination_id: nominationId, vote_count: count }) as VoteTallyRow;

const NOW = "2026-03-10T00:00:00.000Z";

describe("tallyState", () => {
  it("keeps the viewer's game votes oldest first, with the counts per nomination", () => {
    const state = tallyState(
      [row(1, 3), row(2, 1)],
      [vote(2, 20, "2026-03-09T00:00:00Z"), vote(1, 10, "2026-03-08T00:00:00Z"), vote(3, null, "2026-03-07T00:00:00Z")],
    );
    expect([...state.counts]).toEqual([[1, 3], [2, 1]]);
    expect(state.votes.map((v) => v.gameId)).toEqual([10, 20]);
  });
});

describe("castOnTally", () => {
  const start = tallyState([row(1, 3), row(2, 1)], [vote(1, 10, "2026-03-08T00:00:00Z")]);

  it("adds a vote and its count", () => {
    const next = castOnTally(start, nom(2, 20), 2, NOW);
    expect(next.counts.get(2)).toBe(2);
    expect(next.votes.map((v) => v.gameId)).toEqual([10, 20]);
  });

  it("takes a vote back when the game is voted again, from any of its nominations", () => {
    const next = castOnTally(start, nom(5, 10), 2, NOW);
    expect(next.counts.get(1)).toBe(2);
    expect(next.votes).toEqual([]);
  });

  it("evicts the oldest vote past the cap, as the backend does", () => {
    const next = castOnTally(start, nom(2, 20), 1, NOW);
    expect(next.counts.get(1)).toBe(2);
    expect(next.counts.get(2)).toBe(2);
    expect(next.votes.map((v) => v.gameId)).toEqual([20]);
  });

  it("never counts below zero and ignores a nomination with no game", () => {
    const empty = tallyState([], [vote(1, 10, "2026-03-08T00:00:00Z")]);
    expect(castOnTally(empty, nom(1, 10), 2, NOW).counts.get(1)).toBe(0);
    expect(castOnTally(start, nom(4, null), 2, NOW)).toBe(start);
  });
});

describe("ballotTally", () => {
  const tally: RoundTally = { rows: [row(1, 3)], cap: 2, countsHidden: false, ok: true };

  it("drops the counts while the vote is open, even when the API sent them", () => {
    expect(ballotTally(tally, { voting_ended: false })).toEqual({ rows: [], cap: 2, countsHidden: true, ok: true });
  });

  it("keeps the counts once the vote has ended", () => {
    expect(ballotTally(tally, { voting_ended: true })).toBe(tally);
  });

  it("leaves a failed read as a failure", () => {
    const failed = { ...tally, rows: [], ok: false };
    expect(ballotTally(failed, { voting_ended: false })).toBe(failed);
  });
});
