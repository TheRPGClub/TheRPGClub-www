import Link from "next/link";
import type { AchievementFeedGroup } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  displayRarity,
  isSpoiler,
  memberSetHref,
  rarityTier,
  viewFromUnlock,
} from "@/lib/achievements";
import { foilKind, formatUtcTime, leadHighlight } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import { AchievementHoverCard } from "../achievement-hover-card";
import { AchievementIcon } from "../achievement-icon";
import { FoilStamp } from "../foil-stamp";
import { ProviderBadge } from "../provider-badge";
import { RarityChip } from "../rarity-chip";
import { SpoilerText } from "../spoiler-text";
import { GameBand, HUB_LINK, MemberLink, OddsTag } from "./parts";

// A Latest card: one member's Unlocks in one Achievement Set on one UTC day,
// on a game-tint spine. The icons fan out like a hand of cards. A card that
// holds a Highlight takes double size: its lead Unlock sits large on the
// right under a foil stamp (Platinum, Mastery, Completion) or its
// ultra-rare Rarity, and the rest shrink to a strip of Rarity dots.

const FAN_LIMIT = 5;

// The fan's hand-placed lean, by position.
const FAN_POSE = [
  "-rotate-6",
  "rotate-3 -translate-y-1",
  "-rotate-2 translate-y-0.5",
  "rotate-[5deg]",
  "-rotate-3",
];

const RARITY_DOT = {
  common: "border-rarity-common",
  uncommon: "border-rarity-uncommon",
  rare: "border-rarity-rare",
  ultra: "border-rarity-ultra",
} as const;

export function HubGroupCard({
  card,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  tint: SetTint;
  className?: string;
}) {
  const lead = leadHighlight(card);
  return lead ? (
    <HighlightGroupCard card={card} lead={lead} tint={tint} className={className} />
  ) : (
    <PlainGroupCard card={card} tint={tint} className={className} />
  );
}

function CardShell({
  tint,
  className,
  children,
}: {
  tint: SetTint;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-md border border-rule bg-ink-2 pl-2.5",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-2.5" style={{ background: tint.tint }} />
      {children}
    </article>
  );
}

function WhoLine({ card }: { card: AchievementFeedGroup }) {
  const time = formatUtcTime(card.latest_unlocked_at);
  return (
    <div className="flex items-start gap-x-3">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.95rem] text-paper-dim">
        <MemberLink user={card.user} className="text-base tracking-[0.06em]" />
        <span>
          unlocked {card.count} {card.count === 1 ? "Achievement" : "Achievements"} in
        </span>
      </p>
      {time && (
        <time
          dateTime={card.latest_unlocked_at}
          className="font-label ml-auto shrink-0 pt-1 text-[0.78rem] tracking-[0.08em] text-paper-mute"
        >
          {time} UTC
        </time>
      )}
    </div>
  );
}

function BandLine({ card, tint }: { card: AchievementFeedGroup; tint: SetTint }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <GameBand set={card.achievement_set} userId={card.user.user_id} tint={tint} />
      <ProviderBadge
        provider={card.achievement_set.provider}
        short
        className="h-5 shrink-0 px-1.5 text-[0.7rem]"
      />
    </div>
  );
}

function PlainGroupCard({
  card,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  tint: SetTint;
  className?: string;
}) {
  const shown = card.unlocks.slice(0, FAN_LIMIT);
  const more = Math.max(0, card.count - shown.length);
  const names = card.unlocks
    .map((u) => (isSpoiler(viewFromUnlock(u)) ? "Hidden achievement" : u.achievement.name))
    .filter(Boolean)
    .join(" · ");
  const href = memberSetHref(card.user.user_id, card.achievement_set.id);

  return (
    <CardShell tint={tint} className={cn("@container", className)}>
      {/* Half width: stacked. Full width: the fan moves to the right edge. */}
      <div className="flex h-full flex-col gap-3 px-4 pt-3 pb-3.5 @xl:grid @xl:grid-cols-[minmax(0,1fr)_auto] @xl:content-center @xl:gap-x-8 @xl:gap-y-2.5 @xl:pr-6">
        <WhoLine card={card} />
        <BandLine card={card} tint={tint} />
        <ul
          aria-label="Unlocks"
          className="flex items-center py-1 pl-1 @xl:col-start-2 @xl:row-span-3 @xl:row-start-1"
        >
          {shown.map((unlock, i) => {
            const view = viewFromUnlock(unlock);
            return (
              <li
                key={unlock.id}
                className={cn("relative", i > 0 && "-ml-3.5", FAN_POSE[i])}
                style={{ zIndex: FAN_LIMIT - i }}
              >
                <AchievementHoverCard view={view}>
                  <AchievementIcon
                    view={view}
                    size="md"
                    className="drop-shadow-[0_6px_10px_rgb(0_0_0/0.45)] @xl:size-16"
                  />
                </AchievementHoverCard>
              </li>
            );
          })}
          {more > 0 && (
            <li className="-ml-3.5 rotate-2">
              <Link
                href={href}
                aria-label={`${more} more Unlocks`}
                className={cn(
                  "font-headline grid size-14 place-items-center rounded-[6px] border-[1.5px] border-dashed border-rule-strong bg-ink-3 text-2xl text-paper-dim @xl:size-16",
                  HUB_LINK,
                )}
              >
                +{more}
              </Link>
            </li>
          )}
        </ul>
        {names && (
          <p className="mt-auto truncate text-[0.82rem] text-paper-mute @xl:col-start-1 @xl:mt-0">
            {names}
          </p>
        )}
      </div>
    </CardShell>
  );
}

