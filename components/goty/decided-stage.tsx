import type { GotyVote } from "@/lib/goty/types";
import { AwardStory } from "./award-story";

// Decided: each Award's cover story in turn, its tally beside it. An Award
// that went to nobody says so in its place.
export function DecidedStage({ vote }: { vote: GotyVote }) {
  return (
    <section className="flex flex-col gap-4">
      {vote.awards.map((award) =>
        award.winner ? (
          <AwardStory key={award.award} vote={vote} award={award} />
        ) : (
          <p
            key={award.award}
            className="rounded-[3.2px] border border-dashed border-border-strong px-4 py-8 text-center text-dim-foreground"
          >
            {award.name} {vote.year} was not given: {award.ballot.length ? "nobody voted" : "it had no candidates"}.
          </p>
        ),
      )}
    </section>
  );
}
