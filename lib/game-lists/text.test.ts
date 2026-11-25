import { describe, expect, it } from "vitest";
import { addedTag, gamesCount, privateNote, updatedText } from "@/lib/game-lists/text";

const NOW = new Date("2026-11-24T15:00:00Z");

describe("updatedText", () => {
  it("counts days, then weeks, then names the date", () => {
    expect(updatedText("2026-11-24T01:00:00Z", NOW)).toBe("today");
    expect(updatedText("2026-11-23T23:00:00Z", NOW)).toBe("yesterday");
    expect(updatedText("2026-11-21T10:00:00Z", NOW)).toBe("3 days ago");
    expect(updatedText("2026-11-14T10:00:00Z", NOW)).toBe("1 week ago");
    expect(updatedText("2026-11-03T10:00:00Z", NOW)).toBe("3 weeks ago");
    expect(updatedText("2026-10-04T10:00:00Z", NOW)).toBe("4 Oct");
    expect(updatedText("2025-10-04T10:00:00Z", NOW)).toBe("4 Oct 2025");
  });
});

describe("addedTag", () => {
  it("says Today, else the short date", () => {
    expect(addedTag("2026-11-24T00:10:00Z", NOW)).toBe("Today");
    expect(addedTag("2026-11-03T00:10:00Z", NOW)).toBe("3 Nov");
  });
});

describe("gamesCount / privateNote", () => {
  it("words counts", () => {
    expect(gamesCount(1)).toBe("1 game");
    expect(gamesCount(0)).toBe("0 games");
  });
  it("tells the owner how many are Private", () => {
    const lists = [{ visibility: "private" as const }, { visibility: "members" as const }];
    expect(privateNote(lists, true)).toBe("1 Private, only you see it");
    expect(privateNote([...lists, ...lists], true)).toBe("2 Private, only you see them");
    expect(privateNote(lists.slice(1), true)).toBe("All seen by members");
    expect(privateNote(lists, false)).toBe("Members-visible lists");
  });
});
