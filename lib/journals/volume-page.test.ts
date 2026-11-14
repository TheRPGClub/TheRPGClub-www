import { describe, expect, it } from "vitest";

import type { GameSummary, JournaledGame } from "@/lib/api/types";
import { chapterRows, firstEntryOnPage, openChapter, parseVolumeQuery } from "@/lib/journals/volume-page";

const game = (game_id: number, title: string) => ({ game_id, title }) as GameSummary;
const row = (g: GameSummary | null, entry_count: number, last_entry_at: string | null): JournaledGame => ({
  game: g,
  entry_count,
  last_entry_at,
});

describe("parseVolumeQuery", () => {
  it("reads the open chapter, its page and a new chapter", () => {
    expect(parseVolumeQuery({ game: "12", page: "3", new: "1" })).toEqual({ gameId: 12, page: 3, startingNew: true });
  });

  it("ignores what isn't a positive whole number", () => {
    expect(parseVolumeQuery({ game: "0", page: "x" })).toEqual({ gameId: null, page: 1, startingNew: false });
    expect(parseVolumeQuery({ game: ["7", "8"], page: "-1", new: "yes" })).toEqual({
      gameId: 7,
      page: 1,
      startingNew: false,
    });
  });
});

describe("chapterRows", () => {
  it("is the Contents, newest chapter first, each with its marks; a row without a game drops", () => {
    const rows = chapterRows(
      [row(game(1, "Old"), 2, "2026-01-01"), row(null, 5, "2026-05-01"), row(game(2, "New"), 3, "2026-03-01")],
      new Set([2]),
      new Set([1]),
    );
    expect(rows).toEqual([
      { game: game(2, "New"), entryCount: 3, lastEntryAt: "2026-03-01", nowPlaying: true, completed: false },
      { game: game(1, "Old"), entryCount: 2, lastEntryAt: "2026-01-01", nowPlaying: false, completed: true },
    ]);
  });
});

describe("openChapter", () => {
  const chapters = chapterRows([row(game(2, "New"), 3, "2026-03-01"), row(game(1, "Old"), 2, "2026-01-01")], new Set(), new Set());

  it("opens the asked-for chapter, else the newest", () => {
    expect(openChapter(chapters, { gameId: 1, page: 1, startingNew: false })).toMatchObject({ gameId: 1, index: 1 });
    expect(openChapter(chapters, { gameId: null, page: 1, startingNew: false })).toMatchObject({ gameId: 2, index: 0 });
  });

  it("opens a game not in the book yet as a new chapter, and nothing when starting one", () => {
    expect(openChapter(chapters, { gameId: 9, page: 1, startingNew: false })).toEqual({ gameId: 9, index: -1, row: null });
    expect(openChapter(chapters, { gameId: 2, page: 1, startingNew: true })).toEqual({ gameId: null, index: -1, row: null });
    expect(openChapter([], { gameId: null, page: 1, startingNew: false })).toEqual({ gameId: null, index: -1, row: null });
  });
});

describe("firstEntryOnPage", () => {
  const entries = [{ created_at: "2026-03-01" }, { created_at: "2026-02-01" }];

  it("is the page's last entry when the page is the chapter's last", () => {
    expect(firstEntryOnPage(entries, true)).toBe("2026-02-01");
  });

  it("is unknown on an earlier page or an empty one", () => {
    expect(firstEntryOnPage(entries, false)).toBeUndefined();
    expect(firstEntryOnPage([], true)).toBeUndefined();
  });
});
