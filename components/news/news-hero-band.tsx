import type { Catchup, InkSegment } from "@/lib/news-catchup";
import type { NewsItem } from "@/lib/news";
import { NewsHero } from "./news-hero";
import { NewsNewCount } from "./news-new-count";

// Catch-up's hero band: the new count (or "All caught up") on the left and
// the hero art on the right; on a phone the count stacks above the art.

export function NewsHeroBand({
  catchup,
  hero,
  since,
  segments,
  nameOf,
  now,
}: {
  catchup: Catchup;
  hero: NewsItem;
  since: string | null;
  segments: InkSegment[];
  nameOf: (key: string | null) => string;
  now: Date;
}) {
  return (
    <section
      aria-labelledby="news-count"
      className="grid gap-5 lg:min-h-[23.25rem] lg:grid-cols-[18.75rem_minmax(0,1fr)]"
    >
      <NewsNewCount catchup={catchup} since={since} segments={segments} />
      <NewsHero
        item={hero}
        categoryName={nameOf(hero.category_key)}
        isNew={catchup.state === "new"}
        now={now}
      />
    </section>
  );
}
