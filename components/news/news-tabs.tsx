import Link from "next/link";
import { cn } from "@/lib/utils";

// The News page's two tabs under its masthead, Catch-up (/news) and Shelves
// (/news/shelves), as links: each name in Anton, the open one in paper over
// the red you-are-here bar on the hairline, the rest in faint ink. Both keep
// the visit's mark (`?mark=`), so moving between them stays one visit.

export type NewsTab = "catchup" | "shelves";

const TABS: { tab: NewsTab; label: string; path: string }[] = [
  { tab: "catchup", label: "Catch-up", path: "/news" },
  { tab: "shelves", label: "Shelves", path: "/news/shelves" },
];

export function NewsTabs({ active, mark }: { active: NewsTab; mark: string | null }) {
  const query = mark ? `?${new URLSearchParams({ mark })}` : "";
  return (
    <nav data-slot="news-tabs" aria-label="News views" className="flex gap-x-7 border-b border-border">
      {TABS.map(({ tab, label, path }) => {
        const on = tab === active;
        const href = `${path}${query}`;
        return (
          <Link
            key={tab}
            href={href}
            aria-current={on ? "page" : undefined}
            className={cn(
              "font-headline relative -mb-px pt-1 pb-2.5 text-[1.35rem] leading-none transition-colors outline-none sm:text-[1.55rem]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
              "after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-gotm after:opacity-0",
              on ? "text-foreground after:opacity-100" : "text-faint-foreground hover:text-dim-foreground",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
