import { describe, expect, it } from "vitest";

import type { VotingRound } from "@/lib/api/types";
import { phaseCopy } from "@/lib/voting/phase";

const round = (over: Partial<VotingRound>): VotingRound => ({
  round_number: 7,
  month_year: "March 2026",
  voting_opens_at: "2026-03-08T17:00:00Z",
  voting_closes_at: "2026-03-15T17:00:00Z",
  closed_at: null,
  decided_at: null,
  phase: "nominating",
  nominations_open: true,
  voting_open: false,
  voting_ended: false,
  pending_ties: {},
  ...over,
});

const now = Date.parse("2026-03-05T12:00:00Z");

describe("phaseCopy", () => {
  it("counts down the nomination days to when voting opens, in Eastern time", () => {
    expect(phaseCopy(round({}), now)).toEqual({
      title: "Nominations",
      clock: {
        figure: "4",
        label: "Days of nominations left",
        detail: "Voting opens Sun, Mar 8 · 1:00 PM ET",
      },
    });
  });

  it("says Day for the last one and never counts below zero", () => {
    const lastDay = phaseCopy(round({}), Date.parse("2026-03-07T20:00:00Z"));
    expect(lastDay.clock.label).toBe("Day of nominations left");
    const late = phaseCopy(round({}), Date.parse("2026-03-09T00:00:00Z"));
    expect(late.clock.figure).toBe("0");
  });

  it("counts down the vote to its close once voting is open", () => {
    expect(phaseCopy(round({ phase: "voting", voting_open: true }), now)).toEqual({
      title: "Voting",
      clock: {
        figure: "11",
        label: "Days of voting left",
        detail: "Voting closes Sun, Mar 15 · 1:00 PM ET. Nominations are closed.",
      },
    });
  });

  it("names a runoff and when it closes", () => {
    const copy = phaseCopy(round({ phase: "runoff", runoff_closes_at: "2026-03-17T17:00:00Z" }), now);
    expect(copy.title).toBe("Results");
    expect(copy.clock).toEqual({
      figure: "Runoff",
      label: "Voting ended in a tie",
      detail: "A runoff between the tied games closes Tue, Mar 17 · 1:00 PM ET.",
    });
    expect(phaseCopy(round({ phase: "runoff" }), now).clock.detail).toBe(
      "A runoff between the tied games decides the winner.",
    );
  });

  it("hands a tie to the admins", () => {
    expect(phaseCopy(round({ phase: "tie" }), now).clock).toEqual({
      figure: "Tie",
      label: "Voting ended in a tie",
      detail: "The admins will pick Round 7's winner, then nominations open for the next round.",
    });
  });

  it("closes a finished round until its winners are recorded", () => {
    for (const phase of ["closed", "decided"] as const) {
      expect(phaseCopy(round({ phase }), now)).toEqual({
        title: "Results",
        clock: {
          figure: "Closed",
          label: "Voting has ended",
          detail: "Nominations for the next round open once Round 7's winners are recorded.",
        },
      });
    }
  });
});
