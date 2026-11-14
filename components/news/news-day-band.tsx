import { dayHeading, type NewsDay } from "@/lib/news";
import { NewsCard } from "./news-card";

// One UTC day on the News page: its heading (the day, and its tally unless
// the band runs over a page break) on a strong rule, then its cards.

export function NewsDayBand({
  day,
  partial,
  now,
  nameOf,
}: {
  day: NewsDay;
  partial: boolean;
  now: Date;
  nameOf: (key: string | null) => string;
}) {
  const heading = dayHeading(day.day, partial ? null : day.items.length, now);
  return (
    <section aria-label={heading.title}>
      <h2 className="mb-3 flex items-baseline gap-3">
        <time dateTime={day.day} className="font-headline shrink-0 text-3xl">
          {heading.title}
        </time>
        {heading.note && (
          <span className="font-label shrink-0 text-[0.8rem] tracking-[0.08em] text-faint-foreground">
            {heading.note}
          </span>
        )}
        <span aria-hidden className="h-0.5 min-w-6 flex-1 self-center bg-border-strong" />
      </h2>
      <ul className="grid gap-5 @xl:grid-cols-2 @3xl:grid-cols-3">
        {day.items.map((item) => (
          <li key={item.message_id} className="min-w-0">
            <NewsCard item={item} categoryName={nameOf(item.category_key)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
