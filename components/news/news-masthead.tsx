import type { ReactNode } from "react";
import type { NewsCategoryRow, NewsFilters } from "@/lib/news";
import { PageHeader } from "@/components/templates/page-header";
import { NewsTabs, type NewsTab } from "./news-tabs";
import { NewsTools } from "./news-tools";

// The News page's masthead: NEWS with its Updated note, the tools (search,
// Categories, and the Mark all seen slot) on the rule, then the Catch-up /
// Shelves tabs.

export function NewsMasthead({
  badge,
  updated,
  rows,
  filters,
  tab,
  markAllSeen,
}: {
  badge: ReactNode;
  // "Updated 12 min ago": when the newest News Item in the view was
  // posted; null with none.
  updated: string | null;
  rows: NewsCategoryRow[];
  filters: NewsFilters;
  tab: NewsTab;
  markAllSeen?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <PageHeader
        title="News"
        badge={badge}
        count={
          updated && <span className="font-bold tracking-[0.08em] uppercase">{updated}</span>
        }
        actions={<NewsTools rows={rows} filters={filters} markAllSeen={markAllSeen} />}
      />
      <NewsTabs active={tab} mark={filters.mark} />
    </div>
  );
}
