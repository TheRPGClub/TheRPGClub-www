import Link from "next/link";
import type { AchievementSet, UserSummary } from "@/lib/api/types";
import {
  formatRarity,
  memberAchievementsHref,
  memberName,
  memberSetHref,
  setTitle,
} from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { TintBand } from "../tint";

// Small pieces the hub's cards, tiles and rail share.

export const HUB_LINK =
  "rounded-xs transition-colors hover:text-highlight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight";

// A day band's label: paper tape stuck across the wall, a rule running out
// to the tally. Days are UTC.
export function DayTape({
  day,
  label,
  tally,
  index,
}: {
  day: string | null;
  label: string;
  tally: string;
  index: number;
}) {
  return (
    <h2 className="flex items-center gap-3.5">
      <span
        className={cn(
          "font-label shrink-0 bg-paper/90 px-4 pt-1 pb-[3px] text-[0.95rem] font-extrabold tracking-[0.1em] text-ink [clip-path:polygon(0_8%,3%_0,97%_6%,100%_0,99%_92%,96%_100%,2%_94%,0_100%)]",
          index % 2 ? "rotate-[0.9deg]" : "-rotate-[1.2deg]",
        )}
      >
        {day ? <time dateTime={day}>{label}</time> : label}
      </span>
      <span aria-hidden className="h-px min-w-6 flex-1 bg-rule" />
      <span className="font-label min-w-0 truncate text-[0.8rem] tracking-[0.08em] text-paper-mute">
        {tally}
      </span>
    </h2>
  );
}

// Avatar and name, both leading to the member's achievements page.
export function MemberLink({
  user,
  size = "sm",
  className,
}: {
  user: UserSummary;
  size?: "xs" | "sm";
  className?: string;
}) {
  const name = memberName(user);
  return (
    <Link
      href={memberAchievementsHref(user.user_id)}
      className={cn(
        "font-label inline-flex min-w-0 items-center gap-2 font-extrabold text-paper",
        HUB_LINK,
        className,
      )}
    >
      <ReviewerAvatar userId={user.user_id} name={name} size={size} className="shrink-0" />
      <span className="truncate">{name}</span>
    </Link>
  );
}

// The game title on its tint band, linking to the member's set page.
export function GameBand({
  set,
  userId,
  tint,
  className,
}: {
  set: AchievementSet;
  userId: string;
  tint: SetTint;
  className?: string;
}) {
  return (
    <Link
      href={memberSetHref(userId, set.id)}
      className={cn(
        "group/band inline-flex max-w-full min-w-0 rounded-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        className,
      )}
    >
      <TintBand
        tint={tint}
        as="span"
        className="font-headline block max-w-full truncate rounded-xs px-2.5 pt-[5px] pb-1 text-[1.45rem] leading-none uppercase transition-[filter] group-hover/band:brightness-110"
      >
        {setTitle(set)}
      </TintBand>
    </Link>
  );
}

// An ultra-rare Unlock's Rarity printed in its ink, tilted like a price tag.
export function OddsTag({
  rarity,
  className,
}: {
  rarity: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-headline inline-block rotate-6 rounded-xs bg-rarity-ultra px-1.5 pt-[3px] pb-0.5 text-[0.95rem] leading-none text-ink shadow-[0_3px_8px_rgb(0_0_0/0.5)]",
        className,
      )}
    >
      {formatRarity(rarity)}
    </span>
  );
}
