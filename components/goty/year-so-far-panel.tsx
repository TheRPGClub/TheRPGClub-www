import type { GotyAward, GotyVote } from "@/lib/goty/types";
import { wonInLabel } from "@/lib/goty/awards";
import { clubReleases, yearSoFarEmpty, yearSoFarLine } from "@/lib/goty/year-so-far";
import { YearSoFarCard } from "./year-so-far-card";

// One Award's Year So Far under its envelope: the line saying what these
// games are (and, for Game of the Year, that they are not nominations),
// then their covers. GOTM / NR-GOTM winners carry where they won; club
// releases how many members played them.
export function YearSoFarPanel({ vote, award }: { vote: GotyVote; award: GotyAward }) {
  const goty = award.award === "game_of_the_year";
  const items = goty
    ? clubReleases(vote).map((r) => ({ game: r.game, played: r.members_played, note: "" }))
    : award.ballot.map((game) => ({ game, played: null, note: wonInLabel(game.won_in) }));
  return (
    <section className="flex flex-col gap-5">
      <p className="mt-1 max-w-[72ch] text-[0.95rem] text-dim-foreground">{yearSoFarLine(vote, award)}</p>
      {items.length === 0 ? (
        <p data-slot="issue-note" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
          {yearSoFarEmpty(vote, award.award)}
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-x-5 sm:gap-y-7">
          {items.map((item) => (
            <YearSoFarCard key={item.game.game_id} award={award.award} game={item.game} note={item.note} played={item.played} />
          ))}
        </ul>
      )}
    </section>
  );
}
