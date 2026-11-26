import Link from "next/link";
import type { GiveawayTab } from "@/lib/giveaways";
import { cn } from "@/lib/utils";

const TABS: { tab: GiveawayTab; label: string; href: string }[] = [
  { tab: "shelf", label: "Shelf", href: "/giveaways" },
  { tab: "claimed", label: "Claimed", href: "/giveaways/claimed" },
  { tab: "donated", label: "Donated", href: "/giveaways/donated" },
];

// Three tags hanging from the header's rule, each on its string: the picked
// one is a solid ink tag, the others paper outlines that drop on hover.
export function GiveawayTabs({
  active,
  counts,
}: {
  active: GiveawayTab;
  counts: Record<GiveawayTab, number | null>;
}) {
  return (
    <nav aria-label="Giveaways" className="flex gap-2 sm:gap-3">
      {TABS.map(({ tab, label, href }) => {
        const on = tab === active;
        const count = counts[tab];
        return (
          <Link
            key={tab}
            href={href}
            aria-current={on ? "page" : undefined}
            className="group flex flex-col items-center outline-none"
          >
            <i aria-hidden className="h-2.5 w-0.5 bg-foreground sm:h-3.5" />
            <span
              className={cn(
                "font-headline relative flex items-baseline gap-2 rounded-b-md border-2 border-t-0 border-foreground px-3.5 pt-4 pb-2.5 text-[1.35rem] leading-none transition-[translate,background-color,color] duration-200 ease-out sm:px-5 sm:text-[1.7rem]",
                "group-focus-visible:ring-3 group-focus-visible:ring-highlight/60",
                on
                  ? "bg-foreground text-background"
                  : "bg-card text-dim-foreground group-hover:translate-y-1 group-hover:text-foreground",
              )}
            >
              <i
                aria-hidden
                className={cn(
                  "absolute top-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full",
                  on ? "bg-background" : "bg-foreground",
                )}
              />
              {label}
              {count !== null && (
                <b className={cn("font-label text-[0.8rem] font-extrabold", on ? "text-background/70" : "text-faint-foreground")}>
                  {count}
                </b>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
