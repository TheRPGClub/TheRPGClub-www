import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryTag, newsCardView, newsInk, splitLastWord, type NewsItem } from "@/lib/news";
import { NewsArt } from "./news-art";

// One News Item as a frame on the contact sheet: its art in the News
// Category's ink, then the headline (the outside page, in a new tab), the
// site's description, the member's comment in italic, and a meta line (site
// on the left, poster and time on the right). Anything missing simply isn't
// set; an image-only item's comment takes the headline slot.

const META_LINK =
  "rounded-xs transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

export function NewsCard({
  item,
  categoryName,
}: {
  item: NewsItem;
  // The News Category's display name from the API's list.
  categoryName: string;
}) {
  const view = newsCardView(item);
  const ink = newsInk(item.category_key);

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-md bg-ink-2">
      <NewsArt
        frames={view.frames}
        href={view.href}
        framesOpen={view.framesOpen}
        fallback={view.fallback}
        tag={categoryTag(categoryName)}
        tagTitle={categoryName}
        ink={ink.color}
        dashed={ink.dashed}
      />
      <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3.5">
        {view.headline && (
          <h3 className="text-[1.02rem] leading-[1.3] font-semibold text-pretty [overflow-wrap:anywhere]">
            {view.href ? (
              <a
                href={view.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xs text-paper transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
              >
                <OutboundHeadline text={view.headline} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="text-paper">{view.headline}</span>
            )}
          </h3>
        )}
        {view.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-paper-dim">{view.description}</p>
        )}
        {view.comment && (
          <p className="mt-1.5 line-clamp-3 text-sm text-paper-dim italic">
            &ldquo;{view.comment}&rdquo;
          </p>
        )}
        <p className="font-label mt-auto flex items-baseline justify-between gap-3 pt-2.5 text-[0.76rem] tracking-[0.08em] text-paper-mute">
          <span className="min-w-0 truncate">{view.site}</span>
          <span className="flex shrink-0 items-baseline gap-1.5">
            {item.author.member ? (
              <Link href={`/members/${item.author.user_id}`} className={`inline-block max-w-[10rem] truncate align-bottom ${META_LINK}`}>
                {item.author.name}
              </Link>
            ) : (
              <span className="inline-block max-w-[10rem] truncate align-bottom">{item.author.name}</span>
            )}
            <span aria-hidden>·</span>
            <time dateTime={item.posted_at}>{view.time}</time>
          </span>
        </p>
      </div>
    </article>
  );
}

// The headline with its outbound arrow kept on the last word's line. A
// long last word (a bare address) stays free to wrap instead.
function OutboundHeadline({ text }: { text: string }) {
  const [head, last] = splitLastWord(text);
  if (last.length > 24) {
    return (
      <>
        {text}
        <ArrowUpRight
          aria-hidden
          className="ml-0.5 inline size-3.5 -translate-y-px align-baseline text-paper-mute"
        />
      </>
    );
  }
  return (
    <>
      {head}
      <span className="whitespace-nowrap">
        {last}
        <ArrowUpRight
          aria-hidden
          className="ml-0.5 inline size-3.5 -translate-y-px align-baseline text-paper-mute"
        />
      </span>
    </>
  );
}
