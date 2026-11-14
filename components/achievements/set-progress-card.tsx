import Link from "next/link";
import { Trophy } from "lucide-react";
import type { AchievementSet, SetProgress } from "@/lib/api/types";
import { progressFill, progressPercent, setBadges, setTitle } from "@/lib/achievements";
import { Chip } from "@/components/issue/chip";
import { cn } from "@/lib/utils";
import { ProviderBadge } from "./provider-badge";
import { SetBadgeChip } from "./set-badge";

type CardProgress = Pick<
  SetProgress,
  | "earned_count"
  | "hardcore_earned_count"
  | "total_count"
  | "points_earned"
  | "completed_at"
  | "mastered_at"
  | "platinum_at"
>;

// One Achievement Set with a member's progress through it: the set's icon
// and title, its Provider and platform, the earned count over the total as
// numerals over a bar, and any Completion, Mastery or Platinum. Without
// progress (nobody's, or the viewer hasn't started) it lists the set's size.
export function SetProgressCard({
  set,
  progress,
  href,
  className,
}: {
  set: AchievementSet;
  progress: CardProgress | null;
  href?: string;
  className?: string;
}) {
  const title = setTitle(set);
  const percent = progress ? progressPercent(progress) : 0;
  const fill = progressFill(progress);
  const badges = progress ? setBadges(progress) : [];
  const ra = set.provider === "retroachievements";

  return (
    <article
      className={cn(
        "group relative flex gap-4 rounded-md border border-border bg-card p-4 transition-colors",
        href && "hover:border-border-strong hover:bg-muted/60",
        className,
      )}
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-muted sm:size-[4.5rem]">
        {set.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Provider icons
          <img src={set.icon_url} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center text-faint-foreground">
            <Trophy className="size-6" />
          </span>
        )}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_12%,transparent)]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline line-clamp-2 text-[1.3rem] leading-[0.95] text-foreground sm:text-[1.45rem]">
            {href ? (
              <Link
                href={href}
                className="transition-colors group-hover:text-highlight after:absolute after:inset-0 after:content-['']"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <ProviderBadge provider={set.provider} short />
            {set.platform_label && <Chip>{set.platform_label}</Chip>}
            {badges.map((badge) => (
              <SetBadgeChip key={badge} badge={badge} />
            ))}
          </div>
        </div>

        {progress ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-end justify-between gap-3">
              <p className="flex items-baseline gap-1">
                <span className="font-headline text-[1.9rem] leading-[0.8] text-foreground">
                  {progress.earned_count}
                </span>
                <span className="font-label text-[0.85rem] text-faint-foreground">
                  / {progress.total_count}
                </span>
              </p>
              <span className="font-label text-[0.8rem] text-dim-foreground">
                {percent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${title} progress`}
              aria-valuemin={0}
              aria-valuemax={progress.total_count}
              aria-valuenow={progress.earned_count}
              aria-valuetext={`${progress.earned_count} of ${progress.total_count} unlocked`}
              className="h-1 w-full overflow-hidden bg-muted"
            >
              <div className="h-full bg-foreground" style={{ width: `${fill}%` }} />
            </div>
            {ra && (
              <p className="font-label flex flex-wrap gap-x-3 text-[0.74rem] text-faint-foreground">
                {set.points_total > 0 && (
                  <span>
                    {progress.points_earned} / {set.points_total} pts
                  </span>
                )}
                {progress.hardcore_earned_count > 0 && (
                  <span>{progress.hardcore_earned_count} hardcore</span>
                )}
              </p>
            )}
          </div>
        ) : (
          <p className="font-label text-[0.8rem] text-faint-foreground">
            {set.achievements_count} achievements
            {ra && set.points_total > 0 ? ` · ${set.points_total} pts` : ""}
          </p>
        )}
      </div>
    </article>
  );
}
