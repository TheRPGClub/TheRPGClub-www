import type { ReactNode } from "react";
import type { Nomination } from "@/lib/api/types";

// The pieces of a nomination slot on the yellow ballot strip: the viewer's
// pick, the empty slot and an error, all in ink.

export function ExistingNomination({
  nomination,
  note,
}: {
  nomination: Nomination;
  note?: string;
}) {
  const game = nomination.game;
  const title = game?.title ?? `Game #${nomination.gamedb_game_id ?? "?"}`;
  const cover = game?.cover_url ?? game?.art_url;
  return (
    <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3.5">
      <span className="block h-20 w-15 overflow-hidden rounded-xs bg-background ring-2 ring-background">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-headline grid size-full place-items-center p-1 text-center text-[0.7rem] leading-none text-faint-foreground">
            {title}
          </span>
        )}
      </span>
      <div className="min-w-0">
        <p className="font-headline text-[1.75rem] leading-[0.95] text-balance sm:text-[1.9rem]">
          {title}
        </p>
        {nomination.reason && (
          <p className="mt-1 line-clamp-2 text-[0.82rem] text-highlight-muted-foreground">
            &ldquo;{nomination.reason}&rdquo;
          </p>
        )}
        {note && (
          <p className="mt-1 text-[0.82rem] font-medium text-highlight-muted-foreground">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export function EmptySlot({ children }: { children: ReactNode }) {
  return (
    <p className="font-label grid min-h-18 flex-1 place-items-center rounded-xs border-2 border-dashed border-background/45 p-2.5 text-center text-[0.88rem] font-extrabold tracking-[0.06em] text-highlight-muted-foreground">
      {children}
    </p>
  );
}

export function SlotError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-[0.85rem] font-semibold text-background">
      {children}
    </p>
  );
}
