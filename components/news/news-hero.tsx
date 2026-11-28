import { newsCardView, newsInk, type NewsItem } from "@/lib/news";
import { agoLabel, siteInitial } from "@/lib/news-catchup";
import { NewsArtFill } from "./news-art-fill";
import { NewsMeta, NewsTag } from "./news-meta";
import { OutboundHeadline } from "./news-outbound";

// The hero: the newest new News Item (or, with nothing new, the newest one)
// filling the band as art, its headline on a scrim at the foot with the
// category tag, site · time · poster, and the member's comment. A new one
// wears a yellow NEW flag.

export function NewsHero({
  item,
  categoryName,
  isNew,
  now,
}: {
  item: NewsItem;
  categoryName: string;
  isNew: boolean;
  now: Date;
}) {
  const view = newsCardView(item);
  const ink = newsInk(item.category_key);
  return (
    <article
      aria-label={isNew ? "Newest new item" : "Newest item"}
      data-slot="news-hero"
      className="group/tile relative isolate flex min-h-[20rem] overflow-hidden rounded-md bg-card sm:min-h-[23rem]"
    >
      <NewsArtFill frames={view.frames} ink={ink.color} initial={siteInitial(view.site)} big />
      <div
        aria-hidden
        data-slot="news-scrim"
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,color-mix(in_oklab,var(--background)_55%,transparent)_55%,color-mix(in_oklab,var(--background)_94%,transparent)_85%,var(--background))]"
      />
      {isNew && (
        <span data-slot="news-new-flag" className="font-label absolute top-4 right-4 rounded-xs bg-highlight px-2 pt-[5px] pb-1 text-xs leading-none font-extrabold tracking-[0.1em] text-highlight-foreground">
          NEW
        </span>
      )}
      <div className="relative mt-auto w-full px-5 pt-24 pb-5 sm:px-7 sm:pb-6">
        <NewsTag item={item} name={categoryName} />
        {view.headline && (
          <h2 className="mt-3 mb-2.5 max-w-[40rem] text-[1.6rem] leading-[1.1] font-semibold text-balance text-foreground [overflow-wrap:anywhere] sm:text-[2.2rem]">
            <OutboundHeadline text={view.headline} href={view.href} />
          </h2>
        )}
        {view.description && !view.comment && (
          <p className="mb-2.5 line-clamp-2 max-w-[60ch] text-dim-foreground">{view.description}</p>
        )}
        <NewsMeta item={item} site={view.site} when={agoLabel(item.posted_at, now)} posted />
        {view.comment && (
          <p className="mt-2.5 max-w-[60ch] text-[1.05rem] text-dim-foreground italic">
            &ldquo;{view.comment}&rdquo;
          </p>
        )}
      </div>
    </article>
  );
}
