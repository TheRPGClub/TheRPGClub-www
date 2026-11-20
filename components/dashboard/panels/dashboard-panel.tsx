import { Suspense, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PANELS, type PanelKey, type PanelViewer } from "@/lib/dashboard/panels";
import { MemberMark } from "@/components/challenges/host-badge";
import { PanelBody } from "./panel-body";
import { PanelSkeleton } from "./panel-states";

// One Dashboard Panel (unify pick B): an ink card like the NR-GOTM feature,
// topped by a 4px rule in the panel's own ink. The head (its name in Anton,
// the scope chip, "See all") draws at once; the items load in their own
// Suspense boundary, so a slow source never holds the page.
export function DashboardPanel({ panelKey, viewer }: { panelKey: PanelKey; viewer: PanelViewer }) {
  const spec = PANELS[panelKey];
  const wide = spec.place === "wide";
  const headingId = `panel-${panelKey}`;
  const seeAll = spec.seeAll?.(viewer.id);

  return (
    <section
      aria-labelledby={headingId}
      style={{ "--panel-ink": `var(--panel-${spec.ink})` } as CSSProperties}
      className="@container min-w-0 rounded-sm bg-card px-4 pt-4.5 pb-2.5 shadow-[inset_0_4px_0_var(--panel-ink)] sm:px-5 sm:pt-5 sm:pb-3"
    >
      <header className="mb-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <h3 id={headingId} className="font-headline text-[1.75rem] leading-none sm:text-[1.9rem]">
          {spec.title}
        </h3>
        {spec.chip && <ScopeChip scope={spec.scope} viewer={viewer} />}
        {seeAll && (
          <Link
            href={seeAll}
            className="font-label ml-auto inline-flex items-center gap-1.5 text-sm font-extrabold tracking-[0.06em] text-(--panel-ink) transition-colors hover:text-highlight [&_svg]:size-4 motion-safe:[&_svg]:transition-transform motion-safe:hover:[&_svg]:translate-x-0.5"
          >
            See all
            <span className="sr-only"> {spec.title}</span>
            <ArrowRight aria-hidden />
          </Link>
        )}
      </header>
      <Suspense fallback={<PanelSkeleton wide={wide} />}>
        <PanelBody panelKey={panelKey} viewer={viewer} wide={wide} />
      </Suspense>
    </section>
  );
}

// "Club" in label type, or "Mine" as a pill wearing the member's avatar.
function ScopeChip({ scope, viewer }: { scope: "club" | "mine"; viewer: PanelViewer }) {
  if (scope === "club") {
    return (
      <span className="font-label text-[0.8rem] font-extrabold tracking-[0.1em] text-faint-foreground">Club</span>
    );
  }
  return (
    <span className="font-label inline-flex h-6.5 items-center gap-1.5 rounded-full pr-2.5 pl-0.5 text-[0.8rem] font-extrabold tracking-[0.08em] shadow-[inset_0_0_0_1px_var(--color-border-strong)]">
      <MemberMark name={viewer.name} src={viewer.avatarUrl} size={22} />
      Mine
    </span>
  );
}
