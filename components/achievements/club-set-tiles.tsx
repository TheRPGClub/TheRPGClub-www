import { formatRarity, isSpoiler, type AchievementView } from "@/lib/achievements";
import type { GameSetAchievement } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { ClubAchievementTile, type RingDot, type TileHolder } from "./club-achievement-tile";
import { SpoilerText } from "./spoiler-text";

// The club page's Achievements: a named grid (tile, name, how many hold it)
// when the set is small enough, else a dense grid of tiles alone with the
// Platinum at double size.

export interface ClubTile {
  achievement: GameSetAchievement;
  view: AchievementView;
  slot: number;
  dots: RingDot[];
  opacity: number;
  holders: TileHolder[];
  platinum: boolean;
}

export function ClubSetTiles({
  tiles,
  named,
  tint,
  memberCount,
  viewerId,
}: {
  tiles: ClubTile[];
  named: boolean;
  tint: string;
  memberCount: number;
  viewerId: string | null;
}) {
  return named ? (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-2 gap-y-5 pt-5 sm:grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))]">
      {tiles.map((t) => (
        <li key={t.achievement.id} className="flex flex-col items-center gap-2 text-center">
          <ClubAchievementTile
            view={t.view}
            size="md"
            slot={t.slot}
            tint={tint}
            opacity={t.opacity}
            dots={t.dots}
            holders={t.holders}
            memberCount={memberCount}
            viewerId={viewerId}
            foil={t.platinum}
          />
          <p
            className={cn(
              "line-clamp-2 max-w-[12rem] text-[0.86rem] leading-[1.15] font-semibold",
              t.holders.length ? "text-foreground" : "text-faint-foreground",
            )}
          >
            <SpoilerText spoiler={isSpoiler(t.view)}>
              {t.achievement.name ?? "Untitled achievement"}
            </SpoilerText>
          </p>
          <p className="-mt-1.5 text-[0.76rem] text-faint-foreground">
            {t.holders.length} of {memberCount}
            {t.achievement.rarity != null && ` · ${formatRarity(t.achievement.rarity)}`}
          </p>
        </li>
      ))}
    </ul>
  ) : (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] justify-items-center gap-y-1 pt-5">
      {tiles.map((t) => (
        <li
          key={t.achievement.id}
          className={cn("grid place-items-center", t.platinum && "col-span-2 row-span-2")}
        >
          <ClubAchievementTile
            view={t.view}
            size={t.platinum ? "lg" : "sm"}
            slot={t.slot}
            tint={tint}
            opacity={t.opacity}
            dots={t.dots}
            holders={t.holders}
            memberCount={memberCount}
            viewerId={viewerId}
            foil={t.platinum}
          />
        </li>
      ))}
    </ul>
  );
}
