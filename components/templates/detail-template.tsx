import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  SectionHeading,
  headingLinkClass,
} from "@/components/templates/page-header";

// The detail template: one thing's own page, read top to bottom. A hero
// opens it (the game's cover story, the member's banner, an Achievement
// Set's masthead, a review's banner), then its sections follow in reading
// order. The game page, the single review page, the Member profile and the
// Achievement Set page share it.
//
// The template owns the order and the section frame; each page keeps its own
// rhythm through `className` (layout only: `space-y-10`, `flex flex-col
// gap-8`, or margins on the sections themselves when the gaps differ).

export interface DetailTemplateProps {
  // The page's opening: a banner, a cover story or a masthead.
  hero: ReactNode;
  // The sections, in reading order: `DetailSection`s, or a page's own blocks
  // (the game's ballot strip and reviews-and-rail columns, the member's
  // shelves). Streamed sections can sit here inside their own Suspense.
  children: ReactNode;
  // Layout only: the rhythm between the hero and the sections.
  className?: string;
}

export function DetailTemplate({ hero, children, className }: DetailTemplateProps) {
  return (
    <div className={className}>
      {hero}
      {children}
    </div>
  );
}

export interface DetailSectionProps {
  // The heading's id; the section is labelled by it (and it is the anchor).
  id: string;
  title: ReactNode;
  // A tally beside the title, e.g. "3 reviews".
  count?: ReactNode;
  // Trailing on the heading's baseline, usually a `SectionLink`.
  action?: ReactNode;
  // h2 by default; h3 for a department inside a section.
  as?: "h2" | "h3";
  // Layout only, on the section (`space-y-4`, `mt-10`, `min-w-0`).
  className?: string;
  // Layout only, on the heading (`mb-4` when the section has no gap).
  headingClassName?: string;
  children: ReactNode;
}

// One department of a detail page: a section named by its masthead heading.
export function DetailSection({
  id,
  title,
  count,
  action,
  as,
  className,
  headingClassName,
  children,
}: DetailSectionProps) {
  return (
    <section aria-labelledby={id} className={className}>
      <SectionHeading
        title={<span id={id}>{title}</span>}
        count={count}
        action={action}
        as={as}
        className={headingClassName}
      />
      {children}
    </section>
  );
}

// The "All 12 reviews →" link beside a section heading.
export function SectionLink({
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "className">) {
  return (
    <Link {...props} className={headingLinkClass}>
      {children}
      <ArrowRight aria-hidden />
    </Link>
  );
}
