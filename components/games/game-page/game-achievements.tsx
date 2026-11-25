import {
  fetchGameAchievementSets,
  fetchRingMemberNames,
} from "@/lib/games/game-page";
import {
  groupSetsByProvider,
  pickInitialTab,
  setMembers,
  setSwitchLabel,
} from "@/lib/achievements/game-page";
import { Showcase } from "@/components/achievements/showcase/showcase";

// The game page's last section: the game's Achievements per service, where
// the viewer and the club stand in each set, and who has each one (on
// hover). A game without sets (or a read that fails) shows nothing, so the
// page doesn't apologise for it.
export async function GameAchievements({
  gameId,
  ach,
  achSet,
}: {
  gameId: number;
  // The service and set to open (`?ach=steam&ach_set=3`).
  ach?: string;
  achSet?: string;
}) {
  const sets = await fetchGameAchievementSets(gameId);
  if (!sets) return null;
  const tabs = groupSetsByProvider(sets);
  const initial = pickInitialTab(tabs, ach, achSet);
  if (!initial) return null;
  const names = await fetchRingMemberNames();

  return (
    <Showcase
      initialProvider={initial.provider}
      initialSetId={initial.setId}
      tabs={tabs.map((tab) => ({
        provider: tab.provider,
        sets: tab.sets.map((set) => ({
          set,
          label: setSwitchLabel(set, tab.sets),
          members: setMembers(set, names),
        })),
      }))}
    />
  );
}
