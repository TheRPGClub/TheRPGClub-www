import { describe, expect, it } from "vitest";

import type { Game, JournaledGame } from "@/lib/api/types";
import { bannerArt, journalPreview } from "@/lib/members/profile-page";

const game = (game_id: number, art_url: string | null) => ({ game_id, art_url }) as Game;

describe("bannerArt", () => {
  it("is the member's #1 favorite's art, else the first game they're playing with art", () => {
    expect(bannerArt([{ game: game(1, "fav.jpg") }], [{ game: game(2, "now.jpg") }])).toBe("fav.jpg");
    expect(
      bannerArt(
        [{ game: game(1, null) }, { game: game(3, "second.jpg") }],
        [{ game: null }, { game: game(2, "now.jpg") }],
      ),
    ).toBe("now.jpg");
  });

  it("is null with no pick", () => {
    expect(bannerArt([], [{ game: game(2, null) }])).toBeNull();
  });
});

describe("journalPreview", () => {
  const row = (g: Game | null) => ({ game: g, entry_count: 1, last_entry_at: null }) as JournaledGame;

  it("is the profile's newest chapters that name a game, and the chapter tally", () => {
    const user = { journal: [row(game(1, null)), row(null)] };
    expect(journalPreview(user, 7)).toEqual({ rows: [row(game(1, null))], chapters: 7 });
    expect(journalPreview(user, undefined).chapters).toBe(1);
    expect(journalPreview({}, undefined)).toEqual({ rows: [], chapters: 0 });
  });
});
