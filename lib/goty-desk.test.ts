import { describe, expect, it } from "vitest";
import type { GotyAward, GotyVote, GotyVoteSummary } from "@/lib/api/goty";
import {
  changedDates,
  datesLockedReason,
  datesNote,
  datesRefusal,
  gotyStatusLine,
  movableDates,
  nominationsRemovable,
  pickGotyYear,
  savedDates,
  tieChoices,
  tiedAwards,
} from "./goty-desk";

const DAY = 86_400_000;
const NOMS = Date.parse("2027-01-01T05:00:00Z");
const OPENS = Date.parse("2027-01-15T17:00:00Z");
const CLOSES = Date.parse("2027-01-18T04:59:59Z");

function summary(over: Partial<GotyVoteSummary> = {}): GotyVoteSummary {
  return {
    year: 2026,
    name: "GOTY Vote 2026",
    nominations_open_at: new Date(NOMS).toISOString(),
    voting_opens_at: new Date(OPENS).toISOString(),
    voting_closes_at: new Date(CLOSES).toISOString(),
    phase: "nominating",
    nominations_open: true,
    voting_open: false,
    runoff_open: false,
    ...over,
  };
}

function award(over: Partial<GotyAward> = {}): GotyAward {
  return {
    award: "gotm",
    name: "GOTM of the Year",
    ballot: [
      { game_id: 1, title: "Chrono Trigger" },
      { game_id: 2, title: "Hades" },
      { game_id: 3, title: "Disco Elysium" },
    ],
    cap: 1,
    runoff_ballot: [],
    pending_tie: [],
    own_votes: [],
    own_runoff_votes: [],
    tally: { counts_hidden: false, runoff_counts_hidden: false, games: [] },
    ...over,
  };
}

const vote = (over: Partial<GotyVote> = {}): GotyVote => ({
  ...summary(),
  pending_ties: {},
  runoff_ties: {},
  awards: [award()],
  ...over,
});

describe("pickGotyYear", () => {
  const votes = [summary({ year: 2025, phase: "decided" }), summary({ year: 2026 }), summary({ year: 2027, phase: "upcoming" })];

  it("takes ?year= when the API has it", () => {
    expect(pickGotyYear(votes, "2025")).toBe(2025);
  });

  it("else opens on the newest vote not yet decided", () => {
    expect(pickGotyYear(votes, "1999")).toBe(2027);
    expect(pickGotyYear([summary({ year: 2025, phase: "decided" })], null)).toBe(2025);
  });

  it("is null with no votes", () => {
    expect(pickGotyYear([], null)).toBeNull();
  });
});

describe("gotyStatusLine", () => {
  it("counts nominations and the days to voting while nominating", () => {
    expect(gotyStatusLine(summary(), 3, OPENS - 9 * DAY)).toBe(
      "GOTY Vote 2026 · Nominations open · 3 nominations · voting opens in 9 days",
    );
  });

  it("names the close while voting", () => {
    expect(gotyStatusLine(summary({ phase: "voting" }), 3, CLOSES - DAY / 2)).toBe(
      "GOTY Vote 2026 · Voting open · closes in 1 day",
    );
  });
});

describe("movableDates", () => {
  it("moves all three before nominations open", () => {
    expect([...movableDates(summary({ phase: "upcoming" }), NOMS - DAY)]).toEqual([
      "nominations_open_at",
      "voting_opens_at",
      "voting_closes_at",
    ]);
  });

  it("locks the nominations' opening once nominations opened", () => {
    expect([...movableDates(summary(), OPENS - DAY)]).toEqual(["voting_opens_at", "voting_closes_at"]);
  });

  it("moves only the close while voting is open", () => {
    expect([...movableDates(summary({ phase: "voting" }), OPENS + DAY)]).toEqual(["voting_closes_at"]);
  });

  it("locks the close once the main vote is tallied, whatever the phase reads", () => {
    const tallied = summary({ phase: "voting", closed_at: "2027-01-17T00:00:00Z" });
    expect(movableDates(tallied, OPENS + DAY).size).toBe(0);
    expect(datesLockedReason(tallied, OPENS + DAY)).toMatch(/has closed/);
  });

  it("moves nothing once voting closed or the vote is decided", () => {
    expect(movableDates(summary({ phase: "runoff" }), CLOSES + DAY).size).toBe(0);
    expect(datesLockedReason(summary({ phase: "decided", decided_at: "2027-01-19T00:00:00Z" }), CLOSES + 2 * DAY)).toMatch(
      /decided/,
    );
    expect(datesLockedReason(summary(), OPENS - DAY)).toBeNull();
  });
});

describe("datesNote", () => {
  it("says which dates are shut and how a move behaves", () => {
    expect(datesNote(summary({ phase: "upcoming" }), NOMS - DAY)).toBe(
      "Your time. Move the vote's opening alone and its close follows to the end of that weekend.",
    );
    expect(datesNote(summary(), OPENS - DAY)).toMatch(/^Your time\. Nominations have opened, so their opening stays\./);
    expect(datesNote(summary({ phase: "voting" }), OPENS + DAY)).toMatch(/only the close can move/);
    expect(datesNote(summary({ phase: "closed", closed_at: "2027-01-18T05:00:00Z" }), CLOSES + DAY)).toMatch(/has closed/);
  });
});

describe("datesRefusal and changedDates", () => {
  const saved = savedDates(summary());

  it("sends only the dates that changed", () => {
    expect(changedDates(saved, { ...saved, voting_opens_at: OPENS + DAY })).toEqual({ voting_opens_at: OPENS + DAY });
  });

  it("refuses an unchanged draft, a cleared field and dates out of order", () => {
    expect(datesRefusal(saved, saved)).toMatch(/Nothing to save/);
    expect(datesRefusal(saved, { ...saved, voting_closes_at: NaN })).toMatch(/Pick a date/);
    expect(datesRefusal(saved, { ...saved, nominations_open_at: OPENS + DAY })).toMatch(/Nominations must open before/);
    expect(datesRefusal(saved, { ...saved, voting_closes_at: OPENS - DAY })).toMatch(/open before it closes/);
  });

  it("lets a moved opening pass its old close, since the close follows", () => {
    expect(datesRefusal(saved, { ...saved, voting_opens_at: CLOSES + 7 * DAY })).toBeNull();
  });
});

describe("tiedAwards and tieChoices", () => {
  it("lists Awards with games pending only in the tie phase", () => {
    const tied = award({ pending_tie: [1, 2] });
    expect(tiedAwards(vote({ phase: "tie", awards: [tied, award({ award: "nr_gotm" })] }))).toEqual([tied]);
    expect(tiedAwards(vote({ phase: "runoff", awards: [tied] }))).toEqual([]);
  });

  it("names each tied game with the runoff count when there was a runoff", () => {
    const tied = award({
      pending_tie: [1, 2],
      runoff_ballot: [1, 2],
      tally: {
        counts_hidden: false,
        runoff_counts_hidden: false,
        games: [
          { gamedb_game_id: 1, votes: 4, runoff_votes: 2 },
          { gamedb_game_id: 2, votes: 4, runoff_votes: 2 },
        ],
      },
    });
    expect(tieChoices(tied)).toEqual([
      { gameId: 1, title: "Chrono Trigger", votes: 2 },
      { gameId: 2, title: "Hades", votes: 2 },
    ]);
  });
});

describe("nominationsRemovable", () => {
  it("holds until voting opens", () => {
    expect(nominationsRemovable(summary(), OPENS - 1)).toBe(true);
    expect(nominationsRemovable(summary(), OPENS)).toBe(false);
  });
});
