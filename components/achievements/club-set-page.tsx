import type { GameAchievementSet } from "@/lib/api/types";
import { setTitle } from "@/lib/achievements";
import {
  NAMED_GRID_LIMIT,
  RING_COLORS,
  RING_LIMIT,
  holderOpacity,
  ringSpots,
  setMembers,
  viewFromGameAchievement,
} from "@/lib/achievements/game-page";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import type { RingDot } from "./club-achievement-tile";
import { ClubSetBar, ClubSetHeader } from "./club-set-header";
import { ClubSetKey } from "./club-set-key";
import { ClubSetMargin } from "./club-set-margin";
import { ClubSetTiles, type ClubTile } from "./club-set-tiles";
import { TintSpine } from "./tint";

// One Achievement Set as the club's composite page on a game: the game-tint
// spine, every Achievement faded by how few members hold it and ringed by
// their dots, the members who completed it signing the margin, and the
// viewer's own progress as a tint bar along the top edge (to their set
// page). The page's top rule is its Provider colour, so it joins its tab.

const PROVIDER_RULE = {
  retroachievements: "border-t-provider-retroachievements",
  steam: "border-t-provider-steam",
  psn: "border-t-provider-psn",
} as const;

export function ClubSetPage({
  set,
  tint,
  names,
  viewerId,
}: {
  set: GameAchievementSet;
  tint: SetTint;
  // user_id -> display name, from the member directory.
  names: ReadonlyMap<string, string>;
  viewerId: string | null;
}) {
  const title = setTitle(set);
  const total = set.achievements.length || set.achievements_count;
  const members = setMembers(set, names);
  const ringed = members.slice(0, RING_LIMIT);
  const spots = ringSpots(ringed.length);
  const nameOf = new Map(members.map((m) => [m.userId, m.name]));
  const clubUnlocked = set.achievements.filter((a) => a.holders.length > 0).length;
  const named = set.achievements.length <= NAMED_GRID_LIMIT;

  const tiles: ClubTile[] = set.achievements.map((achievement, i) => {
    const view = viewFromGameAchievement(achievement, set.provider, i);
    const held = new Set(achievement.holders);
    const dots: RingDot[] = ringed.map((m, j) => ({
      spot: spots[j],
      color: RING_COLORS[j],
      on: held.has(m.userId),
    }));
    return {
      achievement,
      view,
      slot: i + 1,
      dots,
      opacity: holderOpacity(achievement.holders.length, members.length),
      holders: achievement.holders.map((id) => ({
        userId: id,
        name: nameOf.get(id) ?? names.get(id) ?? id,
      })),
      platinum: set.provider === "psn" && achievement.tier === "platinum",
    };
  });

  return (
    <article
      aria-label={`${title}, ${set.platform_label ?? set.provider}`}
      className={cn(
        "relative rounded-md rounded-tl-none border-t-[3px] bg-card shadow-[0_18px_40px_rgb(0_0_0/0.5)]",
        PROVIDER_RULE[set.provider],
      )}
    >
      <TintSpine tint={tint.tint} className="rounded-tl-none" />
      <ClubSetBar set={set} tint={tint} />
      <div className="grid gap-x-6 pt-6 pr-4 pb-5 pl-[30px] sm:pr-5 lg:grid-cols-[minmax(0,1fr)_12.5rem]">
        <ClubSetHeader set={set} title={title} total={total} clubUnlocked={clubUnlocked} />

        <div className="min-w-0">
          <ClubSetTiles
            tiles={tiles}
            named={named}
            tint={tint.tint}
            memberCount={members.length}
            viewerId={viewerId}
          />

          <ClubSetKey members={ringed} rest={members.length - ringed.length} total={members.length} viewerId={viewerId} />
        </div>

        <ClubSetMargin set={set} members={members} total={total} />
      </div>
    </article>
  );
}
