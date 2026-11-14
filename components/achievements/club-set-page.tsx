import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GameAchievementSet } from "@/lib/api/types";
import {
  formatRarity,
  formatUnlockDate,
  isSpoiler,
  isUnknownUnlockDate,
  memberSetHref,
  progressFill,
  setTitle,
} from "@/lib/achievements";
import {
  NAMED_GRID_LIMIT,
  RING_COLORS,
  RING_LIMIT,
  closestMember,
  fadeSteps,
  holderOpacity,
  ringSpots,
  setMembers,
  viewFromGameAchievement,
  type SetMember,
} from "@/lib/achievements/game-page";
import type { SetTint } from "@/lib/achievements/tint-color";
import { Chip } from "@/components/issue/chip";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { ClubAchievementTile, type RingDot } from "./club-achievement-tile";
import { SpoilerText } from "./spoiler-text";
import { TintSpine } from "./tint";

// One Achievement Set as the club's composite page on a game: the game-tint
// spine, every Achievement faded by how few members hold it and ringed by
// their dots, the members who completed it signing the margin, and the
// viewer's own progress as a tint bar along the top edge (to their set
// page). The page's top rule is its Provider colour, so it joins its tab.

const PROVIDER_RULE = {
  retroachievements: "border-t-provider-retroachievements",
  steam: "border-t-provider-steam",
  psn: "border-t-provider-psn",
} as const;

export function ClubSetPage({
  set,
  tint,
  names,
  viewerId,
}: {
  set: GameAchievementSet;
  tint: SetTint;
  // user_id -> display name, from the member directory.
  names: ReadonlyMap<string, string>;
  viewerId: string | null;
}) {
  const title = setTitle(set);
  const total = set.achievements.length || set.achievements_count;
  const members = setMembers(set, names);
  const ringed = members.slice(0, RING_LIMIT);
  const spots = ringSpots(ringed.length);
  const nameOf = new Map(members.map((m) => [m.userId, m.name]));
  const clubUnlocked = set.achievements.filter((a) => a.holders.length > 0).length;
  const progress = set.viewer_progress;
  const named = set.achievements.length <= NAMED_GRID_LIMIT;

  const tiles = set.achievements.map((achievement, i) => {
    const view = viewFromGameAchievement(achievement, set.provider, i);
    const held = new Set(achievement.holders);
    const dots: RingDot[] = ringed.map((m, j) => ({
      spot: spots[j],
      color: RING_COLORS[j],
      on: held.has(m.userId),
    }));
    return {
      achievement,
      view,
      slot: i + 1,
      dots,
      opacity: holderOpacity(achievement.holders.length, members.length),
      holders: achievement.holders.map((id) => ({
        userId: id,
        name: nameOf.get(id) ?? names.get(id) ?? id,
      })),
      platinum: set.provider === "psn" && achievement.tier === "platinum",
    };
  });

  return (
    <article
      aria-label={`${title}, ${set.platform_label ?? set.provider}`}
      className={cn(
        "relative rounded-md rounded-tl-none border-t-[3px] bg-card shadow-[0_18px_40px_rgb(0_0_0/0.5)]",
        PROVIDER_RULE[set.provider],
      )}
    >
      <TintSpine tint={tint.tint} className="rounded-tl-none" />
      {progress && (
        <Link
          href={memberSetHref(progress.user_id, set.id)}
          aria-hidden
          tabIndex={-1}
          className="absolute top-0 right-0 left-3 h-[7px] bg-muted"
        >
          <span
            className="block h-full"
            style={{ width: `${progressFill(progress)}%`, background: tint.tint }}
          />
        </Link>
      )}

      <div className="grid gap-x-6 pt-6 pr-4 pb-5 pl-[30px] sm:pr-5 lg:grid-cols-[minmax(0,1fr)_12.5rem]">
        <header className="col-span-full flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border pb-3">
          <h3 className="font-headline text-[1.45rem] leading-none text-foreground">{title}</h3>
          {set.platform_label && <Chip>{set.platform_label}</Chip>}
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

        <div className="min-w-0">
          {named ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-x-2 gap-y-5 pt-5 sm:grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))]">
              {tiles.map((t) => (
                <li key={t.achievement.id} className="flex flex-col items-center gap-2 text-center">
                  <ClubAchievementTile
                    view={t.view}
                    size="md"
                    slot={t.slot}
                    tint={tint.tint}
                    opacity={t.opacity}
                    dots={t.dots}
                    holders={t.holders}
                    memberCount={members.length}
                    viewerId={viewerId}
                    foil={t.platinum}
                  />
                  <p
                    className={cn(
                      "line-clamp-2 max-w-[12rem] text-[0.86rem] leading-[1.15] font-semibold",
                      t.holders.length ? "text-foreground" : "text-faint-foreground",
                    )}
                  >
                    <SpoilerText spoiler={isSpoiler(t.view)}>
                      {t.achievement.name ?? "Untitled achievement"}
                    </SpoilerText>
                  </p>
                  <p className="-mt-1.5 text-[0.76rem] text-faint-foreground">
                    {t.holders.length} of {members.length}
                    {t.achievement.rarity != null && ` · ${formatRarity(t.achievement.rarity)}`}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] justify-items-center gap-y-1 pt-5">
              {tiles.map((t) => (
                <li
                  key={t.achievement.id}
                  className={cn("grid place-items-center", t.platinum && "col-span-2 row-span-2")}
                >
                  <ClubAchievementTile
                    view={t.view}
                    size={t.platinum ? "lg" : "sm"}
                    slot={t.slot}
                    tint={tint.tint}
                    opacity={t.opacity}
                    dots={t.dots}
                    holders={t.holders}
                    memberCount={members.length}
                    viewerId={viewerId}
                    foil={t.platinum}
                  />
                </li>
              ))}
            </ul>
          )}

          <Key members={ringed} rest={members.length - ringed.length} total={members.length} viewerId={viewerId} />
        </div>

        <Margin set={set} members={members} total={total} />
      </div>
    </article>
  );
}

