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
