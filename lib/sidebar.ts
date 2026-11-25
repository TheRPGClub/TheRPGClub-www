// The sidebar's map of the site (spec api#416): Dashboard, the member's
// Pinned Pages, then the Browse groups. The API owns which pages can be
// pinned and who may see each (ADR 0012); the website owns where each key
// goes, its group, label and one-line note. Client-safe: no server imports.
import { featureView, type FeatureKey, type SessionFeature } from "@/lib/features";
import { CODEX_PATH } from "@/lib/codex/paths";
import { RELEASES_PATH } from "@/lib/release-calendar";
import { staffSectionsFor, type StaffSectionKey } from "@/lib/staff";
import type { SessionMembership } from "@/lib/auth-types";

export type SidebarGroupKey = "play" | "games" | "club" | "staff";

// The Pinned Page keys the website has a place for (the API's
// PinnedPages::PAGES).
export type PinnedPageKey =
  | "voting"
  | "gotm_history"
  | "goty"
  | "challenges"
  | "games"
  | "lists"
  | "reviews"
  | "releases"
  | "achievements"
  | "journals"
  | "members"
  | "news"
  | "codex"
  | "giveaways"
  | "suggestions"
  | "staff_desk"
  | "voting_console"
  | "synonyms"
  | "live_events"
  | "public_reminders"
  | "suggestion_review";

// Every page the sidebar lists: the Pinned Page keys, plus pages the API
// can't pin yet (`pinnable: false`).
export type SidebarPageKey = PinnedPageKey | "franchises";

export interface SidebarPage {
  // The Pinned Page key the API knows it by (or the page's own key, for one
  // that can't be pinned).
  key: SidebarPageKey;
  href: string;
  label: string;
  note: string;
  group: SidebarGroupKey;
  // The Feature it belongs to; none for pages every member has.
  feature?: FeatureKey;
  // Matched only on its own path, not the pages below it (the staff desk,
  // whose tools sit under /admin).
  exact?: boolean;
  // Not a Pinned Page the API knows (PinnedPages::PAGES), so it offers no
  // pin: Franchises (www#206), until the API lists it.
  pinnable?: false;
}

export interface SidebarGroup {
  key: SidebarGroupKey;
  label: string;
  pages: SidebarPage[];
}

export const GROUP_LABEL: Record<SidebarGroupKey, string> = {
  play: "Play",
  games: "Games",
  club: "Club",
  staff: "Staff",
};

export const CLUB_PAGES: readonly SidebarPage[] = [
  { key: "voting", href: "/voting", label: "Voting", note: "This round's picks and the vote", group: "play", feature: "voting_gotm" },
  { key: "gotm_history", href: "/gotm", label: "GOTM history", note: "Every round's winners", group: "play", feature: "voting_gotm" },
  { key: "goty", href: "/goty", label: "GOTY Vote", note: "The year's three Awards", group: "play", feature: "goty_vote" },
  { key: "challenges", href: "/challenges", label: "Challenges", note: "Years Alive, Seasonal, Secret Santa", group: "play", feature: "challenges" },
  { key: "games", href: "/games", label: "Games", note: "The club's GameDB catalogue", group: "games", feature: "game_index" },
  { key: "franchises", href: "/franchises", label: "Franchises", note: "Every series as a box set", group: "games", pinnable: false },
  { key: "lists", href: "/lists", label: "Lists", note: "Members' and the club's Game Lists", group: "games", feature: "game_lists" },
  { key: "reviews", href: "/reviews", label: "Reviews", note: "Every member's reviews, newest first", group: "games", feature: "reviews" },
  { key: "releases", href: RELEASES_PATH, label: "Releases", note: "What's coming out, by region", group: "games", feature: "release_calendar" },
  { key: "achievements", href: "/achievements", label: "Achievements", note: "RA, Steam and PSN unlocks", group: "games", feature: "achievement_hub" },
  { key: "journals", href: "/journals", label: "Game Journals", note: "Members' play diaries", group: "games", feature: "journals" },
  { key: "members", href: "/members", label: "Members", note: "Everyone in the club", group: "club" },
  { key: "news", href: "/news", label: "News", note: "Gaming news, by category", group: "club", feature: "news_hub" },
  { key: "codex", href: CODEX_PATH, label: "Codex", note: "Club lore and history", group: "club", feature: "club_codex" },
  { key: "giveaways", href: "/giveaways", label: "Giveaways", note: "Free keys from members", group: "club", feature: "giveaways" },
  { key: "suggestions", href: "/suggestions", label: "Suggestion Board", note: "Ideas for the club", group: "club", feature: "suggestions" },
];

// The staff sections lib/staff.ts marks `nav`, under their Pinned Page keys.
export const STAFF_PAGE: Partial<Record<StaffSectionKey, { key: PinnedPageKey; note: string }>> = {
  overview: { key: "staff_desk", note: "What's waiting, every tool" },
  voting: { key: "voting_console", note: "Run the round" },
  synonyms: { key: "synonyms", note: "Search aliases" },
  "live-events": { key: "live_events", note: "Streams and watch parties" },
  reminders: { key: "public_reminders", note: "The bot's timed announcements" },
  suggestions: { key: "suggestion_review", note: "Triage the board" },
};

// The groups this viewer is shown, in order: pages for Features they aren't
// shown are left out, a group with none left is dropped, Staff by role.
export function sidebarGroups(
  features: readonly SessionFeature[] | null | undefined,
  membership: SessionMembership | null | undefined,
): SidebarGroup[] {
  const view = featureView(features);
  const club = CLUB_PAGES.filter((p) => !p.feature || view.shown(p.feature));
  const staff: SidebarPage[] = staffSectionsFor(membership).flatMap((s) => {
    const page = s.nav ? STAFF_PAGE[s.key] : undefined;
    if (!page) return [];
    return [{ ...page, href: s.href, label: s.label, group: "staff" as const, exact: s.key === "overview" }];
  });
  const pages = [...club, ...staff];
  return (Object.keys(GROUP_LABEL) as SidebarGroupKey[])
    .map((key) => ({ key, label: GROUP_LABEL[key], pages: pages.filter((p) => p.group === key) }))
    .filter((g) => g.pages.length > 0);
}

// The Pinned Pages the viewer can see, in the member's order; keys for pages
// they can't see are skipped, not lost.
export function pinnedPages(groups: readonly SidebarGroup[], keys: readonly string[]): SidebarPage[] {
  const byKey = new Map<string, SidebarPage>(
    groups.flatMap((g) => g.pages).flatMap((p) => (p.pinnable === false ? [] : [[p.key, p] as const])),
  );
  return keys.flatMap((k) => byKey.get(k) ?? []);
}

// The path is this page's or one below it.
export function isCurrent(pathname: string, href: string, exact = false): boolean {
  return pathname === href || (!exact && pathname.startsWith(href + "/"));
}

// The page the viewer is on, by its longest matching path; null on a page
// with a fixed place (Dashboard, Settings, a profile) or one not listed.
// A Franchise's page sits under Franchises, which stays lit there (www#206).
export function currentPage(groups: readonly SidebarGroup[], pathname: string): SidebarPage | null {
  let best: SidebarPage | null = null;
  for (const page of groups.flatMap((g) => g.pages)) {
    if (isCurrent(pathname, page.href, page.exact) && (!best || page.href.length > best.href.length)) {
      best = page;
    }
  }
  return best;
}
