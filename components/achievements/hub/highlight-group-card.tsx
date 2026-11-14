import type { AchievementFeedGroup } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  displayRarity,
  isSpoiler,
  rarityTier,
  viewFromUnlock,
} from "@/lib/achievements";
import { foilKind, type leadHighlight } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "../achievement-hover-card";
import { AchievementIcon } from "../achievement-icon";
import { FoilStamp } from "../foil-stamp";
import { RarityChip } from "../rarity-chip";
import { SpoilerText } from "../spoiler-text";
import { BandLine, CardShell, WhoLine } from "./group-card-parts";
import { OddsTag } from "./parts";

// A Latest card holding a Highlight, at double size: its lead Unlock sits
// large on the right under a foil stamp (Platinum, Mastery, Completion) or
// its ultra-rare Rarity, and the rest shrink to a strip of Rarity dots.

const RARITY_DOT = {
  common: "border-rarity-common",
  uncommon: "border-rarity-uncommon",
  rare: "border-rarity-rare",
  ultra: "border-rarity-ultra",
} as const;

export function HighlightGroupCard({
  card,
  lead,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  lead: NonNullable<ReturnType<typeof leadHighlight>>;
  tint: SetTint;
  className?: string;
}) {
  const view = viewFromUnlock(lead);
  const foil = foilKind(lead.highlight);
  const rarity = displayRarity(view);
  const set = card.achievement_set;
  const more = Math.max(0, card.count - card.unlocks.length);

  return (
    <CardShell tint={tint} className={className}>
      <div className="grid h-full sm:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex min-w-0 flex-col gap-3 px-4 pt-3 pb-4">
          <WhoLine card={card} />
          <BandLine card={card} tint={tint} />
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] text-dim-foreground">
            {lead.highlight === "completion" || lead.highlight === "mastery" ? (
              <span>
                {HIGHLIGHT_LABEL[lead.highlight]}: all {set.achievements_count}{" "}
                {set.achievements_count === 1 ? "Achievement" : "Achievements"}
                {lead.highlight === "mastery" && ", hardcore"}
              </span>
            ) : (
              <SpoilerText spoiler={isSpoiler(view)} className="min-w-0 truncate font-semibold text-foreground">
                {view.name ?? "Untitled achievement"}
              </SpoilerText>
            )}
            {lead.highlight !== "rare" && (
              <RarityChip rarity={view.rarity} figure={rarity.rarity} size="sm" />
            )}
          </p>
          <div className="mt-auto flex items-center gap-2.5">
            <ul aria-label={`${card.count} Unlocks by Rarity`} className="flex flex-wrap gap-1">
              {card.unlocks.map((unlock) => {
                const tier = rarityTier(unlock.achievement.rarity);
                return (
                  <li
                    key={unlock.id}
                    className={cn(
                      "size-[13px] rounded-[1.5px] border-2 bg-muted",
                      tier ? RARITY_DOT[tier] : "border-faint-foreground",
                      unlock.id === lead.id && foil && "foil border-transparent",
                    )}
                  />
                );
              })}
            </ul>
            {more > 0 && (
              <span className="font-label text-[0.78rem] text-faint-foreground">+{more}</span>
            )}
          </div>
        </div>

        {/* The lead Unlock, large, under its stamp or its Rarity. */}
        <div className="relative h-40 min-w-0 sm:h-auto sm:min-h-40">
          <AchievementHoverCard
            view={view}
            className="absolute top-3 right-8 rotate-[4deg] sm:right-6"
          >
            <AchievementIcon view={view} size="xl" foil={foil != null} className="drop-shadow-[0_8px_16px_rgb(0_0_0/0.55)]" />
          </AchievementHoverCard>
          {foil ? (
            <FoilStamp
              kind={foil}
              size={foil === "completion" ? "md" : "lg"}
              className="pointer-events-none absolute right-28 bottom-3 sm:right-auto sm:bottom-2 sm:left-0"
            />
          ) : (
            rarity.rarity != null && (
              <OddsTag
                rarity={view.rarity ?? rarity.rarity}
                className="absolute top-2 right-5 text-[1.15rem] sm:right-7"
              />
            )
          )}
        </div>
      </div>
    </CardShell>
  );
}
