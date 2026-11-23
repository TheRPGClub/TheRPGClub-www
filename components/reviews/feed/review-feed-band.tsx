import { feedDayHeading, type FeedDay } from "@/lib/reviews/feed";
import { ReviewBox } from "./review-box";

// One UTC day of the feed: its Anton heading and tally on a running rule,
// then its Reviews two-up (one a row on a narrow page).
export function ReviewFeedBand({
  day,
  partial,
  now,
  written,
}: {
  day: FeedDay;
  // The day runs over a page break, so this page's tally would be short.
  partial: boolean;
  now: Date;
  written: boolean;
}) {
  const heading = feedDayHeading(day.day, partial ? null : day.entries.length, now, written);
  return (
    <section aria-label={heading.title}>
      <h2 className="mb-2.5 flex items-baseline gap-3 sm:mb-3.5">
        <time dateTime={day.day} className="font-headline shrink-0 text-2xl whitespace-nowrap sm:text-3xl">
          {heading.title}
        </time>
        {heading.note && (
          <span className="font-label shrink-0 text-[0.8rem] tracking-[0.08em] whitespace-nowrap text-faint-foreground">
            {heading.note}
          </span>
        )}
        <span aria-hidden className="h-0.5 min-w-6 flex-1 self-center bg-border-strong" />
      </h2>
      <ul className="grid gap-3.5 @4xl:grid-cols-2 @4xl:gap-5">
        {day.entries.map((entry) => (
          <li key={entry.revision_id ? `rev-${entry.revision_id}` : entry.review_id} className="@container min-w-0">
            <ReviewBox entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}
