import Link from "next/link";
import type { AchievementFeedHighlight } from "@/lib/api/types";
import {
  HIGHLIGHT_LABEL,
  formatRarity,
  memberName,
  memberSetHref,
  setTitle,
  viewFromUnlock,
} from "@/lib/achievements";
import { foilKind } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { SectionHeading } from "@/components/templates/page-header";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { AchievementIcon } from "../achievement-icon";
import { ProviderBadge } from "../provider-badge";
import { HUB_LINK } from "./parts";

// The desktop rail beside Latest: this week's Highlights, newest first, one
// row each. The row leads to the member's set page.
export function HighlightRail({
  cards,
  weekLabel,
  tints,
  allHref,
}: {
  cards: AchievementFeedHighlight[];
  weekLabel: string;
  tints: (setId: number) => SetTint;
  allHref: string;
}) {
  return (
    <section aria-labelledby="hub-rail-heading" className="space-y-1">
      <SectionHeading
        title={<span id="hub-rail-heading">Highlights this week</span>}
        count={weekLabel}
        className="items-end"
      />
      {cards.length === 0 ? (
        <p className="mt-3 rounded-md border border-dashed border-border-strong px-4 py-8 text-center text-[0.95rem] text-dim-foreground">
          No Highlights this week.
        </p>
      ) : (
        <ul>
          {cards.map((card, i) => (
            <RailRow key={card.id} card={card} tint={tints(card.achievement_set.id)} index={i} />
          ))}
        </ul>
      )}
      <Link
        href={allHref}
        className={cn(
          "font-label mt-2 inline-flex text-sm font-extrabold text-dim-foreground",
          HUB_LINK,
        )}
      >
        All Highlights
      </Link>
    </section>
  );
}

function RailRow({
  card,
  tint,
  index,
}: {
  card: AchievementFeedHighlight;
  tint: SetTint;
  index: number;
}) {
  const view = viewFromUnlock(card);
  const kind = card.highlight ?? "rare";
  const name = memberName(card.user);
  const set = card.achievement_set;

  return (
    <li className="border-b border-border">
      <Link
        href={memberSetHref(card.user.user_id, set.id)}
        className="group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 py-3 outline-none focus-visible:bg-card focus-visible:outline-2 focus-visible:outline-highlight"
      >
        <AchievementIcon
          view={view}
          size="md"
          foil={foilKind(kind) != null}
          className={index % 2 ? "rotate-[1.5deg]" : "-rotate-2"}
        />
        <span className="min-w-0">
          <span className="font-headline block text-[1.3rem] leading-none uppercase transition-colors group-hover:text-highlight">
            {HIGHLIGHT_LABEL[kind]}
            {kind === "rare" && card.achievement.rarity != null && (
              <span className="ml-1.5 text-rarity-ultra">
                {formatRarity(card.achievement.rarity)}
              </span>
            )}
          </span>
          <span className="mt-1.5 flex min-w-0 items-center gap-2 text-[0.88rem] text-dim-foreground">
            <ReviewerAvatar userId={card.user.user_id} name={name} size="xs" className="shrink-0" />
            <span className="shrink-0">{name}</span>
            <span aria-hidden className="h-3.5 w-1 shrink-0 rounded-[1px]" style={{ background: tint.tint }} />
            <span className="truncate">{setTitle(set)}</span>
          </span>
        </span>
        <ProviderBadge provider={set.provider} short className="h-5 px-1.5 text-[0.7rem]" />
      </Link>
    </li>
  );
}
