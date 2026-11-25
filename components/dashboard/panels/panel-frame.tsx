import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PANELS, type PanelKey, type PanelViewer } from "@/lib/dashboard/panels";
import { MemberMark } from "@/components/challenges/host-badge";
import { cn } from "@/lib/utils";

// How a panel stands in edit mode: ringed in signal orange when its change
// didn't save (the final round's "Not saved"). A drag's look is CSS on the
// wrapper's data-sort-* attributes.
export type PanelFrameState = "idle" | "failed";

// One Dashboard Panel (unify pick B): an ink card like the NR-GOTM feature,
// topped by a 4px rule in the panel's own ink. The head (its name in Anton,
// the scope chip, "See all"), then in edit mode its control strip, then its
// items. In edit mode the items show as a fading preview the member can't
// click into (`inert`); the wrapper stays the same element either way, so the
// items aren't drawn again on the way in or out.
export function PanelFrame({
  panelKey,
  viewer,
  controls,
  editing = false,
  state = "idle",
  children,
  ...rest
}: {
  panelKey: PanelKey;
  viewer: PanelViewer;
  controls?: ReactNode;
  editing?: boolean;
  state?: PanelFrameState;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "children">) {
  const spec = PANELS[panelKey];
  const headingId = `panel-${panelKey}`;
  const seeAll = spec.seeAll?.(viewer.id);

  return (
    <section
      aria-labelledby={headingId}
      style={{ "--panel-ink": `var(--panel-${spec.ink})` } as CSSProperties}
      className={cn(
        "@container min-w-0 rounded-sm bg-card px-4 pt-4.5 pb-2.5 shadow-[inset_0_4px_0_var(--panel-ink)] transition-[opacity,box-shadow] sm:px-5 sm:pt-5 sm:pb-3",
        state === "failed" && "shadow-[inset_0_4px_0_var(--panel-ink),inset_0_0_0_2px_var(--color-destructive)]",
      )}
      {...rest}
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
      {controls}
      <div
        inert={editing}
        className={cn(
          editing &&
            "pointer-events-none max-h-28 overflow-hidden mask-[linear-gradient(#000_50%,transparent)] select-none",
        )}
      >
        {children}
      </div>
    </section>
  );
}

// "Club" in label type, or "Mine" as a pill wearing the member's avatar.
export function ScopeChip({ scope, viewer }: { scope: "club" | "mine"; viewer: PanelViewer }) {
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
