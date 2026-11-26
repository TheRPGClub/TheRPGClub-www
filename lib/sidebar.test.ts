import { describe, expect, it } from "vitest";

import type { SessionMembership } from "@/lib/auth-types";
import type { SessionFeature } from "@/lib/features";
import {
  currentPage,
  pinnedPages,
  sidebarGroups,
} from "@/lib/sidebar";

const flags = (over: Partial<SessionMembership> = {}): SessionMembership => ({
  admin: false,
  moderator: false,
  regular: false,
  member: true,
  newcomer: false,
  active: true,
  dev: false,
  longstanding: false,
  ...over,
});

const feature = (key: string, shown = true): SessionFeature => ({
  key,
  name: key,
  state: "live",
  hideable: true,
  shown,
  preview: false,
});

const keys = (groups: ReturnType<typeof sidebarGroups>) =>
  Object.fromEntries(groups.map((g) => [g.key, g.pages.map((p) => p.key)]));

describe("sidebarGroups", () => {
  it("groups every page for a member who is shown everything", () => {
    expect(keys(sidebarGroups(undefined, flags()))).toEqual({
      play: ["voting", "gotm_history", "goty", "challenges"],
      games: ["games", "franchises", "lists", "reviews", "releases", "achievements", "journals"],
      club: ["members", "news", "codex", "giveaways", "feedback", "roadmap"],
    });
  });

  it("lists the Roadmap next to the board only while its Feature is shown", () => {
    const shown = [feature("suggestions"), feature("roadmap")];
    expect(keys(sidebarGroups(shown, flags())).club).toEqual(["members", "suggestions", "roadmap"]);
    const hidden = [feature("suggestions"), feature("roadmap", false)];
    expect(keys(sidebarGroups(hidden, flags())).club).toEqual(["members", "suggestions"]);
  });

  it("leaves out pages for Features the viewer isn't shown, and empty groups", () => {
    const features = [feature("voting_gotm", false), feature("game_index"), feature("news_hub")];
    expect(keys(sidebarGroups(features, flags()))).toEqual({
      games: ["games", "franchises"],
      club: ["members", "news"],
    });
  });

  it("gives Staff only to staff, by tier", () => {
    expect(keys(sidebarGroups(undefined, flags())).staff).toBeUndefined();
    expect(keys(sidebarGroups(undefined, flags({ moderator: true }))).staff).toEqual([
      "staff_desk",
      "live_events",
    ]);
    // In the desk's order: Voting, The bot, Members, GameDB.
    expect(keys(sidebarGroups(undefined, flags({ dev: true }))).staff).toEqual([
      "staff_desk",
      "voting_console",
      "public_reminders",
      "live_events",
      "feedback_review",
      "synonyms",
    ]);
  });
});

describe("pinnedPages", () => {
  it("keeps the member's order and skips pages they can't see", () => {
    const groups = sidebarGroups([feature("game_index"), feature("news_hub", false)], flags());
    expect(pinnedPages(groups, ["voting", "games", "members", "news"]).map((p) => p.key)).toEqual(["games", "members"]);
  });

  it("pins Franchises like any other page", () => {
    const groups = sidebarGroups(undefined, flags());
    expect(pinnedPages(groups, ["franchises", "games"]).map((p) => p.key)).toEqual(["franchises", "games"]);
  });
});

describe("currentPage", () => {
  const groups = sidebarGroups(undefined, flags({ dev: true }));
  const at = (path: string) => currentPage(groups, path)?.key ?? null;

  it("matches a page and the pages below it", () => {
    expect(at("/games")).toBe("games");
    expect(at("/games/123/reviews")).toBe("games");
    expect(at("/releases")).toBe("releases");
    expect(at("/reviews")).toBe("reviews");
    expect(at("/reviews/42")).toBe("reviews");
  });

  it("lights Franchises on the index and on a Franchise page", () => {
    expect(at("/franchises")).toBe("franchises");
    expect(at("/franchises/7")).toBe("franchises");
  });

  it("matches the staff desk only on its own path", () => {
    expect(at("/admin")).toBe("staff_desk");
    expect(at("/admin/voting")).toBe("voting_console");
    expect(at("/admin/presence")).toBeNull();
  });

  it("is null on pages with a fixed place", () => {
    expect(at("/dashboard")).toBeNull();
    expect(at("/settings")).toBeNull();
  });
});
