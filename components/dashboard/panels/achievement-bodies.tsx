import type { AchievementUnlock, UserSummary } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  displayRarity,
  formatRarity,
  isSpoiler,
  memberName,
  memberSetHref,
  rarityTier,
  setTitle,
  viewFromUnlock,
} from "@/lib/achievements";
import { foilKind } from "@/lib/achievements/hub";
import { readClubAchievements, readMyUnlocks } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { Badge } from "@/components/ui/badge";
import { MetaParts, PanelItem } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Latest Achievements: the club's (each member's newest Unlock of a day in
// a set, with how many more came with it) and the member's own.

export async function AchievementsClubBody({ wide }: BodyProps) {
  const cards = await readClubAchievements();
  const rows = cards?.flatMap((card) =>
    card.kind === "group"
      ? card.unlocks.slice(0, 1).map((unlock) => ({ unlock, user: card.user, more: card.count - 1 }))
      : [{ unlock: card as AchievementUnlock, user: card.user, more: 0 }],
  );
  return listBody({
    rows: rows ?? null,
    title: PANELS.achievements_club.title,
    wide,
    row: ({ unlock, user, more }) => <UnlockRow key={unlock.id} unlock={unlock} user={user} more={more} />,
  });
}

export async function AchievementsMineBody({ viewer, wide }: BodyProps) {
  const unlocks = await readMyUnlocks(viewer.id);
  return listBody({
    rows: unlocks,
    title: PANELS.achievements_mine.title,
    wide,
    row: (unlock) => <UnlockRow key={unlock.id} unlock={unlock} />,
  });
}

// An Unlock: its die-cut icon, its name (sealed while it is a spoiler to
// the viewer), the member and set, and its Rarity or foil.
function UnlockRow({ unlock, user, more = 0 }: { unlock: AchievementUnlock; user?: UserSummary; more?: number }) {
  const view = viewFromUnlock(unlock);
  const foil = foilKind(unlock.highlight);
  const name = isSpoiler(view) ? "Hidden achievement" : view.name || "Untitled achievement";
  return (
    <PanelItem
      media={<AchievementIcon view={view} size="sm" foil={foil != null} />}
      title={name}
      href={memberSetHref(unlock.user_id, unlock.achievement_set.id)}
      meta={
        <MetaParts
          parts={[user && <b>{memberName(user)}</b>, setTitle(unlock.achievement_set), more > 0 && `+${more} more`]}
        />
      }
      aside={foil ? <Badge tone="foil" size="sm">{HIGHLIGHT_LABEL[foil]}</Badge> : <RarityFigure unlock={unlock} />}
    />
  );
}

// The Rarity as a small chip in its tier's ink: "2.1%".
function RarityFigure({ unlock }: { unlock: AchievementUnlock }) {
  const { rarity } = displayRarity(viewFromUnlock(unlock));
  const tier = rarityTier(unlock.achievement.rarity);
  if (rarity == null || !tier) return null;
  return (
    <Badge tone={`rarity-${tier}`} size="sm">
      {formatRarity(rarity)}
    </Badge>
  );
}
