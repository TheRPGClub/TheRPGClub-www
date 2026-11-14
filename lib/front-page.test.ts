import { describe, expect, it } from "vitest";

import type { PublicWinner, VotingCategory } from "@/lib/api/types";
import { coverLead, marqueeItems, trackShelf } from "./front-page";

const win = (round: number, kind: VotingCategory, id: number): PublicWinner => ({
  round_number: round,
  month_year: `m${round}`,
  kind,
  game_id: id,
  title: `t${id}`,
  cover_url: `c${id}`,
  art_url: null,
});

// The public window as the API sends it: newest round first, GOTM before
// NR-GOTM within a round (a tied round has two GOTMs).
const winners = [
  win(9, "nr_gotm", 91),
  win(9, "gotm", 90),
  win(9, "gotm", 92),
  win(8, "gotm", 80),
  win(8, "nr_gotm", 81),
  win(7, "gotm", 70),
];

describe("coverLead", () => {
  it("is the latest round's first GOTM, numbered by that round", () => {
    expect(coverLead(winners)).toEqual({ lead: winners[1], roundNumber: 9 });
  });

  it("is null without winners", () => {
    expect(coverLead([])).toBeNull();
  });

  it("is null when the latest round has no GOTM", () => {
    expect(coverLead([win(9, "nr_gotm", 91), win(8, "gotm", 80)])).toBeNull();
  });
});

describe("trackShelf", () => {
  it("takes one pick per round for the track, newest first", () => {
    expect(trackShelf(winners, "gotm").map((w) => w.game_id)).toEqual([90, 80, 70]);
    expect(trackShelf(winners, "nr_gotm").map((w) => w.game_id)).toEqual([91, 81]);
  });

  it("stops at five rounds", () => {
    const many = Array.from({ length: 8 }, (_, i) => win(20 - i, "gotm", i));
    expect(trackShelf(many, "gotm").map((w) => w.round_number)).toEqual([20, 19, 18, 17, 16]);
  });
});

describe("marqueeItems", () => {
  it("lists every GOTM, newest first", () => {
    expect(marqueeItems(winners)).toEqual([
      { key: "9-90", title: "t90", coverUrl: "c90", roundNumber: 9 },
      { key: "9-92", title: "t92", coverUrl: "c92", roundNumber: 9 },
      { key: "8-80", title: "t80", coverUrl: "c80", roundNumber: 8 },
      { key: "7-70", title: "t70", coverUrl: "c70", roundNumber: 7 },
    ]);
  });
});
