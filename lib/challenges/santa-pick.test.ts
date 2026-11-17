import { describe, expect, it } from "vitest";
import {
  hoursLabel,
  pickCards,
  pickCopy,
  pickPageState,
  pickRefusal,
  santaEdition,
  shuffleTo,
  stepTo,
  tasteHints,
} from "@/lib/challenges/santa-pick";
import type { ChallengeEdition, SantaBacklogEntry, SantaView } from "@/lib/challenges/types";

const entry = (id: number, title: string, extra: Partial<SantaBacklogEntry> = {}): SantaBacklogEntry => ({
  entry_id: id * 10,
  gamedb_game_id: id,
  game: { game_id: id, title, cover_url: `/c/${id}.jpg`, art_url: null, initial_release_date: "2024-02-02T00:00:00Z" },
  platform: null,
  hours: null,
  ...extra,
});

const PS5 = { platform_id: 5, platform_name: "PlayStation 5", platform_abbreviation: "PS5" };
const PC = { platform_id: 6, platform_name: "PC (Microsoft Windows)", platform_abbreviation: null };

describe("pickCards", () => {
  it("deals each backlog game once, in the backlog's order, with its year, platform and time", () => {
    const cards = pickCards([
      entry(1, "Persona 3 Reload", { platform: PS5, hours: 61.6 }),
      entry(2, "Grandia", { game: { game_id: 2, title: "Grandia", initial_release_date: null } }),
    ]);
    expect(cards).toEqual([
      { gameId: 1, title: "Persona 3 Reload", coverUrl: "/c/1.jpg", artUrl: null, year: 2024, platforms: ["PS5"], hours: 61.6 },
      { gameId: 2, title: "Grandia", coverUrl: null, artUrl: null, year: null, platforms: [], hours: null },
    ]);
  });

  it("folds a game backlogged on two platforms into one card naming both", () => {
    const cards = pickCards([entry(1, "Lies of P", { platform: PS5 }), entry(1, "Lies of P", { platform: PC })]);
    expect(cards).toHaveLength(1);
    expect(cards[0].platforms).toEqual(["PS5", "PC (Microsoft Windows)"]);
  });
});

describe("hoursLabel", () => {
  it("rounds HowLongToBeat's time to whole hours", () => {
    expect(hoursLabel(61.6)).toBe("About 62 hours");
    expect(hoursLabel(1.2)).toBe("About 1 hour");
    expect(hoursLabel(0.4)).toBe("Under an hour");
  });

  it("is null without a time", () => {
    expect(hoursLabel(null)).toBeNull();
  });
});

describe("moving through the deal", () => {
  it("steps forward and back, wrapping round the backlog", () => {
    expect(stepTo(0, 14, 1)).toBe(1);
    expect(stepTo(13, 14, 1)).toBe(0);
    expect(stepTo(0, 14, -1)).toBe(13);
  });

  it("shuffles to another game, never the one showing", () => {
    expect(shuffleTo(3, 14, () => 0)).toBe(0);
    expect(shuffleTo(0, 14, () => 0)).toBe(1);
    expect(shuffleTo(5, 14, () => 0.999)).toBe(13);
    expect(shuffleTo(13, 14, () => 0.999)).toBe(12);
  });

  it("stays put with a single game", () => {
    expect(stepTo(0, 1, 1)).toBe(0);
    expect(shuffleTo(0, 1, () => 0.5)).toBe(0);
  });
});

const view = (extra: Partial<SantaView> = {}): SantaView => ({
  edition_id: 4,
  year: 2026,
  challenge: { id: 2, name: "Secret Santa" },
  reveal_on: "2026-12-25",
  recipient: { user_id: "905", username: "loot_hoarder", global_name: "Loot Hoarder" },
  taste: { genres: [], platform: null },
  pick: null,
  pick_deadline_on: "2026-12-15",
  picks_open: true,
  backlog: [],
  ...extra,
});

describe("pickCopy", () => {
  it("names the recipient, the days left to pick and when they find out", () => {
    const copy = pickCopy(view(), "2026-12-08");
    expect(copy.title).toBe("Pick for Loot Hoarder");
    expect(copy.chip).toBe("Secret Santa 2026");
    expect(copy.days).toBe(7);
    expect(copy.daysLabel).toBe("days · picks due Tue 15 Dec");
    expect(copy.privacy).toBe(
      "Only you can see this page. Loot Hoarder finds out on 25 December, and who picked stays secret until the Edition ends.",
    );
  });

  it("counts down to one day", () => {
    expect(pickCopy(view(), "2026-12-14").daysLabel).toBe("day · picks due Tue 15 Dec");
  });

  it("explains the list before a pick and the deadline after one", () => {
    const copy = pickCopy(view(), "2026-12-08");
    expect(copy.note(14, false)).toBe(
      "14 games: Loot Hoarder's backlog, without the games they've Cleared. Shuffle deals a random one; the reel jumps anywhere. If you don't pick by Tue 15 Dec, Loot Hoarder gets a random game from this list.",
    );
    expect(copy.note(14, true)).toBe(
      "You can change your pick until picks close on Tue 15 Dec. Loot Hoarder finds out on 25 December.",
    );
    expect(copy.note(1, false)).toMatch(/^1 game: /);
  });
});

