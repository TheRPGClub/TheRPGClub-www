import type { PublicWinner } from "@/lib/api/types";
import { trackShelf } from "@/lib/front-page";
import { SectionTitle } from "@/components/landing/section-title";
import { TrackShelf } from "@/components/landing/track-shelf";

// The two tracks side by side, each with its latest picks when the public
// winners read has them.
export function TwoTracks({ winners }: { winners: PublicWinner[] }) {
  return (
    <section
      aria-labelledby="tracks-title"
      className="border-t border-border px-4 py-12 sm:px-10 sm:py-18"
    >
      <SectionTitle id="tracks-title">Two tracks, every month</SectionTitle>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-7">
        <TrackShelf
          kind="gotm"
          name="Game of the Month"
          body="The club's main event: an RPG, chosen by vote, played by the club through the month."
          picks={trackShelf(winners, "gotm")}
        />
        <TrackShelf
          kind="nr_gotm"
          name="Non-RPG Game of the Month"
          body="The second track, for everything else: roguelikes, farming sims, metroidvanias, whatever the club fancies."
          picks={trackShelf(winners, "nr_gotm")}
        />
      </div>
    </section>
  );
}
