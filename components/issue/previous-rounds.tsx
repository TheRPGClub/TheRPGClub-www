import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GotmRound, GotmRoundGame, VotingCategory } from "@/lib/api/types";
import { SectionHeading, headingLinkClass } from "@/components/issue/page-header";
import { cn } from "@/lib/utils";

// The dashboard's strip of the rounds before the current one: a monumental
// round number beside each round's winners, GOTM first, every pick footed in
// its track's ink.

const TRACK_LABEL: Record<VotingCategory, string> = {
  gotm: "GOTM",
  nr_gotm: "NR-GOTM",
};

export function PreviousRounds({ rounds }: { rounds: GotmRound[] }) {
  if (rounds.length === 0) return null;

  return (
    <section aria-labelledby="previous-rounds" className="space-y-4">
      <SectionHeading
        title={<span id="previous-rounds">Previous rounds</span>}
        action={
          <Link href="/gotm" className={headingLinkClass}>
            Full history
            <ArrowRight aria-hidden />
          </Link>
        }
      />
      <ol className="grid gap-x-5 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
        {rounds.map((round) => {
          const picks: { kind: VotingCategory; entry: GotmRoundGame }[] = [
            ...(round.gotm?.games ?? []).map((entry) => ({
              kind: "gotm" as const,
              entry,
            })),
            ...(round.nr_gotm?.games ?? []).map((entry) => ({
              kind: "nr_gotm" as const,
              entry,
            })),
          ];
          const month = round.gotm?.month_year ?? round.nr_gotm?.month_year;
          return (
            <li
              key={round.round_number}
              className="grid grid-cols-[4.25rem_1fr] gap-4 xl:border-r xl:border-rule xl:pr-5 xl:last:border-r-0"
            >
              <p className="font-headline text-[3.6rem] leading-[0.85]">
                {round.round_number}
                {month && (
                  <span className="font-label mt-2 block text-[0.8rem] leading-tight font-extrabold text-paper-mute">
                    {month}
                  </span>
                )}
              </p>
              <ul className="grid grid-cols-2 gap-3">
                {picks.slice(0, 4).map(({ kind, entry }, i) => (
                  <li key={`${kind}-${entry.gamedb_game_id ?? i}`}>
                    <RoundPick kind={kind} entry={entry} />
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function RoundPick({
  kind,
  entry,
}: {
  kind: VotingCategory;
  entry: GotmRoundGame;
}) {
  const game = entry.game;
  const art = game?.art_url ?? game?.cover_url;
  const title = game?.title ?? "Unknown game";
  const body = (
    <>
      <span
        className={cn(
          "relative block h-28 overflow-hidden rounded-[3px] bg-ink-3 after:absolute after:inset-x-0 after:bottom-0 after:h-1",
          kind === "gotm" ? "after:bg-gotm" : "after:bg-nr",
        )}
      >
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={art}
            alt=""
            className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/pick:scale-[1.04]"
          />
        ) : (
          <span className="font-headline grid size-full place-items-center p-2 text-center text-lg text-paper-mute">
            {title}
          </span>
        )}
      </span>
      <span
        className={cn(
          "font-label mt-2 block text-xs tracking-[0.08em]",
          kind === "gotm" ? "text-gotm-soft" : "text-nr-soft",
        )}
      >
        {TRACK_LABEL[kind]}
      </span>
      <span className="font-label block text-[0.95rem] leading-tight tracking-[0.02em] text-paper">
        {title}
      </span>
    </>
  );

  return entry.gamedb_game_id ? (
    <Link href={`/games/${entry.gamedb_game_id}`} className="group/pick block">
      {body}
    </Link>
  ) : (
    <div>{body}</div>
  );
}
