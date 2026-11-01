import Link from "next/link";
import { CircleCheck, Crown, Gem, Trophy } from "lucide-react";
import type {
  AchievementFeedCard,
  AchievementFeedGroup,
  AchievementFeedHighlight,
  AchievementHighlightKind,
} from "@/lib/api/types";
import {
  FEED_ICON_LIMIT,
  HIGHLIGHT_LABEL,
  displayRarity,
  formatFeedDay,
  formatUnlockDate,
  isSpoiler,
  memberAchievementsHref,
  memberName,
  memberSetHref,
  setTitle,
  viewFromUnlock,
} from "@/lib/achievements";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "./achievement-hover-card";
import { AchievementIcon } from "./achievement-icon";
import { ProviderBadge } from "./provider-badge";
import { RarityLabel } from "./rarity-label";
import { SpoilerText } from "./spoiler-text";

// A community feed card. A group is one member's Unlocks in one Achievement
// Set on one UTC day, shown as up to eight icons and "+N". A Highlight is a
// single Platinum, Completion, Mastery or ultra-rare Unlock, set larger and
// capped with a paper rule.
export function FeedCard({
  card,
  className,
}: {
  card: AchievementFeedCard;
  className?: string;
}) {
  return card.kind === "highlight" ? (
    <FeedHighlightCard card={card} className={className} />
  ) : (
    <FeedGroupCard card={card} className={className} />
  );
}

const LINK = "transition-colors hover:text-highlight";

function MemberByline({
  user,
  date,
}: {
  user: AchievementFeedGroup["user"];
  date: string;
}) {
  const name = memberName(user);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <ReviewerAvatar userId={user.user_id} name={name} size="sm" />
      <Link
        href={memberAchievementsHref(user.user_id)}
        className={cn("font-label truncate text-[0.9rem] text-paper", LINK)}
      >
        {name}
      </Link>
      <span className="font-label shrink-0 text-[0.78rem] text-paper-mute">
        {date}
      </span>
    </div>
  );
}

export function FeedGroupCard({
  card,
  className,
}: {
  card: AchievementFeedGroup;
  className?: string;
}) {
  const set = card.achievement_set;
  const shown = card.unlocks.slice(0, FEED_ICON_LIMIT);
  const more = Math.max(0, card.count - shown.length);

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-md border border-rule bg-ink-2 p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <MemberByline user={card.user} date={formatFeedDay(card.day)} />
        <ProviderBadge provider={set.provider} short className="shrink-0" />
      </div>

      <p className="flex min-w-0 items-baseline gap-2">
        <span className="font-headline shrink-0 text-[2rem] leading-[0.8] text-paper">
          {card.count}
        </span>
        <span className="min-w-0 text-[0.9rem] leading-snug text-paper-dim">
          {card.count === 1 ? "unlock" : "unlocks"} in{" "}
          <Link
            href={memberSetHref(card.user.user_id, set.id)}
            className={cn("font-semibold text-paper", LINK)}
          >
            {setTitle(set)}
          </Link>
        </span>
      </p>

      <ul aria-label="Unlocks" className="flex flex-wrap gap-1.5">
        {shown.map((unlock) => (
          <li key={unlock.id}>
            <AchievementHoverCard view={viewFromUnlock(unlock)}>
              <AchievementIcon view={viewFromUnlock(unlock)} size="sm" />
            </AchievementHoverCard>
          </li>
        ))}
        {more > 0 && (
          <li>
            <Link
              href={memberSetHref(card.user.user_id, set.id)}
              aria-label={`${more} more unlocks`}
              className="font-label flex size-10 items-center justify-center rounded-sm bg-ink-3 text-[0.85rem] text-paper-dim shadow-[inset_0_0_0_1px_var(--color-rule-strong)] transition-colors hover:text-highlight"
            >
              +{more}
            </Link>
          </li>
        )}
      </ul>
    </article>
  );
}

const HIGHLIGHT_ICON: Record<AchievementHighlightKind, typeof Trophy> = {
  platinum: Trophy,
  completion: CircleCheck,
  mastery: Crown,
  rare: Gem,
};

export function FeedHighlightCard({
  card,
  className,
}: {
  card: AchievementFeedHighlight;
  className?: string;
}) {
  const view = viewFromUnlock(card);
  const set = card.achievement_set;
  const kind = card.highlight;
  const Icon = kind ? HIGHLIGHT_ICON[kind] : Trophy;
  const rarity = displayRarity(view);

  return (
    <article
      className={cn(
        "flex flex-col gap-3.5 rounded-md border border-rule border-t-paper bg-ink-2 p-4 [border-top-width:3px]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {kind && (
          <span className="font-label inline-flex h-6 items-center gap-1 rounded-xs bg-paper px-2 text-[0.78rem] text-ink [&_svg]:size-3">
            <Icon aria-hidden />
            {HIGHLIGHT_LABEL[kind]}
          </span>
        )}
        <ProviderBadge provider={set.provider} short className="ml-auto shrink-0" />
      </div>

      <div className="flex items-start gap-4">
        <AchievementHoverCard view={view}>
          <AchievementIcon view={view} size="lg" />
        </AchievementHoverCard>
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3 className="font-headline text-[1.5rem] leading-[0.95] text-paper sm:text-[1.7rem]">
            <SpoilerText spoiler={isSpoiler(view)}>
              {view.name ?? "Untitled achievement"}
            </SpoilerText>
          </h3>
          <p className="text-[0.9rem] leading-snug text-paper-dim">
            in{" "}
            <Link
              href={memberSetHref(card.user.user_id, set.id)}
              className={cn("font-semibold text-paper", LINK)}
            >
              {setTitle(set)}
            </Link>
          </p>
          <RarityLabel
            rarity={rarity.rarity}
            hardcore={rarity.hardcore}
            // A rare Highlight already wears "Ultra rare" up top.
            chip={kind !== "rare"}
          />
        </div>
      </div>

      <div className="border-t border-rule pt-3">
        <MemberByline user={card.user} date={formatUnlockDate(card.unlocked_at)} />
      </div>
    </article>
  );
}
