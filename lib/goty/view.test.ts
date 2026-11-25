import { describe, expect, it } from "vitest";
import { awardState, gotyClock, gotyTimeline, nextAward, pageStage } from "./view";
import { award, gotyVote } from "./test-fixtures";

const NOW = Date.parse("2027-01-16T17:00:00Z");

describe("pageStage", () => {
  it("maps each phase to its stage", () => {
    expect(pageStage(gotyVote({ phase: "upcoming" }))).toBe("upcoming");
    expect(pageStage(gotyVote({ phase: "nominating" }))).toBe("nominating");
    expect(pageStage(gotyVote({ phase: "voting" }))).toBe("voting");
    expect(pageStage(gotyVote({ phase: "tie" }))).toBe("runoff");
    expect(pageStage(gotyVote({ phase: "decided" }))).toBe("decided");
  });

  it("reads closed as counting, or the runoff once one opened", () => {
    expect(pageStage(gotyVote({ phase: "closed" }))).toBe("counting");
    expect(pageStage(gotyVote({ phase: "closed", runoff_opens_at: "2027-01-18T05:00:00Z" }))).toBe("runoff");
  });
});

describe("awardState", () => {
  it("is a ballot while voting, uncontested with one candidate, empty with none", () => {
    const vote = gotyVote();
    expect(awardState(vote, award("gotm"))).toBe("ballot");
    expect(awardState(vote, award("gotm", { ballot: [{ game_id: 1, title: "A" }] }))).toBe("uncontested");
    expect(awardState(vote, award("gotm", { ballot: [] }))).toBe("empty");
  });

  it("is won once it has a winner, a runoff while its runoff is open, a tie after", () => {
    expect(awardState(gotyVote({ phase: "runoff" }), award("gotm", { winner: { gamedb_game_id: 1, decided_by: "vote" } }))).toBe("won");
    expect(awardState(gotyVote({ phase: "runoff", runoff_open: true }), award("gotm", { runoff_ballot: [1, 2] }))).toBe("runoff");
    expect(awardState(gotyVote({ phase: "tie" }), award("gotm", { runoff_ballot: [1, 2], pending_tie: [1, 2] }))).toBe("tie");
  });

  it("is counting while closed, and not given once decided without a winner", () => {
    expect(awardState(gotyVote({ phase: "closed" }), award("gotm"))).toBe("counting");
    expect(awardState(gotyVote({ phase: "decided" }), award("gotm"))).toBe("empty");
  });
});

describe("gotyClock", () => {
  it("counts the days of voting left", () => {
    const clock = gotyClock(gotyVote(), NOW);
    expect(clock.figure).toBe("2");
    expect(clock.label).toBe("Days of voting left");
    expect(clock.detail).toBe("Closes Sun 17 Jan, 11:59 PM ET");
  });

  it("counts hours in an open runoff", () => {
    const clock = gotyClock(
      gotyVote({ phase: "runoff", runoff_open: true, runoff_opens_at: "2027-01-18T05:00:00Z", runoff_closes_at: "2027-01-19T04:59:59Z" }),
      Date.parse("2027-01-18T11:00:00Z"),
    );
    expect(clock).toMatchObject({ figure: "18", label: "Hours of runoff left" });
  });

  it("says when it was decided", () => {
    expect(gotyClock(gotyVote({ phase: "decided", decided_at: "2027-01-19T06:00:00Z" }), NOW).label).toBe(
      "Decided Tue 19 Jan 2027 · three Awards",
    );
  });
});

describe("gotyTimeline", () => {
  it("lists the phase steps only, no reminders", () => {
    const { ticks } = gotyTimeline(gotyVote(), NOW);
    expect(ticks.map((t) => t.name)).toEqual(["Set up", "Nominations open", "Voting opens", "Voting closes", "Runoff, if tied"]);
    expect(ticks.map((t) => t.date)).toEqual(["1 Dec", "1 Jan", "15 Jan", "17 Jan", "18 Jan"]);
  });

  it("places Now between the steps it falls between, and at the end once decided", () => {
    const { now } = gotyTimeline(gotyVote(), NOW);
    expect(now).toBeGreaterThan(66);
    expect(now).toBeLessThan(82);
    expect(gotyTimeline(gotyVote({ phase: "decided" }), NOW).now).toBe(100);
  });
});

it("steps to the next Award, round to the first", () => {
  expect(nextAward("gotm")).toBe("nr_gotm");
  expect(nextAward("game_of_the_year")).toBe("gotm");
});
