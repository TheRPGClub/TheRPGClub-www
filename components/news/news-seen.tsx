import Link from "next/link";
import { newsCardView, newsInk, type NewsItem } from "@/lib/news";
import { rowWhen } from "@/lib/news-catchup";
import { InkSquare } from "./ink-square";
import { OutboundHeadline, OUTBOUND_LINK } from "./news-outbound";

// The Seen rule and the compact rows of News Items already seen, newest
// first: ink square, headline (the outside page, in a new tab), site,
// poster, day and time. On a phone the site, poster and time drop under the
// headline. "+N more new · Show all" sits on the rule's left while the
// mosaic holds back new items.

const LABEL = "font-label text-[0.8rem] font-bold tracking-[0.08em] uppercase";

export function NewsSeenRule({ more }: { more: { count: number; href: string } | null }) {
  return (
    <div className="flex items-center gap-3">
      {more && (
        <>
          <Link href={more.href} className={`${LABEL} shrink-0 text-foreground underline decoration-highlight decoration-2 underline-offset-4 ${OUTBOUND_LINK}`}>
            +{more.count} more new · Show all
          </Link>
          <hr aria-hidden className="h-0.5 flex-1 border-0 bg-border-strong" />
        </>
      )}
      <h2 className={`${LABEL} shrink-0 text-dim-foreground`}>Seen</h2>
      <hr aria-hidden className="h-0.5 flex-1 border-0 bg-border-strong" />
    </div>
  );
}

export function NewsSeenRows({ items, now }: { items: NewsItem[]; now: Date }) {
  return (
    <ul aria-label="Seen items">
      {items.map((item) => (
        <SeenRow key={item.message_id} item={item} now={now} />
      ))}
    </ul>
  );
}

function SeenRow({ item, now }: { item: NewsItem; now: Date }) {
  const view = newsCardView(item);
  const { author } = item;
  return (
    <li className="grid grid-cols-[0.5rem_minmax(0,1fr)] items-baseline gap-x-3.5 gap-y-0.5 border-b border-border py-2 md:grid-cols-[0.5rem_minmax(0,1fr)_8rem_6.5rem_5.5rem] md:items-center">
      <InkSquare {...newsInk(item.category_key)} className="size-2 self-center" />
      <p className="relative min-w-0 truncate text-[0.95rem] text-dim-foreground">
        <OutboundHeadline text={view.headline ?? view.site} href={view.href} className="hover:text-highlight" />
      </p>
      <p className={`${LABEL} col-start-2 flex min-w-0 gap-1.5 text-xs text-faint-foreground md:contents`}>
        <span className="truncate">{view.site}</span>
        <span aria-hidden className="md:hidden">·</span>
        {author.member ? (
          <Link href={`/members/${author.user_id}`} className={`truncate ${OUTBOUND_LINK}`}>
            {author.name}
          </Link>
        ) : (
          <span className="truncate">{author.name}</span>
        )}
        <span aria-hidden className="md:hidden">·</span>
        <time dateTime={item.posted_at} className="shrink-0 tabular-nums md:text-right">
          {rowWhen(item.posted_at, now)}
        </time>
      </p>
    </li>
  );
}
