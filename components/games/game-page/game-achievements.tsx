import {
  fetchGameAchievementSets,
  fetchRingMemberNames,
} from "@/lib/games/game-page";
import {
  groupSetsByProvider,
  pickInitialTab,
  setSwitchLabel,
} from "@/lib/achievements/game-page";
import { getSetTint } from "@/lib/achievements/tint";
import { ClubSetPage } from "@/components/achievements/club-set-page";
import { GameAchievementTabs } from "@/components/achievements/game-achievement-tabs";
import { DetailSection } from "@/components/templates/detail-template";

// The Achievement showcase: one composite page per Achievement Set, behind
// Provider tabs (only the Providers with a set). Each page rings every
// Achievement with the members who hold it and signs its Completions in the
// margin. A game without sets (or a read that fails) shows nothing, so the
// page doesn't apologise for it.
export async function GameAchievements({
  gameId,
  coverUrl,
  viewerId,
  ach,
  achSet,
}: {
  gameId: number;
  coverUrl: string | null;
  viewerId: string | null;
  // The Achievement tab and set to open (`?ach=steam&ach_set=3`).
  ach?: string;
  achSet?: string;
}) {
  const sets = await fetchGameAchievementSets(gameId);
  if (!sets) return null;
  const tabs = groupSetsByProvider(sets);
  const initial = pickInitialTab(tabs, ach, achSet);
  if (!initial) return null;

  const [names, tints] = await Promise.all([
    fetchRingMemberNames(),
    Promise.all(
      sets.map((set) =>
        getSetTint({ coverUrl, iconUrl: set.icon_url, setId: set.id }),
      ),
    ),
  ]);
  const tintOf = new Map(sets.map((set, i) => [set.id, tints[i]]));

  return (
    <DetailSection
      id="game-achievements"
      title="Achievements"
      count={`${sets.length} ${sets.length === 1 ? "set" : "sets"}`}
      className="mt-10"
      headingClassName="mb-5"
    >
      <GameAchievementTabs
        initialProvider={initial.provider}
        initialSetId={initial.setId}
        tabs={tabs.map((tab) => ({
          provider: tab.provider,
          sets: tab.sets.map((set) => ({
            id: set.id,
            label: setSwitchLabel(set, tab.sets),
            page: (
              <ClubSetPage
                set={set}
                tint={tintOf.get(set.id)!}
                names={names}
                viewerId={viewerId}
              />
            ),
          })),
        }))}
      />
    </DetailSection>
  );
}
