import { describe, expect, it } from "vitest";
import { panelFacts } from "@/lib/challenges/edition-panel";
import type { ChallengeEdition } from "@/lib/challenges/types";

const edition = (extra: Partial<ChallengeEdition> = {}): ChallengeEdition => ({
  id: 7,
  year: 2026,
  phase: "signup",
  challenge: { id: 2, name: "Secret Santa" },
  signup_opens_on: "2025-12-26",
  signup_cutoff_on: "2026-12-01",
  pick_deadline_on: "2026-12-15",
  reveal_on: "2026-12-25",
  ends_on: "2027-12-25",
  signup_open: true,
  signed_up_count: 11,
  signed_up: false,
  members: [
    { user_id: "1", username: "owl", global_name: "Night Owl", left_out: false, withdrawn: false },
    { user_id: "2", username: "coop", global_name: "Couch Co-op", left_out: true, withdrawn: false },
  ],
  ...extra,
});

describe("panelFacts", () => {
  it("counts down to the cutoff during sign-up", () => {
    expect(panelFacts(edition(), "2026-11-17")).toEqual({
      label: "Sign-up closes Tue 1 Dec",
      big: 14,
      caption: "days to sign up",
      lines: ["11 signed up so far. You need at least 5 games in your backlog, now and at the draw."],
    });
  });

  it("says the draw is due once sign-up has closed", () => {
    expect(panelFacts(edition({ signup_open: false }), "2026-12-01")).toMatchObject({
      label: "Sign-up closed",
      big: null,
      lines: ["11 signed up. The draw happens today."],
    });
  });

  it("counts down to the pick deadline, naming who the draw left out", () => {
    expect(panelFacts(edition({ phase: "picking" }), "2026-12-08")).toEqual({
      label: "Picks due Tue 15 Dec",
      big: 7,
      caption: "days to pick",
      lines: ["1 in the draw.", "Couch Co-op was left out: under 5 games in their backlog at the draw."],
    });
  });

  it("counts down to the reveal once the picks are in", () => {
    expect(panelFacts(edition({ phase: "picking" }), "2026-12-20")).toMatchObject({
      label: "Revealed Fri 25 Dec",
      big: 5,
      caption: "days to the reveal",
    });
  });

  it("gives the year to Clear after the reveal, and the tally at the end", () => {
    expect(panelFacts(edition({ phase: "revealed", assignments: [] }), "2027-03-03")).toEqual({
      label: "Revealed Fri 25 Dec 2026",
      big: 0,
      caption: "Finished · 0 In Progress",
      lines: ["Every member has until Sat 25 Dec to Clear their game. Santas are revealed then."],
    });
    expect(panelFacts(edition({ phase: "ended", assignments: [] }), "2027-12-26")).toMatchObject({
      label: "Ended Sat 25 Dec",
      big: null,
      caption: "0 Finished · 0 Expired",
    });
  });

  it("explains a cancelled Edition", () => {
    expect(panelFacts(edition({ phase: "cancelled" }), "2026-12-02").lines[0]).toMatch(/Fewer than 2 members/);
  });
});
