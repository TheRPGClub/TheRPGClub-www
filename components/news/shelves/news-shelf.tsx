import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { newsHref, newsInk, parseNewsFilters } from "@/lib/news";
import type { NewsShelf } from "@/lib/news-shelves";
import { InkSquare } from "../ink-square";
import { NewsShelfCard } from "./news-shelf-card";
import { NewsShelfScroller } from "./news-shelf-scroller";

// One News Category's shelf: its ink square, name and "N today" on a
// hairline running to See all (Catch-up filtered to the category), then its
// newest items as a sideways row of art cards. An empty category says so in
// a short note instead of the row.

const LABEL = "font-label font-bold tracking-[0.08em] uppercase";

export function NewsShelfSection({ shelf, now }: { shelf: NewsShelf; now: Date }) {
  const { category_key: key, name, today_count: today, items } = shelf;
  const headingId = `news-shelf-${key}`;
  const seeAll = newsHref(parseNewsFilters({}), { categories: [key] });

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-2.5 flex items-center gap-2.5">
        <InkSquare {...newsInk(key)} className="size-2.5" />
        <h2 id={headingId} className={`${LABEL} min-w-0 truncate text-[1.1rem] font-extrabold text-foreground sm:text-[1.2rem]`}>
          {name}
        </h2>
        <span className={`${LABEL} shrink-0 rounded-xs border border-border-strong px-1.5 pt-[3px] pb-0.5 text-[0.8rem] leading-none text-dim-foreground`}>
          {today} today
        </span>
        <span aria-hidden className="h-px min-w-4 flex-1 bg-border" />
        <Link
          href={seeAll}
          className={`${LABEL} flex shrink-0 items-center gap-1 rounded-xs text-[0.8rem] text-foreground transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight`}
        >
          See all<span className="sr-only"> {name}</span>
          <ChevronRight aria-hidden className="size-3.5" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="rounded-md border border-dashed border-border-strong px-4 py-5 text-sm text-dim-foreground">
          Nothing posted in {name} yet.
        </p>
      ) : (
        <NewsShelfScroller label={name}>
          {items.map((item) => (
            <NewsShelfCard key={item.message_id} item={item} now={now} />
          ))}
        </NewsShelfScroller>
      )}
    </section>
  );
}