function HighlightGroupCard({
  card,
  lead,
  tint,
  className,
}: {
  card: AchievementFeedGroup;
  lead: NonNullable<ReturnType<typeof leadHighlight>>;
  tint: SetTint;
  className?: string;
}) {
  const view = viewFromUnlock(lead);
  const foil = foilKind(lead.highlight);
  const rarity = displayRarity(view);
  const set = card.achievement_set;
  const more = Math.max(0, card.count - card.unlocks.length);

  return (
    <CardShell tint={tint} className={className}>
      <div className="grid h-full sm:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="flex min-w-0 flex-col gap-3 px-4 pt-3 pb-4">
          <WhoLine card={card} />
          <BandLine card={card} tint={tint} />
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.9rem] text-paper-dim">
            {lead.highlight === "completion" || lead.highlight === "mastery" ? (
              <span>
                {HIGHLIGHT_LABEL[lead.highlight]}: all {set.achievements_count}{" "}
                {set.achievements_count === 1 ? "Achievement" : "Achievements"}
                {lead.highlight === "mastery" && ", hardcore"}
              </span>
            ) : (
              <SpoilerText spoiler={isSpoiler(view)} className="min-w-0 truncate font-semibold text-paper">
                {view.name ?? "Untitled achievement"}
              </SpoilerText>
            )}
            {lead.highlight !== "rare" && (
              <RarityChip rarity={view.rarity} figure={rarity.rarity} size="sm" />
            )}
          </p>
          <div className="mt-auto flex items-center gap-2.5">
            <ul aria-label={`${card.count} Unlocks by Rarity`} className="flex flex-wrap gap-1">
              {card.unlocks.map((unlock) => {
                const tier = rarityTier(unlock.achievement.rarity);
                return (
                  <li
                    key={unlock.id}
                    className={cn(
                      "size-[13px] rounded-[1.5px] border-2 bg-ink-3",
                      tier ? RARITY_DOT[tier] : "border-paper-mute",
                      unlock.id === lead.id && foil && "foil border-transparent",
                    )}
                  />
                );
              })}
            </ul>
            {more > 0 && (
              <span className="font-label text-[0.78rem] text-paper-mute">+{more}</span>
            )}
          </div>
        </div>

        {/* The lead Unlock, large, under its stamp or its Rarity. */}
        <div className="relative h-40 min-w-0 sm:h-auto sm:min-h-40">
          <AchievementHoverCard
            view={view}
            className="absolute top-3 right-8 rotate-[4deg] sm:right-6"
          >
            <AchievementIcon view={view} size="xl" foil={foil != null} className="drop-shadow-[0_8px_16px_rgb(0_0_0/0.55)]" />
          </AchievementHoverCard>
          {foil ? (
            <FoilStamp
              kind={foil}
              size={foil === "completion" ? "md" : "lg"}
              className="pointer-events-none absolute right-28 bottom-3 sm:right-auto sm:bottom-2 sm:left-0"
            />
          ) : (
            rarity.rarity != null && (
              <OddsTag
                rarity={view.rarity ?? rarity.rarity}
                className="absolute top-2 right-5 text-[1.15rem] sm:right-7"
              />
            )
          )}
        </div>
      </div>
    </CardShell>
  );
}
