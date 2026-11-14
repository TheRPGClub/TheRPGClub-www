"use client";

import { Fragment } from "react";
import { displayRarity } from "@/lib/achievements";
import { formatSlot, type TimelineCluster } from "@/lib/achievements/set-page";
import { AchievementIcon } from "@/components/achievements/achievement-icon";
import { RarityChip } from "@/components/achievements/rarity-chip";
import { Button } from "@/components/ui/button";
import { AchievementName, type SpreadViewProps } from "./shared";

// The timeline on phones: a vertical run down a rule in the game tint, one
// entry per UTC day under its month, the longer gaps counted.

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function VerticalRun({
  clusters,
  tint,
  selectedId,
  onSelect,
  inlineId,
  inlineDetail,
}: SpreadViewProps & { clusters: TimelineCluster[] }) {
  const monthOf = (day: string) => MONTH_YEAR.format(new Date(`${day}T00:00:00Z`));
  return (
    <ol className="relative flex flex-col md:hidden" aria-label="Unlocks by day">
      <span
        aria-hidden
        className="absolute top-2 bottom-2 left-[2.6rem] w-[3px] rounded-[1px]"
        style={{ background: tint.tint }}
      />
      {clusters.map((c, i) => {
        const date = new Date(`${c.day}T00:00:00Z`);
        const month = monthOf(c.day);
        const newMonth = i === 0 || month !== monthOf(clusters[i - 1].day);
        const picked = c.items.find((i) => i.view.id === selectedId);
        return (
          <Fragment key={c.day}>
            {newMonth && (
              <li className="relative pt-3 pb-2 pl-[3.6rem]">
                <span className="font-headline text-[1.4rem] leading-none text-foreground">{month}</span>
              </li>
            )}
            {c.gapDays != null && c.gapDays >= 7 && (
              <li className="font-label py-1 pl-[3.6rem] text-[0.75rem] text-faint-foreground">
                +{c.gapDays} days
              </li>
            )}
            <li className="relative grid grid-cols-[2.2rem_1fr] gap-x-[1.4rem] py-2">
              <span className="flex flex-col items-end pt-1">
                <span className="font-headline text-[1.6rem] leading-none text-foreground">
                  {date.getUTCDate()}
                </span>
              </span>
              <span
                aria-hidden
                className="absolute top-[0.95rem] left-[2.6rem] size-3 -translate-x-[4.5px] rounded-full border-2 border-foreground bg-background"
              />
              <ul className="flex min-w-0 flex-col gap-1">
                {c.items.map((item) => {
                  const selected = selectedId === item.view.id;
                  const shown = displayRarity(item.view);
                  return (
                    <li key={item.view.id}>
                      <Button
                        variant="pick-tile"
                        size="bare"
                        aria-pressed={selected}
                        onClick={() => onSelect(item.view.id)}
                        className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-3 p-1"
                      >
                        <AchievementIcon view={item.view} size="sm" slot={item.slot} tint={tint.tint} />
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="flex min-w-0 items-baseline gap-1.5">
                            <span className="font-headline text-[0.95rem]" style={{ color: tint.tint }}>
                              {formatSlot(item.slot)}
                            </span>
                            <AchievementName
                              view={item.view}
                              className="truncate text-[0.95rem] font-semibold text-foreground"
                            />
                          </span>
                          <RarityChip rarity={item.view.rarity} figure={shown.rarity} size="sm" className="w-fit" />
                        </span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </li>
            {picked && picked.view.id === inlineId && <li className="py-2 pl-[3.6rem]">{inlineDetail(picked)}</li>}
          </Fragment>
        );
      })}
    </ol>
  );
}
