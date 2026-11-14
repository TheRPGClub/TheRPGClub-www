import { describe, expect, it } from "vitest";

import type { Game, Nomination, NominationVote, VotingRound } from "@/lib/api/types";
import { trackResult, voteTitle } from "@/lib/voting/result";

const game = (id: number, title: string) => ({ game_id: id, title }) as Game;
const nom = (id: number, gameId: number | null, title?: string) =>
  ({
    nomination_id: id,
    gamedb_game_id: gameId,
    game: title && gameId ? game(gameId, title) : null,
  }) as Nomination;
const row = (nominationId: number, gameId: number, count: number) => ({
  nomination_id: nominationId,
  gamedb_game_id: gameId,
  vote_count: count,
});
const round = (over: Partial<VotingRound> = {}) =>
  ({ phase: "closed", pending_ties: {}, ...over }) as VotingRound;

describe("trackResult", () => {
  const nominations = [nom(1, 10, "Chrono Trigger"), nom(2, 20, "Earthbound"), nom(3, 10, "Chrono Trigger")];

  it("names the game with the most votes, counting both nominations of a game", () => {
    const rows = [row(1, 10, 2), row(2, 20, 3), row(3, 10, 2)];
    expect(trackResult(round(), "gotm", nominations, rows)).toEqual({
      kind: "leaders",
      titles: ["Chrono Trigger"],
      top: 4,
    });
  });

  it("lists every leader on an even count", () => {
    const rows = [row(1, 10, 2), row(2, 20, 2)];
    expect(trackResult(round(), "gotm", nominations, rows)).toMatchObject({
      titles: ["Chrono Trigger", "Earthbound"],
      top: 2,
    });
  });

  it("reports a tie the admins or a runoff are settling", () => {
    const tied = round({ phase: "runoff", pending_ties: { gotm: [game(10, "A"), game(20, "B")] } });
    expect(trackResult(tied, "gotm", nominations, [])).toEqual({
      kind: "tie",
      titles: ["A", "B"],
      runoff: true,
    });
    expect(trackResult(round({ phase: "tie", pending_ties: { gotm: [game(1, "A")] } }), "gotm", [], [])).toMatchObject({ runoff: false });
  });

  it("has no winner when no votes were cast", () => {
    expect(trackResult(round(), "gotm", nominations, [])).toEqual({ kind: "none", hadNominations: true });
    expect(trackResult(round(), "nr_gotm", [], [])).toEqual({ kind: "none", hadNominations: false });
  });

  it("falls back to Unknown game for a leader with no title", () => {
    expect(trackResult(round(), "gotm", [], [row(9, 99, 1)])).toMatchObject({ titles: ["Unknown game"] });
  });
});

describe("voteTitle", () => {
  const vote = (gameTitle: string | null, nominationId: number) =>
    ({ nomination_id: nominationId, game: gameTitle ? game(1, gameTitle) : null }) as NominationVote;

  it("reads the vote's own game, then its nomination's, then gives up", () => {
    const nominations = [nom(5, 50, "Earthbound")];
    expect(voteTitle(vote("Chrono Trigger", 5), nominations)).toBe("Chrono Trigger");
    expect(voteTitle(vote(null, 5), nominations)).toBe("Earthbound");
    expect(voteTitle(vote(null, 6), nominations)).toBe("Unknown game");
  });
});
