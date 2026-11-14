import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// The profile's bookcase: every list that isn't being read right now is a
// shelf of closed books. A shelf's label is its link; a spine is a game, its
// cover cropped tall under the title set sideways. Now Playing is the open
// books above the case.

export { Spine, spineHeight } from "@/components/issue/member-shelf-spine";
export { PodiumSpines } from "@/components/issue/member-shelf-podium";

const SPINE_LINK =
  "font-label inline-flex items-center gap-1.5 text-[0.84rem] font-extrabold tracking-[0.08em] text-dim-foreground transition-colors hover:text-highlight [&_svg]:size-3.5 motion-safe:[&_svg]:transition-transform motion-safe:hover:[&_svg]:translate-x-0.5";

export function MemberShelf({
  label,
  count,
  blurb,
  links,
  more,
  empty,
  children,
}: {
  label: string;
  count: number;
  blurb?: ReactNode;
  // The shelf's own links ("Open list", "Compare", "Pick one at random").
  links: { href: string; label: string; icon?: ReactNode }[];
  // Remaining items past the spines shown, with where to see them.
  more?: { count: number; href: string };
  empty: string;
  children?: ReactNode;
}) {
  const id = `shelf-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className="grid gap-3 border-b-[6px] border-muted pt-5 shadow-[0_1px_0_var(--color-border)] sm:grid-cols-[10.5rem_1fr] sm:gap-6"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:flex-col sm:flex-nowrap sm:items-start sm:gap-1.5 sm:pb-4">
        <p className="font-headline text-[2.5rem] leading-[0.82] sm:text-[3.9rem]">
          {count}
        </p>
        <h2 id={id} className="font-headline text-2xl sm:text-[1.65rem]">
          {label}
        </h2>
        {blurb && (
          <p className="hidden text-[0.82rem] leading-snug text-faint-foreground sm:block">
            {blurb}
          </p>
        )}
        <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1.5 sm:mt-1 sm:ml-0 sm:flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={SPINE_LINK}>
              {link.label}
              {link.icon ?? <ArrowRight aria-hidden />}
            </Link>
          ))}
        </div>
      </div>

      {count > 0 && children ? (
        <div className="flex min-h-0 items-end gap-1 overflow-hidden pt-4 sm:min-h-[15.5rem] sm:pt-0">
          {children}
          {more && more.count > 0 && (
            <div className="flex shrink-0 self-stretch items-end pb-3.5 pl-3 max-sm:hidden">
              <Link href={more.href} className={SPINE_LINK}>
                +{more.count} more
                <ArrowRight aria-hidden />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <p className="self-center pb-5 text-sm text-faint-foreground sm:pb-4">
          {empty}
        </p>
      )}
    </section>
  );
}
