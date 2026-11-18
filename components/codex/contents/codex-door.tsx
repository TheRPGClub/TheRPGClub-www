import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

// One part's door on the contents page (1C): the part's ink as the whole
// door with ink type, its count as a monumental numeral, its name, a line on
// what it holds, and under an ink rule its newest entry and the ways in. The
// whole door opens its part (its name's link stretches over it, with the
// yellow focus ring round the door); the links inside stay their own.
export function CodexDoor({
  ink,
  count,
  name,
  blurb,
  label,
  latest,
  empty,
  openHref,
  openLabel,
  addHref,
  isPublic = false,
}: {
  ink: string;
  count: number;
  name: string;
  blurb: string;
  // "Newest Fun Fact · by Grindlord".
  label: string;
  latest: ReactNode | null;
  empty: string;
  openHref: string;
  openLabel: string;
  addHref?: string | null;
  isPublic?: boolean;
}) {
  return (
    <article className={cn("relative flex flex-col rounded-md px-6 pt-6 pb-5.5 text-background has-[a[data-door]:focus-visible]:ring-3 has-[a[data-door]:focus-visible]:ring-highlight lg:min-h-[27.5rem]", ink)}>
      {isPublic && (
        <span className="font-label absolute top-5.5 right-5.5 z-10 inline-flex items-center gap-1.5 rounded-xs px-2 py-1.5 text-[0.78rem] font-extrabold tracking-[0.08em] shadow-[inset_0_0_0_1.5px_currentColor]">
          <Eye aria-hidden className="size-3.5" />
          Public
        </span>
      )}
      <p className="font-headline text-[5.5rem] leading-[0.8] tracking-[-0.01em] sm:text-[7.5rem]">{count}</p>
      <h2 className="font-headline mt-3.5 mb-2.5 text-[2.25rem] leading-[0.9] sm:text-[2.75rem]">
        <Link href={openHref} data-door className="outline-none after:absolute after:inset-0 after:rounded-md hover:underline hover:decoration-2 hover:underline-offset-4">
          {name}
        </Link>
      </h2>
      <p className="max-w-[34ch] text-[0.97rem] leading-[1.45] text-background/80">{blurb}</p>
      <div className="mt-6 border-t-2 border-background pt-3 lg:mt-auto">
        <p className="font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-background/70">
          {latest ? label : empty}
        </p>
        {latest && <div className="pointer-events-none relative z-10 mt-1 mb-3.5 text-[1.0625rem] leading-[1.3] font-semibold [&_a]:pointer-events-auto">{latest}</div>}
        <div className={cn("relative z-10 flex flex-wrap gap-2", !latest && "mt-3.5")}>
          <ButtonLink href={openHref} variant="inverse">
            {openLabel}
            <ArrowRight aria-hidden data-icon="inline-end" />
          </ButtonLink>
          {addHref && (
            <ButtonLink href={addHref} variant="inverse-outline" aria-label={`Add to ${name}`}>
              <Plus aria-hidden data-icon="inline-start" />
              Add
            </ButtonLink>
          )}
        </div>
      </div>
    </article>
  );
}
