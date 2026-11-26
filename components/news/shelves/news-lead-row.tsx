import { newsCardView, newsInk, type NewsItem } from "@/lib/news";
import { agoLabel, siteInitial } from "@/lib/news-catchup";
import { cn } from "@/lib/utils";
import { NewsArtFill } from "../news-art-fill";
import { NewsMeta, NewsTag } from "../news-meta";
import { OutboundHeadline } from "../news-outbound";

// The lead row: the three newest News Items in the member's default view
// as wide art with the headline on a scrim, the first wider. On a phone
// they stack; in a medium column the first spans the row over the other two.

export function NewsLeadRow({
  items,
  nameOf,
  now,
}: {
  items: NewsItem[];
  nameOf: (key: string | null) => string;
  now: Date;
}) {
  return (
    <section aria-label="Newest items" className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
      {items.map((item, i) => (
        <LeadCard key={item.message_id} item={item} first={i === 0} categoryName={nameOf(item.category_key)} now={now} />
      ))}
    </section>
  );
}

function LeadCard({
  item,
  first,
  categoryName,
  now,
}: {
  item: NewsItem;
  first: boolean;
  categoryName: string;
  now: Date;
}) {
  const view = newsCardView(item);
  return (
    <article
      className={cn(
        "group/tile relative isolate flex min-h-[12rem] overflow-hidden rounded-md bg-card lg:min-h-[13rem]",
        first && "min-h-[15rem] sm:col-span-2 lg:col-span-1",
      )}
    >
      <NewsArtFill frames={view.frames} ink={newsInk(item.category_key).color} initial={siteInitial(view.site)} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,color-mix(in_oklab,var(--background)_55%,transparent)_55%,color-mix(in_oklab,var(--background)_94%,transparent))]"
      />
      <div className="absolute top-3 left-3">
        <NewsTag item={item} name={categoryName} />
      </div>
      <div className="relative mt-auto w-full px-4 pt-14 pb-4">
        {view.headline && (
          <h3
            className={cn(
              "mb-2 line-clamp-3 max-w-[35rem] font-semibold text-balance text-foreground [overflow-wrap:anywhere]",
              first ? "text-[1.35rem] leading-[1.15] sm:text-[1.55rem]" : "text-[1.15rem] leading-[1.2]",
            )}
          >
            <OutboundHeadline text={view.headline} href={view.href} />
          </h3>
        )}
        <NewsMeta item={item} site={view.site} when={agoLabel(item.posted_at, now)} />
      </div>
    </article>
  );
}
