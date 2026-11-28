import { Timer } from "lucide-react";
import { formatPlaytime, type NowPlayingPlaytime } from "@/lib/members/profile-playtime";

// The hours pinned to a Now Playing book's top-right corner: the member's
// Playtime on the game and, while one is open, the Playthrough's ("180 h ·
// Playthrough 14 h"). Nothing when there's neither (or no game).
export function PlaytimeCorner({ entry }: { entry: NowPlayingPlaytime }) {
  const total = entry.playtime_minutes ?? 0;
  const run = entry.playthrough_minutes;
  if (total <= 0 && run == null) return null;
  return (
    <span data-slot="playtime-corner" className="font-label absolute top-2.5 right-2.5 inline-flex h-6.5 items-center gap-1.5 rounded-xs bg-[color-mix(in_oklab,var(--color-background)_80%,transparent)] px-2 text-[0.66rem] font-extrabold tracking-[0.07em] text-dim-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-foreground)_25%,transparent)] sm:h-7.5 sm:gap-[7px] sm:px-2.5 sm:text-[0.76rem]">
      <Timer aria-hidden className="size-3.5" />
      <span className="sr-only">Playtime </span>
      <b className="font-headline text-[0.95rem] leading-none font-normal tracking-normal text-foreground sm:text-[1.15rem]">
        {formatPlaytime(total)}
      </b>
      {run != null && (
        <>
          <span aria-hidden className="h-4 w-px bg-[color-mix(in_oklab,var(--color-foreground)_30%,transparent)]" />
          Playthrough
          <b className="font-headline text-[0.95rem] leading-none font-normal tracking-normal text-foreground sm:text-[1.15rem]">
            {formatPlaytime(run)}
          </b>
        </>
      )}
    </span>
  );
}
