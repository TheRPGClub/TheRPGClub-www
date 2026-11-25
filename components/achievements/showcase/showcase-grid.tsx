"use client";

import { ArrowRight } from "lucide-react";
import type { AchievementProvider } from "@/lib/api/types";
import type { SetMember } from "@/lib/achievements/game-page";
import { capClass, showAllClass, type ShowcaseItem, type ShowcaseLens } from "@/lib/achievements/showcase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShowcaseFrame } from "./showcase-frame";

// The sheet of frames, capped at three rows (as many frames as the section's
// width fits) until "Show all" opens the rest in place.
export function ShowcaseGrid({
  items,
  provider,
  lens,
  members,
  expanded,
  onExpand,
}: {
  items: ShowcaseItem[];
  provider: AchievementProvider;
  lens: ShowcaseLens;
  members: SetMember[];
  expanded: boolean;
  onExpand: () => void;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xs border border-dashed border-border-strong px-4 py-8 text-center text-dim-foreground">
        Nothing here.
      </p>
    );
  }
  const more = expanded ? null : showAllClass(items.length);
  return (
    <div className="@container space-y-4">
      <ul className="grid grid-cols-3 gap-x-3 gap-y-4 @md:grid-cols-4 @3xl:grid-cols-6 @5xl:grid-cols-9">
        {items.map((item, i) => (
          <li key={item.achievement.id} className={cn("min-w-0", !expanded && capClass(i))}>
            <ShowcaseFrame item={item} provider={provider} lens={lens} members={members} />
          </li>
        ))}
      </ul>
      {more != null && (
        <Button variant="heading-action" size="bare" onClick={onExpand} className={cn("gap-1.5", more)}>
          Show all {items.length}
          <ArrowRight aria-hidden />
        </Button>
      )}
    </div>
  );
}
