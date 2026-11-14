import { Check } from "lucide-react";
import type { VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// A nomination's box art, footed in the track's ink (GOTM red, NR-GOTM
// violet), with its marks: the viewer's own pick wears the nominations
// yellow, the leader once the vote has ended, and the viewer's vote.

const TRACK = {
  gotm: { bar: "after:bg-gotm", voted: "ring-gotm", chip: "bg-gotm text-gotm-foreground" },
  nr_gotm: { bar: "after:bg-nr", voted: "ring-nr", chip: "bg-nr text-nr-foreground" },
} as const;

export function NominationCover({
  category,
  title,
  cover,
  isOwn,
  isWinner,
  showVoted,
}: {
  category: VotingCategory;
  title: string;
  cover: string | null;
  isOwn: boolean;
  isWinner: boolean;
  showVoted: boolean;
}) {
  const track = TRACK[category];
  return (
    <span
      className={cn(
        "relative block aspect-[3/4] overflow-hidden rounded-sm bg-muted after:absolute after:inset-x-0 after:bottom-0 after:h-1",
        track.bar,
        isOwn && "ring-3 ring-highlight",
        showVoted && !isOwn && cn("ring-3", track.voted),
      )}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/tile:scale-[1.04]"
        />
      ) : (
        <span className="font-headline grid size-full place-items-center p-3 text-center text-2xl leading-[0.95] text-balance text-faint-foreground">
          {title}
        </span>
      )}
      <span className="absolute top-2 left-2 flex flex-col items-start gap-1">
        {isOwn && (
          <span className={chipClass("bg-highlight text-highlight-foreground")}>Your pick</span>
        )}
        {isWinner && <span className={chipClass(track.chip)}>Most votes</span>}
      </span>
      {showVoted && (
        <span
          className={cn(
            chipClass(track.chip),
            "absolute top-2 right-2 inline-flex items-center gap-1",
          )}
        >
          <Check aria-hidden className="size-3" />
          Voted
        </span>
      )}
    </span>
  );
}

function chipClass(tone: string): string {
  return cn(
    "font-label rounded-xs px-1.75 py-0.5 text-[0.72rem] leading-none font-extrabold tracking-[0.1em]",
    tone,
  );
}
