import type { CSSProperties } from "react";
import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { AWARD_INK } from "@/lib/goty/awards";
import { etDay } from "@/lib/goty/dates";
import { GameCover } from "@/components/issue/game-cover";

// Before nominations open: the three Awards side by side, each topped by
// its ink, saying what goes on its ballot, with a fan of the games already
// on it (Game of the Year's fan is three empty slots, one per nomination).
export function UpcomingStage({ vote }: { vote: GotyVote }) {
  return (
    <section className="grid gap-3.5 md:grid-cols-3">
      {vote.awards.map((award) => (
        <article
          key={award.award}
          style={{ "--award-ink": AWARD_INK[award.award] } as CSSProperties}
          className="flex flex-col gap-2.5 rounded-[3.2px] border-t-4 border-(--award-ink) bg-card p-4.5 md:min-h-[290px]"
        >
          <h2 className="font-headline text-[1.9rem] leading-[0.9]">{award.name}</h2>
          <p className="text-[0.92rem] text-dim-foreground">{blurb(award, vote)}</p>
          <Fan award={award} />
        </article>
      ))}
    </section>
  );
}

function blurb(award: GotyAward, vote: GotyVote): string {
  const n = award.ballot.length;
  const games = `${n} ${n === 1 ? "game" : "games"}`;
  if (award.award === "gotm") return `Every GOTM winner from the ${vote.year} rounds. ${games}, nothing to nominate.`;
  if (award.award === "nr_gotm") return `Every NR-GOTM winner from the ${vote.year} rounds. ${games}.`;
  return `Members nominate up to 3 games first released in ${vote.year}, from ${etDay(vote.nominations_open_at)}.`;
}

function Fan({ award }: { award: GotyAward }) {
  const shown = award.award === "game_of_the_year" ? [] : award.ballot.slice(0, 5);
  if (!shown.length) {
    return (
      <span aria-hidden className="mt-auto flex h-[120px] items-end">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{ transform: `rotate(${(i - 1) * 5}deg)` }}
            className="-mr-7.5 h-26 w-19.5 rounded-[3px] border-2 border-dashed border-border-strong bg-card"
          />
        ))}
      </span>
    );
  }
  const more = award.ballot.length - shown.length;
  return (
    <span className="mt-auto flex h-[120px] items-end">
      {shown.map((game, i) => (
        <span key={game.game_id} style={{ transform: `rotate(${(i - 2) * 4}deg)` }} className="-mr-8.5 w-19.5 shadow-[0_8px_18px_rgb(0_0_0/0.5)]">
          <GameCover title={game.title} coverUrl={game.cover_url} fallbackClassName="text-xs" />
        </span>
      ))}
      {more > 0 && (
        <span className="font-label ml-11.5 text-[0.8rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
          + {more} more
        </span>
      )}
    </span>
  );
}
