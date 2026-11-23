import { describe, expect, it } from "vitest";

import type { ReviewRevision } from "@/lib/api/types";
import { reviewPageMode } from "@/lib/reviews/review-page";

const rev = (id: number, published: boolean) =>
  ({ revision_id: id, published_at: published ? "2025-03-02T00:00:00Z" : null }) as ReviewRevision;
const published = { published_at: "2024-11-12T00:00:00Z", revisions: [rev(5, true)], draft_revision: null };

describe("reviewPageMode", () => {
  it("reads for anyone but the author", () => {
    expect(reviewPageMode(published, { edit: "1" }, false)).toEqual({ kind: "read" });
  });

  it("opens a Draft straight in the desk", () => {
    expect(reviewPageMode({ published_at: null }, {}, true)).toEqual({ kind: "review" });
  });

  it("edits the first take under ?edit", () => {
    expect(reviewPageMode(published, { edit: "1" }, true)).toEqual({ kind: "review" });
  });

  it("edits a Published Revision under ?revision", () => {
    expect(reviewPageMode(published, { revision: "5" }, true)).toEqual({ kind: "revision", revision: rev(5, true) });
    expect(reviewPageMode(published, { revision: "9" }, true)).toEqual({ kind: "read" });
  });

  it("opens the Draft Revision under ?revisit, or starts one", () => {
    expect(reviewPageMode(published, { revisit: "1" }, true)).toEqual({ kind: "start-revisit" });
    const withDraft = { ...published, draft_revision: rev(6, false) };
    expect(reviewPageMode(withDraft, { revisit: "1" }, true)).toEqual({ kind: "revision", revision: rev(6, false) });
  });
});
