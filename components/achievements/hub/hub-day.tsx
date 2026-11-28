import type { AchievementFeedGroup } from "@/lib/api/types";
import type { FeedDay } from "@/lib/api/achievement-feed";
import { hubDayHeading } from "@/lib/achievements/hub";
import { HubRow } from "./hub-row";

// One UTC day of the hub, headed as the News page heads its days: the day in
// Anton, its date and Unlock count, a strong rule out to the edge. Then one
// row per member and set, on hairlines.
export function HubDay({ day, now }: { day: FeedDay; now: Date }) {
  const heading = hubDayHeading(day.day, day.cards, now);
  const groups = day.cards.filter((card): card is AchievementFeedGroup => card.kind === "group");
  return (
    <section aria-label={heading.title} data-slot="hub-day">
      <h2 data-slot="hub-day-band" className="mb-1 flex items-baseline gap-3">
        {day.day ? (
          <time dateTime={day.day} className="font-headline shrink-0 text-3xl">
            {heading.title}
          </time>
        ) : (
          <span className="font-headline shrink-0 text-3xl">{heading.title}</span>
        )}
        <span data-slot="hub-day-note" className="font-label shrink-0 text-[0.8rem] tracking-[0.08em] text-faint-foreground">
          {heading.note}
        </span>
        <span aria-hidden data-slot="hub-day-rule" className="h-0.5 min-w-6 flex-1 self-center bg-border-strong" />
      </h2>
      <ul>
        {groups.map((card) => (
          <HubRow key={`${card.user.user_id}-${card.achievement_set.id}-${card.day}`} card={card} />
        ))}
      </ul>
    </section>
  );
}
