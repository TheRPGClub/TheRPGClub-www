import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import type { GotmRound, GotmRoundBlock, VotingCategory } from "@/lib/api/types";
import { roundEditHref, roundPrefillHref, TRACK_NAME, TRACKS } from "@/lib/rounds";
import { cn } from "@/lib/utils";

// The rounds on file, newest first: each round's numeral and month beside
// its GOTM and NR-GOTM games, each track with its Edit link (or Add, when
// the round has none for that track).
export function RoundList({ rounds }: { rounds: GotmRound[] }) {
  return (
    <ol>
      {rounds.map((round) => (
        <RoundRow key={round.round_number} round={round} />
      ))}
    </ol>
  );
}

function RoundRow({ round }: { round: GotmRound }) {
  const monthYear = round.gotm?.month_year ?? round.nr_gotm?.month_year ?? "";
  return (
    <li className="grid gap-3 border-b border-border py-4 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
      <h3 className="flex items-baseline gap-3 md:block">
        <span className="font-headline block text-[3rem] leading-[0.8] md:text-[3.5rem]">{round.round_number}</span>
        <span className="font-label block text-[0.82rem] font-bold tracking-[0.08em] text-faint-foreground md:mt-2">
          <span className="sr-only">Round {round.round_number}, </span>
          {monthYear}
        </span>
      </h3>
      {TRACKS.map((category) => (
        <TrackCell key={category} category={category} round={round} block={round[category]} monthYear={monthYear} />
      ))}
    </li>
  );
}

function TrackCell({
  category,
  round,
  block,
  monthYear,
}: {
  category: VotingCategory;
  round: GotmRound;
  block: GotmRoundBlock | null;
  monthYear: string;
}) {
  const label = TRACK_NAME[category];
  const games = block ? [...block.games].sort((a, b) => a.game_index - b.game_index) : [];
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-label text-[0.78rem] font-bold tracking-[0.08em]",
            category === "gotm" ? "text-gotm-soft" : "text-nr-soft",
          )}
        >
          {label}
        </span>
        {block ? (
          <Link
            href={roundEditHref(category, round.round_number)}
            className="font-label inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[0.8rem] font-bold tracking-[0.06em] text-dim-foreground transition-colors hover:text-highlight focus-visible:ring-2 focus-visible:ring-highlight/60 focus-visible:outline-none"
            aria-label={`Edit ${label} round ${round.round_number}`}
          >
            <Pencil className="size-3.5" aria-hidden />
            Edit
          </Link>
        ) : (
          <Link
            href={roundPrefillHref(category, round.round_number, monthYear)}
            className="font-label inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-[0.8rem] font-bold tracking-[0.06em] text-dim-foreground transition-colors hover:text-highlight focus-visible:ring-2 focus-visible:ring-highlight/60 focus-visible:outline-none"
            aria-label={`Add ${label} round ${round.round_number}`}
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </Link>
        )}
      </div>
      {!block ? (
        <p className="mt-1 text-[0.9rem] text-faint-foreground">No {label} this round.</p>
      ) : games.length === 0 ? (
        <p className="mt-1 text-[0.9rem] text-faint-foreground">No game (placeholder)</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {games.map((g) => (
            <li key={g.game_index} className="truncate font-semibold">
              {g.game?.title ?? `GameDB game ${g.gamedb_game_id ?? "?"}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
