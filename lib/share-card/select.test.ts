import { describe, expect, it } from "vitest";
import type { PublicWinner } from "@/lib/api/types";
import {
  latestDecidedRound,
  parseRound,
  planShareCard,
  roundWinners,
  shareCardImagePath,
  shareCardVersion,
} from "./select";

function winner(round: number, kind: PublicWinner["kind"], title: string): PublicWinner {
  return {
    round_number: round,
    month_year: "2026-11",
    kind,
    game_id: round * 10 + (kind === "gotm" ? 1 : 2),
    title,
    cover_url: `https://img.test/${title}.jpg`,
    art_url: kind === "gotm" ? `https://img.test/${title}-art.jpg` : null,
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
  it("carries the latest round and the version of its card", () => {
    const plan = planShareCard(WINDOW, "42");
    expect(plan.kind).toBe("round");
    if (plan.kind !== "round") return;
    expect(shareCardImagePath(WINDOW)).toBe(`/share-card?round=42&v=${plan.version}`);
  });

  it("changes when a round decided in steps gains its second winner", () => {
    const partial = WINDOW.filter((w) => w.kind === "gotm");
    expect(shareCardImagePath(partial)).toMatch(/^\/share-card\?round=42&v=\w+$/);
    expect(shareCardImagePath(partial)).not.toBe(shareCardImagePath(WINDOW));
  });

  it("changes when a winner gains a cover", () => {
    const coverless = WINDOW.map((w) => (w.title === "Hades" ? { ...w, cover_url: null } : w));
    expect(shareCardImagePath(coverless)).not.toBe(shareCardImagePath(WINDOW));
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
      {
        kind: "gotm",
        title: "Chrono Trigger",
        coverUrl: "https://img.test/Chrono Trigger.jpg",
        artUrl: "https://img.test/Chrono Trigger-art.jpg",
      },
      { kind: "nr_gotm", title: "Hades", coverUrl: "https://img.test/Hades.jpg", artUrl: null },
    ]);
  });

  it("leaves out a category with no winner", () => {
    expect(roundWinners([winner(7, "nr_gotm", "Hades")], 7)).toEqual([
      { kind: "nr_gotm", title: "Hades", coverUrl: "https://img.test/Hades.jpg", artUrl: null },
    ]);
  });
});

describe("shareCardVersion", () => {
  const issue = { round: 42, monthYear: "2026-11", latest: true };
  const picks = roundWinners(WINDOW, 42);

  it("is a short, stable token", () => {
    expect(shareCardVersion(issue, picks)).toMatch(/^[0-9a-z]{1,7}$/);
    expect(shareCardVersion(issue, picks)).toBe(shareCardVersion({ ...issue }, [...picks]));
  });

  it("follows the round no longer being the latest", () => {
    expect(shareCardVersion({ ...issue, latest: false }, picks)).not.toBe(shareCardVersion(issue, picks));
  });
});

describe("planShareCard", () => {
  it("draws the asked-for round", () => {
    const plan = planShareCard(WINDOW, "41");
    expect(plan).toMatchObject({ kind: "round", issue: { round: 41, monthYear: "2026-11", latest: false } });
    expect(plan.kind === "round" && plan.winners.map((w) => w.title)).toEqual(["Xenogears", "Celeste"]);
  });

  it("marks the latest decided round", () => {
    expect(planShareCard(WINDOW, "42")).toMatchObject({ kind: "round", issue: { latest: true } });
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
