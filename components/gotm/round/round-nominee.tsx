import Link from "next/link";
import type { VotingCategory } from "@/lib/api/types";
import { votesLabel, type RoundRow } from "@/lib/gotm-round";
import { UNKNOWN_GAME_TITLE } from "@/components/issue/gotm-shared";
import { cn } from "@/lib/utils";
import { Nominator } from "./round-nominator";

// One game in a Category's column: cover, title, nominator, the full reason
// and, when the round had a vote, its count over a thin bar in the
// Category's ink (scaled to the column's top count).
export function RoundNominee({
  kind,
  row,
  votes,
  max,
}: {
  kind: VotingCategory;
  row: RoundRow;
  votes: number | null;
  max: number;
}) {
  const title = row.game?.title ?? UNKNOWN_GAME_TITLE;
  const cover = row.game?.cover_url ?? row.game?.art_url;
  const reason = row.nomination?.reason?.trim();
  const nr = kind === "nr_gotm";

  return (
    <li
      className={cn(
        "grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-border py-3.5 md:grid-cols-[3.25rem_minmax(0,1fr)_7rem] md:gap-x-4",
        votes == null && "md:grid-cols-[3.25rem_minmax(0,1fr)]",
      )}
    >
      <div
        className={cn(
          "relative h-15 w-11 overflow-hidden rounded-xs bg-muted md:h-17.5 md:w-13",
          row.won && "ring-1 ring-foreground ring-offset-2 ring-offset-background",
        )}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={cover} alt="" loading="lazy" className="size-full object-cover" />
        )}
      </div>
      <div className="min-w-0">
        {row.won && (
          <span
            className={cn(
              "font-label mb-1.5 table rounded-xs px-1.5 py-px text-[0.75rem] font-extrabold tracking-[0.14em] uppercase",
              nr ? "bg-nr text-nr-foreground" : "bg-gotm text-gotm-foreground",
            )}
          >
            Winner
          </span>
        )}
        <h3 className={cn("leading-tight font-semibold", row.won ? "text-[1.125rem]" : "text-base")}>
          {row.gameId ? (
            <Link href={`/games/${row.gameId}`} className="hover:text-highlight">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {row.nomination && (
          <p className="font-label mt-0.5 text-[0.8rem] font-semibold tracking-[0.1em] text-faint-foreground uppercase">
            {row.nomination.user ? "by " : null}
            <Nominator user={row.nomination.user} />
          </p>
        )}
        {reason && (
          <p className="mt-1.5 max-w-[65ch] text-[0.875rem] leading-relaxed whitespace-pre-line text-dim-foreground">
            {reason}
          </p>
        )}
      </div>
      {votes != null && <VoteCount kind={kind} votes={votes} max={max} runoff={row.nomination?.runoff_votes ?? null} />}
    </li>
  );
}

function VoteCount({ kind, votes, max, runoff }: { kind: VotingCategory; votes: number; max: number; runoff: number | null }) {
  const nr = kind === "nr_gotm";
  const share = max > 0 ? Math.round((votes / max) * 100) : 0;
  return (
    <div className="font-label col-start-2 flex items-center gap-2.5 text-[0.8rem] font-semibold tracking-[0.08em] text-dim-foreground uppercase md:col-start-3 md:block md:text-right">
      <span className="whitespace-nowrap">
        <span className="font-headline mr-1 text-[1.125rem] tracking-normal text-foreground tabular-nums md:text-[1.375rem]">
          {votes}
        </span>
        {votesLabel(votes).replace(/^\d+ /, "")}
      </span>
      <span aria-hidden className="relative block h-0.75 flex-1 rounded-[1px] bg-muted md:mt-1.5">
        <span
          className={cn("absolute inset-y-0 left-0 rounded-[1px] md:right-0 md:left-auto", nr ? "bg-nr" : "bg-gotm")}
          style={{ width: `${share}%` }}
        />
      </span>
      {runoff != null && (
        <span className={cn("block whitespace-nowrap md:mt-1.5", nr ? "text-nr-soft" : "text-gotm-soft")}>
          Runoff {runoff}
        </span>
      )}
    </div>
  );
}
