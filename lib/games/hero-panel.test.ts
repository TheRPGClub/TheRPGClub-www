import { describe, expect, it } from "vitest";
import { latestMember } from "./hero-panel";

const user = (name: string) => ({ global_name: name, username: name.toLowerCase() }) as never;
const now = new Date("2026-11-23T12:00:00Z");

describe("latestMember", () => {
  it("names the member with the newest date, by day this year", () => {
    const entries = [
      { user_id: "1", user: user("Mara"), at: "2026-10-02T10:00:00Z" },
      { user_id: "2", user: user("Tavi"), at: "2026-11-20T10:00:00Z" },
      { user_id: "3", user: user("Jun"), at: null },
    ];
    expect(latestMember(entries, (e) => e.at, "day", now)).toEqual({ name: "Tavi", when: "20 Nov" });
  });

  it("adds the year to a day in another year", () => {
    const entries = [{ user_id: "1", user: user("Mara"), at: "2025-03-14T10:00:00Z" }];
    expect(latestMember(entries, (e) => e.at, "day", now)?.when).toBe("14 Mar 2025");
  });

  it("says month and year for the month style", () => {
    const entries = [{ user_id: "1", user: user("Rowan"), at: "2025-10-05T10:00:00Z" }];
    expect(latestMember(entries, (e) => e.at, "month", now)).toEqual({ name: "Rowan", when: "Oct 2025" });
  });

  it("is null without a readable date", () => {
    expect(latestMember([{ user_id: "1", at: "nope" }], (e) => e.at, "day", now)).toBeNull();
    expect(latestMember([], () => null, "day", now)).toBeNull();
  });
});
