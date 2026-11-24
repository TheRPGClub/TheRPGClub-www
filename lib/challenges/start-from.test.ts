import { describe, expect, it } from "vitest";

import { createRequest, editRequest, emptyDraft, newHandGames, type ChallengeDraft } from "@/lib/challenges/form";
import { canStartFromList, draftFromFranchise, draftFromList } from "@/lib/challenges/start-from";
import type { FranchisePage } from "@/lib/franchises/types";
import type { GameList } from "@/lib/game-lists/types";

const owner = { user_id: "1", username: "rowan", avatar_url: "/a" };
const entry = (id: number, title: string, position: number) => ({
  game_id: id,
  position,
  note: null,
  added_at: "2026-11-01T00:00:00Z",
  game: { game_id: id, title, cover_url: `/c/${id}.jpg` },
});
const list = (over: Partial<GameList> = {}): GameList => ({
  id: 9,
  name: "Soulslike, but make it history",
  description: null,
  visibility: "members",
  sort: "ranked",
  club: false,
  owner,
  taken_over_from: null,
  taken_over_at: null,
  entry_count: 2,
  preview_games: [],
  viewer: { can_edit: true, can_delete: true },
  entries: [entry(5, "Demon's Souls", 1), entry(6, "Nioh", 2)],
  created_at: "",
  updated_at: "",
  ...over,
});
const fg = (id: number, title: string, mainline: boolean) => ({
  game_id: id,
  title,
  cover_url: null,
  release_year: 1990,
  mainline,
  source: "igdb" as const,
  parent_game_name: null,
});

describe("canStartFromList", () => {
  it("lets the owner start from their own list, and staff from a club list", () => {
    expect(canStartFromList(list(), { id: "1", staff: false })).toBe(true);
    expect(canStartFromList(list(), { id: "2", staff: true })).toBe(false);
    expect(canStartFromList(list({ club: true, owner: null }), { id: "2", staff: true })).toBe(true);
    expect(canStartFromList(list({ club: true, owner: null }), { id: "1", staff: false })).toBe(false);
  });
});

describe("draftFromList", () => {
  it("makes the list's games Core in order and links the list on create", () => {
    const d = draftFromList(list());
    expect(d.core.map((g) => g.game_id)).toEqual([5, 6]);
    expect(d.hostedByClub).toBe(false);
    expect(createRequest(d).data.pool).toMatchObject({ game_list_id: 9, core_game_ids: [5, 6] });
  });

  it("hosts a club list's Challenge for the club", () => {
    expect(draftFromList(list({ club: true, owner: null })).hostedByClub).toBe(true);
  });

  it("never sends the link on an edit", () => {
    const body = editRequest(draftFromList(list()), { locked: false, closedForGood: false });
    expect(body.data.pool).not.toHaveProperty("game_list_id");
  });
});

describe("draftFromFranchise", () => {
  it("brings Mainline in as Core and the Franchise as a source", () => {
    const page = {
      franchise_id: 3,
      name: "Final Fantasy",
      games: { mainline: [fg(1, "FF I", true), fg(2, "FF II", true)], other: [fg(4, "Tactics", false)], add_ons: [] },
    } as unknown as FranchisePage;
    const d = draftFromFranchise(page);
    expect(d.core.map((g) => g.game_id)).toEqual([1, 2]);
    expect(createRequest(d).data.pool).toMatchObject({ franchise_ids: [3], core_game_ids: [1, 2] });
    expect(createRequest(d).data.pool).not.toHaveProperty("game_list_id");
  });
});

describe("add to list on an edit", () => {
  const saved: ChallengeDraft = {
    ...emptyDraft(),
    core: [{ game_id: 5, title: "Demon's Souls" }],
    optional: [{ game_id: 7, title: "Lies of P" }],
    savedOptional: [{ game_id: 8, title: "Nine Sols", source: "list", new: false }],
    gameList: { id: 9, name: "Soulslike", canAdd: true },
  };

  it("names the games newly put in the Pool by hand, not moves or listed games", () => {
    const edited: ChallengeDraft = {
      ...saved,
      core: [{ game_id: 7, title: "Lies of P" }, { game_id: 11, title: "Elden Ring" }, { game_id: 8, title: "Nine Sols" }],
      optional: [{ game_id: 5, title: "Demon's Souls" }, { game_id: 12, title: "Nioh 2" }],
    };
    expect(newHandGames(saved, edited).map((g) => g.game_id)).toEqual([11, 12]);
  });

  it("sends add_to_list only when asked and linked", () => {
    expect(editRequest(saved, { locked: true, closedForGood: false, addToList: true }).data.add_to_list).toBe(true);
    expect(editRequest(saved, { locked: false, closedForGood: false }).data).not.toHaveProperty("add_to_list");
    expect(
      editRequest({ ...saved, gameList: null }, { locked: false, closedForGood: false, addToList: true }).data,
    ).not.toHaveProperty("add_to_list");
  });
});
