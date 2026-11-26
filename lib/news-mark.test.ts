import { describe, expect, it } from "vitest";
import {
  beaconEligible,
  followVisit,
  isIsoInstant,
  isLater,
  newestListedAt,
  newestShown,
  readNewsMarkBeacon,
  shouldSendMark,
} from "./news-mark";

// An item listed (and posted) at `listed_at`; `posted_at` differs only when
// a test says so.
const at = (listed_at: string, posted_at = listed_at) => ({ listed_at, posted_at });
const catchup = { page: 1, since: null };

describe("isLater", () => {
  it("compares instants across offsets", () => {
    expect(isLater("2026-11-26T10:00:00+01:00", "2026-11-26T08:59:59Z")).toBe(true);
    expect(isLater("2026-11-26T08:59:59Z", "2026-11-26T10:00:00+01:00")).toBe(false);
  });

  it("tells microseconds apart within one millisecond", () => {
    expect(isLater("2026-11-26T09:00:00.123457Z", "2026-11-26T09:00:00.123456Z")).toBe(true);
    expect(isLater("2026-11-26T09:00:00.123Z", "2026-11-26T09:00:00.123000Z")).toBe(false);
  });
});

describe("newestListedAt", () => {
  it("returns the newest listed_at exactly as given", () => {
    const items = [at("2026-11-25T09:00:00.000Z"), at("2026-11-26T09:00:00.123456Z"), at("2026-11-24T09:00:00Z")];
    expect(newestListedAt(items)).toBe("2026-11-26T09:00:00.123456Z");
  });

  it("goes by listed_at, not posted_at: an item recorded late is the newest", () => {
    const late = at("2026-11-26T12:00:00.000001Z", "2026-11-20T09:00:00.000Z");
    expect(newestListedAt([at("2026-11-26T10:00:00.000000Z"), late])).toBe("2026-11-26T12:00:00.000001Z");
  });

  it("is null with nothing, and skips junk and items from an API without listed_at", () => {
    expect(newestListedAt([])).toBeNull();
    expect(newestListedAt([at("yesterday")])).toBeNull();
    const olderApi: { posted_at: string; listed_at?: string | null }[] = [
      { posted_at: "2026-11-26T09:00:00Z" },
      { posted_at: "2026-11-26T09:00:00Z", listed_at: null },
    ];
    expect(newestListedAt(olderApi)).toBeNull();
  });
});

describe("newestShown", () => {
  const top = [at("2026-11-26T12:00:00.000Z"), at("2026-11-26T11:00:00.000Z"), at("2026-11-26T10:00:00.000Z")];
  const seen = [at("2026-11-26T08:00:00.000Z"), at("2026-11-25T08:00:00.000Z")];
  const meta = { news_mark: "2026-11-26T09:00:00.000000Z", new_count: 3 };

  it("is the hero when there are new items", () => {
    expect(newestShown(meta, top, seen, catchup)).toBe("2026-11-26T12:00:00.000Z");
  });

  it("is the newest Seen row's hero when caught up", () => {
    const caughtUp = { news_mark: "2026-11-26T12:00:00.000000Z", new_count: 0 };
    expect(newestShown(caughtUp, top, top, catchup)).toBe("2026-11-26T12:00:00.000Z");
  });

  it("is the newest of the whole view on a first visit", () => {
    expect(newestShown({ news_mark: null, new_count: 0 }, top, top, catchup)).toBe("2026-11-26T12:00:00.000Z");
  });

  it("is the newest row on a later page (no hero or mosaic there)", () => {
    expect(newestShown(meta, top, seen, { page: 2, since: null })).toBe("2026-11-26T08:00:00.000Z");
  });

  it("is the newest of the page's new items on Show all", () => {
    expect(newestShown(null, null, top, { page: 1, since: meta.news_mark })).toBe("2026-11-26T12:00:00.000Z");
  });

  it("is null when nothing was shown", () => {
    expect(newestShown(meta, [], [], catchup)).toBeNull();
  });
});

