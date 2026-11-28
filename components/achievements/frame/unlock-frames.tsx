import Link from "next/link";
import type { AchievementUnlock } from "@/lib/api/types";
import { memberSetHref, viewFromUnlock } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { FrameDetails } from "./frame-details";
import { FrameHover } from "./frame-hover";
import { FrameIcon, type FrameSize } from "./frame-icon";

// A member's Unlocks in one set as a run of equal frames, wrapping, each
// opening its details on hover and leading to the member's set page. None
// is singled out. When the read held back some (`count` over the run), a
// last frame says how many more and leads to the set page too.
export function UnlockFrames({
  unlocks,
  count,
  userId,
  setId,
  size = "md",
  className,
}: {
  unlocks: AchievementUnlock[];
  count: number;
  userId: string;
  setId: number;
  size?: FrameSize;
  className?: string;
}) {
  const href = memberSetHref(userId, setId);
  const more = count - unlocks.length;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {unlocks.map((unlock) => {
        const view = viewFromUnlock(unlock);
        const name = view.hidden && !view.viewerUnlocked ? "Hidden achievement" : (view.name ?? "Untitled achievement");
        return (
          <li key={unlock.id}>
            <FrameHover
              label={name}
              href={href}
              details={<FrameDetails view={view} highlight={unlock.highlight} />}
            >
              <FrameIcon view={view} size={size} />
            </FrameHover>
          </li>
        );
      })}
      {more > 0 && (
        <li>
          <Link
            href={href}
            aria-label={`${more} more Unlocks`}
            data-slot="achievement-frame-more"
            data-size={size}
            className={cn(
              "font-label flex items-center justify-center rounded-xs text-[0.8rem] text-dim-foreground shadow-[inset_0_0_0_1px_var(--color-border-strong)] transition-colors hover:text-highlight",
              size === "sm" ? "size-[34px]" : "size-[52px]",
            )}
          >
            +{more}
          </Link>
        </li>
      )}
    </ul>
  );
}
