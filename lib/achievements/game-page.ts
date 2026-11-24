import type {
  AchievementProvider,
  GameAchievementSet,
  GameSetAchievement,
} from "@/lib/api/types";
import { memberName, type AchievementView } from "@/lib/achievements";

// Pure helpers behind the game page's Achievement section: the sets per
// service, which to open, and each set's club members. No React here.

// The tab order on a game page.
export const GAME_TAB_ORDER: readonly AchievementProvider[] = [
  "steam",
  "retroachievements",
  "psn",
];

export interface ProviderTab {
  provider: AchievementProvider;
  sets: GameAchievementSet[];
}

// The Providers that have a set, in tab order, each with its sets in the
// api's order (by title).
export function groupSetsByProvider(sets: GameAchievementSet[]): ProviderTab[] {
  return GAME_TAB_ORDER.map((provider) => ({
    provider,
    sets: sets.filter((set) => set.provider === provider),
  })).filter((tab) => tab.sets.length > 0);
}

// The tab and set to open: `?ach=<provider>` and `?ach_set=<id>` when they
// name something on the page, otherwise the first tab and its first set.
export function pickInitialTab(
  tabs: ProviderTab[],
  ach: string | undefined,
  achSet: string | undefined,
): { provider: AchievementProvider; setId: number } | null {
  if (tabs.length === 0) return null;
  const tab = tabs.find((t) => t.provider === ach) ?? tabs[0];
  const setId = Number(achSet);
  const set = tab.sets.find((s) => s.id === setId) ?? tab.sets[0];
  return { provider: tab.provider, setId: set.id };
}

// A short name for a set inside its Provider tab: the platform (PS4, PS5)
// when it tells the sets apart, else the title.
export function setSwitchLabel(
  set: GameAchievementSet,
  siblings: GameAchievementSet[],
): string {
  const label = set.platform_label?.trim();
  const unique =
    label &&
    siblings.filter((s) => s.platform_label?.trim() === label).length === 1;
  return unique ? label : set.title?.trim() || `Set ${set.id}`;
}

// A member on a set's page: everyone with at least one Unlock in it (or a
// Completion), with how many of its Achievements they hold.
export interface SetMember {
  userId: string;
  name: string;
  held: number;
  completedAt: string | null;
}

// The set's members in ring order: completers first (oldest Completion
// first), then by Unlocks held, then by name. Names come from the member
// directory, then the Completion's user, then the id.
export function setMembers(
  set: GameAchievementSet,
  names: ReadonlyMap<string, string>,
): SetMember[] {
  const held = new Map<string, number>();
  for (const achievement of set.achievements) {
    for (const id of achievement.holders) held.set(id, (held.get(id) ?? 0) + 1);
  }
  const completedAt = new Map<string, string>();
  const completionNames = new Map<string, string>();
  for (const completion of set.completions) {
    completedAt.set(completion.user.user_id, completion.completed_at);
    completionNames.set(completion.user.user_id, memberName(completion.user));
    if (!held.has(completion.user.user_id)) held.set(completion.user.user_id, 0);
  }
  const order = new Map(set.completions.map((c, i) => [c.user.user_id, i]));
  return [...held.entries()]
    .map(([userId, count]) => ({
      userId,
      name: names.get(userId) ?? completionNames.get(userId) ?? userId,
      held: count,
      completedAt: completedAt.get(userId) ?? null,
    }))
    .sort((a, b) => {
      const ca = order.get(a.userId);
      const cb = order.get(b.userId);
      if (ca != null || cb != null) {
        if (ca == null) return 1;
        if (cb == null) return -1;
        return ca - cb;
      }
      return b.held - a.held || a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    });
}

// The icon's view: "unlocked" here means some member holds it, so the tile
// shows its art; the spoiler still follows the viewer's own Unlock.
export function viewFromGameAchievement(
  achievement: GameSetAchievement,
  provider: AchievementProvider,
  index: number,
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
    displayOrder: index,
    rarity: achievement.rarity ?? null,
    rarityHardcore: null,
    unlocked: achievement.holders.length > 0,
    unlockedAt: null,
    hardcore: false,
    viewerUnlocked: achievement.viewer_unlocked,
  };
}
