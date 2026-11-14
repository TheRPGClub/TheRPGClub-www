import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import type { GameAchievementSet } from "@/lib/api/types";
import {
  completionLabel,
  memberName,
  memberSetHref,
  progressFill,
  progressPercent,
  setBadges,
  setTitle,
} from "@/lib/achievements";
import { Chip } from "@/components/issue/chip";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProviderBadge } from "./provider-badge";
import { SetBadgeChip } from "./set-badge";

// Completers shown as faces before the rest collapse into "+N".
const COMPLETERS_SHOWN = 8;

// One Achievement Set on a GameDB game's page: the set, its size, the
// members who completed it (oldest Completion first, the date in each
// face's tooltip) and, when the viewer has started it, their own progress
// as a bar that opens their set page.
export function GameSetCard({
  set,
  className,
}: {
  set: GameAchievementSet;
  className?: string;
}) {
  const title = setTitle(set);
  const ra = set.provider === "retroachievements";
  const completions = set.completions;
  const shown = completions.slice(0, COMPLETERS_SHOWN);
  const rest = completions.length - shown.length;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-md border border-border bg-card p-4",
        className,
      )}
    >
      <div className="flex gap-4">
        <span className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-muted sm:size-16">
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
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="font-headline line-clamp-2 text-[1.3rem] leading-[0.95] text-foreground">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <ProviderBadge provider={set.provider} />
            {set.platform_label && <Chip>{set.platform_label}</Chip>}
          </div>
          <p className="font-label text-[0.8rem] text-faint-foreground">
            {set.achievements_count}{" "}
            {set.achievements_count === 1 ? "achievement" : "achievements"}
            {ra && set.points_total > 0 ? ` · ${set.points_total} pts` : ""}
          </p>
        </div>
      </div>

      <div>
        <p className="font-label mb-2 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground">
          {completions.length > 0
            ? `Completed by ${completions.length} ${completions.length === 1 ? "member" : "members"}`
            : "No member has completed it yet"}
        </p>
        {completions.length > 0 && (
          <ul className="flex flex-wrap items-center gap-y-1.5">
            {shown.map((completion, i) => {
              const label = completionLabel(completion);
              return (
                <li key={completion.user.user_id} className={cn(i > 0 && "-ml-2")}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Link
                          href={`/members/${completion.user.user_id}`}
                          aria-label={label}
                          className="relative block rounded-full ring-3 ring-card transition-transform hover:z-10 hover:-translate-y-0.5 focus-visible:z-10"
                        />
                      }
                    >
                      <ReviewerAvatar
                        userId={completion.user.user_id}
                        name={memberName(completion.user)}
                        size="sm"
                      />
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
            {rest > 0 && (
              <li className="font-label ml-2 text-sm font-extrabold tracking-[0.04em] text-dim-foreground">
                +{rest}
              </li>
            )}
          </ul>
        )}
      </div>

      {set.viewer_progress && (
        <ViewerProgress set={set} progress={set.viewer_progress} title={title} />
      )}
    </article>
  );
}

function ViewerProgress({
  set,
  progress,
  title,
}: {
  set: GameAchievementSet;
  progress: NonNullable<GameAchievementSet["viewer_progress"]>;
  title: string;
}) {
  const percent = progressPercent(progress);
  const fill = progressFill(progress);
  const badges = setBadges(progress);

  return (
    <Link
      href={memberSetHref(progress.user_id, set.id)}
      className="group/progress -mx-1 -mb-1 flex flex-col gap-1.5 rounded-sm px-1 pb-1 pt-3 border-t border-border"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-label inline-flex items-center gap-1 text-[0.8rem] font-extrabold tracking-[0.08em] text-foreground transition-colors group-hover/progress:text-highlight [&_svg]:size-3.5">
          Your progress
          <ArrowRight aria-hidden />
        </span>
        <span className="font-label text-[0.8rem] text-dim-foreground">
          {progress.earned_count} / {progress.total_count} · {percent}%
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Your progress in ${title}`}
        aria-valuemin={0}
        aria-valuemax={progress.total_count}
        aria-valuenow={progress.earned_count}
        aria-valuetext={`${progress.earned_count} of ${progress.total_count} unlocked`}
        className="h-1 w-full overflow-hidden bg-muted"
      >
        <div className="h-full bg-foreground" style={{ width: `${fill}%` }} />
      </div>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {badges.map((badge) => (
            <SetBadgeChip key={badge} badge={badge} />
          ))}
        </div>
      )}
    </Link>
  );
}
