import { placePanels, type PanelKey, type PanelViewer, type PlacedPanel } from "@/lib/dashboard/panels";
import { SectionHeading } from "@/components/templates/page-header";
import { cn } from "@/lib/utils";
import { DashboardPanel } from "./dashboard-panel";

// The member's Dashboard Panels under the issue (unify pick B): an "Around
// the club" heading on the paper rule, then the cover/rail grid carried on.
// From `lg` wide panels fill the main column and compact ones the 23rem
// rail, each column in the member's order; below `lg` the two columns fold
// into one (`contents`) and `order` puts every panel back in the member's
// order. A member who shows no panels gets no section.
export function AroundTheClub({ panels, viewer }: { panels: readonly PanelKey[]; viewer: PanelViewer }) {
  if (panels.length === 0) return null;
  const { wide, rail } = placePanels(panels);
  const both = wide.length > 0 && rail.length > 0;

  return (
    <section aria-labelledby="around-the-club" className="space-y-5">
      <SectionHeading title={<span id="around-the-club">Around the club</span>} />
      <div className={cn("flex flex-col gap-5", both && "lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start")}>
        <Column panels={wide} viewer={viewer} />
        <Column panels={rail} viewer={viewer} spread={!both} />
      </div>
    </section>
  );
}

// One column. With nothing beside it, rail panels spread across the width
// in a grid of their own rather than leaving a lone 23rem strip.
function Column({ panels, viewer, spread = false }: { panels: PlacedPanel[]; viewer: PanelViewer; spread?: boolean }) {
  if (panels.length === 0) return null;
  return (
    <div
      className={cn(
        "contents",
        spread ? "lg:grid lg:grid-cols-2 lg:items-start lg:gap-5 2xl:grid-cols-3" : "lg:flex lg:flex-col lg:gap-5",
      )}
    >
      {panels.map(({ key, order }) => (
        <div key={key} style={{ order }} className="min-w-0">
          <DashboardPanel panelKey={key} viewer={viewer} />
        </div>
      ))}
    </div>
  );
}