// The page's key: whose dot sits where on the ring, and what the fade means.
function Key({
  members,
  rest,
  total,
  viewerId,
}: {
  members: SetMember[];
  rest: number;
  total: number;
  viewerId: string | null;
}) {
  if (total === 0) {
    return (
      <p className="mt-5 border-t border-border pt-4 text-[0.86rem] text-faint-foreground">
        No member has unlocked anything here yet.
      </p>
    );
  }
  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-[0.84rem] text-dim-foreground md:flex-row md:flex-wrap md:items-center md:gap-x-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="font-label basis-full text-[0.78rem] tracking-[0.08em] text-faint-foreground sm:basis-auto">
          Ring, clockwise from top left
        </span>
        {members.map((m, i) => (
          <span key={m.userId} className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-2.5 rounded-full" style={{ background: RING_COLORS[i] }} />
            {m.name}
            {m.userId === viewerId && <span className="text-faint-foreground">(you)</span>}
          </span>
        ))}
        {rest > 0 && <span className="text-faint-foreground">+{rest} more on hover</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-label basis-full text-[0.78rem] tracking-[0.08em] text-faint-foreground sm:basis-auto">
          Unlocked by
        </span>
        {fadeSteps(total).map((n, i) => (
          <span key={n} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-4 rounded-[4px] border-[2.5px] border-foreground bg-muted"
              style={{ opacity: holderOpacity(n, total) }}
            />
            {i === 0 ? `${n} of ${total}` : n}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-4 rounded-[4px] border-[1.5px] border-dashed border-border-strong" />
          Nobody
        </span>
      </div>
    </div>
  );
}

// The margin: each Completion signed on foil (oldest first), then the
// members still going, and who is closest when nobody has signed.
const UNSIGNED_SHOWN = 4;

function Margin({
  set,
  members,
  total,
}: {
  set: GameAchievementSet;
  members: SetMember[];
  total: number;
}) {
  const signed = members.filter((m) => m.completedAt);
  const going = members.filter((m) => !m.completedAt).slice(0, UNSIGNED_SHOWN);
  const closest = closestMember(members, total);

  return (
    <aside
      aria-label="Completions"
      className="mt-5 flex flex-col gap-3.5 border-t border-dashed border-border pt-4 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-4 lg:pl-4"
    >
      <h4 className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">Completions</h4>
      {signed.length > 0 ? (
        <ol className="flex flex-wrap gap-3.5 lg:flex-col">
          {signed.map((m, i) => (
            <li key={m.userId}>
              <Link
                href={memberSetHref(m.userId, set.id)}
                className={cn(
                  "foil block rounded-[3px] p-[3px] shadow-[0_5px_12px_rgb(0_0_0/0.45)] outline-none transition-transform",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight motion-safe:hover:rotate-0",
                  i % 2 === 0 ? "-rotate-3" : "rotate-2",
                )}
              >
                <span className="flex flex-col gap-1 rounded-[2px] bg-background px-2.5 pt-2 pb-1.5">
                  <span className="flex items-center gap-2 text-[1.05rem] font-semibold text-foreground italic">
                    <ReviewerAvatar userId={m.userId} name={m.name} size="xs" />
                    <span className="truncate">{m.name}</span>
                  </span>
                  <span className="font-label text-[0.74rem] tracking-[0.06em] text-dim-foreground">
                    {m.completedAt && isUnknownUnlockDate(m.completedAt)
                      ? "Completed, date unknown"
                      : `Completed ${formatUnlockDate(m.completedAt!)}`}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="border-b-[1.5px] border-dashed border-border-strong pb-1.5 text-[0.86rem] text-faint-foreground">
          No Completion yet
        </p>
      )}
      {going.length > 0 && (
        <ul className="flex flex-col gap-2">
          {going.map((m) => (
            <li
              key={m.userId}
              className="flex items-center gap-2 border-b-[1.5px] border-dashed border-border-strong pb-1.5 text-[0.86rem] text-faint-foreground"
            >
              <ReviewerAvatar userId={m.userId} name={m.name} size="xs" />
              <span className="truncate">{m.name}</span>
              <span className="ml-auto shrink-0 tabular-nums">
                {m.held} / {total}
              </span>
            </li>
          ))}
        </ul>
      )}
      {signed.length === 0 && closest && (
        <p className="text-[0.82rem] leading-snug text-faint-foreground italic">
          Closest: {closest.member.name}, {closest.toGo} to go.
        </p>
      )}
    </aside>
  );
}
