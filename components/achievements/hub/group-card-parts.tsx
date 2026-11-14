import type { AchievementFeedGroup } from "@/lib/api/types";
import { formatUtcTime } from "@/lib/achievements/hub";
import type { SetTint } from "@/lib/achievements/tint-color";
import { cn } from "@/lib/utils";
import { ProviderBadge } from "../provider-badge";
import { GameBand, MemberLink } from "./parts";

// The frame every Latest card shares: the game-tint spine, who unlocked how
// many and when, and the game's band with its Provider.

export function CardShell({
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
        "relative overflow-hidden rounded-md border border-border bg-card pl-2.5",
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-2.5" style={{ background: tint.tint }} />
      {children}
    </article>
  );
}

export function WhoLine({ card }: { card: AchievementFeedGroup }) {
  const time = formatUtcTime(card.latest_unlocked_at);
  return (
    <div className="flex items-start gap-x-3">
      <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.95rem] text-dim-foreground">
        <MemberLink user={card.user} className="text-base tracking-[0.06em]" />
        <span>
          unlocked {card.count} {card.count === 1 ? "Achievement" : "Achievements"} in
        </span>
      </p>
      {time && (
        <time
          dateTime={card.latest_unlocked_at}
          className="font-label ml-auto shrink-0 pt-1 text-[0.78rem] tracking-[0.08em] text-faint-foreground"
        >
          {time} UTC
        </time>
      )}
    </div>
  );
}

export function BandLine({ card, tint }: { card: AchievementFeedGroup; tint: SetTint }) {
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
