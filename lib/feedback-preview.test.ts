import { describe, expect, it } from "vitest";

import { previewFeedback } from "@/lib/feedback-preview";

describe("previewFeedback", () => {
  it("shows the author's own Pending card of the picked kind", () => {
    const card = previewFeedback({
      kind: "suggestion",
      title: "  Dark mode for the bot  ",
      details: " Please ",
      authorId: "42",
      authorName: "Ana",
    });
    expect(card).toMatchObject({
      kind: "suggestion",
      title: "Dark mode for the bot",
      details: "Please",
      status: "pending",
      done: false,
      created_by: "42",
      created_by_name: "Ana",
      upvote_count: 0,
      viewer_upvoted: false,
    });
  });

  it("holds the title's place and drops empty details before anything is typed", () => {
    const card = previewFeedback({ kind: null, title: " ", details: "", authorId: "1", authorName: "A" });
    expect(card.title).toBe("Your title goes here");
    expect(card.details).toBeNull();
    expect(card.kind).toBe("feature_request");
  });
});
