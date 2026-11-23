import Link from "next/link";
import type { AchievementSetDetail } from "@/lib/api/types";
import { memberAchievementsHref, setBadges, setTitle } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { FoilStamp } from "@/components/achievements/foil-stamp";
import { ProviderBadge } from "@/components/achievements/provider-badge";
import { MemberAvatar } from "@/components/issue/member-cover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SetHeaderStats } from "./set-header-stats";
import { BackLink } from "@/components/shell/back-link";

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
  const badges = set.progress ? setBadges(set.progress) : [];

  return (
    <header className="border-b-2 border-foreground pb-6">
      <BackLink href={memberAchievementsHref(userId)} label="Achievements" className="mb-5" />
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
            {set.platform_label && <Badge className="border-0">{set.platform_label}</Badge>}
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

        <SetHeaderStats set={set} title={title} tint={tint} />
      </div>
    </header>
  );
}
