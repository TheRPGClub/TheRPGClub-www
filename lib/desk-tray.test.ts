import { describe, expect, it } from "vitest";

import type { BotJob, VotingRound } from "@/lib/api/types";
import { trayCards, type TrayReadings } from "@/lib/desk-tray";

const now = new Date("2026-11-23T12:00:00Z");
const NONE: TrayReadings = { round: null, pending: null, jobs: [], events: null };

const round = (over: Partial<VotingRound>) =>
  ({
    round_number: 143,
    voting_opens_at: "2026-11-21T00:00:00Z",
    voting_closes_at: "2026-11-28T17:00:00Z",
    phase: "voting",
    ...over,
  }) as VotingRound;

const failed = (over: Partial<BotJob>) =>
  ({ id: 1, kind: "memberscan", status: "failed", finished_at: "2026-11-23T11:00:00Z", updated_at: "2026-11-23T11:00:00Z", ...over }) as BotJob;

describe("trayCards", () => {
  it("is empty on a quiet day", () => {
    expect(trayCards(NONE, now)).toEqual([]);
  });

  it("puts an open vote first, in yellow, with its close date", () => {
    const [card] = trayCards({ ...NONE, round: round({}) }, now);
    expect(card).toMatchObject({ key: "round", numeral: "143", title: "Voting is open", tone: "open", href: "/admin/voting" });
    expect(card.line).toBe("Round 143 · closes Sat 28 Nov");
  });

  it("names nominations and ties, and leaves a closed round out", () => {
    expect(trayCards({ ...NONE, round: round({ phase: "nominating" }) }, now)[0].title).toBe("Nominations are open");
    expect(trayCards({ ...NONE, round: round({ phase: "tie" }) }, now)[0].line).toBe("Round 143");
    expect(trayCards({ ...NONE, round: round({ phase: "decided" }) }, now)).toEqual([]);
  });

  it("counts pending Feedback, with the oldest only when every one was read", () => {
    const all = trayCards({ ...NONE, pending: { total: 2, createdAt: ["2026-11-20T09:00:00Z", "2026-11-22T09:00:00Z"] } }, now);
    expect(all[0]).toMatchObject({ numeral: "2", title: "Feedback pending", line: "Oldest from Fri 20 Nov" });
    const some = trayCards({ ...NONE, pending: { total: 9, createdAt: ["2026-11-22T09:00:00Z"] } }, now);
    expect(some[0].line).toBeNull();
    expect(trayCards({ ...NONE, pending: { total: 0, createdAt: [] } }, now)).toEqual([]);
  });

  it("counts recent failures only, naming the newest", () => {
    const cards = trayCards(
      { ...NONE, jobs: [failed({}), failed({ id: 2, kind: "say", finished_at: "2026-11-01T00:00:00Z" })] },
      now,
    );
    expect(cards).toEqual([
      expect.objectContaining({ key: "failed", numeral: "1", title: "Bot job failed", line: "Recount members · 1 h ago", href: null, tone: "bad" }),
    ]);
  });

  it("counts live events not yet over, naming the next or one on now", () => {
    const events = [
      { starts_at: "2026-11-29T01:00:00Z", ends_at: "2026-11-29T03:00:00Z" },
      { starts_at: "2026-11-25T01:00:00Z", ends_at: "2026-11-25T03:00:00Z" },
      { starts_at: "2026-11-01T01:00:00Z", ends_at: "2026-11-01T03:00:00Z" },
    ];
    const [card] = trayCards({ ...NONE, events }, now);
    expect(card).toMatchObject({ key: "live", numeral: "2", title: "Live events coming" });
    expect(card.line).toBe("Next: Tue 24 Nov, 20:00 EST");
    const onNow = trayCards({ ...NONE, events: [{ starts_at: "2026-11-23T11:00:00Z", ends_at: "2026-11-23T13:00:00Z" }] }, now);
    expect(onNow[0].line).toBe("One is on now");
  });
});
