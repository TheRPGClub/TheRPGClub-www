import type { AchievementFeedGroup, AchievementSetProgress } from "@/lib/api/types";
import { PROVIDER_LABEL, memberName, memberSetHref, setTitle } from "@/lib/achievements";
import { countCells } from "@/lib/achievements/frame";
import { PROVIDER_VAR } from "@/lib/achievements/provider-color";
import { ageLabel } from "@/lib/dashboard/panel-items";
import { readClubAchievements, readMySets } from "@/lib/dashboard/panel-sources";
import { PANELS } from "@/lib/dashboard/panels";
import { FrameIcon } from "@/components/achievements/frame/frame-icon";
import { TickStrip } from "@/components/achievements/frame/tick-strip";
import { UnlockFrames } from "@/components/achievements/frame/unlock-frames";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { MetaParts, PanelItem, PanelWhen } from "./panel-list";
import { listBody } from "./body-kit";
import type { BodyProps } from "./panel-body";

// Latest Achievements: the club's newest days (one member's Unlocks in one
// set, every one as a small frame) and the member's own sets closest to
// done, each with its progress strip.

export async function AchievementsClubBody({ wide }: BodyProps) {
  const cards = await readClubAchievements();
  const groups = cards?.filter((card): card is AchievementFeedGroup => card.kind === "group") ?? null;
  const now = Date.now();
  return listBody({
    rows: groups,
    title: PANELS.achievements_club.title,
    wide,
    row: (card) => <DayRow key={`${card.user.user_id}-${card.achievement_set.id}-${card.day}`} card={card} now={now} />,
  });
}

export async function AchievementsMineBody({ viewer, wide }: BodyProps) {
  const sets = await readMySets(viewer.id);
  return listBody({
    rows: sets,
    title: PANELS.achievements_mine.title,
    wide,
    empty: "No sets in progress.",
    row: (set) => <SetRow key={set.id} set={set} userId={viewer.id} />,
  });
}

function ProviderMark({ provider }: { provider: AchievementSetProgress["provider"] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="size-2 rounded-[1px]" style={{ background: PROVIDER_VAR[provider] }} />
      {PROVIDER_LABEL[provider]}
    </span>
  );
}

function DayRow({ card, now }: { card: AchievementFeedGroup; now: number }) {
  const name = memberName(card.user);
  const unlocks = `${card.count} ${card.count === 1 ? "Unlock" : "Unlocks"}`;
  return (
    <PanelItem
      plain
      media={<ReviewerAvatar userId={card.user.user_id} name={name} size="sm" />}
      title={<><b>{name}</b> · {setTitle(card.achievement_set)}</>}
      href={memberSetHref(card.user.user_id, card.achievement_set.id)}
      meta={<MetaParts parts={[<ProviderMark key="p" provider={card.achievement_set.provider} />, unlocks]} />}
      aside={<PanelWhen>{ageLabel(card.latest_unlocked_at, now)}</PanelWhen>}
      below={
        <UnlockFrames
          unlocks={card.unlocks.slice(0, 12)}
          count={card.count}
          userId={card.user.user_id}
          setId={card.achievement_set.id}
          size="sm"
          className="gap-1"
        />
      }
    />
  );
}

function SetRow({ set, userId }: { set: AchievementSetProgress; userId: string }) {
  const icon = { iconUrl: set.achievement_set.icon_url ?? null, iconLockedUrl: null, hidden: false, viewerUnlocked: true };
  return (
    <PanelItem
      media={<FrameIcon view={icon} size="sm" />}
      title={setTitle(set.achievement_set)}
      href={memberSetHref(userId, set.achievement_set_id)}
      meta={<ProviderMark provider={set.provider} />}
      aside={
        <span className="font-label text-[0.85rem] font-bold text-foreground">
          {set.earned_count}
          <span className="text-faint-foreground">/{set.total_count}</span>
        </span>
      }
      below={
        <TickStrip
          cells={countCells(set.earned_count, set.total_count)}
          label={`${set.earned_count} of ${set.total_count} Achievements`}
        />
      }
    />
  );
}
