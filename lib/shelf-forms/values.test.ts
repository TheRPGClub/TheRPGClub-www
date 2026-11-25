import { describe, expect, it } from "vitest";

import type { GameCollection, GameCompletion, UserNowPlaying } from "@/lib/api/types";
import {
  completionPayload,
  completionProblems,
  completionStart,
  shelfPayload,
  shelfRefusal,
  shelfStart,
} from "./values";

const TODAY = "2026-11-24";
const nowPlaying = {
  now_playing_id: 7,
  user_id: "u1",
  gamedb_game_id: 42,
  platform_id: 3,
  added_at: "2026-11-09T18:12:00.000Z",
  note: "Opera house next",
  sort_order: 1,
  note_updated_at: null,
} satisfies UserNowPlaying;

const completion = {
  completion_id: 5,
  user_id: "u1",
  gamedb_game_id: 42,
  platform_id: 9,
  note: "Got Shadow back.",
  completion_type: "Completionist",
  started_at: "2019-02-01",
  completed_at: "2019-03-14T16:00:00.000Z",
  final_playtime_hrs: "38.0",
  created_at: "2019-03-14T10:00:00.000Z",
} satisfies GameCompletion;

describe("completionStart", () => {
  it("pre-fills Started and the platform from Now Playing, and Finished with today", () => {
    const start = completionStart({ nowPlaying, today: TODAY });
    expect(start.startedFromNowPlaying).toBe(true);
    expect(start.values).toEqual({
      completionType: "Main Story",
      started: "2026-11-09",
      finished: TODAY,
      platformId: 3,
      playtime: "",
      note: "",
      keepNowPlaying: false,
    });
  });

  it("pre-fills the hours from the open Playthrough (spec api#457)", () => {
    expect(completionStart({ nowPlaying, playthroughMinutes: 860, today: TODAY }).values.playtime).toBe("14.33");
    expect(completionStart({ playthroughMinutes: 120, today: TODAY }).values.playtime).toBe("2");
    expect(completionStart({ playthroughMinutes: null, today: TODAY }).values.playtime).toBe("");
  });

  it("keeps an existing completion's hours over the open Playthrough", () => {
    expect(completionStart({ entry: completion, playthroughMinutes: 860, today: TODAY }).values.playtime).toBe("38");
  });

  it("leaves Started blank for a game not on Now Playing", () => {
    const start = completionStart({ today: TODAY });
    expect(start.startedFromNowPlaying).toBe(false);
    expect(start.values.started).toBeNull();
    expect(start.values.finished).toBe(TODAY);
  });

  it("opens an existing completion as stored", () => {
    expect(completionStart({ entry: completion, nowPlaying, today: TODAY }).values).toMatchObject({
      completionType: "Completionist",
      started: "2019-02-01",
      finished: "2019-03-14",
      platformId: 9,
      playtime: "38",
      note: "Got Shadow back.",
    });
  });
});

describe("completionPayload", () => {
  const values = completionStart({ nowPlaying, today: TODAY }).values;

  it("logs both days and takes the game off Now Playing", () => {
    expect(completionPayload(42, values, { original: null, onNowPlaying: true })).toEqual({
      gamedb_game_id: 42,
      completion_type: "Main Story",
      platform_id: 3,
      started_at: "2026-11-09",
      completed_at: TODAY,
      final_playtime_hrs: null,
      note: null,
      leave_now_playing: true,
    });
  });

  it("keeps it on Now Playing when ticked", () => {
    const kept = completionPayload(42, { ...values, keepNowPlaying: true }, { original: null, onNowPlaying: true });
    expect(kept).not.toHaveProperty("leave_now_playing");
  });

  it("sends no leave_now_playing for a game not on Now Playing, or on an edit", () => {
    expect(completionPayload(42, values, { original: null, onNowPlaying: false })).not.toHaveProperty("leave_now_playing");
    const edit = completionPayload(42, { ...values, playtime: "41.5", note: "  Again " }, { original: completion, onNowPlaying: true });
    expect(edit).not.toHaveProperty("leave_now_playing");
    expect(edit).not.toHaveProperty("gamedb_game_id");
    expect(edit).toMatchObject({ final_playtime_hrs: 41.5, note: "Again" });
  });

  it("sends an edit's days only when they changed", () => {
    const stored = completionStart({ entry: completion, today: TODAY }).values;
    const untouched = completionPayload(42, { ...stored, note: "new note" }, { original: completion, onNowPlaying: false });
    expect(untouched).not.toHaveProperty("started_at");
    expect(untouched).not.toHaveProperty("completed_at");

    const moved = completionPayload(42, { ...stored, finished: "2019-03-20" }, { original: completion, onNowPlaying: false });
    expect(moved).toMatchObject({ completed_at: "2019-03-20" });
    expect(moved).not.toHaveProperty("started_at");

    const cleared = completionPayload(42, { ...stored, started: null }, { original: completion, onNowPlaying: false });
    expect(cleared).toMatchObject({ started_at: null });
  });
});

describe("completionProblems", () => {
  it("adds the hours and note checks to the date checks", () => {
    const values = { ...completionStart({ today: TODAY }).values, playtime: "lots", finished: "2026-12-01" };
    expect(completionProblems(values, TODAY)).toEqual({
      finished: "Finished can't be in the future.",
      playtime: "Hours must be a number, 0 or more.",
    });
  });
});

describe("shelfPayload", () => {
  it("adds a game to Now Playing without a Started day", () => {
    const values = shelfStart(null, TODAY);
    expect(shelfPayload("now_playing", 42, { ...values, platformId: 3 })).toEqual({
      gamedb_game_id: 42,
      platform_id: 3,
      note: null,
    });
  });

  it("sends a Now Playing Started day only when it changed", () => {
    const values = shelfStart(nowPlaying, TODAY);
    expect(values.started).toBe("2026-11-09");
    expect(shelfPayload("now_playing", 42, values, nowPlaying)).toEqual({
      platform_id: 3,
      note: "Opera house next",
    });
    expect(shelfPayload("now_playing", 42, { ...values, started: "2026-11-02" }, nowPlaying)).toMatchObject({
      added_at: "2026-11-02",
    });
  });

  it("sends no platform for Favorites and the ownership for Collection", () => {
    expect(shelfPayload("favorite", 42, { ...shelfStart(null, TODAY), platformId: 3, note: "Best" })).toEqual({
      gamedb_game_id: 42,
      note: "Best",
    });
    const owned = { collection_id: 2, user_id: "u1", gamedb_game_id: 42, platform_id: 4, ownership_type: "Physical", note: null } satisfies GameCollection;
    const values = shelfStart(owned, TODAY);
    expect(values.ownershipType).toBe("Physical");
    expect(shelfPayload("collection", 42, values, owned)).toEqual({ platform_id: 4, ownership_type: "Physical", note: null });
  });
});

describe("shelfRefusal", () => {
  it("puts a date refusal on its field and keeps others at the foot", () => {
    expect(shelfRefusal("started_after_finished", "x")).toEqual({ field: "started", message: "Started can't be after Finished." });
    expect(shelfRefusal("finished_in_future", "x").field).toBe("finished");
    expect(shelfRefusal("added_in_future", "x").field).toBe("started");
    expect(shelfRefusal("started_in_future", "x").field).toBe("started");
    expect(shelfRefusal(undefined, "Couldn't save it.")).toEqual({ message: "Couldn't save it." });
  });
});
