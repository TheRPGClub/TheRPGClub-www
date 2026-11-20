import { Suspense, type ReactNode } from "react";
import { PANELS, type PanelKey, type PanelViewer } from "@/lib/dashboard/panels";
import { hiddenPanels, newPanels, type CatalogueEntry } from "@/lib/dashboard/panel-edit";
import type { FeatureView } from "@/lib/features";
import { PanelBody } from "./panel-body";
import { PanelBoundary } from "./panel-boundary";
import { PanelBoard } from "./panel-board";
import { PanelSkeleton } from "./panel-states";

// The member's Dashboard Panels under the issue (unify pick B). The server
// draws each shown panel's items in its own Suspense boundary, so a slow
// source never holds the page; the board (a client component) lays them out
// and lets the member edit them. A member with nothing to show and nothing
// to turn on gets no section.
export function AroundTheClub({
  panels,
  apiList,
  catalogue,
  customised,
  features,
  viewer,
}: {
  panels: readonly PanelKey[];
  // The API's list as read (keys this page doesn't draw included), or the
  // club default when the read failed.
  apiList: readonly string[];
  // The API's catalogue; empty when the read failed (no edit mode then).
  catalogue: readonly CatalogueEntry[];
  customised: boolean;
  features: Pick<FeatureView, "shown">;
  viewer: PanelViewer;
}) {
  const available = hiddenPanels(catalogue, [], features);
  if (panels.length === 0 && available.length === 0) return null;

  const bodies: Partial<Record<PanelKey, ReactNode>> = {};
  for (const key of panels) {
    const wide = PANELS[key].place === "wide";
    bodies[key] = (
      <PanelBoundary title={PANELS[key].title}>
        <Suspense fallback={<PanelSkeleton wide={wide} />}>
          <PanelBody panelKey={key} viewer={viewer} wide={wide} />
        </Suspense>
      </PanelBoundary>
    );
  }

  return (
    <PanelBoard
      saved={panels}
      apiList={apiList}
      available={available}
      fresh={newPanels(catalogue)}
      customised={customised}
      viewer={viewer}
      bodies={bodies}
      editable={catalogue.length > 0}
    />
  );
}
