import { describe, expect, it } from "vitest";
import { decidedLine, envelope, wonInLabel, wonInFor, nominatedBy, nominatedGames, nominationGame, ownVoteCount, resultRows } from "./awards";
import { castLocally, syncFromServer } from "./cast";
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

  it("dates Game of the Year's nominations from the vote, not 1 January", () => {
    const vote = gotyVote({ phase: "upcoming", nominations_open_at: "2027-01-08T17:00:00Z" });
    expect(envelope(vote, vote.awards[2], 0, 0).status).toBe("nominations each, from 8 Jan");
  });

  it("counts the ballot's own votes once it has them, else the API's", () => {
    const vote = gotyVote({}, { gotm: { own_votes: [1] }, nr_gotm: { runoff_ballot: [1, 2], own_votes: [1, 2], own_runoff_votes: [] } });
    expect(ownVoteCount(vote.awards[0])).toBe(1);
    expect(ownVoteCount(vote.awards[0], [1, 3])).toBe(2);
    expect(ownVoteCount(vote.awards[1])).toBe(0);
  });

  it("counts a closed runoff rather than offering its vote", () => {
    const vote = gotyVote({ phase: "closed", voting_open: false, runoff_opens_at: "2027-01-18T05:00:00Z" }, { gotm: { runoff_ballot: [1, 2] } });
    expect(envelope(vote, vote.awards[0], 0, 1)).toEqual({ figure: "", status: "Counting the runoff" });
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

  it("stands in for a nomination whose game the API didn't send", () => {
    expect(nominationGame({ ...nomination(4, 12, "me"), game: null })).toEqual({ game_id: 12, title: "Game #12", cover_url: null });
    expect(nominationGame(nomination(4, 12, "me")).title).toBe("Game 12");
  });

  it("credits nominators with the viewer as you", () => {
    expect(nominatedBy(nominatedGames(noms, "me")[0], "me")).toBe("Nominated by you, Juno");
  });
});

describe("syncFromServer", () => {
  it("takes the API's list when no vote is in flight", () => {
    expect(syncFromServer({ votes: [1], synced: "1" }, [1, 2], false)).toEqual({ votes: [1, 2], synced: "1,2" });
    expect(syncFromServer({ votes: [1, 2], synced: "1,2" }, [1, 2], false)).toBeNull();
  });

  it("notes but doesn't apply a list that lands while a vote is in flight", () => {
    // Voted 1 (refresh pending), then 3: the refresh for 1 must not erase 3,
    // and must not be applied later once 3 lands either.
    const midFlight = syncFromServer({ votes: [1, 3], synced: "" }, [1], true);
    expect(midFlight).toEqual({ votes: [1, 3], synced: "1" });
    expect(syncFromServer(midFlight!, [1], false)).toBeNull();
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

describe("wonInLabel", () => {
  it("names one win by its round and full month", () => {
    expect(wonInLabel([{ round_number: 50, month_year: "January 2026" }])).toBe("Round 50 · January");
  });

  it("joins two wins with short months", () => {
    expect(
      wonInLabel([
        { round_number: 51, month_year: "February 2026" },
        { round_number: 59, month_year: "October 2026" },
      ]),
    ).toBe("Rounds 51 + 59 · Feb, Oct");
  });

  it("reads legacy month labels", () => {
    expect(wonInLabel([{ round_number: 7, month_year: "Jan 2026" }])).toBe("Round 7 · January");
    expect(wonInLabel([{ round_number: 8, month_year: "2026-03" }])).toBe("Round 8 · March");
    expect(wonInLabel([{ round_number: 9, month_year: "sept 2026" }])).toBe("Round 9 · September");
  });

  it("keeps an unreadable month as it is, and drops a blank one", () => {
    expect(wonInLabel([{ round_number: 9, month_year: "Summer special" }])).toBe("Round 9 · Summer special");
    expect(wonInLabel([{ round_number: 9, month_year: "" }])).toBe("Round 9");
  });

  it("says nothing with no wins or no key", () => {
    expect(wonInLabel([])).toBe("");
    expect(wonInLabel(undefined)).toBe("");
  });
});

describe("wonInFor", () => {
  it("joins a game to its ballot entry by id", () => {
    const a = award("gotm", { ballot: [{ game_id: 4, title: "Game 4", won_in: [{ round_number: 53, month_year: "April 2026" }] }] });
    expect(wonInFor(a, 4)).toBe("Round 53 · April");
    expect(wonInFor(a, 5)).toBe("");
  });
});
