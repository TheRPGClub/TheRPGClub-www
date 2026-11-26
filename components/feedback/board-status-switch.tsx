import Link from "next/link";
import type { CSSProperties } from "react";
import type { FeedbackKind, FeedbackTotals } from "@/lib/api/types";
import { boardHref, kindMeta, type BoardStatus } from "@/lib/feedback";
import { cn } from "@/lib/utils";

// Open / Closed for the shown kind: a small segmented control, the current
// one on `muted` with a 2px underline in the kind's ink.
export function BoardStatusSwitch({
  kind,
  status,
  totals,
}: {
  kind: FeedbackKind;
  status: BoardStatus;
  totals: FeedbackTotals | null;
}) {
  const counts = totals?.[kind];
  const items = [
    { key: "open", label: "Open", count: counts?.open },
    { key: "closed", label: "Closed", count: counts?.closed },
  ] as const;
  return (
    <nav
      aria-label="Open or closed"
      style={{ "--k": kindMeta(kind).ink } as CSSProperties}
      className="flex shrink-0 rounded-sm border border-border-strong"
    >
      {items.map((item, i) => {
        const on = item.key === status;
        return (
          <Link
            key={item.key}
            href={boardHref(kind, item.key)}
            aria-current={on ? "page" : undefined}
            className={cn(
              "font-label px-3.5 py-[7px] text-[0.82rem] font-bold",
              i > 0 && "border-l border-border-strong",
              on
                ? "bg-muted text-foreground shadow-[inset_0_-2px_0_var(--k)]"
                : "text-dim-foreground hover:text-foreground",
            )}
          >
            {item.label}
            {item.count != null && <> {item.count}</>}
          </Link>
        );
      })}
    </nav>
  );
}