describe("beaconEligible", () => {
  const view = { categories: [] as string[], q: "", page: 1, since: null as string | null };

  it("is the unfiltered Catch-up page one and every unfiltered Show all page", () => {
    expect(beaconEligible(view)).toBe(true);
    expect(beaconEligible({ ...view, since: "2026-11-26T09:00:00Z" })).toBe(true);
    expect(beaconEligible({ ...view, since: "2026-11-26T09:00:00Z", page: 3 })).toBe(true);
  });

  it("is never a filtered or searched view, nor a later page of Seen rows", () => {
    expect(beaconEligible({ ...view, categories: ["releases"] })).toBe(false);
    expect(beaconEligible({ ...view, q: "zelda" })).toBe(false);
    expect(beaconEligible({ ...view, q: "zelda", since: "2026-11-26T09:00:00Z" })).toBe(false);
    expect(beaconEligible({ ...view, page: 2 })).toBe(false);
  });
});

describe("followVisit", () => {
  const mark = "2026-11-26T09:00:00.000000Z";

  it("starts a visit with what the first view showed", () => {
    expect(followVisit(null, mark, "2026-11-26T10:00:00.000000Z")).toEqual({
      mark,
      newest: "2026-11-26T10:00:00.000000Z",
      sent: null,
    });
  });

  it("only moves forward within a visit", () => {
    const visit = followVisit(null, mark, "2026-11-26T11:00:00.000000Z");
    expect(followVisit(visit, mark, "2026-11-26T10:00:00.000000Z").newest).toBe("2026-11-26T11:00:00.000000Z");
    expect(followVisit(visit, mark, null).newest).toBe("2026-11-26T11:00:00.000000Z");
    expect(followVisit(visit, mark, "2026-11-26T12:00:00.000000Z").newest).toBe("2026-11-26T12:00:00.000000Z");
  });

  it("keeps what was sent within a visit, and starts over on a new visit (another mark)", () => {
    const visit = { mark, newest: "2026-11-26T11:00:00.000000Z", sent: "2026-11-26T11:00:00.000000Z" };
    expect(followVisit(visit, mark, null).sent).toBe("2026-11-26T11:00:00.000000Z");
    expect(followVisit(visit, "2026-11-26T11:00:00.000000Z", null)).toEqual({
      mark: "2026-11-26T11:00:00.000000Z",
      newest: null,
      sent: null,
    });
  });
});

describe("shouldSendMark", () => {
  const mark = "2026-11-26T09:00:00.000000Z";

  it("sends a newer item, once", () => {
    expect(shouldSendMark("2026-11-26T10:00:00.000Z", mark, null)).toBe(true);
    expect(shouldSendMark("2026-11-26T10:00:00.000Z", mark, "2026-11-26T10:00:00.000Z")).toBe(false);
  });

  it("sends on a first visit (no mark)", () => {
    expect(shouldSendMark("2026-11-26T08:00:00.000Z", null, null)).toBe(true);
  });

  it("sends nothing that wouldn't move the mark", () => {
    expect(shouldSendMark("2026-11-26T09:00:00.000Z", mark, null)).toBe(false);
    expect(shouldSendMark("2026-11-26T08:00:00.000Z", mark, null)).toBe(false);
    expect(shouldSendMark(null, mark, null)).toBe(false);
  });
});

describe("readNewsMarkBeacon", () => {
  it("takes an ISO instant", () => {
    expect(readNewsMarkBeacon({ news_mark: "2026-11-26T09:00:00.123Z" })).toEqual({
      news_mark: "2026-11-26T09:00:00.123Z",
    });
    expect(isIsoInstant("2026-11-26T09:00:00+00:00")).toBe(true);
  });

  it("refuses anything else", () => {
    expect(readNewsMarkBeacon(null)).toBeNull();
    expect(readNewsMarkBeacon({})).toBeNull();
    expect(readNewsMarkBeacon({ news_mark: 1764147600 })).toBeNull();
    expect(readNewsMarkBeacon({ news_mark: "2026-11-26" })).toBeNull();
    expect(readNewsMarkBeacon({ news_mark: "2026-13-45T09:00:00Z" })).toBeNull();
  });
});
