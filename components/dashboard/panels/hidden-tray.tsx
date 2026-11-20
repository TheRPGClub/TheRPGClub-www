"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { PANELS, type PanelKey, type PanelViewer } from "@/lib/dashboard/panels";
import { FeatureSwitch } from "@/components/feature/feature-switch";
import { ScopeChip } from "./panel-frame";

// Edit mode's Hidden tray (picks: D's dashed tray, drawn in B): every panel
// the member can use but doesn't show, in the club's order, each a small card
// under its ink rule with a line on what it shows and the Hidden switch. A
// panel added since their last visit to edit mode wears the mint "New" stamp.
export function HiddenTray({
  hidden,
  fresh,
  viewer,
  customised,
  onShow,
}: {
  hidden: readonly PanelKey[];
  fresh: readonly PanelKey[];
  viewer: PanelViewer;
  customised: boolean;
  onShow: (key: PanelKey) => void;
}) {
  return (
    <section
      aria-labelledby="hidden-panels"
      className="rounded-sm border-[1.5px] border-dashed border-border-strong p-4 sm:p-5"
    >
      <div className="flex items-baseline gap-3">
        <h3 id="hidden-panels" className="font-headline text-[1.9rem] leading-[0.9]">
          Hidden
        </h3>
        <span className="font-label text-sm font-bold tracking-[0.08em] text-faint-foreground">
          {hidden.length === 1 ? "1 panel" : `${hidden.length} panels`}
        </span>
      </div>
      <p className="mt-1.5 mb-5 text-[0.9rem] text-dim-foreground">
        {hidden.length > 0
          ? "Switch one on and it joins the end of your dashboard."
          : "Every panel you can use is on your dashboard."}
      </p>
      {hidden.length > 0 && (
        <ul className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          {hidden.map((key) => (
            <TrayCard key={key} panelKey={key} viewer={viewer} fresh={fresh.includes(key)} onShow={() => onShow(key)} />
          ))}
        </ul>
      )}
      {customised && (
        <p className="mt-5 border-t border-border pt-3 text-[0.85rem] text-faint-foreground">
          Want the club&apos;s default back?{" "}
          <Link
            href="/settings#pref-dashboard_panels-name"
            className="text-foreground underline decoration-gotm decoration-2 underline-offset-4 transition-colors hover:text-highlight"
          >
            Reset dashboard
          </Link>{" "}
          in Settings.
        </p>
      )}
    </section>
  );
}

function TrayCard({
  panelKey,
  viewer,
  fresh,
  onShow,
}: {
  panelKey: PanelKey;
  viewer: PanelViewer;
  fresh: boolean;
  onShow: () => void;
}) {
  const spec = PANELS[panelKey];
  const nameId = `tray-${panelKey}`;
  return (
    <li
      style={{ "--panel-ink": `var(--panel-${spec.ink})` } as CSSProperties}
      className="relative min-w-0 rounded-sm bg-card px-3.5 pt-3.5 pb-2 shadow-[inset_0_3px_0_color-mix(in_oklab,var(--panel-ink)_72%,var(--color-muted))]"
    >
      {fresh && (
        <span
          id={`${nameId}-new`}
          className="font-headline absolute -top-3.5 -right-1.5 z-10 -rotate-8 rounded-xs bg-panel-new px-2.25 pt-1.25 pb-1 text-[1.05rem] leading-none text-background shadow-[inset_0_0_0_2px_var(--color-background),0_6px_14px_rgb(0_0_0/0.45)]">
          New
        </span>
      )}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <h4 id={nameId} className="font-headline text-xl leading-[0.95] text-dim-foreground">
          {spec.title}
        </h4>
        {spec.chip && <ScopeChip scope={spec.scope} viewer={viewer} />}
      </div>
      <div className="flex min-h-12.5 items-center gap-3 pt-1.5" data-focus={`tray-switch-${panelKey}`}>
        <p id={`${nameId}-blurb`} className="min-w-0 flex-1 text-sm leading-[1.3] text-dim-foreground">
          {spec.blurb}
        </p>
        <FeatureSwitch
          checked={false}
          onChange={(next) => next && onShow()}
          onLabel="Shown"
          offLabel="Hidden"
          labelledBy={nameId}
          describedBy={fresh ? `${nameId}-blurb ${nameId}-new` : `${nameId}-blurb`}
        />
      </div>
    </li>
  );
}
