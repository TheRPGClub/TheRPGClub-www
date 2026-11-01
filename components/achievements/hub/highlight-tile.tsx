import Link from "next/link";
import type { AchievementFeedHighlight } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  isSpoiler,
  memberAchievementsHref,
  memberName,
  memberSetHref,
  setTitle,
  viewFromUnlock,
} from "@/lib/achievements";
import { foilKind, formatUnlockStamp } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "../achievement-hover-card";
import { AchievementIcon } from "../achievement-icon";
import { FoilStamp } from "../foil-stamp";
import { SpoilerText } from "../spoiler-text";
import { OddsTag } from "./parts";

// A Highlight on the Highlights wall, at double size: the Unlock large and
// tilted, a foil stamp (Platinum, Mastery, Completion) or its ultra-rare
// Rarity pressed over it, the member's avatar on its corner, and a paper tag
// beneath edged in the game tint (left) and the Provider's colour (top).

const PROVIDER_TOP = {
  retroachievements: "border-t-provider-retroachievements",
  steam: "border-t-provider-steam",
  psn: "border-t-provider-psn",
} as const;

export function HighlightTile({
  card,
  tint,
  index,
}: {
  card: AchievementFeedHighlight;
  tint: SetTint;
  index: number;
}) {
  const view = viewFromUnlock(card);
  const foil = foilKind(card.highlight);
  const set = card.achievement_set;
  const name = memberName(card.user);
  const lean = ["-rotate-[1.2deg]", "rotate-[0.6deg]", "rotate-[1.5deg]"][index % 3];

  return (
    <article className={cn("relative flex flex-col items-center", lean)}>
      <div className="relative pt-2.5">
        <AchievementHoverCard view={view} className="-rotate-2">
          <AchievementIcon
            view={view}
            size="xl"
            foil={foil != null}
            className="drop-shadow-[0_8px_16px_rgb(0_0_0/0.55)]"
          />
        </AchievementHoverCard>
        <Link
          href={memberAchievementsHref(card.user.user_id)}
          aria-label={name}
          className="absolute top-3 -right-4 rounded-full shadow-[0_0_0_2px_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          <ReviewerAvatar userId={card.user.user_id} name={name} size="lg" />
        </Link>
        {foil ? (
          <FoilStamp
            kind={foil}
            size="md"
            className="pointer-events-none absolute -bottom-3 -left-5 whitespace-nowrap"
          />
        ) : (
          card.achievement.rarity != null && (
            <OddsTag rarity={card.achievement.rarity} className="absolute -top-1 -left-3" />
          )
        )}
      </div>

      <div
        className={cn(
          "relative mt-6 w-full rounded-xs border-t-[3px] bg-paper py-1.5 pr-2 pl-3 text-ink shadow-[0_3px_8px_rgb(0_0_0/0.5)]",
          PROVIDER_TOP[set.provider],
        )}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: tint.tint }} />
        <h3 className="font-label truncate text-[0.95rem] leading-tight font-extrabold">
          <span className="sr-only">{HIGHLIGHT_LABEL[card.highlight ?? "rare"]}: </span>
          <SpoilerText spoiler={isSpoiler(view)}>
            {view.name ?? "Untitled achievement"}
          </SpoilerText>
        </h3>
        <p className="font-label truncate text-[0.78rem] leading-snug font-semibold tracking-[0.04em] text-[#55554f]">
          <Link
            href={memberSetHref(card.user.user_id, set.id)}
            className="underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-highlight"
          >
            {setTitle(set)}
          </Link>
          {" · "}
          {name}
        </p>
        <p className="font-label text-[0.72rem] leading-snug font-semibold tracking-[0.06em] text-[#55554f]">
          <time dateTime={card.unlocked_at}>{formatUnlockStamp(card.unlocked_at)}</time>
        </p>
      </div>
    </article>
  );
}
