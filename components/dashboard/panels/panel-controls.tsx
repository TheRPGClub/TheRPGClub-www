"use client";

import type { DragEvent } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { PanelKey } from "@/lib/dashboard/panels";
import { panelName } from "@/lib/dashboard/panel-edit";
import { Button } from "@/components/ui/button";
import { FeatureSwitch } from "@/components/feature/feature-switch";

// A shown panel's control strip in edit mode (picks: D's mechanics, drawn in
// B): the grip to drag it by (fine pointers only; touch and keyboard use the
// arrows), its place ("3 of 6"), Move up and Move down, and the Shown switch.
// The arrows stay focusable at the ends (aria-disabled), so a keyboard member
// moving a panel to the top keeps their place.
export function PanelControls({
  panelKey,
  place,
  count,
  onMove,
  onHide,
  onGripDragStart,
  onGripDragEnd,
}: {
  panelKey: PanelKey;
  // 1-based place in the member's order.
  place: number;
  count: number;
  onMove: (step: -1 | 1) => void;
  onHide: () => void;
  onGripDragStart: (e: DragEvent<HTMLElement>) => void;
  onGripDragEnd: () => void;
}) {
  const name = panelName(panelKey);
  const first = place === 1;
  const last = place === count;
  return (
    <div className="my-2.5 flex h-11 items-center gap-0.5 rounded-xs bg-muted pr-2.5 pl-1.5 pointer-coarse:h-13 pointer-coarse:gap-1.5">
      <span
        draggable
        onDragStart={onGripDragStart}
        onDragEnd={onGripDragEnd}
        title="Drag to move"
        aria-hidden
        className="hidden h-9 w-7 cursor-grab place-items-center text-faint-foreground transition-colors hover:text-foreground active:cursor-grabbing pointer-fine:grid"
      >
        <GripVertical className="size-4.5" />
      </span>
      <span className="font-headline mr-1.5 min-w-6 text-center text-xl leading-none text-dim-foreground">
        {place}
        <small className="font-label ml-0.5 text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
          of {count}
        </small>
      </span>
      <Button
        variant="row"
        size="icon-sm"
        id={`panel-up-${panelKey}`}
        aria-label={`Move ${name} up`}
        aria-disabled={first || undefined}
        onClick={() => !first && onMove(-1)}
        className="aria-disabled:cursor-default aria-disabled:opacity-35 pointer-coarse:size-10"
      >
        <ChevronUp />
      </Button>
      <Button
        variant="row"
        size="icon-sm"
        id={`panel-down-${panelKey}`}
        aria-label={`Move ${name} down`}
        aria-disabled={last || undefined}
        onClick={() => !last && onMove(1)}
        className="aria-disabled:cursor-default aria-disabled:opacity-35 pointer-coarse:size-10"
      >
        <ChevronDown />
      </Button>
      <span className="ml-auto" data-focus={`panel-switch-${panelKey}`}>
        <FeatureSwitch
          checked
          onChange={(next) => !next && onHide()}
          onLabel="Shown"
          offLabel="Hidden"
          labelledBy={`panel-${panelKey}`}
        />
      </span>
    </div>
  );
}
