import { describe, expect, it } from "vitest";

import { reviewHref } from "@/lib/reviews/href";

describe("reviewHref", () => {
  it("points at the review's own page", () => {
    expect(reviewHref(42)).toBe("/reviews/42");
  });

  it("opens the editor with ?edit", () => {
    expect(reviewHref(42, { edit: true })).toBe("/reviews/42?edit=1");
    expect(reviewHref(42, { edit: false })).toBe("/reviews/42");
  });
});

describe("reviewHref for Revisions", () => {
  it("edits a Published Revision with ?revision", () => {
    expect(reviewHref(42, { revision: 7 })).toBe("/reviews/42?revision=7");
  });

  it("opens the Draft Revision with ?revisit", () => {
    expect(reviewHref(42, { revisit: true })).toBe("/reviews/42?revisit=1");
  });

  it("points at a Revision's stop", () => {
    expect(reviewHref(42, { take: 7 })).toBe("/reviews/42#revision-7");
  });
});
