import Link from "next/link";
import type { BoardTab } from "@/lib/suggestion-board";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// The Suggestion Board's folder tabs, each a link to its tab's URL with the
// tab's count beside the label. Rendered inside the board's Tabs.
export function BoardTabList({
  tab,
  openTotal,
  rejectedTotal,
}: {
  tab: BoardTab;
  openTotal: number | undefined;
  rejectedTotal: number | undefined;
}) {
  const tabs = [
    { key: "open", label: "Open", count: openTotal, href: "/suggestions" },
    { key: "rejected", label: "Rejected", count: rejectedTotal, href: "/suggestions?tab=rejected" },
  ] as const;

  return (
    <TabsList
      aria-label="Suggestion Board tabs"
      className="flex w-auto justify-start gap-1 p-0 group-data-horizontal/tabs:h-auto"
    >
      {tabs.map((t) => (
        <TabsTrigger
          key={t.key}
          value={t.key}
          nativeButton={false}
          render={<Link href={t.href} />}
          className="h-9 flex-initial gap-2 border-0 px-3.5 py-0 text-[0.95rem] transition-colors after:hidden"
        >
          {t.label}
          {t.count != null && (
            <span
              className={cn(
                "font-bold",
                t.key === tab ? "text-dim-foreground" : "text-faint-foreground",
              )}
            >
              {t.count}
            </span>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
