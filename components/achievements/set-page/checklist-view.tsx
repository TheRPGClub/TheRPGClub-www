"use client";

import { Fragment } from "react";
import type { HeadlineReason, SlottedAchievement } from "@/lib/achievements/set-page";
import { ChecklistHero } from "./checklist-hero";
import { ChecklistRow } from "./checklist-row";
import type { SpreadViewProps } from "./shared";

// CHECKLIST: the headline Achievement as a hero on the tint, then every
// other one in display order as a numbered row: number, tick, icon, name,
// Rarity and the shown member's Unlock date (or "Not yet").
export function ChecklistView({
  items,
  tint,
  selectedId,
  onSelect,
  inlineId,
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
          <ChecklistHero
            item={headline.item}
            reason={headline.reason}
            tint={tint.tint}
            contrast={tint.contrast}
            selected={selectedId === headline.item.view.id}
            onSelect={onSelect}
          />
          {inlineId === headline.item.view.id && inlineDetail(headline.item)}
        </>
      )}

      {rest.length > 0 && (
        <ol aria-label="Achievements" className="flex flex-col">
          {rest.map((item) => (
            <Fragment key={item.view.id}>
              <li className="border-b border-border last:border-b-0">
                <ChecklistRow
                  item={item}
                  tint={tint.tint}
                  contrast={tint.contrast}
                  selected={selectedId === item.view.id}
                  onSelect={onSelect}
                />
              </li>
              {inlineId === item.view.id && <li className="py-3 xl:hidden">{inlineDetail(item)}</li>}
            </Fragment>
          ))}
        </ol>
      )}
    </div>
  );
}
