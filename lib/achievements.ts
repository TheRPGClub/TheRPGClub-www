import type {
  AchievementHighlightKind,
  AchievementProvider,
  AchievementSet,
  AchievementSetCompletion,
  AchievementTier,
  AchievementUnlock,
  SetAchievement,
  SetProgress,
  UserSummary,
} from "@/lib/api/types";

// Pure helpers behind the Achievement Hub components: one view shape for an
// Achievement whichever read it came from, the spoiler and Rarity rules, the
// grid order and the hub's links. No React here, so pages and components on
// either side of the client boundary share them.

export const PROVIDER_LABEL: Record<AchievementProvider, string> = {
  retroachievements: "RetroAchievements",
  steam: "Steam",
  psn: "PlayStation",
};

export const PROVIDER_SHORT_LABEL: Record<AchievementProvider, string> = {
  retroachievements: "RA",
  steam: "Steam",
  psn: "PSN",
};

export const TIER_LABEL: Record<AchievementTier, string> = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export const HIGHLIGHT_LABEL: Record<AchievementHighlightKind, string> = {
  platinum: "Platinum",
  completion: "Completion",
  mastery: "Mastery",
  rare: "Ultra rare",
};

// A Highlight is an Unlock rarer than this (Provider Rarity, in percent).
// RarityLabel says "Ultra rare" under the same line, so the two never
// disagree.
export const ULTRA_RARE_BELOW = 5;

// Feed cards show at most this many icons; the rest is "+N".
export const FEED_ICON_LIMIT = 8;

// One Achievement as the components draw it. `unlocked` is the shown
// member's state (what the icon and date say); `viewerUnlocked` is the
// signed-in viewer's own, which alone lifts the spoiler blur.
export interface AchievementView {
  id: number;
  provider: AchievementProvider;
  name: string | null;
  description: string | null;
  iconUrl: string | null;
  iconLockedUrl: string | null;
  hidden: boolean;
  points: number | null;
  tier: AchievementTier | null;
  displayOrder: number | null;
  rarity: number | null;
  rarityHardcore: number | null;
  unlocked: boolean;
  unlockedAt: string | null;
  hardcore: boolean;
  viewerUnlocked: boolean;
}

export function viewFromSetAchievement(
  achievement: SetAchievement,
  provider: AchievementProvider,
): AchievementView {
  return {
    id: achievement.id,
    provider,
    name: achievement.name ?? null,
    description: achievement.description ?? null,
    iconUrl: achievement.icon_url ?? null,
    iconLockedUrl: achievement.icon_locked_url ?? null,
    hidden: achievement.hidden,
    points: achievement.points ?? null,
    tier: achievement.tier ?? null,
    displayOrder: achievement.display_order ?? null,
    rarity: achievement.rarity ?? null,
    rarityHardcore: achievement.rarity_hardcore ?? null,
    unlocked: achievement.unlocked_at != null,
    unlockedAt: achievement.unlocked_at,
    hardcore: achievement.hardcore,
    viewerUnlocked: achievement.viewer_unlocked,
  };
}

export function viewFromUnlock(unlock: AchievementUnlock): AchievementView {
  const { achievement } = unlock;
  return {
    id: achievement.id,
    provider: unlock.achievement_set.provider,
    name: achievement.name ?? null,
    description: achievement.description ?? null,
    iconUrl: achievement.icon_url ?? null,
    iconLockedUrl: achievement.icon_locked_url ?? null,
    hidden: achievement.hidden,
    points: achievement.points ?? null,
    tier: achievement.tier ?? null,
    displayOrder: achievement.display_order ?? null,
    rarity: achievement.rarity ?? null,
    rarityHardcore: achievement.rarity_hardcore ?? null,
    unlocked: true,
    unlockedAt: unlock.unlocked_at,
    hardcore: unlock.hardcore,
    viewerUnlocked: unlock.viewer_unlocked,
  };
}

// A hidden Achievement's name and description stay blurred until the viewer
// has unlocked it themselves.
export function isSpoiler(
  view: Pick<AchievementView, "hidden" | "viewerUnlocked">,
): boolean {
  return view.hidden && !view.viewerUnlocked;
}

export function isUltraRare(rarity: number | null | undefined): boolean {
  return rarity != null && rarity < ULTRA_RARE_BELOW;
}

