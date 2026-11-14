import { describe, expect, it } from "vitest";

import { previewSuggestion } from "@/lib/suggestions-preview";

describe("previewSuggestion", () => {
  it("shows the author's own Pending card with the types in the board's order", () => {
    const card = previewSuggestion({
      title: "  Dark mode for the bot  ",
      details: " Please ",
      types: ["Bug", "New Feature"],
      authorId: "42",
      authorName: "Ana",
    });
    expect(card).toMatchObject({
      title: "Dark mode for the bot",
      details: "Please",
      labels: "New Feature, Bug",
      status: "pending",
      created_by: "42",
      created_by_name: "Ana",
      upvote_count: 0,
      viewer_upvoted: false,
    });
  });

  it("holds the title's place and drops empty details before anything is typed", () => {
    const card = previewSuggestion({ title: " ", details: "", types: [], authorId: "1", authorName: "A" });
    expect(card.title).toBe("Your title goes here");
    expect(card.details).toBeNull();
    expect(card.labels).toBe("");
  });
});
