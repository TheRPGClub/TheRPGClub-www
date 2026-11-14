import { ArrowRight } from "lucide-react";
import type { AchievementSetDetail } from "@/lib/api/types";
import { formatUnlockDate } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// The masthead's numbers: the monumental earned / total over a progress bar
// in the game tint (and the RetroAchievements points), then the last
// Unlock and the way to the game.
export function SetHeaderStats({
  set,
  title,
  tint,
}: {
  set: AchievementSetDetail;
  title: string;
  tint: SetTint;
}) {
  const progress = set.progress;
  const total = progress?.total_count ?? set.achievements_count;
  const earned = progress?.earned_count ?? 0;
  const left = Math.max(total - earned, 0);
  const ra = set.provider === "retroachievements";

  return (
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
        <Progress
          value={earned}
          max={total > 0 ? total : 1}
          tone="tint"
          size="lg"
          aria-label={`${title} progress`}
          aria-valuetext={`${earned} of ${total} unlocked`}
          style={{ "--progress-ink": tint.tint } as React.CSSProperties}
        />
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
          <ButtonLink
            href={`/games/${set.game_id}`}
            variant="outline"
          >
            View game <ArrowRight data-icon="inline-end" />
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
