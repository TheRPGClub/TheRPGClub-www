import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { AchievementSetDetail, ApiSingle } from "@/lib/api/types";
import {
  formatUnlockDate,
  memberName,
  progressPercent,
  setBadges,
  setTitle,
  viewFromSetAchievement,
  type AchievementView,
} from "@/lib/achievements";
import { achievementRowId, setDetailPath } from "@/lib/member-achievements";
import { fetchAchievementSummary } from "@/lib/member-achievements-server";
import { AchievementGrid } from "@/components/achievements/achievement-grid";
import { AchievementList } from "@/components/achievements/achievement-list";
import { ProviderBadge } from "@/components/achievements/provider-badge";
import { SetBadgeChip } from "@/components/achievements/set-badge";
import { Chip } from "@/components/issue/chip";
import { SectionHeading } from "@/components/issue/page-header";
import { MemberListShell } from "@/components/member/member-list-shell";
import { buttonVariants } from "@/components/ui/button";

// One Achievement Set through a member's eyes: the set and their progress
// (earned over total as the monumental numeral, with any Completion,
// Mastery or Platinum), a link to the GameDB game when the set is linked to
// one, then every Achievement as an icon grid and, below it, laid open with
// details. Hover cards don't open on tap, so a tapped icon jumps to its
// details instead. Hidden Achievements stay blurred until the viewer has
// unlocked them.

const rowHref = (view: AchievementView) => `#${achievementRowId(view.id)}`;
const rowId = (view: AchievementView) => achievementRowId(view.id);

export default async function MemberAchievementSetPage({
  params,
}: {
  params: Promise<{ id: string; setId: string }>;
}) {
  const { id, setId } = await params;
  if (!/^\d+$/.test(setId)) notFound();

  const [session, summary, res] = await Promise.all([
    getSession(),
    fetchAchievementSummary(id),
    apiFetch(setDetailPath(setId, id), { cache: "no-store" }),
  ]);
  // The hub is opt-in: like the achievements page, a member with no Linked
  // Account has no set pages, except for the member themselves.
  if (summary.status === "none" && session?.principal.discord_id !== id) {
    notFound();
  }
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Achievement Set ${setId} failed to load (${res.status})`);
  const { data: set }: ApiSingle<AchievementSetDetail> = await res.json();

  const title = setTitle(set);
  const displayName = set.user ? memberName(set.user) : id;
  const progress = set.progress;
  const views = set.achievements.map((a) => viewFromSetAchievement(a, set.provider));
  const removed = set.removed_achievements.map((a) =>
    viewFromSetAchievement(a, set.provider),
  );
  const ra = set.provider === "retroachievements";
  const total = progress?.total_count ?? set.achievements_count;
  const earned = progress?.earned_count ?? 0;
  const fill = total > 0 ? Math.min(100, (earned / total) * 100) : 0;

  return (
    <MemberListShell
      userId={id}
      displayName={displayName}
      title={title}
      action={
        set.game_id != null && (
          <Link
            href={`/games/${set.game_id}`}
            className={buttonVariants({ variant: "outline" })}
          >
            View game <ArrowRight data-icon="inline-end" />
          </Link>
        )
      }
    >
      <section
        aria-label="Progress"
        className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7"
      >
        <span className="relative size-24 shrink-0 overflow-hidden rounded-sm bg-ink-3 sm:size-28">
          {set.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote Provider icons
            <img src={set.icon_url} alt="" className="size-full object-cover" />
          ) : (
            <span aria-hidden className="flex size-full items-center justify-center text-paper-mute">
              <Trophy className="size-8" />
            </span>
          )}
          <span aria-hidden className="pointer-events-none absolute inset-0 rounded-sm shadow-[inset_0_0_0_1px_rgb(244_244_240/0.12)]" />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <ProviderBadge provider={set.provider} />
            {set.platform_label && <Chip>{set.platform_label}</Chip>}
            {progress &&
              setBadges(progress).map((badge) => (
                <SetBadgeChip key={badge} badge={badge} />
              ))}
          </div>

          <div className="flex max-w-2xl flex-col gap-2">
            <div className="flex items-end justify-between gap-4">
              <p className="flex items-baseline gap-2">
                <span className="font-headline text-[4.5rem] leading-[0.8] text-paper sm:text-[5.75rem]">
                  {earned}
                </span>
                <span className="font-label text-xl text-paper-mute">
                  / {total}
                </span>
              </p>
              <span className="font-headline text-3xl leading-none text-paper-dim">
                {progress ? progressPercent(progress) : 0}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`${title} progress`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={earned}
              aria-valuetext={`${earned} of ${total} unlocked`}
              className="h-1.5 w-full overflow-hidden bg-ink-3"
            >
              <div className="h-full bg-paper" style={{ width: `${fill}%` }} />
            </div>
            <p className="font-label flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-paper-mute">
              {progress ? (
                <>
                  {ra && set.points_total > 0 && (
                    <span>
                      {progress.points_earned} / {set.points_total} pts
                    </span>
                  )}
                  {ra && progress.hardcore_earned_count > 0 && (
                    <span>{progress.hardcore_earned_count} hardcore</span>
                  )}
                  {progress.last_unlocked_at && (
                    <span>Last Unlock {formatUnlockDate(progress.last_unlocked_at)}</span>
                  )}
                </>
              ) : (
                <span>{displayName} has no Unlocks in this set yet.</span>
              )}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="set-achievements" className="space-y-4">
        <SectionHeading
          title={<span id="set-achievements">Achievements</span>}
          count={`${views.filter((v) => v.unlocked).length} of ${views.length} unlocked`}
        />
        <AchievementGrid items={views} hrefFor={rowHref} />
      </section>

      {views.length > 0 && (
        <section aria-labelledby="set-details" className="space-y-4">
          <SectionHeading title={<span id="set-details">Details</span>} />
          <AchievementList items={views} rowId={rowId} />
        </section>
      )}

      {removed.length > 0 && (
        <section aria-labelledby="set-removed" className="space-y-4">
          <SectionHeading
            title={<span id="set-removed">Removed</span>}
            count={`${removed.length} no longer in the set`}
          />
          <AchievementList items={removed} label="Removed achievements" />
        </section>
      )}
    </MemberListShell>
  );
}
