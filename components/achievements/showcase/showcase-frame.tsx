import type { AchievementProvider } from "@/lib/api/types";
import { formatRarity, rarityTier } from "@/lib/achievements";
import { viewFromGameAchievement, type SetMember } from "@/lib/achievements/game-page";
import type { ShowcaseItem, ShowcaseLens } from "@/lib/achievements/showcase";
import { cn } from "@/lib/utils";
import { FrameDetails } from "../frame/frame-details";
import { FRAME_RING, FrameHover } from "../frame/frame-hover";
import { FrameIcon } from "../frame/frame-icon";
import { ShowcaseHolders } from "./showcase-holders";

const RARITY_INK = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  ultra: "text-rarity-ultra",
} as const;

// One Achievement on the sheet: its art as a square frame filling the column, then the edge
// line (its number in its Rarity ink, the Rarity, and on the right "not yet"
// in the Me lens or how many club members have it), its name and one line
// of description. A missing one is a dark frame with the art faded. Hover
// opens its details with who in the club has it.
export function ShowcaseFrame({
  item,
  provider,
  lens,
  members,
}: {
  item: ShowcaseItem;
  provider: AchievementProvider;
  lens: ShowcaseLens;
  members: SetMember[];
}) {
  const { achievement, number, had } = item;
  const view = viewFromGameAchievement(achievement, provider, number - 1);
  const spoiler = view.hidden && !view.viewerUnlocked;
  const name = spoiler ? "Hidden achievement" : (view.name ?? "Untitled achievement");
  const tier = rarityTier(achievement.rarity);
  const label = `${name}, ${had ? (lens === "me" ? "unlocked" : "held in the club") : "not yet"}`;

  return (
    <FrameHover
      label={label}
      details={
        <FrameDetails view={view}>
          <ShowcaseHolders holders={achievement.holders} members={members} />
        </FrameDetails>
      }
      ring="inner"
      className="w-full text-left"
    >
      <FrameIcon view={view} size="fill" missing={!had} className={FRAME_RING} />
      <span className="font-label mt-1.5 flex items-baseline gap-2 text-[0.74rem] tracking-[0.06em]">
        <span className={tier ? RARITY_INK[tier] : "text-faint-foreground"}>{String(number).padStart(2, "0")}</span>
        {achievement.rarity != null && <span className="text-dim-foreground">{formatRarity(achievement.rarity)}</span>}
        <span className="ml-auto text-faint-foreground normal-case">
          {lens === "me" ? (had ? "" : "not yet") : `${achievement.holders.length}/${members.length}`}
        </span>
      </span>
      <span className={cn("mt-0.5 block truncate text-[0.95rem] font-semibold", had ? "text-foreground" : "text-faint-foreground")}>
        {name}
      </span>
      {view.description && !spoiler && (
        <span className="block truncate text-[0.8rem] text-faint-foreground">{view.description}</span>
      )}
    </FrameHover>
  );
}
