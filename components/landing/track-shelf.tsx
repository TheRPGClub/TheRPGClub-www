import type { PublicWinner, VotingCategory } from "@/lib/api/types";
import { cn } from "@/lib/utils";

// One track: its name in the track's colour, what it is, and a shelf of its
// latest picks (three on a phone, five from sm up).
export function TrackShelf({
  kind,
  name,
  body,
  picks,
}: {
  kind: VotingCategory;
  name: string;
  body: string;
  picks: PublicWinner[];
}) {
  const gotm = kind === "gotm";
  return (
    <div className={cn("border-t-6 pt-4.5", gotm ? "border-gotm" : "border-nr")}>
      <h3
        className={cn(
          "font-headline text-[2.25rem] leading-[0.95] sm:text-[2.6rem]",
          gotm ? "text-gotm" : "text-nr-soft",
        )}
      >
        {name}
      </h3>
      <p className="mt-2.5 max-w-[52ch] text-dim-foreground">{body}</p>
      {picks.length > 0 && (
        <ul className="mt-5 grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {picks.map((pick, i) => (
            <li key={pick.round_number} className={cn(i >= 3 && "max-sm:hidden")}>
              <div
                className={cn(
                  "aspect-[3/4] overflow-hidden border-b-4 bg-muted",
                  gotm ? "border-gotm" : "border-nr",
                )}
              >
                {pick.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pick.cover_url}
                    alt={pick.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-headline grid size-full place-items-center p-2 text-center text-lg text-faint-foreground">
                    {pick.title}
                  </span>
                )}
              </div>
              <p className="font-label mt-1.5 text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                Round {pick.round_number}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
