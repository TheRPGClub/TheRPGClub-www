"use client";

import { useRouter } from "next/navigation";
import { historyHref, type HistoryOrder, type HistoryQuery } from "@/lib/codex/history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const ORDERS: [HistoryOrder, string][] = [
  ["oldest", "Oldest first"],
  ["newest", "Newest first"],
];

// Oldest first | Newest first (2B), kept in the URL's `order`; a change
// starts again from the first page.
export function OrderSwitch({ query }: { query: HistoryQuery }) {
  const router = useRouter();
  return (
    <ToggleGroup
      aria-label="Order"
      variant="switcher"
      spacing={0}
      value={[query.order]}
      onValueChange={(next) => {
        const order = next[0] as HistoryOrder | undefined;
        if (order && order !== query.order) router.push(historyHref(HISTORY_PATH, { kind: query.kind, order }), { scroll: false });
      }}
    >
      {ORDERS.map(([value, label]) => (
        <ToggleGroupItem key={value} value={value} variant="switcher" size="sm">
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
