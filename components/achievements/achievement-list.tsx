import {
  sortAchievements,
  type AchievementOrder,
  type AchievementView,
} from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { AchievementDetails } from "./achievement-details";

// A set's Achievements with their details laid open: the same body as the
// hover card, one panel each. Hover cards don't open on tap, so this is
// where phones read them; `rowId` lets an AchievementGrid's icons jump here.
export function AchievementList({
  items,
  order = "unlocked-first",
  rowId,
  label = "Achievement details",
  className,
}: {
  items: AchievementView[];
  order?: AchievementOrder;
  rowId?: (view: AchievementView) => string;
  label?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <ol
      aria-label={label}
      className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-3", className)}
    >
      {sortAchievements(items, order).map((view) => (
        <li
          key={view.id}
          id={rowId?.(view)}
          className="scroll-mt-20 rounded-md border border-rule bg-ink-2 p-3.5 target:border-paper-mute"
        >
          <AchievementDetails view={view} />
        </li>
      ))}
    </ol>
  );
}
