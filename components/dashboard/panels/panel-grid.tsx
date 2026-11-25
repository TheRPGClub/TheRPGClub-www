"use client";

import type { ReactNode } from "react";
import { PANELS, placePanels, type PanelKey, type PanelViewer, type PlacedPanel } from "@/lib/dashboard/panels";
import type { PanelSort } from "@/hooks/use-panel-sort";
import { cn } from "@/lib/utils";
import { SortStatus } from "@/components/sortable/sort-status";
import { PanelControls } from "./panel-controls";
import { PanelFrame } from "./panel-frame";
import { PanelSkeleton } from "./panel-states";

export interface PanelGridProps {
  viewer: PanelViewer;
  // Each shown panel's items as the server drew them; a panel switched on in
  // this visit has none until the dashboard renders again.
  bodies: Partial<Record<PanelKey, ReactNode>>;
  editing: boolean;
  // The panel whose change didn't save, ringed.
  failed: PanelKey | null;
  // The live order and the drag (hooks/use-panel-sort): in edit mode the
  // panel itself drags.
  sort: PanelSort;
  onHide: (key: PanelKey) => void;
}

// The panels on the cover/rail grid (unify pick B). From `lg` wide panels
// fill the main column and compact ones the 23rem rail, each column in the
// member's order; below `lg` the two columns fold into one (`contents`) and
// `order` puts every panel back in the member's order. With both columns in
// use each is a drag zone of its own; otherwise the whole grid is one.
export function PanelGrid(props: PanelGridProps) {
  const { sort } = props;
  const { wide, rail } = placePanels(sort.order);
  const both = wide.length > 0 && rail.length > 0;
  const zoned = "all" in sort.zones;
  return (
    <div
      {...(zoned ? sort.zone("all") : {})}
      className={cn("flex flex-col gap-5", both && "lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start")}
    >
      <Column {...props} panels={wide} zoned={!zoned} place="wide" />
      <Column {...props} panels={rail} zoned={!zoned} place="rail" spread={!both} />
      {props.editing && <SortStatus status={sort.status} />}
    </div>
  );
}

// One column. With nothing beside it, rail panels spread across the width
// in a grid of their own rather than leaving a lone 23rem strip.
function Column({
  panels,
  spread = false,
  zoned,
  place,
  ...props
}: PanelGridProps & { panels: PlacedPanel[]; spread?: boolean; zoned: boolean; place: "wide" | "rail" }) {
  if (panels.length === 0) return null;
  return (
    <div
      {...(zoned ? props.sort.zone(place) : {})}
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
  viewer,
  bodies,
  editing,
  failed,
  sort,
  onHide,
}: PanelGridProps & { panelKey: PanelKey; order: number }) {
  const body = bodies[panelKey] ?? <PanelSkeleton wide={PANELS[panelKey].place === "wide"} />;
  return (
    <div {...sort.item(panelKey)} style={{ order }} className="relative min-w-0 rounded-sm">
      <PanelFrame
        panelKey={panelKey}
        viewer={viewer}
        editing={editing}
        state={failed === panelKey ? "failed" : "idle"}
        controls={
          editing && (
            <PanelControls
              panelKey={panelKey}
              place={order + 1}
              count={sort.order.length}
              onHide={() => onHide(panelKey)}
            />
          )
        }
      >
        {body}
      </PanelFrame>
    </div>
  );
}
