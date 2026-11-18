import { ArrowRight } from "lucide-react";
import type { YourBusinessProps } from "@/lib/challenges/edition-client";
import { panelFacts } from "@/lib/challenges/edition-panel";
import type { EditionPage } from "@/lib/challenges/edition-page";
import type { ChallengeEdition } from "@/lib/challenges/types";
import { ButtonLink } from "@/components/ui/button";
import { SantaCircle } from "@/components/challenges/assignment/santa-circle";
import { YourBusiness } from "@/components/challenges/assignment/your-business";

// The Edition's side panel (surface brief challenges-assignment, 4A): the
// date that matters next, a monumental holly numeral and its caption, the
// viewer's own business in yellow, a muted line of context; once the
// Edition ends, the Santa circle and the way to the next Edition.
export function EditionPanel({
  data,
  edition,
  business,
  className,
}: {
  data: EditionPage;
  edition: ChallengeEdition;
  business: YourBusinessProps;
  className?: string;
}) {
  const facts = panelFacts(edition, data.today);
  const ended = edition.phase === "ended";
  const newer = data.newer;
  return (
    <aside aria-label="This Edition" className={className}>
      <div className="flex flex-col gap-3 rounded-sm bg-card px-5 py-[18px]">
        <p className="font-label text-[0.8rem] tracking-[0.08em] text-faint-foreground">{facts.label}</p>
        {facts.big !== null && (
          <p className="-mt-1 flex flex-col">
            <span className="font-headline text-[4.5rem] leading-[0.8] text-(--challenge-tint-hi)">{facts.big}</span>
            <span className="font-label mt-1.5 text-[0.8rem] tracking-[0.08em] text-dim-foreground">
              {facts.caption}
            </span>
          </p>
        )}
        {facts.big === null && facts.caption && (
          <p className="font-label -mt-1 text-[0.86rem] tracking-[0.08em] text-dim-foreground">{facts.caption}</p>
        )}
        <YourBusiness {...business} />
        {facts.lines.map((line) => (
          <p key={line} className="text-[0.92rem] leading-[1.45] text-dim-foreground">
            {line}
          </p>
        ))}
        {ended && edition.assignments && edition.assignments.length > 0 && (
          <SantaCircle assignments={edition.assignments} viewerId={data.viewerId} />
        )}
        {newer && (ended || edition.phase === "revealed" || edition.phase === "cancelled") && (
          <ButtonLink href={`/challenges/${edition.challenge.id}?edition=${newer.id}`} variant="outline" size="sm">
            {newer.phase === "signup" && !ended ? `Sign-up for ${newer.year} is open` : `Go to Edition ${newer.year}`}
            <ArrowRight aria-hidden />
          </ButtonLink>
        )}
      </div>
    </aside>
  );
}
