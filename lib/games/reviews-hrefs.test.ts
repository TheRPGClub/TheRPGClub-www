import { describe, expect, it } from "vitest";

import { reviewsPageHrefs } from "@/lib/games/reviews-hrefs";

describe("reviewsPageHrefs", () => {
  it("keeps page one bare", () => {
    const hrefs = reviewsPageHrefs(7, 1);
    expect(hrefs.list(1)).toBe("/games/7/reviews");
    expect(hrefs.reader(42)).toBe("/games/7/reviews?review=42");
    expect(hrefs.compose).toBe("/games/7/reviews?compose=1#compose");
  });

  it("opens the reader and the composer from the page they came from", () => {
    const hrefs = reviewsPageHrefs(7, 3);
    expect(hrefs.list(3)).toBe("/games/7/reviews?page=3");
    expect(hrefs.reader(42)).toBe("/games/7/reviews?page=3&review=42");
    expect(hrefs.reader(42, 1)).toBe("/games/7/reviews?review=42");
    expect(hrefs.compose).toBe("/games/7/reviews?page=3&compose=1#compose");
  });
});
