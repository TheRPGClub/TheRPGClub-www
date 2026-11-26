import { notFound } from "next/navigation";
import { fetchNewsCategories, fetchNewsShelves, fetchNewsStamp } from "@/lib/api/news";
import { categoryNames, newsCategoryRows, parseNewsFilters } from "@/lib/news";
import { agoLabel } from "@/lib/news-catchup";
import { leadItems } from "@/lib/news-shelves";
import { NewsNote } from "../news-empty";
import { NewsLiveRefresh } from "../news-live-refresh";
import { NewsMasthead } from "../news-masthead";
import { NewsShelvesView } from "./news-shelves-view";

// The Shelves tab's body once the member is let in: one shelves read (every
// followed News Category's newest items and today's count), the lead row
// taken from it, and the same masthead and live refresh as Catch-up.

export async function NewsShelvesBody({ userId, badge }: { userId: string; badge: React.ReactNode }) {
  // The stamp first: an item recorded between it and the read only makes the
  // page's next poll re-read it, never leaves it behind.
  const stamp = await fetchNewsStamp();
  const [read, categories] = await Promise.all([fetchNewsShelves(userId, stamp), fetchNewsCategories()]);
  // The flag changed after the page's gate ran.
  if (read === "not_found") notFound();

  // Shelves is always the default view; the tools lead to Catch-up.
  const filters = parseNewsFilters({});
  const nameOf = categoryNames(categories);
  const now = new Date();
  const lead = read ? leadItems(read.shelves) : [];
  // The shelves read sends no per-category counts, so the Categories control
  // shows none; without the read it claims nothing about switched-off ones.
  const rows = newsCategoryRows(categories, filters, null, read ? read.meta.hidden_categories : null);

  return (
    <div className="space-y-6">
      <NewsLiveRefresh stamp={stamp} page={1} />
      <NewsMasthead
        badge={badge}
        updated={lead[0] ? `Updated ${agoLabel(lead[0].posted_at, now)}` : null}
        rows={rows}
        filters={filters}
        tab="shelves"
      />
      {read ? (
        <NewsShelvesView
          shelves={read.shelves}
          lead={lead}
          hidden={read.meta.hidden_categories}
          nameOf={nameOf}
          now={now}
        />
      ) : (
        <NewsNote>Couldn&apos;t load the news. Try again in a moment.</NewsNote>
      )}
      {lead.length > 0 && (
        <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">Days and times in UTC</p>
      )}
    </div>
  );
}
