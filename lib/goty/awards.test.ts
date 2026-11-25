import { describe, expect, it } from "vitest";
import { decidedLine, envelope, nominatedBy, nominatedGames, resultRows } from "./awards";
import { castLocally } from "./cast";
import { eligibilityNote, gotyError } from "./copy";
import { award, gotyVote, nomination } from "./test-fixtures";

describe("envelope", () => {
  it("shows the viewer's votes against the cap while voting", () => {
    const vote = gotyVote();
    expect(envelope(vote, vote.awards[0], 0, 1)).toEqual({ figure: "1", of: "/2", status: "your votes" });
  });

  it("counts nominations for Game of the Year while nominating", () => {
    const vote = gotyVote({ phase: "nominating" });
    expect(envelope(vote, vote.awards[2], 7, 0)).toEqual({ figure: "7", status: "games nominated so far" });
    expect(envelope(vote, vote.awards[0], 7, 0).status).toBe("games, no nominating");
  });

  it("names a decided Award's winner", () => {
    const vote = gotyVote({ phase: "runoff" }, { gotm: { winner: { gamedb_game_id: 2, decided_by: "vote" } } });
    expect(envelope(vote, vote.awards[0], 0, 0).status).toBe("Decided: Game 2");
  });
});

describe("results", () => {
  const decided = award("game_of_the_year", {
    winner: { gamedb_game_id: 1, decided_by: "runoff" },
    runoff_ballot: [1, 2],
    result: [
      { gamedb_game_id: 1, votes: 11, runoff_votes: 9 },
      { gamedb_game_id: 2, votes: 11, runoff_votes: 7 },
      { gamedb_game_id: 3, votes: 7, runoff_votes: 0 },
    ],
  });

  it("sorts by runoff votes, then votes", () => {
    expect(resultRows(decided).map((r) => r.game.game_id)).toEqual([1, 2, 3]);
  });

  it("says how an Award was won", () => {
    expect(decidedLine(decided)).toBe("9 votes · won in a runoff, 9 to 7");
    expect(decidedLine(award("gotm", { winner: { gamedb_game_id: 1, decided_by: "uncontested" } }))).toBe("Uncontested");
    expect(
      decidedLine(award("gotm", { winner: { gamedb_game_id: 1, decided_by: "vote" }, result: [{ gamedb_game_id: 1, votes: 14, runoff_votes: 0 }] })),
    ).toBe("14 votes · won by vote");
  });
});

describe("nominations", () => {
  const noms = [nomination(1, 10, "a", "Tavi"), nomination(2, 11, "b", "Juno"), nomination(3, 11, "me", "Rowan")];

  it("lists each game once, most nominated first, marking the viewer's", () => {
    const list = nominatedGames(noms, "me");
    expect(list.map((g) => [g.game.game_id, g.by.length, g.mine])).toEqual([
      [11, 2, true],
      [10, 1, false],
    ]);
    expect(list[0].ownNominationId).toBe(3);
  });

  it("credits nominators with the viewer as you", () => {
    expect(nominatedBy(nominatedGames(noms, "me")[0], "me")).toBe("Nominated by you, Juno");
  });
});

describe("castLocally", () => {
  it("toggles a vote off, adds under the cap, drops the oldest at it", () => {
    expect(castLocally([1, 2], 2, 3)).toEqual({ votes: [1], dropped: null });
    expect(castLocally([1], 2, 3)).toEqual({ votes: [1, 2], dropped: null });
    expect(castLocally([1, 2], 3, 2)).toEqual({ votes: [2, 3], dropped: 1 });
  });
});

describe("copy", () => {
  it("explains eligibility", () => {
    expect(eligibilityNote({ game_id: 1, year: 2026, eligible: true, released_on: "2026-03-14", date_precision: "day" })).toEqual({
      ok: true,
      text: "Released Mar 2026",
    });
    expect(eligibilityNote({ game_id: 1, year: 2026, eligible: false, reason: "not_released_in_year", released_on: "2025-11-01", date_precision: "day" }).text).toBe(
      "First released Nov 2025. Only games first released in 2026 can be nominated.",
    );
    expect(eligibilityNote({ game_id: 1, year: 2026, eligible: false, reason: "release_unknown" }).text).toMatch(/Ask staff to record its release/);
  });

  it("words the API's refusals", () => {
    expect(gotyError({ error: "nomination_cap_reached" }, 422)).toMatch(/three nominations/);
    expect(gotyError({ error: "not_released_in_year" }, 422, 2026)).toBe("Only games first released in 2026 can be nominated.");
    expect(gotyError({ error: "other", message: "Server said no" }, 422)).toBe("Server said no");
  });
});
