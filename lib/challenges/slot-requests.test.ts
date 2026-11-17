import { describe, expect, it } from "vitest";

import { pastPickRequest, pastPlayPath, runNotices, slotMoveRequest, slotRefusal } from "@/lib/challenges/slot-requests";

describe("slotMoveRequest", () => {
  it("moves a game to a year of the Run", () => {
    expect(slotMoveRequest(9, 4, 2020)).toEqual({
      path: "/api/v1/challenge_runs/9/slot_move",
      body: { data: { game_id: 4, slot_year: 2020 } },
    });
  });

  it("sends nothing for ids or years that can't be one", () => {
    expect(slotMoveRequest(0, 4, 2020)).toBeNull();
    expect(slotMoveRequest(9, 4.5, 2020)).toBeNull();
    expect(slotMoveRequest(9, 4, Number.NaN)).toBeNull();
  });
});

describe("pastPickRequest", () => {
  it("picks a Game Completion for a year", () => {
    expect(pastPickRequest(9, 51, 2012)).toEqual({
      path: "/api/v1/challenge_runs/9/past_pick",
      body: { data: { completion_id: 51, slot_year: 2012 } },
    });
    expect(pastPickRequest(9, -1, 2012)).toBeNull();
  });
});

describe("pastPlayPath", () => {
  it("narrows the list by title", () => {
    expect(pastPlayPath(9, "")).toBe("/api/v1/challenge_runs/9/past_play");
    expect(pastPlayPath(9, " mana & more ")).toBe("/api/v1/challenge_runs/9/past_play?q=mana+%26+more");
  });
});

describe("slotRefusal", () => {
  it("shows the API's own words", () => {
    expect(slotRefusal({ status: 409, code: "slot_filled", message: "2020 is filled by Yakuza." })).toBe(
      "2020 is filled by Yakuza.",
    );
  });

  it("falls back to a sentence per code", () => {
    expect(slotRefusal({ status: 422, code: "slot_not_fitting" })).toBe("That game wasn't released in that year.");
    expect(slotRefusal({ status: 422, code: "already_cleared" })).toBe(
      "That game is already Cleared on your Run: move it instead.",
    );
    expect(slotRefusal({ status: 403 })).toBe("Only the Run's member can change it.");
    expect(slotRefusal({ status: 500 })).toBe("That didn't work. Try again in a moment.");
  });
});

describe("runNotices", () => {
  it("reads what a new Run's member should know", () => {
    expect(
      runNotices({ data: {}, meta: { notices: [{ code: "birth_year_shown", message: "Your birth year, 1988, shows." }] } }),
    ).toEqual([{ code: "birth_year_shown", message: "Your birth year, 1988, shows." }]);
    expect(runNotices({ data: {} })).toEqual([]);
    expect(runNotices(null)).toEqual([]);
  });
});
