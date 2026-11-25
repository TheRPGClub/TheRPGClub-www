import type { GotyVote } from "@/lib/goty/types";
import { SectionHeading } from "@/components/templates/page-header";
import { HistoryAward } from "./history-award";

// Every decided year's winners, newest first: the year in Anton beside its
// three Awards, each with its winner and its final tally behind a
// disclosure (api#476: each year is read in full for its tally).
export function GotyHistory({ years }: { years: GotyVote[] }) {
  return (
    <section className="mt-2.5">
      <SectionHeading title="Winners by year" count="Newest first" className="mb-1" />
      {years.length === 0 ? (
        <p className="py-6 text-dim-foreground">No year has been decided yet. The first winners land here.</p>
      ) : (
        years.map((vote) => (
          <article
            key={vote.year}
            className="grid gap-3 border-b border-border py-5 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-5"
          >
            <p className="font-headline text-5xl leading-[0.8] md:text-[4.5rem]">{vote.year}</p>
            <div className="grid gap-5 md:grid-cols-3">
              {vote.awards.map((award) => (
                <HistoryAward key={award.award} award={award} />
              ))}
            </div>
          </article>
        ))
      )}
    </section>
  );
}
