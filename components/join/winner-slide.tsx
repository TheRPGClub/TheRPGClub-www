import type { PublicWinner } from "@/lib/api/types";
import { splitTitle } from "@/components/issue/gotm-shared";
import { Starburst } from "@/components/issue/starburst";
import { SlideFrame, headlineSize } from "@/components/join/slide-frame";
import { cn } from "@/lib/utils";

// A /join slide for one of this month's winners: its key art full-bleed under
// an ink scrim, the round numeral in the track's ink, the two-line headline
// and the track's starburst. Without key art it keeps the layout on ink.

const TRACK = {
  gotm: { numeral: "text-gotm", second: "text-highlight" },
  nr_gotm: { numeral: "text-nr", second: "text-nr-soft" },
} as const;

function fullMonth(monthYear: string): string | null {
  return /^\s*([A-Za-z]+)\s+\d{4}\s*$/.exec(monthYear)?.[1] ?? null;
}

function blurb(winner: PublicWinner): string {
  if (winner.kind === "nr_gotm") {
    return "The wildcard: the club's pick for everything that isn't an RPG, voted in beside the Game of the Month and played alongside it.";
  }
  const month = fullMonth(winner.month_year);
  return `What the club is playing this month: nominated by members, voted in, and played together through ${month ?? "the month"}, with a Discord thread to talk it over.`;
}

export function WinnerSlide({ winner, stamp }: { winner: PublicWinner; stamp: boolean }) {
  const ink = TRACK[winner.kind];
  const [first, second] = splitTitle(winner.title);
  return (
    <>
      {winner.art_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={winner.art_url}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover object-[62%_30%]"
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-t from-background via-background/85 to-background/60 lg:bg-linear-to-r lg:from-background/95 lg:via-background/80 lg:via-40% lg:to-background/15 lg:to-75%"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-background to-transparent" />
      <Starburst
        track={winner.kind}
        still={!stamp}
        className="absolute top-16 right-4 z-10 size-24 sm:top-20 sm:size-32 lg:top-32 lg:right-[40.5rem] lg:size-[9.4rem]"
        textClassName={winner.kind === "gotm" ? "text-[0.95rem] sm:text-[1.15rem]" : "text-[0.8rem] sm:text-[1rem]"}
      />
      <SlideFrame>
        <p className="flex items-end gap-4.5">
          <span className={cn("font-headline text-[5.5rem] leading-[0.78] sm:text-[7rem] lg:text-[9rem]", ink.numeral)}>
            {winner.round_number}
          </span>
          <span className="font-label pb-1.5 text-sm leading-[1.3] tracking-[0.08em] text-dim-foreground sm:pb-2 sm:text-base">
            Round {winner.round_number}
            <br />
            {winner.month_year}
          </span>
        </p>
        <h2 className={cn("font-headline mt-5 leading-[0.9] text-balance sm:mt-6.5", headlineSize([first, second]))}>
          {first && <span className="block">{first}</span>}
          <span className={cn("block", ink.second)}>{second}</span>
        </h2>
        <p className="mt-4 max-w-[50ch] text-dim-foreground max-sm:line-clamp-3 sm:mt-5 sm:text-[1.06rem]">
          {blurb(winner)}
        </p>
      </SlideFrame>
    </>
  );
}
