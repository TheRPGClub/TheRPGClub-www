import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type ChallengeViewKey = "runs" | "pool" | "proposals";

export interface ChallengeViewTab {
  key: ChallengeViewKey;
  label: string;
  count: number | null;
  // Something waiting for the viewer (pending Pool Proposals): a yellow
  // badge after the word.
  badge?: number | null;
}

// The view in the address: Runs unless another view the page offers is
// named.
export function parseView(value: string | undefined, offered: readonly ChallengeViewKey[]): ChallengeViewKey {
  return offered.find((key) => key === value) ?? "runs";
}

// The section heading that is also the switch between the Challenge page's
// views (surface brief challenges-pool; pick 9A adds a third word for Pool
// Proposals, www#172): Anton words on the 2px paper rule, the current one
// paper over a 4px underline in the tint's hi. The view is kept in the
// address (`?view=pool`) so it can be shared. The viewer's action sits at
// the right of the rule.
export function ViewSwitch({
  challengeId,
  current,
  views,
  action,
}: {
  challengeId: number;
  current: ChallengeViewKey;
  views: ChallengeViewTab[];
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
              {!!view.badge && (
                <Badge tone="highlight" className="self-center border-0">
                  {view.badge}
                  <span className="sr-only"> waiting</span>
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
      {action && <div className="ml-auto self-center">{action}</div>}
    </div>
  );
}
