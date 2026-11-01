"use client";

import { isSpoiler, type AchievementView } from "@/lib/achievements";
import {
  HEADLINE_LABEL,
  type HeadlineReason,
  type SlottedAchievement,
} from "@/lib/achievements/set-page";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";

// What every view of the spread gets: the set's Achievements with their
// slots, the tint, the selected one, and the phone-only detail card to place
// under `inlineId` (the reader's own pick; the default selection opens no
// card).
export interface SpreadViewProps {
  items: SlottedAchievement[];
  tint: SetTint;
  memberName: string;
  selectedId: number | null;
  inlineId: number | null;
  onSelect: (id: number) => void;
  inlineDetail: (item: SlottedAchievement) => React.ReactNode;
}

// An Achievement's name in a list. A hidden one stays blurred (no reveal
// here, since the whole row is the control); its detail card reveals it.
export function AchievementName({
  view,
  className,
}: {
  view: Pick<AchievementView, "name" | "hidden" | "viewerUnlocked">;
  className?: string;
}) {
  const name = view.name || "Untitled Achievement";
  if (!isSpoiler(view)) return <span className={className}>{name}</span>;
  return (
    <span className={className}>
      <span aria-hidden className="blur-[5px] select-none">
        {name}
      </span>
      <span className="sr-only">Hidden Achievement</span>
    </span>
  );
}

// The selection ring: inset yellow, which marks a selection app-wide.
export const SELECTED = "shadow-[inset_0_0_0_2px_var(--color-highlight)]";

export const ITEM_FOCUS =
  "outline-none focus-visible:shadow-[inset_0_0_0_2px_var(--color-highlight)]";

export function itemClass(selected: boolean, className?: string) {
  return cn(
    "cursor-pointer text-left transition-colors",
    ITEM_FOCUS,
    selected && SELECTED,
    className,
  );
}

// A page's running head: the left label and the right one, on a hairline.
export function PageHead({
  left,
  right,
  className,
}: {
  left: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "font-label flex items-baseline justify-between gap-4 border-b border-rule pb-2.5 text-[0.8rem] text-paper-mute",
        className,
      )}
    >
      <span className="min-w-0 truncate">{left}</span>
      {right && <span className="shrink-0">{right}</span>}
    </div>
  );
}

// Why an Achievement heads the set, as a chip in its chip row: "Rarest",
// "Most points" or "Platinum" (foil). Non-foil chips take their fill from
// the caller (`className`/`style`), since they sit on the tint or on ink.
export function HeadlineChip({
  reason,
  className,
  style,
}: {
  reason: HeadlineReason;
  className?: string;
  style?: React.CSSProperties;
}) {
  const foil = reason === "platinum";
  return (
    <span
      className={cn(
        "font-label inline-flex h-6 items-center rounded-xs px-2 text-[0.78rem] whitespace-nowrap",
        foil ? "foil text-ink" : className,
      )}
      style={foil ? undefined : style}
    >
      {HEADLINE_LABEL[reason]}
    </span>
  );
}
