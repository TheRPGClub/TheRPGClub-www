import Link from "next/link";
import type { AchievementSetsSort } from "@/lib/api/types";
import {
  SET_SORT_LABEL,
  type BinderHref,
  type MemberAchievementsQuery,
} from "@/lib/member-achievements";
import { cn } from "@/lib/utils";

// The right page's header: the two views (the index of sets, the Unlocks)
// on the paper rule, and the index's sort.
export function BinderIndexHeader({
  query,
  href,
  setCount,
  unlockCount,
  badge,
}: {
  query: MemberAchievementsQuery;
  href: BinderHref;
  setCount: number | null;
  unlockCount: number;
  // The staff "Preview" badge, beside the views.
  badge?: React.ReactNode;
}) {
  const views = [
    { key: "sets" as const, label: "Index", count: setCount, noun: ["set", "sets"] },
    { key: "unlocks" as const, label: "Unlocks", count: unlockCount, noun: ["Unlock", "Unlocks"] },
  ];
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-foreground pb-2">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <nav aria-label="Achievement views" id="binder-view">
          <ul className="flex items-end gap-5">
            {views.map((v) => {
              const on = v.key === query.tab;
              return (
                <li key={v.key} className="flex items-end gap-2">
                  <Link
                    href={href({ tab: v.key })}
                    aria-current={on ? "page" : undefined}
                    scroll={false}
                    className={cn(
                      "font-headline leading-[0.85] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                      on
                        ? "text-[2rem] text-foreground sm:text-[2.2rem]"
                        : "text-[1.35rem] text-faint-foreground hover:text-highlight",
                    )}
                  >
                    {v.label}
                  </Link>
                  {on && v.count != null && (
                    <span className="font-label pb-0.5 text-[0.8rem] text-faint-foreground">
                      {v.count.toLocaleString("en-US")}{" "}
                      {v.count === 1 ? v.noun[0] : v.noun[1]}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
        {badge && <div className="pb-0.5">{badge}</div>}
      </div>
      {query.tab === "sets" && (
        <nav aria-label="Sort" className="flex items-center gap-2.5 pb-0.5">
          <span className="font-label text-[0.78rem] tracking-[0.08em] text-faint-foreground">Sort</span>
          <ul className="flex items-center gap-0.5">
            {(Object.keys(SET_SORT_LABEL) as AchievementSetsSort[]).map((s) => {
              const on = query.filter.sort === s;
              return (
                <li key={s}>
                  <Link
                    href={href({ filter: { sort: s } })}
                    aria-current={on ? "true" : undefined}
                    scroll={false}
                    className={cn(
                      "font-label inline-flex h-6 items-center rounded-xs px-1.5 text-[0.8rem] transition-colors focus-visible:outline-2 focus-visible:outline-highlight",
                      on ? "bg-foreground text-background" : "text-dim-foreground hover:text-highlight",
                    )}
                  >
                    {SET_SORT_LABEL[s]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
