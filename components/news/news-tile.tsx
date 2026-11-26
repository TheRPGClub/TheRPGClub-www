import type { CSSProperties } from "react";
import { newsCardView, newsInk, type NewsItem } from "@/lib/news";
import { agoLabel, siteInitial, type TileSize } from "@/lib/news-catchup";
import { cn } from "@/lib/utils";
import { InkPanel, NewsArtFill } from "./news-art-fill";
import { NewDot, NewsMeta, NewsTag } from "./news-meta";
import { OutboundHeadline } from "./news-outbound";

// One new News Item in the mosaic, sized by what it carries (tileSize):
// art + description a large tile, art + headline a normal one, a comment
// alone a small quote tile under an ink edge, and no art an ink panel with
// the site's initial. Every tile wears the yellow new dot. Art that fails
// falls back to the ink panel.

const SCRIM =
  "absolute inset-0 bg-[linear-gradient(180deg,transparent_22%,color-mix(in_oklab,var(--background)_94%,transparent)_85%)]";

export function NewsTile({
  item,
  size,
  categoryName,
  now,
}: {
  item: NewsItem;
  size: TileSize;
  categoryName: string;
  now: Date;
}) {
  const view = newsCardView(item);
  const ink = newsInk(item.category_key);
  const when = agoLabel(item.posted_at, now);
  const shell = "group/tile relative isolate flex size-full flex-col overflow-hidden rounded-md border border-border bg-card";

  if (size === "quote") {
    return (
      <article
        style={{ "--news-ink": ink.color } as CSSProperties}
        className={cn(shell, "border-t-[3px] border-t-(--news-ink) px-3.5 pt-3 pb-3", ink.dashed && "[border-top-style:dashed]")}
      >
        <NewDot />
        <span aria-hidden className="font-headline mt-1.5 block h-6 text-[3.2rem] leading-[0.75] text-(--news-ink)">
          &ldquo;
        </span>
        <p className="mt-1 mb-1.5 line-clamp-3 text-[0.95rem] leading-[1.3] text-foreground italic">{view.comment}</p>
        <p className="mt-auto truncate text-[0.82rem] text-dim-foreground">
          {item.author.name} on{" "}
          <OutboundHeadline text={view.headline ?? view.site} href={view.href} className="font-bold text-foreground" />
        </p>
      </article>
    );
  }

  const art = size === "large" || size === "normal";
  return (
    <article className={cn(shell, "justify-end", art ? "min-h-[13rem]" : "min-h-[10rem]")}>
      {art ? (
        <>
          <NewsArtFill frames={view.frames} ink={ink.color} initial={siteInitial(view.site)} />
          <div aria-hidden className={SCRIM} />
        </>
      ) : (
        <InkPanel ink={ink.color} initial={siteInitial(view.site)} />
      )}
      <NewDot />
      <div className="relative px-3.5 pt-10 pb-3">
        <NewsTag item={item} name={categoryName} />
        {view.headline && (
          <h3
            className={cn(
              "mt-2 mb-1.5 font-semibold text-pretty text-foreground [overflow-wrap:anywhere]",
              size === "large" ? "line-clamp-3 text-[1.35rem] leading-[1.12]" : "line-clamp-3 text-[1.02rem] leading-[1.2]",
            )}
          >
            <OutboundHeadline text={view.headline} href={view.href} />
          </h3>
        )}
        {size === "large" && view.description && (
          <p className="mb-2 line-clamp-3 text-sm leading-[1.4] text-dim-foreground">{view.description}</p>
        )}
        <NewsMeta item={item} site={view.site} when={when} poster={size !== "panel"} />
        {size === "large" && view.comment && (
          <p className="mt-1.5 line-clamp-1 text-sm text-dim-foreground italic">&ldquo;{view.comment}&rdquo;</p>
        )}
      </div>
    </article>
  );
}
