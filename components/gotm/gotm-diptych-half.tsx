import type { GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { TRACK_LABEL, UNKNOWN_GAME_TITLE } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { INK, headline } from "./gotm-diptych-ink";

// One leaf of a round's diptych: a Category's winner over its key art under
// a black scrim, the Anton headline on two lines (the subtitle in the
// Category's accent) and the Category's foot bar. With no winner it is a
// hatched, empty leaf that says so.

export function GotmDiptychHalf({
  kind,
  winners,
  nominationsCount,
  lead = false,
  mirrored = false,
}: {
  kind: VotingCategory;
  // In game_index order; empty when the Category had no winner.
  winners: GotmRoundGame[];
  nominationsCount: number;
  // The newest round: taller, with the winner's starburst.
  lead?: boolean;
  // The right-hand leaf sets its caption flush right.
  mirrored?: boolean;
}) {
  const ink = INK[kind];
  const label = TRACK_LABEL[kind];
  const [first, ...coWinners] = winners;
  const game = first?.game;
  const art = game?.art_url ?? game?.cover_url;
  const [line1, line2] = headline(game?.title ?? UNKNOWN_GAME_TITLE);

  return (
    <div
      className={cn(
        "group/half relative isolate h-full min-w-0 overflow-hidden rounded-sm",
        first
          ? "bg-muted"
          : "border border-border bg-[repeating-linear-gradient(135deg,var(--color-card)_0_12px,var(--color-muted)_12px_24px)]",
      )}
    >
      {art && (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={art}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:transition-transform motion-safe:group-hover/row:scale-[1.03]"
        />
      )}
      {first && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-background)_15%,transparent)_30%,color-mix(in_oklab,var(--color-background)_90%,transparent))]"
        />
      )}
      {first && lead && (
        <WinnerMark
          track={kind}
          className={cn(
            "absolute top-2.5 size-11 sm:top-4 sm:size-16",
            mirrored ? "right-2.5 sm:right-4" : "left-2.5 sm:left-4",
          )}
        />
      )}

      <div
        className={cn(
          "absolute inset-x-3 bottom-3.5 sm:inset-x-5.5 sm:bottom-5",
          mirrored && "text-right",
        )}
      >
        <span
          className={cn(
            "font-label mb-1.5 inline-block rounded-xs px-1.5 py-0.5 text-[0.6875rem] font-bold tracking-[0.16em] uppercase sm:mb-2 sm:px-1.75",
            first ? ink.chip : ink.emptyChip,
          )}
        >
          {label}
        </span>
        {first ? (
          <h3
            className={cn(
              "font-headline text-balance uppercase",
              lead ? "text-[1.25rem] sm:text-[2.25rem]" : "text-[1.125rem] sm:text-[1.875rem]",
              // After the size: a size class resets the leading.
              "leading-[1.02]",
            )}
          >
            <span className="block">{line1}</span>
            {line2 && <span className={cn("block", ink.second)}>{line2}</span>}
          </h3>
        ) : (
          <>
            <h3 className="font-headline text-[1.125rem] leading-[1.02] text-dim-foreground uppercase sm:text-[1.875rem]">
              No {label} winner this round
            </h3>
            {nominationsCount > 0 && (
              <p className="font-label mt-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] text-faint-foreground uppercase sm:text-[0.8125rem]">
                {nominationsCount} nominated
              </p>
            )}
          </>
        )}
        {coWinners.length > 0 && (
          <p className="font-label mt-1.5 text-[0.6875rem] font-semibold tracking-[0.1em] text-dim-foreground uppercase sm:text-[0.8125rem]">
            + {coWinners.map((w) => w.game?.title ?? UNKNOWN_GAME_TITLE).join(" + ")}
          </p>
        )}
      </div>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 z-10",
          first ? cn("h-1.25", ink.foot) : cn("h-0.75", ink.emptyFoot),
        )}
      />
    </div>
  );
}
