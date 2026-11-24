import type { FeatureKey, FeatureView } from "@/lib/features";
import { memberListHref, type MemberListKey } from "@/lib/members/member-lists";

// The edit page's lists that once had a section here, by their old URL hash
// (`/edit#backlog`), in the rail's order. Each now has its own page.
const EDIT_LISTS: { hash: string; key: MemberListKey; label: string; feature?: FeatureKey }[] = [
  { hash: "now-playing", key: "now_playing", label: "Now Playing", feature: "now_playing" },
  { hash: "favorites", key: "favorites", label: "Favorites" },
  { hash: "completed", key: "completed", label: "Completed", feature: "game_completions" },
  { hash: "backlog", key: "backlog", label: "Backlog", feature: "backlog" },
  { hash: "collection", key: "collection", label: "Collection", feature: "collection" },
];

export interface ManagedList {
  // The old section hash on /edit, e.g. "backlog".
  hash: string;
  label: string;
  href: string;
}

// The member's list pages the "Manage your lists" row links to: the lists
// whose Feature they're shown (Favorites belong to no Feature).
export function managedLists(userId: string, features: FeatureView): ManagedList[] {
  return EDIT_LISTS.filter((l) => !l.feature || features.shown(l.feature)).map((l) => ({
    hash: l.hash,
    label: l.label,
    href: memberListHref(userId, l.key),
  }));
}
