import { describe, expect, it } from "vitest";
import type { PublicWinner } from "@/lib/api/types";
import {
  latestDecidedRound,
  parseRound,
  planShareCard,
  roundWinners,
  shareCardImagePath,
} from "./select";

function winner(round: number, kind: PublicWinner["kind"], title: string): PublicWinner {
  return {
    round_number: round,
    month_year: "2026-11",
    kind,
    game_id: round * 10 + (kind === "gotm" ? 1 : 2),
    title,
    cover_url: `https://img.test/${title}.jpg`,
    art_url: null,
  };
}

const WINDOW = [
  winner(42, "gotm", "Chrono Trigger"),
  winner(42, "gotm", "Second GOTM"),
  winner(42, "nr_gotm", "Hades"),
  winner(41, "gotm", "Xenogears"),
  winner(41, "nr_gotm", "Celeste"),
];

describe("latestDecidedRound", () => {
  it("is the highest round_number", () => {
    expect(latestDecidedRound(WINDOW)).toBe(42);
    expect(latestDecidedRound([winner(3, "gotm", "a"), winner(9, "nr_gotm", "b")])).toBe(9);
  });

  it("is null without winners", () => {
    expect(latestDecidedRound([])).toBeNull();
  });
});

describe("shareCardImagePath", () => {
  it("carries the latest round", () => {
    expect(shareCardImagePath(WINDOW)).toBe("/share-card?round=42");
  });

  it("is bare without winners", () => {
    expect(shareCardImagePath([])).toBe("/share-card");
  });
});

describe("parseRound", () => {
  it.each([
    ["42", 42],
    ["1", 1],
  ])("reads %s", (value, round) => {
    expect(parseRound(value)).toBe(round);
  });

  it.each([null, undefined, "", "0", "-1", "4.2", "42abc", "1e3", "0042", "9999999999"])(
    "rejects %s",
    (value) => {
      expect(parseRound(value)).toBeNull();
    },
  );
});

describe("roundWinners", () => {
  it("takes each category's lead pick, GOTM first", () => {
    expect(roundWinners(WINDOW, 42)).toEqual([
      { kind: "gotm", title: "Chrono Trigger", coverUrl: "https://img.test/Chrono Trigger.jpg" },
      { kind: "nr_gotm", title: "Hades", coverUrl: "https://img.test/Hades.jpg" },
    ]);
  });

  it("leaves out a category with no winner", () => {
    expect(roundWinners([winner(7, "nr_gotm", "Hades")], 7)).toEqual([
      { kind: "nr_gotm", title: "Hades", coverUrl: "https://img.test/Hades.jpg" },
    ]);
  });
});

describe("planShareCard", () => {
  it("draws the asked-for round", () => {
    const plan = planShareCard(WINDOW, "41");
    expect(plan).toMatchObject({ kind: "round", round: 41 });
    expect(plan.kind === "round" && plan.winners.map((w) => w.title)).toEqual(["Xenogears", "Celeste"]);
  });

  it("falls back to the brand card without a round", () => {
    expect(planShareCard(WINDOW, null)).toEqual({ kind: "brand" });
    expect(planShareCard(WINDOW, "nope")).toEqual({ kind: "brand" });
  });

  it("falls back when the read failed (no winners)", () => {
    expect(planShareCard([], "42")).toEqual({ kind: "brand" });
  });

  it("falls back for a round the read doesn't have", () => {
    expect(planShareCard(WINDOW, "43")).toEqual({ kind: "brand" });
  });
});
