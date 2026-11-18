import { BookOpen, Plus } from "lucide-react";
import { ADD_FUN_FACT_ID, FUN_FACTS_PATH, LORE_PATH, storyOf } from "@/lib/codex/paths";
import { addedOn, type FactPanel } from "@/lib/codex/wall";
import { ButtonLink } from "@/components/ui/button";
import { CodexMemberMark } from "@/components/codex/codex-member-mark";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { FactCycler } from "./fact-cycler";

// The Daily Fun Fact panel leading the contents page (1C): the Fun Facts ink
// as its top rule and heading, the day it went out, the Fun Fact set large
// with its author, and the way to its story when it tells one. "Another one"
// steps through the newest few on the page, never through the bot's queue.
// With no Daily Fun Fact posted yet, the newest Fun Fact leads instead
// (`factPanel`).
export function FactBand({ panel, canAdd }: { panel: FactPanel; canAdd: boolean }) {
  const slides = panel.facts.map((fact) => {
    const story = storyOf(fact.links);
    return {
      id: fact.id,
      figure: (
        <figure className="min-w-0">
          <blockquote className="max-w-[40ch] text-xl leading-[1.32] font-medium text-pretty text-foreground sm:text-[1.625rem]">
            <FunFactText body={fact.body ?? ""} mentions={fact.mentions} />
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2 text-sm text-faint-foreground">
            <CodexMemberMark member={fact.author} />
            <span>
              by <span className="font-semibold text-foreground">{fact.author.name}</span> · {addedOn(fact.created_at)}
            </span>
          </figcaption>
        </figure>
      ),
      story: story && (
        <ButtonLink href={`${LORE_PATH}/${story.id}`} variant="outline" className="flex-1 lg:flex-none">
          <BookOpen aria-hidden />
          Read the story
        </ButtonLink>
      ),
    };
  });

  return (
    <section
      aria-labelledby="codex-fact-band"
      className="grid gap-x-8 gap-y-4 rounded-md bg-card px-5 py-6 shadow-[inset_0_4px_0_var(--color-codex-fact)] sm:px-7 lg:grid-cols-[16.25rem_minmax(0,1fr)_auto] lg:items-center"
    >
      <div>
        <h2 id="codex-fact-band" className="font-headline text-[2.5rem] leading-[0.9] text-codex-fact">
          {panel.heading}
        </h2>
        <p className="font-label mt-2.5 text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">{panel.label}</p>
      </div>
      {slides.length > 0 ? (
        <FactCycler slides={slides} />
      ) : (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-2">
          <p className="max-w-[48ch] text-dim-foreground">The first Daily Fun Fact goes out at 15:00 New York time.</p>
          {canAdd && (
            <ButtonLink href={`${FUN_FACTS_PATH}#${ADD_FUN_FACT_ID}`} variant="highlight" className="lg:ml-auto">
              <Plus aria-hidden />
              Add a Fun Fact
            </ButtonLink>
          )}
        </div>
      )}
    </section>
  );
}
