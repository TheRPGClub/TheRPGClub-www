"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import {
  displayRarity,
  formatUnlockDate,
  isSpoiler,
} from "@/lib/achievements";
import {
  formatSlot,
  type HeadlineReason,
  type SlottedAchievement,
} from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { AchievementName, HeadlineChip, itemClass, type SpreadViewProps } from "./shared";
import { cn } from "@/lib/utils";

// CHECKLIST: the headline Achievement as a hero on the tint, then every
// other one in display order as a numbered row: number, tick, icon, name,
// Rarity and the shown member's Unlock date (or "Not yet").
export function ChecklistView({
  items,
  tint,
  selectedId,
  onSelect,
  inlineDetail,
  headline,
}: SpreadViewProps & {
  headline: { item: SlottedAchievement; reason: HeadlineReason } | null;
}) {
  const rest = headline ? items.filter((i) => i.view.id !== headline.item.view.id) : items;

  return (
    <div className="flex flex-col gap-5">
      {headline && (
        <>
          <Hero
            item={headline.item}
            reason={headline.reason}
            tint={tint.tint}
            contrast={tint.contrast}
            selected={selectedId === headline.item.view.id}
            onSelect={onSelect}
          />
          {selectedId === headline.item.view.id && inlineDetail(headline.item)}
        </>
      )}

      {rest.length > 0 && (
        <ol aria-label="Achievements" className="flex flex-col">
          {rest.map((item) => (
            <Fragment key={item.view.id}>
              <li className="border-b border-rule last:border-b-0">
                <Row
                  item={item}
                  tint={tint.tint}
                  contrast={tint.contrast}
                  selected={selectedId === item.view.id}
                  onSelect={onSelect}
                />
              </li>
              {selectedId === item.view.id && <li className="py-3 xl:hidden">{inlineDetail(item)}</li>}
            </Fragment>
          ))}
        </ol>
      )}
    </div>
  );
}

function Hero({
  item,
  reason,
  tint,
  contrast,
  selected,
  onSelect,
}: {
  item: SlottedAchievement;
  reason: HeadlineReason;
  tint: string;
  contrast: string;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const { view, slot } = item;
  const spoiler = isSpoiler(view);
  const shown = displayRarity(view);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(view.id)}
      className={itemClass(
        selected,
        "grid w-full grid-cols-[auto_minmax(0,1fr)] content-center items-center gap-x-5 gap-y-3 rounded-md p-5 sm:gap-x-7 sm:p-7",
      )}
      style={{ background: tint, color: contrast }}
    >
      <AchievementIcon
        view={view}
        size="xl"
        slot={slot}
        tint={contrast}
        className="max-sm:size-20 sm:row-span-3"
      />
      <AchievementName
        view={view}
        className="font-headline block self-end text-[2.25rem] leading-[0.92] [overflow-wrap:anywhere] max-sm:self-center sm:text-[3rem]"
      />
      {view.description && !spoiler && (
        <span className="line-clamp-3 max-w-[52ch] text-[0.95rem] leading-snug max-sm:col-span-2">
          {view.description}
        </span>
      )}
      <span className="font-label flex flex-wrap items-center gap-x-3 gap-y-1.5 self-start text-[0.85rem] max-sm:col-span-2">
        <HeadlineChip
          reason={reason}
          className="shadow-[0_0_0_2px_rgb(11_11_13/0.35)]"
          style={{ background: contrast, color: tint }}
        />
        {!(spoiler && !view.unlocked) && (
          <RarityChip
            rarity={view.rarity}
            figure={shown.rarity}
            className="shadow-[0_0_0_2px_rgb(11_11_13/0.35)]"
          />
        )}
        <span>
          {view.unlockedAt ? `Unlocked ${formatUnlockDate(view.unlockedAt)}` : "Not yet unlocked"}
        </span>
      </span>
    </button>
  );
}

function Row({
  item,
  tint,
  contrast,
  selected,
  onSelect,
}: {
  item: SlottedAchievement;
  tint: string;
  contrast: string;
  selected: boolean;
  onSelect: (id: number) => void;
}) {
  const { view, slot } = item;
  const sealed = isSpoiler(view) && !view.unlocked;
  const shown = displayRarity(view);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(view.id)}
      className={itemClass(
        selected,
        cn(
          "grid w-full items-center gap-x-3 px-2 py-2.5 hover:bg-ink-3 sm:gap-x-4 sm:px-3",
          "grid-cols-[2.4rem_1.25rem_2.5rem_minmax(0,1fr)] sm:grid-cols-[3rem_1.4rem_3.5rem_minmax(0,1fr)_auto_7.5rem]",
          selected && "bg-ink-3",
        ),
      )}
    >
      <span
        className={cn(
          "font-headline text-[1.9rem] leading-none sm:text-[2.4rem]",
          !view.unlocked && "opacity-55",
        )}
        style={{ color: tint }}
      >
        {formatSlot(slot)}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-5 place-items-center rounded-[3px] sm:size-[1.4rem]",
          view.unlocked ? "" : "border-[1.5px] border-rule-strong",
        )}
        style={view.unlocked ? { background: tint } : undefined}
      >
        {view.unlocked && <Check className="size-3.5" style={{ color: contrast }} strokeWidth={3.5} />}
      </span>
      <AchievementIcon view={view} size="sm" tint={tint} className="sm:size-14" />
      <span className="flex min-w-0 flex-col gap-1">
        <AchievementName
          view={view}
          className={cn(
            "truncate text-[1rem] font-semibold sm:text-[1.05rem]",
            view.unlocked ? "text-paper" : "text-paper-dim",
          )}
        />
        <span className="font-label flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] whitespace-nowrap text-paper-mute sm:hidden">
          {sealed ? (
            <span>Hidden</span>
          ) : (
            <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" />
          )}
          <span className={cn(!view.unlockedAt && "italic normal-case tracking-normal")}>
            {view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "Not yet"}
          </span>
        </span>
        <span className="sr-only">{view.unlocked ? "Unlocked" : "Not unlocked"}</span>
      </span>
      <span className="hidden justify-self-start sm:block">
        {sealed ? (
          <span className="font-label inline-flex h-5 items-center rounded-xs bg-paper/8 px-1.5 text-[0.72rem] text-paper-dim">
            Hidden
          </span>
        ) : (
          <RarityChip rarity={view.rarity} figure={shown.rarity} size="sm" />
        )}
      </span>
      <span
        className={cn(
          "hidden text-right text-[0.88rem] sm:block",
          view.unlockedAt ? "text-paper-dim" : "text-paper-mute italic",
        )}
      >
        {view.unlockedAt ? formatUnlockDate(view.unlockedAt) : "Not yet"}
      </span>
    </button>
  );
}
