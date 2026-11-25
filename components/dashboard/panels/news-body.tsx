import type { CSSProperties } from "react";
import { newsCardView, newsInk, NEWS_PATH, type NewsItem } from "@/lib/news";
import { ageLabel } from "@/lib/dashboard/panel-items";
import { readNews } from "@/lib/dashboard/panel-sources";
import { cn } from "@/lib/utils";
import { PANELS } from "@/lib/dashboard/panels";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Latest News: the member's saved categories (the API applies them), each
// item as a small frame of its art footed in its News Category's ink.
export async function NewsBody({ viewer, wide }: BodyProps) {
  const items = await readNews(viewer.id);
  const now = Date.now();
  return listBody({
    rows: items,
    title: PANELS.news.title,
    wide,
    row: (item) => <NewsRow key={item.message_id} item={item} now={now} />,
  });
}

function NewsRow({ item, now }: { item: NewsItem; now: number }) {
  const view = newsCardView(item);
  return (
    <PanelItem
      media={<NewsThumb url={view.frames[0]?.url ?? null} category={item.category_key} />}
      title={view.headline ?? view.fallback}
      href={view.href ?? NEWS_PATH}
      external={view.href != null}
      meta={<MetaParts parts={[view.site, item.author.name]} />}
      aside={<PanelWhen>{ageLabel(item.posted_at, now)}</PanelWhen>}
    />
  );
}

// A 56px frame of the item's art over a 3px foot bar in its category's ink
// (dashed for Rumours, which are unconfirmed).
function NewsThumb({ url, category }: { url: string | null; category: string | null }) {
  const ink = newsInk(category);
  return (
    <span
      aria-hidden
      style={{ "--news-ink": ink.color } as CSSProperties}
      className="relative block h-9 w-14 shrink-0 overflow-hidden rounded-xs bg-muted"
    >
      {url && (
        // eslint-disable-next-line @next/next/no-img-element -- outside news art, which next/image isn't configured for
        <img src={url} alt="" loading="lazy" className="size-full object-cover" />
      )}
      <i
        className={cn(
          "absolute inset-x-0 bottom-0 h-[3px]",
          ink.dashed ? "bg-[repeating-linear-gradient(90deg,var(--news-ink)_0_6px,transparent_6px_10px)]" : "bg-(--news-ink)",
        )}
      />
    </span>
  );
}
