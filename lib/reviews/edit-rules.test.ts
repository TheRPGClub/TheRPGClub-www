import { describe, expect, it } from "vitest";

import { editedAt, isScoreLocked, scoreLockReason, scoreLocksAt } from "./edit-rules";

const PUBLISHED = "2025-03-12T10:00:00Z";
const at = (iso: string) => Date.parse(iso);

describe("scoreLocksAt", () => {
  it("is null on a Draft", () => {
    expect(scoreLocksAt({ published_at: null })).toBeNull();
  });

  it("reads the API's score_locks_at when served", () => {
    expect(scoreLocksAt({ published_at: PUBLISHED, score_locks_at: "2025-03-19T10:00:00Z" })).toBe(
      at("2025-03-19T10:00:00Z"),
    );
  });

  it("derives 7 days after publishing otherwise", () => {
    expect(scoreLocksAt({ published_at: PUBLISHED })).toBe(at("2025-03-19T10:00:00Z"));
  });
});

describe("isScoreLocked", () => {
  const review = { published_at: PUBLISHED, score_locks_at: "2025-03-19T10:00:00Z" };

  it("leaves the score open inside the 7 days", () => {
    expect(isScoreLocked(review, at("2025-03-15T00:00:00Z"))).toBe(false);
    expect(isScoreLocked(review, at("2025-03-19T10:00:00Z"))).toBe(false);
  });

  it("locks it once the 7 days are past", () => {
    expect(isScoreLocked(review, at("2025-03-19T10:00:01Z"))).toBe(true);
  });

  it("never locks a Draft", () => {
    expect(isScoreLocked({ published_at: null }, at("2030-01-01T00:00:00Z"))).toBe(false);
  });
});

describe("scoreLockReason", () => {
  it("names the day it locked", () => {
    expect(scoreLockReason(at("2025-03-19T10:00:00Z"))).toBe(
      "A score can change for 7 days after publishing. This one locked on 19 Mar 2025. A new score is a Revision.",
    );
  });

  it("still gives the reason without a date", () => {
    expect(scoreLockReason(null)).toContain("This one has locked.");
  });
});

describe("editedAt", () => {
  it("is null when never edited", () => {
    expect(editedAt({ published_at: PUBLISHED, edited_at: null })).toBeNull();
  });

  it("ignores an edit inside the first hour", () => {
    expect(editedAt({ published_at: PUBLISHED, edited_at: "2025-03-12T10:59:00Z" })).toBeNull();
  });

  it("shows an edit past the hour", () => {
    expect(editedAt({ published_at: PUBLISHED, edited_at: "2025-12-03T09:00:00Z" })).toBe(
      "2025-12-03T09:00:00Z",
    );
  });

  it("is null on a Draft", () => {
    expect(editedAt({ published_at: null, edited_at: "2025-12-03T09:00:00Z" })).toBeNull();
  });
});
