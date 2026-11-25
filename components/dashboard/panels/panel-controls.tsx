"use client";

import type { PanelKey } from "@/lib/dashboard/panels";
import { FeatureSwitch } from "@/components/feature/feature-switch";

// A shown panel's control strip in edit mode: its place in the member's
// order ("3 of 6", following the live order while a panel is dragged) and
// the Shown switch. The panel itself drags (hooks/use-panel-sort); the
// switch keeps its own clicks.
export function PanelControls({
  panelKey,
  place,
  count,
  onHide,
}: {
  panelKey: PanelKey;
  // 1-based place in the member's order.
  place: number;
  count: number;
  onHide: () => void;
}) {
  return (
    <div className="my-2.5 flex h-11 items-center gap-0.5 rounded-xs bg-muted pr-2.5 pl-3 pointer-coarse:h-13 pointer-coarse:gap-1.5">
      <span className="font-headline mr-1.5 min-w-6 text-center text-xl leading-none text-dim-foreground">
        {place}
        <small className="font-label ml-0.5 text-[0.72rem] font-bold tracking-[0.08em] text-faint-foreground">
          of {count}
        </small>
      </span>
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
