import type { FeatureKey, FeatureView } from "@/lib/features";

// Dashboard Panels (spec api#421, www#144): the blocks of recent club or
// personal activity below the current issue. The API owns the list of keys,
// who can see each one and the club default (ADR 0012); the website owns how
// each looks: its name, scope chip, ink, column and "See all" page.
// Client-safe: no server imports.

export const PANEL_KEYS = [
  "news",
  "now_playing_club",
  "releases",
  "achievements_club",
  "challenges_club",
  "now_playing_mine",
  "achievements_mine",
  "challenge_runs_mine",
  "completions_club",
  "completions_mine",
  "backlog_pick",
  "reviews",
  "journals",
  "giveaways",
  "suggestions",
  "codex",
  "birthdays",
] as const;

export type PanelKey = (typeof PANEL_KEYS)[number];

// The club default (DashboardPanels::DEFAULT in the API), only for a read
// that failed: the API's answer always wins.
export const CLUB_DEFAULT: readonly PanelKey[] = [
  "news",
  "now_playing_club",
  "releases",
  "achievements_club",
  "challenges_club",
];

// About five items a panel (the design round's pick).
export const PANEL_ITEMS = 5;

// Wide panels sit in the main column with their items two across; rail
// panels in the 23rem rail beside it (unify pick B).
export type PanelPlace = "wide" | "rail";

// The panel ink token, set as `--panel-ink` on the panel (DESIGN.md, Panel
// inks). Panels of the same subject share one.
export type PanelInk =
  | "news"
  | "now-playing"
  | "releases"
  | "achievements"
  | "challenges"
  | "completions"
  | "backlog"
  | "reviews"
  | "journals"
  | "giveaways"
  | "suggestions"
  | "codex"
  | "birthdays";

export interface PanelSpec {
  key: PanelKey;
  title: string;
  // One line on what it shows, for its card in edit mode's Hidden tray.
  blurb: string;
  scope: "club" | "mine";
  // Mine and Club versions of one subject carry a scope chip, so the two
  // tell apart; a panel with only one version has none.
  chip: boolean;
  place: PanelPlace;
  ink: PanelInk;
  // The Feature it belongs to (null: always shown, as Upcoming Birthdays).
  feature: FeatureKey | null;
  // "See all": the panel's page, null when it has none.
  seeAll: ((viewerId: string) => string) | null;
}

const me = (path: string) => (viewerId: string) => `/members/${viewerId}${path}`;
const page = (path: string) => () => path;

