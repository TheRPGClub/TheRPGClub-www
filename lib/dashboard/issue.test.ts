import { describe, expect, it } from "vitest";

import type { GotmRound, GotmRoundBlock } from "@/lib/api/types";
import { currentIssue, sortNominations, winnerIds } from "@/lib/dashboard/issue";

const block = (ids: (number | null)[]): GotmRoundBlock => ({
  month_year: "November 2026",
  voting_results_message_id: null,
  games: ids.map((gamedb_game_id, i) => ({ gamedb_game_id, title: `Game ${i}` })) as unknown as GotmRoundBlock["games"],
});
const round = (round_number: number, gotm: GotmRoundBlock | null, nr_gotm: GotmRoundBlock | null) =>
  ({ round_number, gotm, nr_gotm }) as GotmRound;

describe("currentIssue", () => {
  it("is the round's two winning tracks and the three rounds before it", () => {
    const current = round(10, block([1]), block([2]));
    const history = [10, 9, 8, 7, 6].map((n) => round(n, block([n]), null));
    const issue = currentIssue(current, history);
    expect(issue.gotm).toBe(current.gotm);
    expect(issue.nrGotm).toBe(current.nr_gotm);
    expect(issue.previous.map((r) => r.round_number)).toEqual([9, 8, 7]);
  });

  it("drops a track with no games, and has no winners without a round", () => {
    expect(currentIssue(round(3, block([]), block([4])), [])).toMatchObject({ gotm: null, nrGotm: { games: [{}] } });
    expect(currentIssue(null, [round(2, null, null)])).toMatchObject({ gotm: null, nrGotm: null, previous: [{ round_number: 2 }] });
  });
});

describe("winnerIds", () => {
  it("is each GameDB id once across the round's winners", () => {
    expect(winnerIds([block([1, null, 2]), null, undefined, block([2, 3])])).toEqual([1, 2, 3]);
  });
});

describe("sortNominations", () => {
  it("is both tracks' nominations newest first, each with its track", () => {
    const n = (id: number, at: string) => ({ nomination_id: id, nominated_at: at }) as never;
    expect(
      sortNominations([n(1, "2026-11-01"), n(2, "2026-11-03")], [n(3, "2026-11-02")]).map((x) => [
        (x as { nomination_id: number }).nomination_id,
        x.category,
      ]),
    ).toEqual([
      [2, "gotm"],
      [3, "nr_gotm"],
      [1, "gotm"],
    ]);
  });
});
