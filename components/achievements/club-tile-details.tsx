import { TIER_LABEL, type AchievementView } from "@/lib/achievements";
import { ReviewerAvatar } from "@/components/issue/review-meta";
import { cn } from "@/lib/utils";
import { TIER_RING } from "./achievement-icon";
import type { TileHolder } from "./club-tile-ring";
import { RarityChip } from "./rarity-chip";
import { SpoilerText } from "./spoiler-text";

// A club tile's card: the Achievement's name and description, its Rarity,
// tier and points, and the members who unlocked it, earliest first.
export function TileDetails({
  view,
  spoiler,
  holders,
  memberCount,
  viewerId,
}: {
  view: AchievementView;
  spoiler: boolean;
  holders: TileHolder[];
  memberCount: number;
  viewerId: string | null;
}) {
  const tier = view.provider === "psn" ? view.tier : null;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <p className="text-[0.95rem] leading-tight font-semibold">
          <SpoilerText spoiler={spoiler}>
            {view.name ?? "Untitled achievement"}
          </SpoilerText>
        </p>
        {view.description && (
          <p className="text-[0.85rem] leading-snug text-dim-foreground">
            <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <RarityChip rarity={view.rarity} size="sm" />
        {tier && (
          <span className="font-label inline-flex h-5 items-center gap-1.5 text-[0.74rem] text-dim-foreground">
            <span
              aria-hidden
              className={cn("size-2 rounded-full", tier === "platinum" && "foil")}
              style={tier === "platinum" ? undefined : { background: TIER_RING[tier] }}
            />
            {TIER_LABEL[tier]}
          </span>
        )}
        {view.points != null && view.points > 0 && (
          <span className="font-label text-[0.74rem] text-dim-foreground">
            {view.points} pts
          </span>
        )}
      </div>
      <div className="border-t border-border pt-2.5">
        <p className="font-label mb-2 text-[0.78rem] tracking-[0.08em] text-faint-foreground">
          {holders.length === 0
            ? "No member has unlocked it yet"
            : `Unlocked by ${holders.length} of ${memberCount}`}
        </p>
        {holders.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {holders.map((holder) => (
              <li key={holder.userId} className="flex items-center gap-2 text-[0.88rem]">
                <ReviewerAvatar userId={holder.userId} name={holder.name} size="sm" />
                <span className="truncate">{holder.name}</span>
                {holder.userId === viewerId && (
                  <span className="font-label text-[0.72rem] text-faint-foreground">You</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
