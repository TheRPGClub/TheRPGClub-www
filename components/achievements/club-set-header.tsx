import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GameAchievementSet } from "@/lib/api/types";
import { memberSetHref } from "@/lib/achievements";
import type { SetTint } from "@/lib/achievements/tint-color";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// The club page's head: the viewer's own progress as a bar in the game tint
// along the top edge, then the title, platform, the club's tally and the
// viewer's count, both leading to the viewer's set page.

export function ClubSetBar({ set, tint }: { set: GameAchievementSet; tint: SetTint }) {
  const progress = set.viewer_progress;
  if (!progress) return null;
  return (
    <Link
      href={memberSetHref(progress.user_id, set.id)}
      aria-hidden
      tabIndex={-1}
      className="absolute top-0 right-0 left-3 h-[7px]"
    >
      <Progress
        value={progress.earned_count}
        max={progress.total_count > 0 ? progress.total_count : 1}
        tone="tint"
        className="h-full gap-0"
        trackClassName="h-full"
        style={{ "--progress-ink": tint.tint } as React.CSSProperties}
      />
    </Link>
  );
}

export function ClubSetHeader({
  set,
  title,
  total,
  clubUnlocked,
}: {
  set: GameAchievementSet;
  title: string;
  total: number;
  clubUnlocked: number;
}) {
  const progress = set.viewer_progress;
  return (
  <header className="col-span-full flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3">
    <h3 className="font-headline text-[1.45rem] leading-none text-foreground">{title}</h3>
    {set.platform_label && <Badge className="border-0">{set.platform_label}</Badge>}
    <span className="font-label text-[0.82rem] tracking-[0.08em] text-faint-foreground">
      {clubUnlocked} of {total} unlocked by the club
      {set.provider === "retroachievements" && set.points_total > 0
        ? ` · ${set.points_total} pts`
        : ""}
    </span>
    {progress && (
      <Link
        href={memberSetHref(progress.user_id, set.id)}
        aria-label={`Your progress: ${progress.earned_count} of ${progress.total_count} unlocked. Open your set page`}
        className="group/you ml-auto inline-flex items-baseline gap-2 text-foreground"
      >
        <span className="font-label text-[0.82rem] tracking-[0.08em] text-faint-foreground transition-colors group-hover/you:text-highlight">
          You
        </span>
        <span className="font-headline text-[1.5rem] leading-[0.9]">
          {progress.earned_count}{" "}
          <span className="text-faint-foreground">/ {progress.total_count}</span>
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 self-center text-faint-foreground transition-transform group-hover/you:translate-x-0.5 group-hover/you:text-highlight"
        />
      </Link>
    )}
  </header>
  );
}