export const PANELS: Readonly<Record<PanelKey, PanelSpec>> = {
  news: { key: "news", blurb: "The club's latest news", title: "Latest News", scope: "club", chip: false, place: "wide", ink: "news", feature: "news_hub", seeAll: page("/news") },
  now_playing_club: { key: "now_playing_club", blurb: "What the club is playing", title: "Now Playing", scope: "club", chip: true, place: "wide", ink: "now-playing", feature: "now_playing", seeAll: page("/members") },
  releases: { key: "releases", blurb: "Games coming out soon", title: "Upcoming Releases", scope: "club", chip: false, place: "wide", ink: "releases", feature: "release_calendar", seeAll: page("/releases") },
  achievements_club: { key: "achievements_club", blurb: "The club's newest Unlocks", title: "Latest Achievements", scope: "club", chip: true, place: "wide", ink: "achievements", feature: "achievement_hub", seeAll: page("/achievements") },
  challenges_club: { key: "challenges_club", blurb: "Runs started, games cleared", title: "Challenge Activity", scope: "club", chip: false, place: "wide", ink: "challenges", feature: "challenges", seeAll: page("/challenges") },
  now_playing_mine: { key: "now_playing_mine", blurb: "What you're playing", title: "Now Playing", scope: "mine", chip: true, place: "rail", ink: "now-playing", feature: "now_playing", seeAll: me("/now-playing-games") },
  achievements_mine: { key: "achievements_mine", blurb: "Your sets closest to done", title: "Latest Achievements", scope: "mine", chip: true, place: "wide", ink: "achievements", feature: "achievement_hub", seeAll: me("/achievements") },
  challenge_runs_mine: { key: "challenge_runs_mine", blurb: "Your Runs and how far along they are", title: "Challenge Runs", scope: "mine", chip: false, place: "rail", ink: "challenges", feature: "challenges", seeAll: page("/challenges") },
  completions_club: { key: "completions_club", blurb: "Games the club just finished", title: "Recent Completions", scope: "club", chip: true, place: "wide", ink: "completions", feature: "game_completions", seeAll: page("/members") },
  completions_mine: { key: "completions_mine", blurb: "Games you just finished", title: "Recent Completions", scope: "mine", chip: true, place: "wide", ink: "completions", feature: "game_completions", seeAll: me("/completed-games") },
  backlog_pick: { key: "backlog_pick", blurb: "A game from your backlog", title: "Backlog Pick", scope: "mine", chip: false, place: "rail", ink: "backlog", feature: "backlog", seeAll: me("/backlogged-games/pick") },
  reviews: { key: "reviews", blurb: "The club's newest reviews", title: "Latest Reviews", scope: "club", chip: false, place: "wide", ink: "reviews", feature: "reviews", seeAll: page("/games") },
  journals: { key: "journals", blurb: "New Game Journal entries", title: "Game Journals", scope: "club", chip: false, place: "wide", ink: "journals", feature: "journals", seeAll: page("/journals") },
  giveaways: { key: "giveaways", blurb: "Keys up for grabs, newest first", title: "Open Giveaways", scope: "club", chip: false, place: "wide", ink: "giveaways", feature: "giveaways", seeAll: page("/giveaways") },
  suggestions: { key: "suggestions", blurb: "Latest Suggestion Board activity", title: "Suggestion Board", scope: "club", chip: false, place: "wide", ink: "suggestions", feature: "suggestions", seeAll: page("/suggestions") },
  codex: { key: "codex", blurb: "Today's Fun Fact", title: "Codex fact", scope: "club", chip: false, place: "rail", ink: "codex", feature: "club_codex", seeAll: page("/codex/fun-facts") },
  birthdays: { key: "birthdays", blurb: "Shared Birthdays in the next 30 days", title: "Upcoming Birthdays", scope: "club", chip: false, place: "rail", ink: "birthdays", feature: null, seeAll: null },
};

export function isPanelKey(key: unknown): key is PanelKey {
  return typeof key === "string" && (PANEL_KEYS as readonly string[]).includes(key);
}

// The panels to draw, in the member's order: keys this website knows (a
// panel the API added first waits for the website), each once, and only
// those whose Feature the member can see. The API already leaves out what
// the member can't see; the check here keeps the fallback default honest
// and covers a session that changed since.
export function shownPanels(keys: readonly string[], features: Pick<FeatureView, "shown">): PanelKey[] {
  const seen = new Set<PanelKey>();
  for (const key of keys) {
    if (!isPanelKey(key) || seen.has(key)) continue;
    const { feature } = PANELS[key];
    if (feature && !features.shown(feature)) continue;
    seen.add(key);
  }
  return [...seen];
}

// Each panel with its place in the member's order, split by column. On a
// phone the columns fold back into one in that order (`order` on each).
export interface PlacedPanel {
  key: PanelKey;
  order: number;
}

export function placePanels(keys: readonly PanelKey[]): Record<PanelPlace, PlacedPanel[]> {
  const placed: Record<PanelPlace, PlacedPanel[]> = { wide: [], rail: [] };
  keys.forEach((key, order) => placed[PANELS[key].place].push({ key, order }));
  return placed;
}

// The member whose dashboard it is: Mine panels read their lists and wear
// their avatar on the scope chip.
export interface PanelViewer {
  // The member's id as the API's per-member routes take it (Discord id).
  id: string;
  name: string;
  avatarUrl: string | null;
}

// The keys to draw from the API's answer: the member's list, or the club
// default when the read failed (null), each then checked against what the
// member can see.
export function memberPanels(saved: readonly string[] | null, features: Pick<FeatureView, "shown">): PanelKey[] {
  return shownPanels(saved ?? CLUB_DEFAULT, features);
}
