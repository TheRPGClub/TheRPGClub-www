import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AchievementSetDetail } from "@/lib/api/types";
import {
  formatUnlockDate,
  memberAchievementsHref,
  progressFill,
  setBadges,
  setTitle,
} from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { FoilStamp } from "@/components/achievements/foil-stamp";
import { ProviderBadge } from "@/components/achievements/provider-badge";
import { MemberAvatar } from "@/components/issue/member-cover";
import { Chip } from "@/components/issue/chip";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The set page's masthead: the game title on its tint band (with any
// Completion, Mastery or Platinum stamped on its corner), the Provider and
// whose Unlocks these are, then the monumental earned / total over a
// progress bar in the tint, the last Unlock and the way to the game. It
// sits on the 2px paper rule.
export function SetHeader({
  set,
  tint,
  userId,
  displayName,
  badge,
}: {
  set: AchievementSetDetail;
  tint: SetTint;
  userId: string;
  displayName: string;
  // Leads the Provider line, e.g. the staff "Preview" badge.
  badge?: React.ReactNode;
}) {
  const title = setTitle(set);
  const progress = set.progress;
  const total = progress?.total_count ?? set.achievements_count;
  const earned = progress?.earned_count ?? 0;
  const left = Math.max(total - earned, 0);
  const fill = progressFill({ earned_count: earned, total_count: total });
  const badges = progress ? setBadges(progress) : [];
  const ra = set.provider === "retroachievements";

  return (
    <header className="border-b-2 border-foreground pb-6">
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex min-w-0 flex-col gap-4">
          <div
            className={cn(
              "flex flex-wrap items-start gap-3 sm:relative sm:w-fit sm:max-w-full",
              badges.length > 0 && "sm:pr-24",
            )}
          >
            <h1
              className="font-headline w-fit max-w-full rounded-md px-4 pt-3 pb-2 text-[2.5rem] leading-[0.92] break-words sm:text-[3.5rem] xl:text-[4rem]"
              style={{ background: tint.tint, color: tint.contrast }}
            >
              {title}
            </h1>
            {badges.length > 0 && (
              <span className="flex gap-2 sm:absolute sm:top-0 sm:right-0 sm:-translate-y-[45%]">
                {badges.map((badge) => (
                  <FoilStamp key={badge} kind={badge} size="md" />
                ))}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {badge}
            <ProviderBadge provider={set.provider} />
            {set.platform_label && <Chip>{set.platform_label}</Chip>}
            <Link
              href={memberAchievementsHref(userId)}
              className="font-label flex items-center gap-2 text-[0.95rem] text-dim-foreground transition-colors hover:text-highlight"
            >
              <MemberAvatar
                userId={userId}
                name={displayName}
                className="size-6"
                fallbackClassName="text-xs"
              />
              {displayName}&rsquo;s Achievements
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
          <div className="flex min-w-[16rem] flex-1 flex-col gap-2.5">
            <p className="flex items-end gap-3">
              <span className="font-headline text-[5rem] leading-[0.8] tracking-[-0.01em] text-foreground sm:text-[5.75rem]">
                {earned}
              </span>
              <span className="font-headline pb-0.5 text-[2.75rem] leading-[0.8] text-faint-foreground">
                / {total}
              </span>
              <span className="font-label flex flex-col pb-1 text-[0.85rem] leading-tight text-dim-foreground">
                <span>Unlocked</span>
                <span className="text-faint-foreground">
                  {left === 0 && total > 0 ? "Every one" : `${left} to go`}
                </span>
              </span>
            </p>
            <div
              role="progressbar"
              aria-label={`${title} progress`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={earned}
              aria-valuetext={`${earned} of ${total} unlocked`}
              className="h-2 w-full overflow-hidden rounded-[1px] bg-muted"
            >
              <div className="h-full" style={{ width: `${fill}%`, background: tint.tint }} />
            </div>
            {ra && progress && set.points_total > 0 && (
              <p className="font-label text-[0.85rem] text-faint-foreground">
                {progress.points_earned} / {set.points_total} points
                {progress.hardcore_earned_count > 0 &&
                  ` · ${progress.hardcore_earned_count} hardcore`}
              </p>
            )}
          </div>

          <div className="flex items-end gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-label text-[0.8rem] text-faint-foreground">Last Unlock</span>
              <span className="font-headline text-[2rem] leading-[0.9] text-foreground">
                {progress?.last_unlocked_at
                  ? formatUnlockDate(progress.last_unlocked_at)
                  : "None yet"}
              </span>
            </div>
            {set.game_id != null && (
              <Link
                href={`/games/${set.game_id}`}
                className={buttonVariants({ variant: "outline" })}
              >
                View game <ArrowRight data-icon="inline-end" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
