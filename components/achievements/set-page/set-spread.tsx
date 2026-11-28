"use client";

import { useState } from "react";
import {
  SET_PAGE_VIEWS,
  latestUnlockId,
  type HeadlineReason,
  type SetPageView,
  type SlottedAchievement,
} from "@/lib/achievements/set-page";
import type { SetTint } from "@/lib/achievements/tint-color";
import { TintSpine } from "@/components/achievements/tint";
import { AchievementDetail } from "./achievement-detail";
import { ChecklistView } from "./checklist-view";
import { RarityView } from "./rarity-view";
import { TimelineView } from "./timeline-view";
import { RarityTally } from "./rarity-tally";
import { PageHead } from "./shared";
import { SpreadTabs } from "./spread-tabs";

// The set as a two-page spread. Index tabs in the game tint sit on its top
// edge and switch the left page between CHECKLIST, RARITY and TIMELINE (the
// `?view=` param). The right page holds the picked Achievement's details
// over the set's Rarity tally. On phones the spread closes to one page:
// the details open under the picked item and the tally follows the view.
export function SetSpread({
  view,
  basePath,
  items,
  tint,
  title,
  providerLabel,
  memberName,
  headline,
}: {
  view: SetPageView;
  basePath: string;
  items: SlottedAchievement[];
  tint: SetTint;
  title: string;
  providerLabel: string;
  memberName: string;
  headline: { id: number; reason: HeadlineReason } | null;
}) {
  // `undefined` until the reader picks: the spread then opens on the
  // member's latest Unlock (in the checklist, the latest besides the
  // headline). Phones open no card until a pick.
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const headlineItem = headline ? items.find((i) => i.view.id === headline.id) ?? null : null;
  const selectedId =
    picked === undefined
      ? latestUnlockId(items, view === "checklist" ? (headline?.id ?? null) : null)
      : picked;
  const selected = items.find((i) => i.view.id === selectedId) ?? null;

  const onSelect = (id: number) => setPicked(selectedId === id ? null : id);
  const detailFor = (item: SlottedAchievement, className?: string) => (
    <AchievementDetail
      item={item}
      tint={tint.tint}
      memberName={memberName}
      headline={headline?.id === item.view.id ? headline.reason : null}
      onClose={() => setPicked(null)}
      className={className}
    />
  );
  const viewProps = {
    items,
    tint,
    memberName,
    selectedId,
    onSelect,
    inlineId: picked ?? null,
    inlineDetail: (item: SlottedAchievement) => detailFor(item, "xl:hidden"),
  };
  const unlocked = items.filter((i) => i.view.unlocked).length;

  return (
    <div className="flex flex-col">
      <SpreadTabs view={view} basePath={basePath} tint={tint} />

      <div className="grid gap-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]">
        {/* left page */}
        <section
          aria-label={SET_PAGE_VIEWS.find((v) => v.key === view)?.label}
          data-slot="set-spread-page" data-side="left"
          className="relative flex min-w-0 flex-col gap-5 rounded-md bg-card py-5 pr-4 pl-7 sm:py-7 sm:pr-7 sm:pl-11 xl:rounded-r-none"
        >
          <TintSpine tint={tint.tint} width={12} />
          <PageHead
            left={`${title} · ${providerLabel}`}
            right={`${unlocked} of ${items.length} unlocked`}
          />
          {view === "checklist" && (
            <ChecklistView
              {...viewProps}
              headline={headlineItem && headline ? { item: headlineItem, reason: headline.reason } : null}
            />
          )}
          {view === "rarity" && <RarityView {...viewProps} />}
          {view === "timeline" && <TimelineView {...viewProps} />}
          <span className="font-label mt-auto hidden pt-4 text-[0.75rem] text-faint-foreground xl:block">
            Page 1
          </span>
        </section>

        {/* right page */}
        <aside
          aria-label="Details"
          data-slot="set-spread-page" data-side="right"
          className="flex flex-col gap-6 rounded-md bg-card p-5 sm:p-7 xl:rounded-l-none"
        >
          <PageHead left={`${memberName}’s Unlocks`} right="By Rarity" className="max-xl:hidden" />
          <div className="hidden xl:sticky xl:top-6 xl:flex xl:flex-col xl:gap-6">
            {selected ? (
              detailFor(selected)
            ) : (
              <p className="rounded-md border border-dashed border-border-strong px-5 py-6 text-[0.95rem] leading-relaxed text-faint-foreground">
                Pick an Achievement to see its description, Rarity and Unlock.
              </p>
            )}
            <RarityTally items={items} />
          </div>
          <div className="xl:hidden">
            <RarityTally items={items} />
          </div>
          <span className="font-label mt-auto hidden pt-4 text-right text-[0.75rem] text-faint-foreground xl:block">
            Page 2
          </span>
        </aside>
      </div>
    </div>
  );
}
