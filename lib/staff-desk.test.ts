import { describe, expect, it } from "vitest";

import type { BotJob } from "@/lib/api/types";
import { staffDeskFor } from "@/lib/staff";
import { deskNotes, deskReach, upcomingNote, type DeskReadings } from "@/lib/staff-desk";

const superadmin = staffDeskFor({ dev: true } as never);

const NONE: DeskReadings = {
  round: null,
  pendingSuggestions: null,
  nowPlaying: null,
  presenceCount: null,
  upcomingLiveEvents: null,
  jobs: [],
};

const now = new Date("2026-11-14T12:00:00Z");

function job(over: Partial<BotJob>): BotJob {
  return {
    id: 1,
    kind: "memberscan",
    summary: "",
    status: "done",
    requested_by_user_id: null,
    attempts: 1,
    error_message: null,
    claimed_at: null,
    finished_at: null,
    created_at: "2026-11-14T11:00:00Z",
    updated_at: "2026-11-14T11:00:00Z",
    ...over,
  } as BotJob;
}

describe("deskNotes", () => {
  it("leaves every tool on its own hint when nothing was read", () => {
    expect(deskNotes(superadmin, NONE, now)).toEqual({});
  });

  it("notes the voting round live, the pending queue, presence and live events", () => {
    const notes = deskNotes(
      superadmin,
      {
        ...NONE,
        round: { round_number: 143, phase: "voting" },
        pendingSuggestions: 4,
        nowPlaying: "Chrono Trigger",
        presenceCount: 12,
        upcomingLiveEvents: "20+",
      },
      now,
    );
    expect(notes.voting).toEqual({ text: "Round 143 open", tone: "live" });
    expect(notes.suggestions).toEqual({ text: "4 pending" });
    expect(notes.presence).toEqual({ text: "Chrono Trigger" });
    expect(notes["presence-history"]).toEqual({ text: "12 set" });
    expect(notes["live-events"]).toEqual({ text: "20+ upcoming" });
  });

  it("names the round's phase as the desk says it", () => {
    const note = (phase: "nominating" | "tie" | "decided") =>
      deskNotes(superadmin, { ...NONE, round: { round_number: 9, phase } }, now).voting?.text;
    expect(note("nominating")).toBe("Round 9 nominations");
    expect(note("tie")).toBe("Round 9 tie break");
    expect(note("decided")).toBe("Round 9 decided");
  });

  it("cuts a long presence to fifteen characters and an ellipsis", () => {
    const notes = deskNotes(superadmin, { ...NONE, nowPlaying: "The Legend of Zelda: Tears" }, now);
    expect(notes.presence).toEqual({ text: "The Legend of Z..." });
    const sixteen = deskNotes(superadmin, { ...NONE, nowPlaying: "Sixteen chars ok" }, now);
    expect(sixteen.presence).toEqual({ text: "Sixteen chars ok" });
  });

  it("marks a tool whose latest bot job failed, over any other note", () => {
    const notes = deskNotes(
      superadmin,
      {
        ...NONE,
        jobs: [job({ kind: "memberscan", status: "failed", finished_at: "2026-11-14T10:00:00Z" })],
      },
      now,
    );
    expect(notes.memberscan).toEqual({ text: "Failed 2 h ago", tone: "bad" });
  });

  it("leaves a tool alone when its latest job went through", () => {
    const notes = deskNotes(
      superadmin,
      {
        ...NONE,
        jobs: [job({ id: 2, status: "done" }), job({ id: 1, status: "failed" })],
      },
      now,
    );
    expect(notes.memberscan).toBeUndefined();
  });
});

describe("upcomingNote", () => {
  it("counts upcoming events, or says 20+ when every one read is upcoming", () => {
    expect(upcomingNote(3, 20)).toBe("3");
    expect(upcomingNote(0, 20)).toBe("0");
    expect(upcomingNote(20, 20)).toBe("20+");
  });
});

describe("deskReach", () => {
  it("says what each tier's desk reaches", () => {
    expect(deskReach("superadmin")).toBe(" · Admins see all but Superadmin");
    expect(deskReach("admin")).toBe(" · All but Superadmin");
    expect(deskReach("moderator")).toBe("");
  });
});
