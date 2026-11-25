import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { GotmRoundDetail } from "@/lib/api/types";
import { gotmHistoryHref, gotmRoundHref, type GotmHistoryFilters } from "@/lib/api/gotm-rounds";
import { roundHasNominations } from "@/lib/gotm-round";
import { NO_DISCORD_LINKS, type DiscordLinkConfig } from "@/lib/gotm-links";
import { PageHeader } from "@/components/templates/page-header";
import { RoundColumn } from "./round-column";
import { RoundHero } from "./round-hero";
import { RoundNav } from "./round-nav";

// A closed GOTM round in full (spec api#483, design The Diptych): the winners
// as a hinged pair of art, then each Category's every nominee with who put it
// forward, why, and how the vote went.
export function RoundPage({
  roundNumber,
  round,
  filters,
  badge,
  discord = NO_DISCORD_LINKS,
}: {
  roundNumber: number;
  // null when the round couldn't be read.
  round: GotmRoundDetail | null;
  // The history's filters, kept on every way out.
  filters: GotmHistoryFilters;
  badge?: ReactNode;
  // Where the Discord thread and voting-results links point (server-only
  // env); without it only Reddit links show.
  discord?: DiscordLinkConfig;
}) {
  const back = { href: gotmHistoryHref(filters), label: "GOTM history" };
  if (!round) {
    return (
      <div className="space-y-6">
        <PageHeader title={`Round ${roundNumber}`} back={back} badge={badge} />
        <p className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
          Couldn&apos;t load this round. Try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        back={back}
        badge={badge}
        title={
          <>
            Round {round.round_number}
            {round.month_year && (
              <span className="max-md:font-label max-md:mt-1.5 max-md:block max-md:text-[0.85rem] max-md:font-bold max-md:tracking-[0.18em] max-md:text-dim-foreground max-md:uppercase">
                <span className="max-md:hidden"> · </span>
                {round.month_year}
              </span>
            )}
          </>
        }
        actions={<StepLinks round={round} filters={filters} />}
      />
      <div className="mt-4">
        <RoundHero round={round} discord={discord} />
      </div>
      {roundHasNominations(round) ? (
        <div className="mt-6 grid gap-7 md:grid-cols-[minmax(0,1fr)_8.25rem_minmax(0,1fr)] md:gap-0">
          <RoundColumn kind="gotm" category={round.gotm} discord={discord} />
          <div aria-hidden className="relative before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-border max-md:hidden" />
          <RoundColumn kind="nr_gotm" category={round.nr_gotm} discord={discord} />
        </div>
      ) : (
        <p className="mt-6 flex items-stretch gap-5 rounded-sm border border-border bg-card px-5 py-5 text-[1.0625rem] md:px-7 md:py-6">
          <span aria-hidden className="w-1.25 shrink-0 rounded-[1px] bg-[linear-gradient(var(--color-gotm)_0_50%,var(--color-nr)_50%)]" />
          Nominations weren&apos;t recorded for this round.
        </p>
      )}
      <RoundNav previous={round.previous} next={round.next} filters={filters} />
    </div>
  );
}

// The quick step beside the title; the foot repeats it with more room.
function StepLinks({ round, filters }: { round: GotmRoundDetail; filters: GotmHistoryFilters }) {
  const step = "font-label inline-flex items-center gap-1.5 text-[0.85rem] font-bold tracking-[0.1em] uppercase";
  return (
    <nav aria-label="Step through rounds" className="flex gap-4 max-md:hidden">
      {round.previous != null ? (
        <Link href={gotmRoundHref(round.previous, filters)} className={`${step} hover:text-highlight`}>
          <ArrowLeft aria-hidden className="size-3.5" />
          Round {round.previous}
        </Link>
      ) : null}
      {round.next != null ? (
        <Link href={gotmRoundHref(round.next, filters)} className={`${step} hover:text-highlight`}>
          Round {round.next}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      ) : null}
    </nav>
  );
}
