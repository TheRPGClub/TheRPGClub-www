import type { SessionMembership } from "@/lib/auth-types";
import { describe, expect, it } from "vitest";

import { gameEditHref, gameEditTabNote, gameEditTabsFor, gameEditViewer, parseGameEditTab } from "./tabs";

const m = (flags: Partial<SessionMembership>): SessionMembership => ({
  admin: false,
  moderator: false,
  regular: false,
  member: false,
  newcomer: false,
  active: false,
  dev: false,
  longstanding: false,
  ...flags,
});

describe("Game Edit access", () => {
  it("gives Admins and Superadmins every tab", () => {
    for (const flags of [{ admin: true }, { dev: true }]) {
      const viewer = gameEditViewer(m(flags));
      expect(viewer).toEqual({ admin: true, threads: true });
      expect(gameEditTabsFor(viewer!)).toHaveLength(6);
    }
  });

  it("gives a Regular only Game Threads", () => {
    const viewer = gameEditViewer(m({ regular: true, member: true }));
    expect(viewer).toEqual({ admin: false, threads: true });
    expect(gameEditTabsFor(viewer!)).toEqual(["threads"]);
    expect(parseGameEditTab("text", viewer!)).toBe("threads");
  });

  it("shuts out a member and a signed-out viewer", () => {
    expect(gameEditViewer(m({ member: true }))).toBeNull();
    expect(gameEditViewer(null)).toBeNull();
  });

  it("reads ?tab= leniently and keeps the first tab out of the URL", () => {
    const admin = { admin: true, threads: true };
    expect(parseGameEditTab("releases", admin)).toBe("releases");
    expect(parseGameEditTab("nope", admin)).toBe("text");
    expect(gameEditHref(7, "text")).toBe("/games/7/edit");
    expect(gameEditHref(7, "hltb")).toBe("/games/7/edit?tab=hltb");
  });

  it("notes a tab's staged changes and a failed save", () => {
    expect(gameEditTabNote(2, false)).toEqual({ note: "2 staged", tone: "staged" });
    expect(gameEditTabNote(2, true)).toEqual({ note: "Didn't save", tone: "bad" });
    expect(gameEditTabNote(0, false)).toEqual({ note: "" });
  });
});
