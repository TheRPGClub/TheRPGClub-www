import type { VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// A track described as a flat plate of its own ink: what stands in for the
// winners when the public read fails or comes back empty (the front page's
// flat hero, the first two /join slides).

export const TRACK_PLATES: Record<VotingCategory, { name: string; blurb: string }> = {
  gotm: {
    name: "Game of the Month",
    blurb: "An RPG, nominated and voted in by the club, played through the month.",
  },
  nr_gotm: {
    name: "Non-RPG Game of the Month",
    blurb: "The wildcard: roguelikes, farming sims, metroidvanias, anything that isn't an RPG.",
  },
};

export function TrackPlate({
  kind,
  className,
}: {
  kind: VotingCategory;
  // Placement only.
  className?: string;
}) {
  const { name, blurb } = TRACK_PLATES[kind];
  return (
    <section
      className={cn(
        "rounded-md px-5 pt-4.5 pb-5",
        kind === "gotm" ? "bg-gotm text-gotm-foreground" : "bg-nr text-nr-foreground",
        className,
      )}
    >
      <h2 className="font-headline max-w-[11ch] text-[2.4rem] leading-[0.9] sm:text-[2.75rem]">
        {name}
      </h2>
      <p className="mt-2.5 max-w-[34ch] text-[0.92rem] font-medium opacity-85">{blurb}</p>
    </section>
  );
}
