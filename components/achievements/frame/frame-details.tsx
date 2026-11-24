import { PROVIDER_VAR } from "@/lib/achievements/provider-color";
import { formatUnlockDate, isSpoiler, type AchievementView } from "@/lib/achievements";
import { frameFacts, frameRarity } from "@/lib/achievements/frame";
import type { AchievementHighlightKind } from "@/lib/api/types";
import { SpoilerText } from "../spoiler-text";
import { FrameIcon } from "./frame-icon";

// A frame's hover card: the art beside its name and description, then a
// ruled foot with the Provider's own facts (trophy grade, points) and the
// Rarity. `unlockedAt` adds when the shown member unlocked it; `children`
// carries a surface's extra (the game page's holders).
export function FrameDetails({
  view,
  highlight = null,
  unlockedAt,
  children,
}: {
  view: AchievementView;
  highlight?: AchievementHighlightKind | null;
  unlockedAt?: string | null;
  children?: React.ReactNode;
}) {
  const spoiler = isSpoiler(view);
  const rarity = frameRarity(view);
  return (
    <div>
      <div className="flex items-start gap-3 p-3.5">
        <FrameIcon view={view} size="xl" />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[0.95rem] leading-tight font-semibold text-foreground">
            <SpoilerText spoiler={spoiler}>{view.name ?? "Untitled achievement"}</SpoilerText>
          </p>
          {view.description && (
            <p className="text-[0.84rem] leading-snug text-dim-foreground">
              <SpoilerText spoiler={spoiler}>{view.description}</SpoilerText>
            </p>
          )}
        </div>
      </div>
      <div className="font-label flex flex-col gap-1 border-t border-border px-3.5 py-2.5 text-[0.74rem] tracking-[0.06em]">
        <span className="inline-flex items-center gap-2 text-foreground">
          <span aria-hidden className="size-2 rounded-[1px]" style={{ background: PROVIDER_VAR[view.provider] }} />
          {frameFacts(view, highlight)}
        </span>
        {rarity && <span className="text-dim-foreground normal-case">{rarity}</span>}
        {unlockedAt && (
          <span className="text-faint-foreground normal-case">Unlocked {formatUnlockDate(unlockedAt)}</span>
        )}
      </div>
      {children}
    </div>
  );
}
