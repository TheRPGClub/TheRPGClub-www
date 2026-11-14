import Link from "next/link";
import type { AchievementFeedGroup } from "@/lib/api/types";
import { isSpoiler, memberSetHref, viewFromUnlock } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "../achievement-hover-card";
import { AchievementIcon } from "../achievement-icon";
import { BandLine, CardShell, WhoLine } from "./group-card-parts";
import { HUB_LINK } from "./parts";

// A Latest card without a Highlight: the icons fan out like a hand of
// cards, the rest counted, the names in a line below.

const FAN_LIMIT = 5;

// The fan's hand-placed lean, by position.
const FAN_POSE = [
  "-rotate-6",
  "rotate-3 -translate-y-1",
  "-rotate-2 translate-y-0.5",
  "rotate-[5deg]",
  "-rotate-3",
];

export function PlainGroupCard({
  card,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  tint: SetTint;
  className?: string;
}) {
  const shown = card.unlocks.slice(0, FAN_LIMIT);
  const more = Math.max(0, card.count - shown.length);
  const names = card.unlocks
    .map((u) => (isSpoiler(viewFromUnlock(u)) ? "Hidden achievement" : u.achievement.name))
    .filter(Boolean)
    .join(" · ");
  const href = memberSetHref(card.user.user_id, card.achievement_set.id);

  return (
    <CardShell tint={tint} className={cn("@container", className)}>
      {/* Half width: stacked. Full width: the fan moves to the right edge. */}
      <div className="flex h-full flex-col gap-3 px-4 pt-3 pb-3.5 @xl:grid @xl:grid-cols-[minmax(0,1fr)_auto] @xl:content-center @xl:gap-x-8 @xl:gap-y-2.5 @xl:pr-6">
        <WhoLine card={card} />
        <BandLine card={card} tint={tint} />
        <ul
          aria-label="Unlocks"
          className="flex items-center py-1 pl-1 @xl:col-start-2 @xl:row-span-3 @xl:row-start-1"
        >
          {shown.map((unlock, i) => {
            const view = viewFromUnlock(unlock);
            return (
              <li
                key={unlock.id}
                className={cn("relative", i > 0 && "-ml-3.5", FAN_POSE[i])}
                style={{ zIndex: FAN_LIMIT - i }}
              >
                <AchievementHoverCard view={view}>
                  <AchievementIcon
                    view={view}
                    size="md"
                    className="drop-shadow-[0_6px_10px_rgb(0_0_0/0.45)] @xl:size-16"
                  />
                </AchievementHoverCard>
              </li>
            );
          })}
          {more > 0 && (
            <li className="-ml-3.5 rotate-2">
              <Link
                href={href}
                aria-label={`${more} more Unlocks`}
                className={cn(
                  "font-headline grid size-14 place-items-center rounded-[6px] border-[1.5px] border-dashed border-border-strong bg-muted text-2xl text-dim-foreground @xl:size-16",
                  HUB_LINK,
                )}
              >
                +{more}
              </Link>
            </li>
          )}
        </ul>
        {names && (
          <p className="mt-auto truncate text-[0.82rem] text-faint-foreground @xl:col-start-1 @xl:mt-0">
            {names}
          </p>
        )}
      </div>
    </CardShell>
  );
}
