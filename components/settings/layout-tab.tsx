import { SectionHeading } from "@/components/templates/page-header";
import { PinnedPagesReset } from "@/components/settings/pinned-pages-reset";
import { DashboardReset } from "@/components/settings/dashboard-reset";
import { ThemePicker } from "@/components/settings/theme-picker";
import type { ThemeCard } from "@/lib/theme-picker";

// The Your look & layout tab: the Member's Theme picker on top (ticket
// www#250; only when the Themes Feature offers more than the default), then
// their sidebar Pinned Pages and dashboard panels. Those are changed where
// they live; here each row says whose the member follows and, once they're
// the member's own, offers Reset. Always both rows, so the tab is never empty.
export function LayoutTab({
  pinsCustomised,
  pinsDefault,
  panelsCustomised,
  themes,
}: {
  pinsCustomised: boolean;
  pinsDefault: string;
  panelsCustomised: boolean;
  themes: ThemeCard[] | null;
}) {
  return (
    <div className="flex flex-col gap-10">
      {themes ? <ThemePicker cards={themes} /> : null}
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
    </div>
  );
}
