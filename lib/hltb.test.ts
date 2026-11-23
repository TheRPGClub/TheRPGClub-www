import { describe, expect, it } from "vitest";

import { hltbFailureKind, hltbForceBlockedUntil, hltbSearchAgainLabel } from "./hltb";

// A forced HowLongToBeat search (spec api#437): members may force one per
// game once every 30 days; the API says when on the saved times.
describe("hltbForceBlockedUntil", () => {
  const now = new Date("2026-11-23T12:00:00Z");

  it("is the next forced search date while it is still ahead", () => {
    expect(hltbForceBlockedUntil({ next_forced_search_at: "2026-12-12T15:00:00Z" }, now)).toBe(
      "2026-12-12T15:00:00Z",
    );
  });

  it("is null when a forced search is allowed now", () => {
    expect(hltbForceBlockedUntil({ next_forced_search_at: null }, now)).toBeNull();
    expect(hltbForceBlockedUntil({ next_forced_search_at: "2026-11-20T00:00:00Z" }, now)).toBeNull();
    expect(hltbForceBlockedUntil({}, now)).toBeNull();
  });

  it("ignores a date it can't read", () => {
    expect(hltbForceBlockedUntil({ next_forced_search_at: "soon" }, now)).toBeNull();
  });
});

describe("hltbSearchAgainLabel", () => {
  it("names the day in the club's time zone", () => {
    expect(hltbSearchAgainLabel("2026-12-12T15:00:00Z")).toBe("Can search again on 12 Dec");
    // 03:00 UTC is still the 12th in New York.
    expect(hltbSearchAgainLabel("2026-12-13T03:00:00Z")).toBe("Can search again on 12 Dec");
  });
});

describe("hltbFailureKind", () => {
  it("reads a forced search inside the interval as too soon", () => {
    expect(hltbFailureKind(429, "hltb_search_too_soon")).toBe("too_soon");
    expect(hltbFailureKind(429, undefined)).toBe("too_soon");
  });
});