describe("tasteHints", () => {
  it("says where the recipient plays most and their top genres", () => {
    const hints = tasteHints(
      {
        platform: { platform_id: 5, platform_name: "PlayStation 5", platform_abbreviation: "PS5" },
        genres: [
          { genre_id: 1, name: "Role-playing (RPG)" },
          { genre_id: 2, name: "Tactical" },
          { genre_id: 3, name: "Adventure" },
        ],
      },
      "Loot Hoarder",
    );
    expect(hints).toEqual([
      "Loot Hoarder plays most on PlayStation 5",
      "Their top genres: Role-playing (RPG), Tactical and Adventure",
    ]);
  });

  it("leaves out what the API doesn't know", () => {
    expect(tasteHints({ platform: null, genres: [{ genre_id: 1, name: "Puzzle" }] }, "Lufia")).toEqual([
      "Their top genre: Puzzle",
    ]);
    expect(tasteHints({ platform: null, genres: [] }, "Lufia")).toEqual([]);
    expect(tasteHints(undefined, "Lufia")).toEqual([]);
  });
});

describe("pickRefusal", () => {
  it("shows the API's own sentence", () => {
    expect(pickRefusal(422, { error: "not_eligible", message: "Pick a game from your recipient's backlog that they haven't Cleared." })).toBe(
      "Pick a game from your recipient's backlog that they haven't Cleared.",
    );
  });

  it("falls back to a sentence per refusal", () => {
    expect(pickRefusal(409, { error: "picks_closed" })).toBe("Picks have closed for this Edition, so your pick can't change now.");
    expect(pickRefusal(422, { error: "not_eligible" })).toBe(
      "That game has left their backlog or been Cleared. Pick another one.",
    );
    expect(pickRefusal(403, { error: "not_a_santa" })).toBe("You aren't a Santa in this Edition.");
    expect(pickRefusal(404, { error: "not_found" })).toBe("This Edition no longer exists, or is hidden.");
    expect(pickRefusal(401, null)).toBe("Your session has ended. Sign in again.");
    expect(pickRefusal(500, "oops")).toBe("That didn't work. Try again in a moment.");
  });
});

describe("pickPageState", () => {
  it("opens the deal while picks are open", () => {
    expect(pickPageState({ ok: true, view: view({ backlog: [entry(1, "Grandia")] }) })).toEqual({ kind: "open" });
  });

  it("says the pick is in once picks close", () => {
    const picked = view({
      picks_open: false,
      pick: { game: { game_id: 1, title: "Persona 3 Reload" }, picked_randomly: false },
    });
    expect(pickPageState({ ok: true, view: picked })).toEqual({
      kind: "closed",
      title: "Your pick is in",
      message: "Picks closed on 15 Dec. You picked Persona 3 Reload for Loot Hoarder; everyone sees it on 25 December.",
    });
    const random = view({ picks_open: false, pick: { game: { game_id: 1, title: "Grandia" }, picked_randomly: true } });
    expect(pickPageState({ ok: true, view: random })).toMatchObject({
      title: "Picks are closed",
      message: "Picks closed on 15 Dec. Loot Hoarder got Grandia as a random pick; everyone sees it on 25 December.",
    });
    expect(pickPageState({ ok: true, view: view({ picks_open: false }) })).toMatchObject({
      message: "Picks closed on 15 Dec. Loot Hoarder gets a random game from their backlog; everyone sees it on 25 December.",
    });
  });

  it("explains an empty list", () => {
    expect(pickPageState({ ok: true, view: view({ backlog: [] }) })).toEqual({
      kind: "empty",
      title: "Nothing to pick",
      message:
        "Loot Hoarder has Cleared every game in their backlog, so there's nothing to pick. If that's still so when picks close, they get no game this year.",
    });
  });

  it("turns away anyone who isn't this Edition's Santa with the API's reason", () => {
    expect(
      pickPageState({ ok: false, status: 403, body: { error: "not_a_santa", message: "You aren't a Santa in the 2026 Edition." } }),
    ).toEqual({ kind: "refused", title: "Not your pick", message: "You aren't a Santa in the 2026 Edition." });
  });

  it("says when the page couldn't be read", () => {
    expect(pickPageState({ ok: false, status: 502, body: null })).toEqual({
      kind: "unread",
      title: "Not just now",
      message: "Your pick page couldn't be read. Try again in a moment.",
    });
  });
});

describe("santaEdition", () => {
  const ed = (id: number, year: number, phase: ChallengeEdition["phase"]) => ({ id, year, phase }) as ChallengeEdition;

  it("takes the Edition asked for", () => {
    expect(santaEdition([ed(9, 2027, "signup"), ed(8, 2026, "picking")], 9)?.id).toBe(9);
  });

  it("otherwise takes the newest Edition in picking, else the newest", () => {
    expect(santaEdition([ed(9, 2027, "signup"), ed(8, 2026, "picking")], null)?.id).toBe(8);
    expect(santaEdition([ed(9, 2027, "signup"), ed(8, 2026, "revealed")], 4)?.id).toBe(9);
    expect(santaEdition([], null)).toBeNull();
  });
});
