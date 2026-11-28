import Link from "next/link";
import { categoryTag, newsInk, type NewsItem } from "@/lib/news";
import { cn } from "@/lib/utils";
import { InkSquare } from "./ink-square";

// The small print a hero or tile carries: the category tag (its ink square
// and short name on a dark chip, so it reads over art) and the meta line
// (site · when · poster, the poster linking to their profile when a member).

const META_LINK =
  "rounded-xs transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

export function NewsTag({ item, name }: { item: NewsItem; name: string }) {
  return (
    <span
      title={name}
      data-slot="news-tag"
      className="font-label inline-flex h-[22px] items-center gap-1.5 rounded-xs bg-background/75 px-2 text-xs font-bold tracking-[0.08em] text-foreground uppercase"
    >
      <InkSquare {...newsInk(item.category_key)} className="size-2" />
      {categoryTag(name)}
    </span>
  );
}

export function NewsMeta({
  item,
  site,
  when,
  poster = true,
  posted = false,
  className,
}: {
  item: NewsItem;
  site: string;
  when: string;
  poster?: boolean;
  // "posted by" before the name (the hero).
  posted?: boolean;
  className?: string;
}) {
  const { author } = item;
  return (
    <p
      className={cn(
        "font-label flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs font-bold tracking-[0.07em] text-dim-foreground uppercase",
        className,
      )}
    >
      <span className="max-w-[14rem] truncate">{site}</span>
      <span aria-hidden>·</span>
      <time dateTime={item.posted_at}>{when}</time>
      {poster && (
        <>
          <span aria-hidden>·</span>
          <span className="min-w-0 truncate">
            {posted && "posted by "}
            {author.member ? (
              <Link href={`/members/${author.user_id}`} className={META_LINK}>
                {author.name}
              </Link>
            ) : (
              author.name
            )}
          </span>
        </>
      )}
    </p>
  );
}

// The small yellow dot a new tile wears.
export function NewDot() {
  return (
    <span
      aria-hidden
      data-slot="news-new-dot"
      className="absolute top-3 right-3 z-10 size-[9px] rounded-full bg-highlight shadow-[0_0_0_3px_color-mix(in_oklab,var(--background)_70%,transparent)]"
    />
  );
}