// The Rarity to show: RetroAchievements' hardcore figure for a hardcore
// Unlock when the Provider has one, else the overall figure.
export function displayRarity(
  view: Pick<AchievementView, "provider" | "hardcore" | "rarity" | "rarityHardcore">,
): { rarity: number | null; hardcore: boolean } {
  if (
    view.provider === "retroachievements" &&
    view.hardcore &&
    view.rarityHardcore != null
  ) {
    return { rarity: view.rarityHardcore, hardcore: true };
  }
  return { rarity: view.rarity, hardcore: false };
}

// "0.8%", "12%", "<0.1%": Rarity as the Provider reports it, trimmed.
export function formatRarity(rarity: number): string {
  if (rarity > 0 && rarity < 0.1) return "<0.1%";
  const digits = rarity < 10 ? 1 : 0;
  return `${Number(rarity.toFixed(digits))}%`;
}

// The sync stores Unlocks the Provider gave no time for at the epoch.
export function isUnknownUnlockDate(iso: string | null | undefined): boolean {
  return iso != null && new Date(iso).getUTCFullYear() === 1970;
}

// Dates in UTC, the feed's day boundary, so the server render and the
// client agree.
const DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function formatUnlockDate(iso: string): string {
  if (isUnknownUnlockDate(iso)) return "Unknown date";
  return DATE.format(new Date(iso));
}

// A feed card's `day` (YYYY-MM-DD, UTC).
export function formatFeedDay(day: string): string {
  return formatUnlockDate(`${day}T00:00:00Z`);
}

// Grid order. "display" is the Provider's order; "unlocked-first" puts the
// shown member's Unlocks ahead of the locked ones, each in display order.
export type AchievementOrder = "display" | "unlocked-first";

export function sortAchievements(
  items: AchievementView[],
  order: AchievementOrder,
): AchievementView[] {
  const byDisplay = (a: AchievementView, b: AchievementView) =>
    (a.displayOrder ?? Number.MAX_SAFE_INTEGER) -
      (b.displayOrder ?? Number.MAX_SAFE_INTEGER) || a.id - b.id;
  return [...items].sort((a, b) => {
    if (order === "unlocked-first" && a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }
    return byDisplay(a, b);
  });
}

// Earned share of a set, 0-100, floored so a set reads 100 only when done.
export function progressPercent(
  progress: Pick<SetProgress, "earned_count" | "total_count">,
): number {
  if (progress.total_count <= 0) return 0;
  return Math.floor((progress.earned_count / progress.total_count) * 100);
}

// The badges a set's progress has earned. Mastery is a Completion, so it
// stands in for it rather than beside it.
export type SetBadge = "completion" | "mastery" | "platinum";

export function setBadges(
  progress: Pick<SetProgress, "completed_at" | "mastered_at" | "platinum_at">,
): SetBadge[] {
  const badges: SetBadge[] = [];
  if (progress.mastered_at) badges.push("mastery");
  else if (progress.completed_at) badges.push("completion");
  if (progress.platinum_at) badges.push("platinum");
  return badges;
}

export function setTitle(set: Pick<AchievementSet, "title">): string {
  return set.title?.trim() || "Untitled set";
}

// global_name, then username, then the Discord id (the api's rule).
export function memberName(
  user: Pick<UserSummary, "user_id" | "global_name" | "username">,
): string {
  return user.global_name || user.username || user.user_id;
}

export function memberAchievementsHref(userId: string): string {
  return `/members/${userId}/achievements`;
}

export function memberSetHref(userId: string, setId: number): string {
  return `/members/${userId}/achievements/${setId}`;
}

// The Linked Accounts section of the member's edit page. EditSections shows
// only the section the hash names, so the hash is required.
export function linkedAccountsEditHref(userId: string): string {
  return `/members/${userId}/edit#linked-accounts`;
}

// A Completion on the game page's showcase: "Ana · Completed Mar 3, 2026"
// (or "Completed, unknown date" for an Unlock the Provider gave no time).
export function completionLabel(
  completion: Pick<AchievementSetCompletion, "user" | "completed_at">,
): string {
  const name = memberName(completion.user);
  if (isUnknownUnlockDate(completion.completed_at)) {
    return `${name} · Completed, unknown date`;
  }
  return `${name} · Completed ${formatUnlockDate(completion.completed_at)}`;
}
