import Link from "next/link";
import type { CSSProperties } from "react";
import { TAB_INKS, type GiveawayTab } from "@/lib/giveaways";
import { cn } from "@/lib/utils";

const TABS: { tab: GiveawayTab; label: string; href: string }[] = [
  { tab: "shelf", label: "Shelf", href: "/giveaways" },
  { tab: "claimed", label: "Claimed", href: "/giveaways/claimed" },
  { tab: "donated", label: "Donated", href: "/giveaways/donated" },
];

// Folder tabs on a rule: the picked tab is cut from its gift paper and sits
// on a full-width rule in the same ink; the others are dark card with a strip
// of their paper along the foot.
export function GiveawayTabs({
  active,
  counts,
}: {
  active: GiveawayTab;
  counts: Record<GiveawayTab, number | null>;
}) {
  return (
    <div className="mt-6" style={{ "--rule": TAB_INKS[active] } as CSSProperties}>
      <nav aria-label="Giveaways" className="flex items-end gap-1.5">
        {TABS.map(({ tab, label, href }) => {
          const on = tab === active;
          const count = counts[tab];
          return (
            <Link
              key={tab}
              href={href}
              aria-current={on ? "page" : undefined}
              style={{ "--p": TAB_INKS[tab] } as CSSProperties}
              className={cn(
                "font-headline flex h-11 items-center gap-2 rounded-t-md px-3.5 text-[1.3rem] leading-none outline-none transition-colors duration-200 sm:h-13 sm:px-6 sm:text-[1.6rem]",
                "focus-visible:ring-3 focus-visible:ring-highlight/60",
                on
                  ? "gift-paper text-background"
                  : "bg-card text-dim-foreground shadow-[inset_0_-4px_0_var(--p)] hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
              {count !== null && (
                <b className={cn("font-label text-[0.8rem] font-extrabold", on ? "text-background" : "text-faint-foreground")}>
                  {count}
                </b>
              )}
            </Link>
          );
        })}
      </nav>
      <i aria-hidden className="block h-1 bg-(--rule)" />
    </div>
  );
}
