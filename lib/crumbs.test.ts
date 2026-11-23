import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));
const { crumbTrail } = await import("@/lib/crumbs");

// Names as the pages would read them.
const names = {
  game: async (id: string) => `Game ${id}`,
  reviewGame: async (id: string) => (id === "404" ? null : `${Number(id) + 100}`),
  member: async (id: string) => `Member ${id}`,
  set: async (setId: string, memberId: string) => `Set ${setId} of ${memberId}`,
  challenge: async (id: string) => `Challenge ${id}`,
  loreEntry: async (id: string) => `Lore Entry ${id}`,
  historyEvent: async (id: string) => `History Event ${id}`,
};
const trail = (path: string) => crumbTrail(path.split("/").filter(Boolean), names);

describe("crumbTrail", () => {
  it("names a section, and an unknown one as itself", async () => {
    expect(await trail("/gotm")).toEqual([{ label: "GOTM history", href: "/gotm" }]);
    expect(await trail("/elsewhere")).toEqual([{ label: "elsewhere", href: "/elsewhere" }]);
  });

  it("follows a game down to its reviews", async () => {
    expect(await trail("/games/7/reviews")).toEqual([
      { label: "Games", href: "/games" },
      { label: "Game 7", href: "/games/7" },
      { label: "Reviews", href: "/games/7/reviews" },
    ]);
  });

  it("files a review's own page under its game", async () => {
    expect(await trail("/reviews/9")).toEqual([
      { label: "Games", href: "/games" },
      { label: "Game 109", href: "/games/109" },
      { label: "Reviews", href: "/games/109/reviews" },
      { label: "Review", href: "/reviews/9" },
    ]);
  });

  it("falls back to the section when the review can't be read", async () => {
    expect(await trail("/reviews/404")).toEqual([{ label: "Reviews", href: "/reviews" }]);
  });

  it("follows a member's pages, sub-pages and achievement sets", async () => {
    expect(await trail("/members/3/completed-games/compare")).toEqual([
      { label: "Members", href: "/members" },
      { label: "Member 3", href: "/members/3" },
      { label: "Completed", href: "/members/3/completed-games" },
      { label: "Compare", href: "/members/3/completed-games/compare" },
    ]);
    expect((await trail("/members/3/achievements/12")).at(-1)).toEqual({
      label: "Set 12 of 3",
      href: "/members/3/achievements/12",
    });
    expect(await trail("/members/3/nowhere")).toHaveLength(2);
  });

  it("names the giveaway and suggestion pages", async () => {
    expect((await trail("/giveaways/claimed")).at(-1)).toEqual({
      label: "Your claimed keys",
      href: "/giveaways/claimed",
    });
    expect((await trail("/suggestions/new")).at(-1)).toEqual({
      label: "Suggest something",
      href: "/suggestions/new",
    });
  });

  it("names a Challenge, its edit page and a new one", async () => {
    expect(await trail("/challenges/4/edit")).toEqual([
      { label: "Challenges", href: "/challenges" },
      { label: "Challenge 4", href: "/challenges/4" },
      { label: "Edit", href: "/challenges/4/edit" },
    ]);
    expect((await trail("/challenges/4/pick")).at(-1)).toEqual({ label: "Your pick", href: "/challenges/4/pick" });
    expect((await trail("/challenges/new")).at(-1)).toEqual({ label: "New Challenge", href: "/challenges/new" });
  });

  it("names a staff desk page, a round's edit page and a new live event", async () => {
    expect(await trail("/admin/rounds/nr-gotm/143")).toEqual([
      { label: "Staff desk", href: "/admin" },
      { label: "GOTM rounds", href: "/admin/rounds" },
      { label: "NR-GOTM round 143", href: "/admin/rounds/nr-gotm/143" },
    ]);
    expect((await trail("/admin/live-events/new")).at(-1)).toEqual({
      label: "New",
      href: "/admin/live-events/new",
    });
    // Presence history is a #hash on the presence desk, not a page.
    expect(await trail("/admin/presence")).toHaveLength(2);
  });

  it("names the Club Codex and its parts", async () => {
    expect(await trail("/codex/fun-facts")).toEqual([
      { label: "Club Codex", href: "/codex" },
      { label: "Fun Facts", href: "/codex/fun-facts" },
    ]);
    expect(await trail("/codex/constructor")).toEqual([{ label: "Club Codex", href: "/codex" }]);
  });

  it("names a Lore Entry, its edit page and a new one", async () => {
    const lore = [
      { label: "Club Codex", href: "/codex" },
      { label: "Club Lore", href: "/codex/lore" },
    ];
    expect(await trail("/codex/lore/7/edit")).toEqual([
      ...lore,
      { label: "Lore Entry 7", href: "/codex/lore/7" },
      { label: "Edit", href: "/codex/lore/7/edit" },
    ]);
    expect(await trail("/codex/lore/new")).toEqual([...lore, { label: "New", href: "/codex/lore/new" }]);
  });

  it("names Club History's desk: a new History Event and one's edit page", async () => {
    const history = [
      { label: "Club Codex", href: "/codex" },
      { label: "Club History", href: "/codex/history" },
    ];
    expect(await trail("/codex/history")).toEqual(history);
    expect(await trail("/codex/history/new")).toEqual([...history, { label: "New", href: "/codex/history/new" }]);
    expect(await trail("/codex/history/4/edit")).toEqual([
      ...history,
      { label: "History Event 4", href: "/codex/history#history-event-4" },
      { label: "Edit", href: "/codex/history/4/edit" },
    ]);
  });
});
