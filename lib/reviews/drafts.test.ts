import { describe, expect, it } from "vitest";

import { draftCount, draftFirstLine, draftHref, draftLoss, draftOfGame, draftStateLabel, lastTouched, touchedAt } from "./drafts";

const NOW = Date.parse("2026-11-23T15:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const DAY = 24 * 60 * MIN;

describe("lastTouched", () => {
  it("reads minutes, hours, days, weeks, then the date", () => {
    expect(lastTouched(ago(20_000), NOW)).toBe("just now");
    expect(lastTouched(ago(12 * MIN), NOW)).toBe("12 min ago");
    expect(lastTouched(ago(3 * 60 * MIN), NOW)).toBe("3 h ago");
    expect(lastTouched(ago(DAY + MIN), NOW)).toBe("yesterday");
    expect(lastTouched(ago(3 * DAY), NOW)).toBe("3 days ago");
    expect(lastTouched(ago(8 * DAY), NOW)).toBe("last week");
    expect(lastTouched(ago(15 * DAY), NOW)).toBe("2 weeks ago");
    expect(lastTouched("2026-03-01T10:00:00Z", NOW)).toBe("1 Mar 2026");
  });

  it("reads nothing for a time it can't parse", () => {
    expect(lastTouched("nope", NOW)).toBe("");
  });
});

describe("touchedAt", () => {
  it("is the exact time in UTC", () => {
    expect(touchedAt("2026-11-23T14:02:00Z")).toBe("23 Nov 2026, 14:02 UTC");
  });
});

describe("draftFirstLine", () => {
  it("takes the story's first non-blank line", () => {
    const body = [
      { type: "p", children: [{ text: "  " }] },
      { type: "p", children: [{ text: "The parry window is the whole game." }] },
      { type: "p", children: [{ text: "Second line." }] },
    ];
    expect(draftFirstLine({ body, title: "Ignored" })).toBe("The parry window is the whole game.");
  });

  it("falls back to the title, then to nothing", () => {
    expect(draftFirstLine({ body: null, title: "Just one more run" })).toBe("Just one more run");
    expect(draftFirstLine({ body: null, title: "  " })).toBeNull();
    expect(draftFirstLine({ body: null })).toBeNull();
  });

  it("reads an imported body too", () => {
    expect(draftFirstLine({ body: { summary: "Old take" }, title: null })).toBe("Old take");
  });
});

describe("draftOfGame", () => {
  const drafts = [
    { gamedb_game_id: 3, kind: "revision" as const },
    { gamedb_game_id: 7, kind: "review" as const },
  ];
  it("finds the viewer's Draft Review of the game", () => {
    expect(draftOfGame(drafts, 7)).toBe(drafts[1]);
  });
  it("ignores a Draft Revision and other games", () => {
    expect(draftOfGame(drafts, 3)).toBeNull();
    expect(draftOfGame(drafts, 9)).toBeNull();
  });
});

describe("draftCount", () => {
  it("counts drafts", () => {
    expect(draftCount(1)).toBe("1 draft");
    expect(draftCount(6)).toBe("6 drafts");
  });
});

describe("draftLoss", () => {
  it("names what goes", () => {
    const body = [{ type: "p", children: [{ text: "abcd" }] }];
    expect(draftLoss({ rating: 80, facets: null, body })).toBe("Its score and 4 characters go with it.");
    expect(draftLoss({ rating: null, facets: null, body: null })).toBe("It has nothing in it yet.");
  });
});

describe("Draft Revisions in the pile", () => {
  it("continue on their Review's page under ?revisit", () => {
    expect(draftHref({ review_id: 4, kind: "revision" })).toBe("/reviews/4?revisit=1");
    expect(draftHref({ review_id: 4, kind: "review" })).toBe("/reviews/4");
  });

  it("read Revisiting with the score they would replace", () => {
    expect(draftStateLabel({ kind: "revision", previous_rating: 72 })).toBe("Revisiting · was 72");
    expect(draftStateLabel({ kind: "revision", previous_rating: null })).toBe("Revisiting");
    expect(draftStateLabel({ kind: "review", previous_rating: null })).toBe("Draft");
  });
});
