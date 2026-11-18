import { BookOpen } from "lucide-react";
import type { CodexEntry } from "@/lib/codex/types";
import { LORE_PATH, storyOf } from "@/lib/codex/paths";
import { addedOn } from "@/lib/codex/wall";
import { ButtonLink } from "@/components/ui/button";
import { CodexMemberMark } from "@/components/codex/codex-member-mark";
import { FunFactText } from "@/components/codex/fun-fact-text";
import { AnotherOneButton } from "./another-one-button";

// The Fun Fact band leading the contents page (1C): the Fun Facts ink as its
// top rule and label, the Fun Fact set large, its author, and the way to its
// story when it tells one. The API can't say which Fun Fact the bot posted
// today, so this is one from the wall, and "Another one" draws again.
export function FactBand({ fact }: { fact: CodexEntry | null }) {
  const story = fact ? storyOf(fact.links) : null;
  return (
    <section
      aria-labelledby="codex-fact-band"
      className="grid gap-x-8 gap-y-4 rounded-md bg-card px-5 py-6 shadow-[inset_0_4px_0_var(--color-codex-fact)] sm:px-7 lg:grid-cols-[15rem_minmax(0,1fr)_auto] lg:items-center"
    >
      <div>
        <h2 id="codex-fact-band" className="font-headline text-[2.5rem] leading-[0.9] text-codex-fact">
          Fun Fact
        </h2>
        <p className="font-label mt-2.5 text-[0.8rem] font-bold tracking-[0.08em] text-faint-foreground">
          {fact ? `From the wall · added ${addedOn(fact.created_at)}` : "None on the wall yet"}
        </p>
      </div>
      {fact ? (
        <figure className="min-w-0">
          <blockquote className="max-w-[40ch] text-[1.375rem] leading-[1.32] font-medium text-pretty text-foreground sm:text-[1.625rem]">
            <FunFactText body={fact.body ?? ""} mentions={fact.mentions} />
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2 text-sm text-faint-foreground">
            <CodexMemberMark member={fact.author} />
            by <span className="font-semibold text-foreground">{fact.author.name}</span>
          </figcaption>
        </figure>
      ) : (
        <p className="max-w-[48ch] text-dim-foreground">
          Fun Facts are one or two sentences about the club or its members. The first one added goes out as the
          Daily Fun Fact.
        </p>
      )}
      {fact && (
        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
          {story && (
            <ButtonLink href={`${LORE_PATH}/${story.id}`} variant="outline">
              <BookOpen aria-hidden />
              Read the story
            </ButtonLink>
          )}
          <AnotherOneButton />
        </div>
      )}
    </section>
  );
}
