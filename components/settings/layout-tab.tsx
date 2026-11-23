import { SectionHeading } from "@/components/templates/page-header";
import { PinnedPagesReset } from "@/components/settings/pinned-pages-reset";
import { DashboardReset } from "@/components/settings/dashboard-reset";

// The Your layout tab: the member's sidebar Pinned Pages and dashboard
// panels. They're changed where they live; here each row says whose the
// member follows and, once they're the member's own, offers Reset. Always
// both rows, so the tab is never empty.
export function LayoutTab({
  pinsCustomised,
  pinsDefault,
  panelsCustomised,
}: {
  pinsCustomised: boolean;
  pinsDefault: string;
  panelsCustomised: boolean;
}) {
  return (
    <section aria-labelledby="settings-layout" className="flex max-w-2xl flex-col">
      <SectionHeading title={<span id="settings-layout">Your layout</span>} />
      <p className="mt-3 max-w-[60ch] text-dim-foreground">
        Your sidebar&apos;s Pinned Pages and your dashboard&apos;s panels. Change them where they live; reset them
        here.
      </p>
      <ul className="mt-4 border-t border-border">
        <PinnedPagesReset names={pinsDefault} customised={pinsCustomised} />
        <DashboardReset customised={panelsCustomised} />
      </ul>
    </section>
  );
}
