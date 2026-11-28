import Link from "next/link";
import type { CSSProperties } from "react";
import type { FeedbackKind, FeedbackTotals } from "@/lib/api/types";
import { FEEDBACK_KINDS, boardHref } from "@/lib/feedback";
import { cn } from "@/lib/utils";
import { KIND_ICON } from "./kind-icon";

// The board's one row of kind tabs on a single 1px rule: each a Lucide icon
// and the kind's name in its ink, then its Open count in Anton. The active
// tab's 3px ink bar sits on the rule; the others dim.
export function BoardKindTabs({
  kind,
  totals,
}: {
  kind: FeedbackKind;
  totals: FeedbackTotals | null;
}) {
  return (
    <nav data-slot="feedback-kind-tabs" aria-label="Feedback kinds" className="mt-1.5 border-b border-border">
      <ul className="flex flex-wrap gap-x-[22px]">
        {FEEDBACK_KINDS.map((k) => {
          const Icon = KIND_ICON[k.value];
          const on = k.value === kind;
          const count = totals?.[k.value].open;
          return (
            <li key={k.value} className="min-w-0 flex-1">
              <Link
                href={boardHref(k.value)}
                aria-current={on ? "page" : undefined}
                data-slot="feedback-kind-tab"
                style={{ "--k": k.ink } as CSSProperties}
                className={cn(
                  "relative flex items-baseline gap-3 px-1 pt-2.5 pb-3 transition-opacity hover:opacity-80",
                  on
                    ? "after:absolute after:inset-x-0 after:-bottom-px after:h-[3px] after:bg-(--k)"
                    : "opacity-[0.42]",
                )}
              >
                <Icon aria-hidden className="size-[22px] shrink-0 self-center text-(--k)" />
                <b data-slot="feedback-kind-tab-name" className="font-headline truncate text-2xl leading-none font-normal text-(--k) sm:text-[2.1rem]">
                  {k.plural}
                </b>
                {count != null && (
                  <span className="font-headline text-2xl leading-none text-foreground sm:text-[2.1rem]">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
