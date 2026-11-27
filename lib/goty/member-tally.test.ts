import { describe, expect, it } from "vitest";

import { memberTally } from "./member-tally";
import type { GotyAward, GotyVote } from "./types";

const award = {
  award: "gotm",
  tally: { counts_hidden: false, runoff_counts_hidden: false, games: [{ gamedb_game_id: 1, votes: 4, runoff_votes: 2 }] },
  result: null,
} as unknown as GotyAward;
const vote = (phase: GotyVote["phase"]) => ({ year: 2026, phase, awards: [award] }) as unknown as GotyVote;

describe("memberTally", () => {
  it("drops every count while voting is open, even when the API sent staff them", () => {
    const [a] = memberTally(vote("voting")).awards;
    expect(a.tally).toEqual({ counts_hidden: true, runoff_counts_hidden: true, games: [] });
  });

  it("keeps the main counts but drops the runoff's while the runoff is open", () => {
    const [a] = memberTally(vote("runoff")).awards;
    expect(a.tally).toEqual({
      counts_hidden: false,
      runoff_counts_hidden: true,
      games: [{ gamedb_game_id: 1, votes: 4, runoff_votes: 0 }],
    });
  });

  it("leaves a vote whose voting is over as the API sent it", () => {
    const decided = vote("decided");
    expect(memberTally(decided)).toBe(decided);
  });
});
