import type { CSSProperties } from "react";
import { newsCardView, newsInk, type NewsItem } from "@/lib/news";
import { agoLabel, siteInitial } from "@/lib/news-catchup";
import { cn } from "@/lib/utils";
import { NewsArtFill } from "../news-art-fill";
import { NewsMeta } from "../news-meta";
import { OutboundHeadline } from "../news-outbound";

// One News Item on a shelf: 16:9 art (or the ink panel with the site's
// initial) over a 3px foot bar in the category's ink, dashed for Rumours,
// then the headline in two lines and "site · time". A snap point of the
// sideways row.

export function NewsShelfCard({ item, now }: { item: NewsItem; now: Date }) {
  const view = newsCardView(item);
  const ink = newsInk(item.category_key);
  return (
    <li className="w-[14.75rem] shrink-0 snap-start">
      <article className="group/tile">
        <div
          data-slot="news-shelf-card"
          style={{ "--news-ink": ink.color } as CSSProperties}
          className="relative isolate aspect-video overflow-hidden rounded-md bg-card shadow-[inset_0_0_0_1px_var(--border)]"
        >
          <NewsArtFill frames={view.frames} ink={ink.color} initial={siteInitial(view.site)} />
          <span
            aria-hidden
            data-slot="news-ink-foot"
            className={cn(
              "absolute inset-x-0 bottom-0 h-[3px]",
              ink.dashed
                ? "bg-[repeating-linear-gradient(90deg,var(--news-ink)_0_6px,transparent_6px_10px)]"
                : "bg-(--news-ink)",
            )}
          />
        </div>
        {view.headline && (
          <h3 className="mt-2.5 mb-1 line-clamp-2 text-[0.95rem] leading-[1.3] font-semibold text-foreground [overflow-wrap:anywhere]">
            <OutboundHeadline text={view.headline} href={view.href} />
          </h3>
        )}
        <NewsMeta item={item} site={view.site} when={agoLabel(item.posted_at, now)} poster={false} className={view.headline ? undefined : "mt-2.5"} />
      </article>
    </li>
  );
}
