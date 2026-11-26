import type { CSSProperties, ReactNode } from "react";
import { GameCover } from "@/components/issue/game-cover";
import { cn } from "@/lib/utils";

// Ribbon and bow, in the platform's ink (--p), sized off the cover's own width
// (cqw) so one drawing serves the shelf, the stack and the minis.
const RIBBON = "absolute bg-(--p) transition-colors duration-300 shadow-[0_0_0_2px_rgb(11_11_13/0.45),0_4px_10px_rgb(0_0_0/0.35)]";
const LOOP =
  "absolute top-[calc(36%-6cqw)] size-[17cqw] rounded-[50%_50%_0_50%] border-[3.4cqw] border-(--p) drop-shadow-[0_0_1px_rgb(11_11_13/0.9)]";

// Written out whole so Tailwind finds them.
const TIE_DOWN = "motion-safe:animate-[gift-tie-down_380ms_cubic-bezier(0.16,1,0.3,1)]";
const TIE_ACROSS = "motion-safe:animate-[gift-tie-across_380ms_cubic-bezier(0.16,1,0.3,1)_120ms_both]";
const BOW = "motion-safe:animate-[gift-bow_620ms_cubic-bezier(0.16,1,0.3,1)_both]";

// A game's whole cover, gift-wrapped: a ribbon tied across it in the
// platform's ink with a bow where the bands cross. Untied (a claimed key) the
// cross is gone and a cut end hangs from the foot.
export function WrappedCover({
  title,
  coverUrl,
  ink,
  tied = true,
  tieIn = false,
  className,
  fallbackClassName,
  children,
}: {
  title: string;
  coverUrl: string | null | undefined;
  ink: string;
  tied?: boolean;
  // Tie the ribbon on as it mounts (remount with a new key to tie again).
  tieIn?: boolean;
  // Width (the cover keeps 3:4) and placement.
  className?: string;
  fallbackClassName?: string;
  // Laid over the wrapping (a platform tag, a count).
  children?: ReactNode;
}) {
  return (
    <div className={cn("@container relative h-fit shrink-0 self-start", className)} style={{ "--p": ink } as CSSProperties}>
      <GameCover title={title} coverUrl={coverUrl} className="w-full" fallbackClassName={cn("content-end pb-[14%]", fallbackClassName)} />
      {tied ? (
        <span aria-hidden>
          <i className={cn(RIBBON, "inset-y-0 left-[58%] w-[9%] origin-top", tieIn && TIE_DOWN)} />
          <i className={cn(RIBBON, "inset-x-0 top-[36%] h-[6.75%] origin-left", tieIn && TIE_ACROSS)} />
          <i className={cn(LOOP, "left-[calc(58%-14cqw)] rotate-135", tieIn && BOW)} />
          <i className={cn(LOOP, "left-[calc(67%-2.5cqw)] -rotate-45", tieIn && BOW)} />
        </span>
      ) : (
        <i aria-hidden className={cn(RIBBON, "-bottom-[3%] left-[58%] h-[30%] w-[9%] rotate-[18deg]")} />
      )}
      {children}
    </div>
  );
}
