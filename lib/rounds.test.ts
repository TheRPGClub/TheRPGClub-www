import { describe, expect, it } from "vitest";

import type { Nomination } from "@/lib/api/types";
import {
  listNames,
  nominatorName,
  roundEntryEdit,
  roundPrefillHref,
  roundSaveFailure,
  slotName,
  type RoundSlot,
} from "@/lib/rounds";

describe("roundPrefillHref", () => {
  it("opens the add form on one track's round and month", () => {
    expect(roundPrefillHref("nr_gotm", 143, "November 2026")).toBe(
      "/admin/rounds?track=nr-gotm&round=143&month=November+2026#add",
    );
    expect(roundPrefillHref("gotm", 12, "")).toBe("/admin/rounds?track=gotm&round=12&month=#add");
  });
});

describe("slotName and listNames", () => {
  it("names a lone slot plainly and co-winners by letter", () => {
    expect(slotName(0, 1)).toBe("Game");
    expect(slotName(0, 3)).toBe("Game A");
    expect(slotName(2, 3)).toBe("Game C");
  });

  it("joins names the way a sentence does", () => {
    expect(listNames([])).toBe("");
    expect(listNames(["Game A"])).toBe("Game A");
    expect(listNames(["Game A", "Game B"])).toBe("Game A and Game B");
    expect(listNames(["Game A", "Game B", "Game C"])).toBe("Game A, Game B and Game C");
  });
});

describe("roundEntryEdit", () => {
  const saved: RoundSlot = { id: 7, index: 0, game: null, gameId: 1, reddit: "https://r/x" };

  it("is null when nothing changed (whitespace in the URL aside)", () => {
    expect(roundEntryEdit({ ...saved, reddit: " https://r/x " }, saved)).toBeNull();
  });

  it("sends only what changed", () => {
    expect(roundEntryEdit({ ...saved, gameId: 2 }, saved)).toEqual({ id: 7, gamedb_game_id: 2 });
    expect(roundEntryEdit({ ...saved, reddit: "" }, saved)).toEqual({ id: 7, reddit_url: "" });
  });
});

describe("roundSaveFailure", () => {
  const base = { slotIds: [1, 2, 3], triedIds: [1, 3], savedIds: [] as number[], error: "Taken." };

  it("names the slots that saved and the ones that didn't", () => {
    expect(roundSaveFailure({ ...base, savedIds: [1], reloaded: true })).toBe(
      "Taken. Saved Game A; Game C not saved. The round below is reloaded from the server.",
    );
  });

  it("says nothing was saved when several changes all failed", () => {
    expect(roundSaveFailure({ ...base, reloaded: false })).toBe(
      "Taken. Nothing was saved. Refresh the page to see what the server holds.",
    );
  });

  it("keeps a single failed change to its error, with a fallback", () => {
    expect(roundSaveFailure({ slotIds: [1], triedIds: [1], savedIds: [], reloaded: undefined })).toBe(
      "Couldn't save the round.",
    );
  });
});

describe("nominatorName", () => {
  const n = { user_id: "42", user: null } as Nomination;

  it("prefers the display name, then the username, then the id", () => {
    expect(nominatorName({ ...n, user: { global_name: "Ana", username: "ana" } } as Nomination)).toBe("Ana");
    expect(nominatorName({ ...n, user: { global_name: null, username: "ana" } } as Nomination)).toBe("ana");
    expect(nominatorName(n)).toBe("42");
  });
});
