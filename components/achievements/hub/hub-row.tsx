import Link from "next/link";
import type { AchievementFeedGroup } from "@/lib/api/types";
import { memberAchievementsHref, memberName, memberSetHref, setTitle } from "@/lib/achievements";
import { formatUtcTime } from "@/lib/achievements/hub";
import { PROVIDER_VAR } from "@/lib/achievements/provider-color";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { UnlockFrames } from "../frame/unlock-frames";

const LINK = "rounded-xs transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

// One member's day in one set: who and which game on the left, every Unlock
// of that day as an equal frame, the time of the latest on the right.
export function HubRow({ card }: { card: AchievementFeedGroup }) {
  const name = memberName(card.user);
  const time = formatUtcTime(card.latest_unlocked_at);
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-3 border-t border-border py-3.5 first:border-t-0 md:grid-cols-[15rem_minmax(0,1fr)_auto]">
      <div className="flex min-w-0 items-center gap-3">
        <ReviewerAvatar userId={card.user.user_id} name={name} size="sm" className="shrink-0" />
        <div className="flex min-w-0 flex-col">
          <Link href={memberAchievementsHref(card.user.user_id)} className={`font-label truncate text-[1.05rem] font-extrabold text-foreground ${LINK}`}>
            {name}
          </Link>
          <Link
            href={memberSetHref(card.user.user_id, card.achievement_set.id)}
            className={`inline-flex min-w-0 items-center gap-2 text-[0.88rem] text-dim-foreground ${LINK}`}
          >
            <span aria-hidden className="size-2 shrink-0 rounded-[1px]" style={{ background: PROVIDER_VAR[card.achievement_set.provider] }} />
            <span className="truncate">{setTitle(card.achievement_set)}</span>
          </Link>
        </div>
      </div>
      <time
        dateTime={card.latest_unlocked_at}
        className="font-label self-start pt-1 text-[0.85rem] tracking-[0.06em] text-faint-foreground md:order-last"
      >
        {time ?? ""}
      </time>
      <UnlockFrames
        unlocks={card.unlocks}
        count={card.count}
        userId={card.user.user_id}
        setId={card.achievement_set.id}
        className="col-span-2 md:col-span-1"
      />
    </li>
  );
}
