import Link from "next/link";
import { Trophy } from "lucide-react";
import type { AchievementSet, SetProgress } from "@/lib/api/types";
import { progressPercent, setBadges, setTitle } from "@/lib/achievements";
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
  // The bar is exact; the label floors, so it says 100 only when done.
  const fill =
    progress && progress.total_count > 0
      ? Math.min(100, (progress.earned_count / progress.total_count) * 100)
      : 0;
  const badges = progress ? setBadges(progress) : [];
  const ra = set.provider === "retroachievements";

  return (
    <article
      className={cn(
        "group relative flex gap-4 rounded-md border border-rule bg-ink-2 p-4 transition-colors",
        href && "hover:border-rule-strong hover:bg-ink-3/60",
        className,
      )}
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-sm bg-ink-3 sm:size-[4.5rem]">
        {set.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Provider icons
          <img src={set.icon_url} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          <span aria-hidden className="flex size-full items-center justify-center text-paper-mute">
            <Trophy className="size-6" />
          </span>
        )}
        <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm shadow-[inset_0_0_0_1px_rgb(244_244_240/0.12)]" />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline line-clamp-2 text-[1.3rem] leading-[0.95] text-paper sm:text-[1.45rem]">
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
                <span className="font-headline text-[1.9rem] leading-[0.8] text-paper">
                  {progress.earned_count}
                </span>
                <span className="font-label text-[0.85rem] text-paper-mute">
                  / {progress.total_count}
                </span>
              </p>
              <span className="font-label text-[0.8rem] text-paper-dim">
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
              className="h-1 w-full overflow-hidden bg-ink-3"
            >
              <div className="h-full bg-paper" style={{ width: `${fill}%` }} />
            </div>
            {ra && (
              <p className="font-label flex flex-wrap gap-x-3 text-[0.74rem] text-paper-mute">
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
          <p className="font-label text-[0.8rem] text-paper-mute">
            {set.achievements_count} achievements
            {ra && set.points_total > 0 ? ` · ${set.points_total} pts` : ""}
          </p>
        )}
      </div>
    </article>
  );
}
