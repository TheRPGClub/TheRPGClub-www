"use client";

import {
  RARITY_TIER_LABEL,
  displayRarity,
  formatRarity,
  formatUnlockDate,
  isSpoiler,
  type RarityTier,
} from "@/lib/achievements";
import {
  RARITY_BAND_RANGE,
  formatSlot,
  rarityBands,
  type RarityBand,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { AchievementName, itemClass, type SpreadViewProps } from "./shared";
import { cn } from "@/lib/utils";

const TIER_TEXT: Record<RarityTier, string> = {
  common: "text-rarity-common",
  uncommon: "text-rarity-uncommon",
  rare: "text-rarity-rare",
  ultra: "text-rarity-ultra",
};

const TIER_RULE: Record<RarityTier, string> = {
  common: "bg-rarity-common",
  uncommon: "bg-rarity-uncommon",
  rare: "bg-rarity-rare",
  ultra: "bg-rarity-ultra",
};

// RARITY: one band per tier, Common to Ultra rare, each named in its ink
// with its % range and how many the shown member has. Unlocks sit in their
// band as die-cut tiles; locked ones as dashed numbered slots.
export function RarityView({
  items,
  tint,
  selectedId,
  onSelect,
  inlineId,
  inlineDetail,
}: SpreadViewProps) {
  const bands = rarityBands(items);
  return (
    <div className="flex flex-col">
      {bands.map((band) => {
        const picked = band.items.find((i) => i.view.id === selectedId);
        return (
          <section
            key={band.tier ?? "none"}
            aria-label={band.tier ? RARITY_TIER_LABEL[band.tier] : "No Rarity"}
            className="grid gap-x-6 gap-y-4 border-b border-rule py-6 first:pt-1 last:border-b-0 md:grid-cols-[11rem_minmax(0,1fr)]"
          >
            <BandLabel band={band} />
            {band.items.length === 0 ? (
              <p className="self-center text-[0.95rem] text-paper-mute">
                Nothing in the set is this rare.
              </p>
            ) : (
              <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))]">
                {band.items.map((item) => {
                  const { view, slot } = item;
                  const selected = selectedId === view.id;
                  const sealed = isSpoiler(view) && !view.unlocked;
                  const shown = displayRarity(view);
                  return (
                    <li key={view.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect(view.id)}
                        className={itemClass(
                          selected,
                          "flex w-full flex-col gap-2 rounded-md p-1.5 hover:bg-ink-3",
                        )}
                      >
                        <AchievementIcon
                          view={view}
                          size="lg"
                          slot={slot}
                          tint={tint.tint}
                          className="max-sm:size-[4.25rem]"
                        />
                        <span className="flex min-w-0 flex-col gap-0.5">
                          <span
                            className={cn(
                              "line-clamp-3 text-[0.82rem] leading-tight font-semibold break-words sm:text-[0.92rem]",
                              view.unlocked ? "text-paper" : "text-paper-dim",
                            )}
                          >
                            <span
                              className={cn(
                                "font-headline mr-1.5 text-[1.05rem] font-normal",
                                !view.unlocked && "opacity-60",
                              )}
                              style={{ color: tint.tint }}
                            >
                              {formatSlot(slot)}
                            </span>
                            <AchievementName view={view} />
                          </span>
                          <span className="text-[0.78rem] text-paper-mute">
                            {sealed
                              ? "Hidden"
                              : [
                                  shown.rarity != null ? formatRarity(shown.rarity) : null,
                                  view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "not yet",
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {picked && picked.view.id === inlineId && <div className="md:col-span-2">{inlineDetail(picked)}</div>}
          </section>
        );
      })}
    </div>
  );
}

function BandLabel({ band }: { band: RarityBand }) {
  const label = band.tier ? RARITY_TIER_LABEL[band.tier] : "No Rarity";
  return (
    <div className="flex items-start gap-3 md:flex-col md:gap-2">
      <span
        aria-hidden
        className={cn("mt-1 h-7 w-1.5 shrink-0 rounded-[1px] md:mt-0 md:h-1.5 md:w-10", band.tier ? TIER_RULE[band.tier] : "bg-rule-strong")}
      />
      <div className="flex flex-col gap-1">
        <h3
          className={cn(
            "font-headline text-[1.85rem] leading-[0.95] md:text-[2.1rem]",
            band.tier ? TIER_TEXT[band.tier] : "text-paper-dim",
          )}
        >
          {label}
        </h3>
        <p className="font-label flex flex-wrap gap-x-3 text-[0.8rem] text-paper-mute">
          {band.tier && <span className="text-paper-dim">{RARITY_BAND_RANGE[band.tier]}</span>}
          <span>
            {band.unlocked} of {band.items.length} unlocked
          </span>
        </p>
      </div>
    </div>
  );
}
