import { describe, expect, it } from "vitest";
import type { FeatureKey, FeatureView } from "@/lib/features";
import { managedLists } from "./managed-lists";

const view = (hidden: FeatureKey[] = []): FeatureView => ({
  shown: (key) => !hidden.includes(key),
  canOpen: () => true,
  preview: () => false,
});

describe("managedLists", () => {
  it("links the five list pages in the old rail's order, keyed by the old hash", () => {
    expect(managedLists("42", view())).toEqual([
      { hash: "now-playing", label: "Now Playing", href: "/members/42/now-playing-games" },
      { hash: "favorites", label: "Favorites", href: "/members/42/favorite-games" },
      { hash: "completed", label: "Completed", href: "/members/42/completed-games" },
      { hash: "backlog", label: "Backlog", href: "/members/42/backlogged-games" },
      { hash: "collection", label: "Collection", href: "/members/42/collected-games" },
    ]);
  });

  it("leaves out lists whose Feature the member isn't shown, never Favorites", () => {
    const hashes = managedLists("42", view(["backlog", "game_completions", "now_playing", "collection"])).map(
      (l) => l.hash,
    );
    expect(hashes).toEqual(["favorites"]);
  });
});
