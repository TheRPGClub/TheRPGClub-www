"use client";

import Link from "next/link";
import { useState } from "react";
import { RARITY_TIER_LABEL, type RarityTier } from "@/lib/achievements";
import {
  SET_PAGE_VIEWS,
  latestUnlockId,
  rarityBands,
  setPageViewHref,
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
import { PageHead } from "./shared";
import { cn } from "@/lib/utils";

const TIER_FILL: Record<RarityTier, string> = {
  common: "bg-rarity-common",
  uncommon: "bg-rarity-uncommon",
  rare: "bg-rarity-rare",
  ultra: "bg-rarity-ultra",
};

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
      <nav aria-label="Views" className="flex items-end gap-1 pl-5 sm:pl-7">
        {SET_PAGE_VIEWS.map((option) => {
          const on = option.key === view;
          return (
            <Link
              key={option.key}
              href={setPageViewHref(basePath, option.key)}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={cn(
                "font-label inline-flex items-center rounded-t-md px-3.5 text-[0.95rem] font-extrabold tracking-[0.06em] transition-colors sm:px-5 sm:text-[1rem]",
                "focus-visible:outline-2 focus-visible:outline-highlight",
                on ? "h-11" : "h-9 bg-card text-faint-foreground hover:bg-muted hover:text-foreground",
              )}
              style={on ? { background: tint.tint, color: tint.contrast } : undefined}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      <div className="grid gap-1 xl:grid-cols-[minmax(0,1.7fr)_minmax(20rem,1fr)]">
        {/* left page */}
        <section
          aria-label={SET_PAGE_VIEWS.find((v) => v.key === view)?.label}
          className="relative flex min-w-0 flex-col gap-5 rounded-md bg-card py-5 pr-4 pl-7 sm:py-7 sm:pr-7 sm:pl-11 xl:rounded-r-none xl:shadow-[inset_-22px_0_26px_-20px_rgb(0_0_0/0.7)]"
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
          className="flex flex-col gap-6 rounded-md bg-card p-5 sm:p-7 xl:rounded-l-none xl:shadow-[inset_22px_0_26px_-20px_rgb(0_0_0/0.7)]"
        >
          <PageHead left={`${memberName}’s Unlocks`} right="By Rarity" className="max-xl:hidden" />
          <div className="hidden xl:sticky xl:top-[84px] xl:flex xl:flex-col xl:gap-6">
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

// How much of each Rarity band the shown member has.
function RarityTally({ items }: { items: SlottedAchievement[] }) {
  const bands = rarityBands(items).filter((b) => b.items.length > 0);
  return (
    <section aria-label="Unlocks by Rarity" className="flex flex-col gap-3">
      <h3 className="font-headline border-b-2 border-foreground pb-1.5 text-[1.5rem] leading-[0.95] text-foreground">
        By Rarity
      </h3>
      <ul className="flex flex-col gap-3">
        {bands.map((band) => {
          const share = band.items.length ? (band.unlocked / band.items.length) * 100 : 0;
          return (
            <li key={band.tier ?? "none"} className="grid grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3">
              <span className="font-label text-[0.85rem] text-dim-foreground">
                {band.tier ? RARITY_TIER_LABEL[band.tier] : "No Rarity"}
              </span>
              <span className="h-2 overflow-hidden rounded-[1px] bg-muted">
                <span
                  className={cn("block h-full", band.tier ? TIER_FILL[band.tier] : "bg-faint-foreground")}
                  style={{ width: `${share}%` }}
                />
              </span>
              <span className="font-headline text-right text-[1.05rem] text-foreground">
                {band.unlocked}
                <span className="text-faint-foreground">/{band.items.length}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
