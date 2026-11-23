import { describe, expect, it } from "vitest";

import { trackChips } from "@/components/issue/game-track";

describe("trackChips", () => {
  const won = { gotm_won: true, nr_gotm_won: false, gotm_month_year: "November 2024", nr_gotm_month_year: null };

  it("names the track and the month it won", () => {
    expect(trackChips(won)).toEqual([{ tone: "gotm", label: "Game of the Month · November 2024" }]);
    expect(trackChips(won, { short: true })).toEqual([{ tone: "gotm", label: "GOTM · November 2024" }]);
  });

  it("shortens the month for a pill", () => {
    expect(trackChips(won, { short: true, shortMonth: true })).toEqual([{ tone: "gotm", label: "GOTM · Nov 2024" }]);
    expect(
      trackChips(
        { gotm_won: false, nr_gotm_won: true, gotm_month_year: null, nr_gotm_month_year: "March 2025" },
        { short: true, shortMonth: true },
      ),
    ).toEqual([{ tone: "nr", label: "NR-GOTM · Mar 2025" }]);
  });

  it("keeps a month it can't read as it is, and drops a missing one", () => {
    expect(trackChips({ ...won, gotm_month_year: "Spring 2024 special" }, { short: true, shortMonth: true })[0].label).toBe(
      "GOTM · Spring 2024 special",
    );
    expect(trackChips({ gotm_won: true, nr_gotm_won: false }, { short: true, shortMonth: true })[0].label).toBe("GOTM");
  });
});
