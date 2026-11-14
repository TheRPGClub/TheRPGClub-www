import { describe, expect, it } from "vitest";

import type { VotingRound } from "@/lib/api/types";
import { DAY_MS, rulerTicks } from "@/lib/voting-console";

const NOW = Date.parse("2026-11-14T12:00:00Z");
const at = (days: number) => new Date(NOW + days * DAY_MS).toISOString();
const round = (over: Partial<VotingRound>): VotingRound => ({
  round_number: 143,
  month_year: "December 2026",
  voting_opens_at: at(5),
  voting_closes_at: at(8),
  closed_at: null,
  decided_at: null,
  phase: "nominating",
  nominations_open: true,
  voting_open: false,
  voting_ended: false,
  pending_ties: {},
  ...over,
});
const summary = (ticks: ReturnType<typeof rulerTicks>) => ticks.map((t) => `${t.key}:${t.caption}:${t.tone}`);

describe("rulerTicks", () => {
  it("while nominating, marks the nominations opening and today; the pin stands for the vote", () => {
    expect(summary(rulerTicks(round({}), at(-20), NOW, false))).toEqual([
      "noms:Noms open:plain",
      expect.stringMatching(/^now:.+:now$/),
    ]);
  });

  it("while nominating with the pin where it was saved, shows the close too", () => {
    expect(summary(rulerTicks(round({}), null, NOW, true)).map((s) => s.split(":")[0])).toEqual(["closes", "now"]);
  });

  it("once voting has opened, marks the open and the close, and the runoff and decision when there are", () => {
    const r = round({
      phase: "decided",
      voting_opens_at: at(-9),
      voting_closes_at: at(-6),
      voting_ended: true,
      runoff_closes_at: at(-4),
      runoff_ended: true,
      decided_at: at(-3),
    });
    expect(summary(rulerTicks(r, at(-20), NOW, false))).toEqual([
      "noms:Noms open:plain",
      "opens:Vote opens:plain",
      "closes:Vote closed:plain",
      "runoff:Runoff closed:plain",
      "decided:Decided:plain",
      expect.stringMatching(/^now:.+:now$/),
    ]);
  });

  it("turns a point that falls today into the red Today tick instead of printing over it", () => {
    const r = round({ phase: "voting", voting_opens_at: at(-3), voting_closes_at: at(1), closed_at: at(0.1), voting_ended: true });
    const ticks = rulerTicks(r, null, NOW, false);
    expect(ticks.map((t) => [t.key, t.label, t.tone])).toEqual([
      ["opens", expect.any(String), "plain"],
      ["closes", "Today", "now"],
    ]);
  });
});
