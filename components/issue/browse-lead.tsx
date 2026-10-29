import Link from "next/link";
import type { GotmRound, GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { WinnerMark } from "@/components/issue/browse-winner-mark";
import { cn } from "@/lib/utils";

// The games index's lead: the club's latest winners as wide key-art cards,
// the newest one widest. It opens the browse view only; a search or a filter
// goes straight to the grid.

const TRACK_LABEL: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

export interface LeadPick {
  kind: VotingCategory;
  roundNumber: number;
  entry: GotmRoundGame;
}

// Walks the rounds newest first, GOTM before NR-GOTM within a round, until
// there are enough picks.
export function latestWinners(rounds: GotmRound[], max = 3): LeadPick[] {
  const picks: LeadPick[] = [];
  for (const round of rounds) {
    for (const kind of ["gotm", "nr_gotm"] as const) {
      const games = [...(round[kind]?.games ?? [])].sort(
        (a, b) => a.game_index - b.game_index,
      );
      for (const entry of games) {
        picks.push({ kind, roundNumber: round.round_number, entry });
      }
    }
    if (picks.length >= max) break;
  }
  return picks.slice(0, max);
}

export function BrowseLead({ picks }: { picks: LeadPick[] }) {
  if (picks.length === 0) return null;

  return (
    <section
      aria-label="Latest winners"
      className={cn(
        "grid grid-cols-2 gap-1.5 overflow-hidden rounded-md",
        picks.length === 3 && "md:grid-cols-[1.5fr_1fr_1fr]",
        picks.length === 2 && "grid-cols-1 md:grid-cols-[1.5fr_1fr]",
        picks.length === 1 && "grid-cols-1",
      )}
    >
      {picks.map((pick, i) => (
        <LeadCard
          key={`${pick.kind}-${pick.roundNumber}-${pick.entry.gamedb_game_id ?? i}`}
          pick={pick}
          lead={i === 0}
          // On a phone three cards stack as the lead over a pair.
          span={i === 0 && picks.length === 3}
        />
      ))}
    </section>
  );
}

function LeadCard({
  pick,
  lead,
  span,
}: {
  pick: LeadPick;
  lead: boolean;
  span: boolean;
}) {
  const { kind, roundNumber, entry } = pick;
  const game = entry.game;
  const title = game?.title ?? "Unknown game";
  const art = game?.art_url ?? game?.cover_url;
  const href = entry.gamedb_game_id ? `/games/${entry.gamedb_game_id}` : null;
  const className = cn(
    "group/lead relative isolate flex min-h-50 overflow-hidden bg-ink-3 after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:h-1 md:min-h-75",
    kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
    lead && "min-h-60",
    span && "col-span-2 md:col-span-1",
  );
  const body = (
    <>
      {art && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={art}
          alt=""
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/lead:scale-[1.03]"
        />
      )}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgb(11_11_13/0.96)_0%,rgb(11_11_13/0.55)_40%,rgb(11_11_13/0.05)_72%)]"
      />
      <WinnerMark track={kind} className="absolute top-3.5 right-3.5 size-16" />
      <span className="mt-auto block px-5 pt-16 pb-4.5">
        <span
          className={cn(
            "font-label block text-[0.82rem] font-extrabold tracking-[0.1em]",
            kind === "gotm" ? "text-gotm-soft" : "text-nr-soft",
          )}
        >
          {TRACK_LABEL[kind]} · Round {roundNumber}
        </span>
        <span
          className={cn(
            "font-headline mt-1.5 block leading-[0.92] text-balance",
            lead ? "text-4xl md:text-[2.875rem]" : "text-[1.4rem] md:text-3xl",
          )}
        >
          {title}
        </span>
      </span>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
