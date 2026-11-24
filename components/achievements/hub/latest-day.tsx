import type { AchievementFeedGroup } from "@/lib/api/types";
import type { FeedDay } from "@/lib/api/achievement-feed";
import { formatFeedDay } from "@/lib/achievements";
import { dayTally, leadHighlight } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { HubGroupCard } from "./group-card";
import { DayTape } from "./parts";

// Each UTC day's member-plus-game cards, laid out as a wall under its day
// tape.

function dayLabel(day: string | null): string {
  if (!day) return "Unknown date";
  return WEEKDAY.format(new Date(`${day}T00:00:00Z`));
}

const WEEKDAY = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function LatestDay({
  day,
  index,
  tints,
}: {
  day: FeedDay;
  index: number;
  tints: (setId: number) => SetTint;
}) {
  // Highlight cards span the wall; so does a day's odd plain card out, so
  // the wall never ends on a hole.
  const groups = day.cards.filter(
    (card): card is AchievementFeedGroup => card.kind === "group",
  );
  const plain = groups.filter((card) => !leadHighlight(card));
  const lone = plain.length % 2 ? plain.at(-1) : undefined;
  return (
    <section aria-label={day.day ? formatFeedDay(day.day) : "Unknown date"} className="space-y-3">
      <DayTape day={day.day} label={dayLabel(day.day)} tally={dayTally(day.cards)} index={index} />
      <ul className="grid grid-flow-row-dense gap-3 sm:grid-cols-2">
        {groups.map((card) => (
            <li
              key={`g-${card.user.user_id}-${card.achievement_set.id}-${card.day}`}
              className={
                card === lone || leadHighlight(card) ? "min-w-0 sm:col-span-2" : "min-w-0"
              }
            >
              <HubGroupCard card={card} tint={tints(card.achievement_set.id)} className="h-full" />
            </li>
        ))}
      </ul>
    </section>
  );
}
