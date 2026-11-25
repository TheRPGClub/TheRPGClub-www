import type { GotyVote } from "@/lib/goty/types";
import { howItWorks } from "@/lib/goty/year-so-far";
import { SectionHeading } from "@/components/templates/page-header";

// The Award's name in its label ink: soft red, soft violet, paper.
const LABEL = { gotm: "text-gotm-soft", nr_gotm: "text-nr-soft", game_of_the_year: "text-foreground" } as const;

// How the GOTY Vote works, under the Year So Far: the three Awards, the
// vote's real dates (the schedule the banner draws, in words) and the rules
// (3 nominations each, the vote cap, runoffs), on hairline rules.
export function HowItWorks({ vote }: { vote: GotyVote }) {
  const how = howItWorks(vote);
  return (
    <section aria-labelledby="goty-how" className="mt-2.5">
      <SectionHeading title={<span id="goty-how">How it works</span>} count={vote.name} className="mb-1" />
      <div className="grid gap-x-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ul>
          {how.awards.map((a) => (
            <li key={a.key} className="border-b border-border py-3.5">
              <h3 className={`font-label text-[0.82rem] font-extrabold tracking-[0.08em] uppercase ${LABEL[a.key]}`}>{a.name}</h3>
              <p className="mt-1 text-dim-foreground">{a.text}</p>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] content-start gap-x-5">
          {how.dates.map((d) => (
            <div key={d.step} className="col-span-2 grid grid-cols-subgrid items-baseline border-b border-border py-3.5">
              <dt className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">{d.step}</dt>
              <dd className="text-right">{d.when}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-2 grid gap-x-10 md:grid-cols-3">
        {how.rules.map((r) => (
          <div key={r.title} className="border-b border-border py-3.5 md:border-b-0">
            <h3 className="font-headline text-[1.6rem] leading-[0.95]">{r.title}</h3>
            <p className="mt-1.5 text-[0.92rem] text-dim-foreground">{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
