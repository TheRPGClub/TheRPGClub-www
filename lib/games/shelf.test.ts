import { describe, expect, it } from "vitest";

import type { GameCollection, GameCompletion, UserBacklog, UserFavorite, UserNowPlaying } from "@/lib/api/types";
import { EMPTY_SHELF, nextStep, shelfChips, shelfRows, withoutList, type GameShelf, type ShelfShown } from "./shelf";

const ALL: ShelfShown = { now_playing: true, completed: true, backlog: true, favorite: true, collection: true };

const playing = { entry_id: 7, user_id: "u", gamedb_game_id: 1, platform_id: 3, added_at: "2026-11-09T00:00:00Z", note: null, sort_order: 1, note_updated_at: null } as UserNowPlaying;
const completion = (id: number, completedAt: string | null): GameCompletion =>
  ({ completion_id: id, user_id: "u", gamedb_game_id: 1, platform_id: null, note: null, completion_type: "Main Story", completed_at: completedAt, final_playtime_hrs: null, created_at: "2020-01-01" }) as GameCompletion;
const backlog = { backlog_id: 4, user_id: "u", gamedb_game_id: 1, platform_id: null, note: null } as UserBacklog;
const favorite = { entry: { favorite_id: 5 } as UserFavorite, rank: 2, of: 10 };
const collection = { collection_id: 6, user_id: "u", gamedb_game_id: 1, platform_id: 3, ownership_type: "Physical", note: null } as GameCollection;

const shelf = (over: Partial<GameShelf>): GameShelf => ({ ...EMPTY_SHELF, ...over });

describe("nextStep", () => {
  it("offers Start playing on a game on none of the lists", () => {
    expect(nextStep(EMPTY_SHELF, ALL)).toEqual({ list: "now_playing", mode: "add", label: "Start playing" });
  });

  it("offers Log a completion while the game is in Now Playing", () => {
    expect(nextStep(shelf({ nowPlaying: playing }), ALL)).toEqual({ list: "completed", mode: "log", label: "Log a completion" });
  });

  it("still offers Log a completion while playing a game finished before", () => {
    expect(nextStep(shelf({ nowPlaying: playing, completions: [completion(1, "2019-03-14")] }), ALL).label).toBe("Log a completion");
  });

  it("offers Log another completion on a finished game no longer played", () => {
    expect(nextStep(shelf({ completions: [completion(1, "2019-03-14")] }), ALL)).toEqual({
      list: "completed",
      mode: "log",
      label: "Log another completion",
    });
  });

  it("ignores the other lists", () => {
    expect(nextStep(shelf({ backlog, favorite, collection }), ALL).label).toBe("Start playing");
  });

  it("offers Log a completion when Now Playing is hidden", () => {
    expect(nextStep(EMPTY_SHELF, { ...ALL, now_playing: false }).label).toBe("Log a completion");
    // Playing it with Game Completions hidden: the next list it isn't on.
    expect(nextStep(shelf({ nowPlaying: playing }), { ...ALL, completed: false }).label).toBe("Add to Backlog");
  });

  it("falls back to the other lists when both are hidden", () => {
    const shown = { ...ALL, now_playing: false, completed: false };
    expect(nextStep(EMPTY_SHELF, shown)).toEqual({ list: "backlog", mode: "add", label: "Add to Backlog" });
    expect(nextStep(shelf({ backlog }), shown).label).toBe("Add to Favorites");
    expect(nextStep(shelf({ backlog, favorite, collection }), shown)).toEqual({ list: "backlog", mode: "edit", label: "Edit Backlog" });
  });

  it("never offers a hidden list", () => {
    const shown = { now_playing: false, completed: false, backlog: false, favorite: true, collection: false };
    expect(nextStep(shelf({ favorite }), shown)).toEqual({ list: "favorite", mode: "edit", label: "Edit Favorites" });
  });
});

describe("shelfRows", () => {
  const names = (id: number | null | undefined) => (id === 3 ? "Switch" : null);

  it("gives each shown list its state and verb", () => {
    const rows = shelfRows(shelf({ nowPlaying: playing, completions: [completion(1, "2019-03-14T00:00:00Z")], favorite, collection }), ALL, names);
    expect(rows.map((r) => [r.list, r.state, r.action])).toEqual([
      ["now_playing", "Since 9 Nov · Switch", "Edit"],
      ["completed", "Once · last 14 Mar 2019", "Log another"],
      ["backlog", "Not on it", "Add"],
      ["favorite", "No. 2 of 10", "Edit"],
      ["collection", "Physical · Switch", "Edit"],
    ]);
  });

  it("counts completions and names the latest dated one", () => {
    const [, done] = shelfRows(shelf({ completions: [completion(1, "2024-01-02"), completion(2, null), completion(3, "2019-03-14")] }), ALL);
    expect(done.state).toBe("3 times · last 2 Jan 2024");
    expect(shelfRows(shelf({ completions: [completion(1, null), completion(2, null)] }), ALL)[1].state).toBe("Twice");
    expect(shelfRows(EMPTY_SHELF, ALL)[1]).toMatchObject({ mode: "log", action: "Log one", on: false });
  });

  it("leaves out the lists the viewer isn't shown", () => {
    expect(shelfRows(EMPTY_SHELF, { ...ALL, backlog: false, collection: false }).map((r) => r.list)).toEqual([
      "now_playing",
      "completed",
      "favorite",
    ]);
  });
});

describe("shelfChips", () => {
  it("names every list the game is on", () => {
    expect(shelfChips(shelf({ nowPlaying: playing, completions: [completion(1, null), completion(2, null)], backlog, favorite, collection }), ALL)).toEqual([
      { list: "now_playing", label: "Playing since 9 Nov" },
      { list: "completed", label: "Completed", figure: "×2" },
      { list: "backlog", label: "In Backlog" },
      { list: "favorite", label: "Favorite", figure: "No. 2" },
      { list: "collection", label: "Physical" },
    ]);
  });

  it("has none for a game on no shown list", () => {
    expect(shelfChips(shelf({ backlog }), { ...ALL, backlog: false })).toEqual([]);
  });
});

describe("withoutList", () => {
  it("takes one list's entry off", () => {
    const after = withoutList(shelf({ backlog, favorite }), "backlog");
    expect(after.backlog).toBeNull();
    expect(after.favorite).toBe(favorite);
  });
});
