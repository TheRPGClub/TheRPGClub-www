import { describe, expect, it } from "vitest";

import { viewerOnGame } from "@/lib/games/viewer";

const game = {
  now_playing: [{ user_id: "p1" }],
  completions: [{ user_id: "c1" }, { user_id: "p1" }],
};

describe("viewerOnGame", () => {
  it("lets a member playing the game write a review, playing first", () => {
    expect(viewerOnGame(game, "p1")).toEqual({
      ownerId: "p1",
      isPlaying: true,
      hasCompleted: true,
      canWriteReview: true,
      status: "playing",
    });
  });

  it("lets a member who finished it write a review", () => {
    expect(viewerOnGame(game, "c1")).toMatchObject({ canWriteReview: true, status: "completed" });
  });

  it("keeps the review closed to a member who has neither", () => {
    expect(viewerOnGame(game, "x")).toMatchObject({ canWriteReview: false, status: null });
  });

  it("has no standing for a signed-out viewer or a game without lists", () => {
    expect(viewerOnGame(game, null)).toMatchObject({ ownerId: null, canWriteReview: false });
    expect(viewerOnGame({}, "p1")).toMatchObject({ isPlaying: false, hasCompleted: false });
  });
});
