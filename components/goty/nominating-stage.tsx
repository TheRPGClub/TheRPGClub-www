"use client";

import { Info } from "lucide-react";
import type { NominatedGame } from "@/lib/goty/awards";
import type { GotyNomination, GotyVote } from "@/lib/goty/types";
import { etDay } from "@/lib/goty/dates";
import { useGotyNominations } from "@/hooks/use-goty-nominations";
import { SectionHeading } from "@/components/templates/page-header";
import { DealtHand } from "./dealt-hand";
import { NominationSearch } from "./nomination-search";
import { NominationsWall } from "./nominations-wall";

const CAP = 3;

// Nominating: the viewer's three Game of the Year nominations dealt as
// tilted cards, the search that greys out games not first released in the
// year, then every member's nominations as a wall of covers. No reason is
// asked for or shown (owner pick).
export function NominatingStage({
  vote,
  nominations,
  nominated,
  viewerId,
}: {
  vote: GotyVote;
  nominations: GotyNomination[];
  nominated: NominatedGame[];
  viewerId: string | undefined;
}) {
  const state = useGotyNominations(vote.year);
  const mine = nominations.filter((n) => n.user_id === viewerId);
  const ballots = vote.awards.filter((a) => a.award !== "game_of_the_year");
  return (
    <section className="flex flex-col gap-5">
      <SectionHeading
        title="Your three for Game of the Year"
        count={`${mine.length} of ${CAP} · change them until ${etDay(vote.voting_opens_at)}`}
      />
      <DealtHand mine={mine} year={vote.year} state={state} open={vote.nominations_open} />
      {vote.nominations_open && (
        <NominationSearch
          year={vote.year}
          state={state}
          full={mine.length >= CAP && !state.replacing}
          mine={mine}
          nominated={nominated}
        />
      )}
      <SectionHeading
        className="mt-3"
        title="The nominations"
        count={`${nominated.length} ${nominated.length === 1 ? "game" : "games"} so far`}
      />
      <NominationsWall games={nominated} />
      <p className="flex items-start gap-2 text-[0.88rem] text-faint-foreground">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          {ballots.map((a) => a.name).join(" and ")} need no nominations: their ballots are the year&apos;s winners,{" "}
          {ballots.map((a) => a.ballot.length).join(" and ")} games.
        </span>
      </p>
    </section>
  );
}
