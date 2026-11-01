import {
  sortAchievements,
  type AchievementOrder,
  type AchievementView,
} from "@/lib/achievements";
import { AchievementHoverCard } from "./achievement-hover-card";
import { AchievementIcon } from "./achievement-icon";

// A set's Achievements as a dense icon grid, each icon opening its hover
// card. "unlocked-first" leads with the shown member's Unlocks; "display"
// keeps the Provider's order.
export function AchievementGrid({
  items,
  order = "unlocked-first",
  label = "Achievements",
  empty = "No achievements in this set.",
}: {
  items: AchievementView[];
  order?: AchievementOrder;
  label?: string;
  empty?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-rule-strong px-4 py-5 text-sm text-paper-mute">
        {empty}
      </p>
    );
  }

  return (
    <ul
      aria-label={label}
      className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(3.75rem,1fr))]"
    >
      {sortAchievements(items, order).map((view) => (
        <li key={view.id}>
          <AchievementHoverCard view={view} className="w-full">
            <AchievementIcon
              view={view}
              size="md"
              className="aspect-square size-auto w-full"
            />
          </AchievementHoverCard>
        </li>
      ))}
    </ul>
  );
}
