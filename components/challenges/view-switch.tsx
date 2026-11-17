import Link from "next/link";
import { cn } from "@/lib/utils";

export type ChallengeViewKey = "runs" | "pool";

// The section heading that is also the switch between the Challenge page's
// two views (surface brief challenges-pool): two Anton words on the 2px paper
// rule, the current one paper over a 4px underline in the tint's hi. The view
// is kept in the address (`?view=pool`) so it can be shared. The viewer's Run
// action sits at the right of the rule.
export function ViewSwitch({
  challengeId,
  current,
  views,
  action,
}: {
  challengeId: number;
  current: ChallengeViewKey;
  views: { key: ChallengeViewKey; label: string; count: number | null }[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mt-9 mb-4 flex flex-wrap items-baseline gap-x-[22px] gap-y-3 border-b-2 border-foreground pb-2">
      <nav aria-label="Views" className="contents">
        {views.map((view) => {
          const on = view.key === current;
          return (
            <Link
              key={view.key}
              href={view.key === "runs" ? `/challenges/${challengeId}` : `/challenges/${challengeId}?view=${view.key}`}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={cn(
                "font-headline relative inline-flex items-baseline gap-2 text-[1.875rem] leading-[0.9] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-highlight",
                on
                  ? "text-foreground after:absolute after:inset-x-0 after:-bottom-3 after:h-1 after:bg-(--challenge-tint-hi) after:content-['']"
                  : "text-faint-foreground hover:text-foreground",
              )}
            >
              {view.label}
              {view.count != null && (
                <span className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{view.count}</span>
              )}
            </Link>
          );
        })}
      </nav>
      {action && <div className="ml-auto self-center">{action}</div>}
    </div>
  );
}
