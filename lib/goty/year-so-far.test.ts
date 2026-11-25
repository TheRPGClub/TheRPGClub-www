import { describe, expect, it } from "vitest";
import { gotyVote } from "./test-fixtures";
import { CLUB_RELEASES_MAX, clubReleases, howItWorks, yearSoFarEmpty, yearSoFarLine } from "./year-so-far";

const release = (id: number) => ({ game: { game_id: id, title: `R${id}`, cover_url: null }, members_played: 1 });

describe("the Year So Far", () => {
  it("reads club releases only when the API sent them", () => {
    expect(clubReleases(gotyVote({ phase: "upcoming" }))).toEqual([]);
    expect(clubReleases(gotyVote({ phase: "upcoming", club_releases: [release(1)] }))).toHaveLength(1);
  });

  it("never calls club releases nominations, and says when nominations really open", () => {
    const vote = gotyVote({ phase: "upcoming", nominations_open_at: "2027-01-08T17:00:00Z" });
    const line = yearSoFarLine(vote, vote.awards[2]);
    expect(line).toContain("These are not nominations");
    expect(line).toContain("nominations open Fri 8 Jan 2027");
    expect(yearSoFarEmpty(vote, "game_of_the_year")).toBe("No release from this year played yet.");
  });

  it("says when only the most played are shown", () => {
    const full = gotyVote({ phase: "upcoming", club_releases: Array.from({ length: CLUB_RELEASES_MAX }, (_, i) => release(i)) });
    expect(yearSoFarLine(full, full.awards[2])).toContain("The 48 most played are shown.");
    const few = gotyVote({ phase: "upcoming", club_releases: [release(1)] });
    expect(yearSoFarLine(few, few.awards[2])).not.toContain("most played are shown");
  });

  it("says the track winners become the ballot", () => {
    const vote = gotyVote({ phase: "upcoming" });
    expect(yearSoFarLine(vote, vote.awards[1])).toBe(
      "The 2026 NR-GOTM winners so far. They become NR-GOTM of the Year's ballot, with every NR-GOTM winner still to come this year. Nobody nominates for it.",
    );
    expect(yearSoFarEmpty(vote, "gotm")).toContain("No 2026 GOTM round has a winner yet");
  });
});

describe("howItWorks", () => {
  it("lists the three Awards, the real dates and the rules", () => {
    const how = howItWorks(gotyVote({ phase: "upcoming" }));
    expect(how.awards.map((a) => a.name)).toEqual(["GOTM of the Year", "NR-GOTM of the Year", "Game of the Year"]);
    expect(how.dates).toEqual([
      { step: "Nominations open", when: "Fri 1 Jan, 12:00 AM ET" },
      { step: "Voting opens", when: "Fri 15 Jan, 12:00 PM ET" },
      { step: "Voting closes", when: "Sun 17 Jan, 11:59 PM ET" },
      { step: "Runoff, if tied", when: "Right after voting closes, for a day" },
    ]);
    expect(how.rules.map((r) => r.title)).toEqual(["3 nominations each", "The vote cap", "Runoffs"]);
  });

  it("dates a scheduled runoff", () => {
    const how = howItWorks(gotyVote({ runoff_opens_at: "2027-01-18T05:00:00Z", runoff_closes_at: "2027-01-19T05:00:00Z" }));
    expect(how.dates[3]).toEqual({ step: "Runoff", when: "Mon 18 Jan, 12:00 AM ET to Tue 19 Jan, 12:00 AM ET" });
  });
});
