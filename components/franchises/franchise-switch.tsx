import Link from "next/link";
import { cn } from "@/lib/utils";

export type FranchiseViewKey = "games" | "progress" | "history";

// The Games / Progress / History switch (design pick 6C; Progress from pick
// 1E): Anton words on the 2px paper rule, the current one paper over a 4px
// paper bar, each with its count (Progress counts the viewer's Mainline,
// "11/16"). The view is kept in the address (`?view=history`). An action
// (Link a game, in edit mode) sits at the rule's right.
export function FranchiseSwitch({
  franchiseId,
  current,
  views,
  action,
}: {
  franchiseId: number;
  current: FranchiseViewKey;
  views: { key: FranchiseViewKey; label: string; count: number | string }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-8 mb-5 flex flex-wrap items-baseline gap-x-6 gap-y-3 border-b-2 border-foreground pb-2">
      <nav aria-label="Views" className="contents">
        {views.map((view) => {
          const on = view.key === current;
          return (
            <Link
              key={view.key}
              href={view.key === "games" ? `/franchises/${franchiseId}` : `/franchises/${franchiseId}?view=${view.key}`}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={cn(
                "font-headline relative inline-flex items-baseline gap-2 text-[1.45rem] leading-[0.9] sm:text-[1.875rem] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight",
                on
                  ? "text-foreground after:absolute after:inset-x-0 after:-bottom-3 after:h-1 after:bg-foreground after:content-['']"
                  : "text-faint-foreground hover:text-foreground",
              )}
            >
              {view.label}
              <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{view.count}</span>
            </Link>
          );
        })}
      </nav>
      {action && <div className="ml-auto self-center">{action}</div>}
    </div>
  );
}
