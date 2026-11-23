"use client";

import type { ReactNode } from "react";
import { PANELS, placePanels, type PanelKey, type PanelViewer, type PlacedPanel } from "@/lib/dashboard/panels";
import type { usePanelDrag } from "@/hooks/use-panel-drag";
import { cn, ordinal } from "@/lib/utils";
import { PanelControls } from "./panel-controls";
import { PanelFrame } from "./panel-frame";
import { PanelSkeleton } from "./panel-states";

export interface PanelGridProps {
  shown: readonly PanelKey[];
  viewer: PanelViewer;
  // Each shown panel's items as the server drew them; a panel switched on in
  // this visit has none until the dashboard renders again.
  bodies: Partial<Record<PanelKey, ReactNode>>;
  editing: boolean;
  // The panel whose change didn't save, ringed.
  failed: PanelKey | null;
  drag: ReturnType<typeof usePanelDrag>;
  onMove: (key: PanelKey, step: -1 | 1) => void;
  onHide: (key: PanelKey) => void;
}

// The panels on the cover/rail grid (unify pick B). From `lg` wide panels
// fill the main column and compact ones the 23rem rail, each column in the
// member's order; below `lg` the two columns fold into one (`contents`) and
// `order` puts every panel back in the member's order.
export function PanelGrid(props: PanelGridProps) {
  const { wide, rail } = placePanels(props.shown);
  const both = wide.length > 0 && rail.length > 0;
  return (
    <div className={cn("flex flex-col gap-5", both && "lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start")}>
      <Column {...props} panels={wide} />
      <Column {...props} panels={rail} spread={!both} />
    </div>
  );
}

// One column. With nothing beside it, rail panels spread across the width
// in a grid of their own rather than leaving a lone 23rem strip.
function Column({ panels, spread = false, ...props }: PanelGridProps & { panels: PlacedPanel[]; spread?: boolean }) {
  if (panels.length === 0) return null;
  return (
    <div
      className={cn(
        "contents",
        spread ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 2xl:grid-cols-3" : "lg:flex lg:flex-col lg:gap-5",
      )}
    >
      {panels.map(({ key, order }) => (
        <GridPanel key={key} panelKey={key} order={order} {...props} />
      ))}
    </div>
  );
}

function GridPanel({
  panelKey,
  order,
  shown,
  viewer,
  bodies,
  editing,
  failed,
  drag,
  onMove,
  onHide,
}: PanelGridProps & { panelKey: PanelKey; order: number }) {
  const target = drag.target(panelKey);
  const body = bodies[panelKey] ?? <PanelSkeleton wide={PANELS[panelKey].place === "wide"} />;
  return (
    <div style={{ order }} className="relative min-w-0">
      <PanelFrame
        panelKey={panelKey}
        viewer={viewer}
        editing={editing}
        state={drag.dragged === panelKey ? "dragging" : failed === panelKey ? "failed" : "idle"}
        {...(editing ? target.handlers : {})}
        controls={
          editing && (
            <PanelControls
              panelKey={panelKey}
              place={order + 1}
              count={shown.length}
              onMove={(step) => onMove(panelKey, step)}
              onHide={() => onHide(panelKey)}
              {...drag.grip(panelKey)}
            />
          )
        }
      >
        {body}
      </PanelFrame>
      {target.edge && <DropLine edge={target.edge} place={target.place} />}
    </div>
  );
}

// Where a dragged panel would land: a yellow line in the gap on the panel's
// top or bottom edge, labelled with the place it would take.
function DropLine({ edge, place }: { edge: "before" | "after"; place: number }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 z-10 flex items-center gap-2",
        edge === "before" ? "-top-3.5" : "-bottom-3.5",
      )}
    >
      <span className="h-0.75 flex-1 rounded-full bg-highlight" />
      <span className="font-label rounded-xs bg-highlight px-1.5 py-0.5 text-[0.72rem] font-extrabold tracking-[0.08em] text-highlight-foreground">
        Drop here · {ordinal(place)}
      </span>
    </div>
  );
}
