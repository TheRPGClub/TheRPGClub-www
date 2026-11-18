import { ListFilter } from "lucide-react";
import { HISTORY_KINDS, KIND_NAME, historyHref, kindInk, type HistoryKind, type HistoryQuery } from "@/lib/codex/history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { ButtonLink } from "@/components/ui/button";
import { OrderSwitch } from "./order-switch";

// The tools row (2B): the History Event Kind chips, "All" first, each a
// link keeping the order, and Oldest first | Newest first at the right. On
// phones the chips scroll on their own row with the order under them.
export function HistoryTools({
  query,
  total,
  counts,
}: {
  query: HistoryQuery;
  total: number;
  counts: Record<HistoryKind, number>;
}) {
  const chips: { kind: HistoryKind | null; label: string; count: number; ink: string }[] = [
    { kind: null, label: "All", count: total, ink: "var(--color-foreground)" },
    ...HISTORY_KINDS.map((kind) => ({ kind, label: KIND_NAME[kind], count: counts[kind], ink: kindInk(kind) })),
  ];
  return (
    <div className="mt-5.5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <nav aria-label="History Event Kind" className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <ListFilter aria-hidden className="mr-0.5 size-3.5 shrink-0 text-faint-foreground" />
        {chips.map((chip) => (
          <ButtonLink
            key={chip.label}
            href={historyHref(HISTORY_PATH, { kind: chip.kind, order: query.order })}
            variant="kind-chip"
            size="xs"
            aria-current={chip.kind === query.kind ? "true" : undefined}
            style={{ "--ink": chip.ink } as React.CSSProperties}
            className="shrink-0"
          >
            {chip.label} {chip.count}
          </ButtonLink>
        ))}
      </nav>
      <OrderSwitch query={query} />
    </div>
  );
}
