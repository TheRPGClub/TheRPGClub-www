import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CodexEntryLink } from "@/lib/codex/types";

// See also under a History Event (www#127, design 2B): "See also" in label
// caps, then each linked entry's title with the masthead-red underline and
// an arrow. `links` is already what this reader may see (a Visitor gets
// History Events only); none, and nothing shows.
export function HistorySeeAlso({
  links,
  href,
}: {
  links: readonly CodexEntryLink[];
  href: (link: CodexEntryLink) => string;
}) {
  if (links.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <span className="font-label text-[0.78rem] leading-none font-bold tracking-[0.08em] text-faint-foreground uppercase">
        See also
      </span>
      {links.map((link) => (
        <Link
          key={link.id}
          href={href(link)}
          className="inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-highlight"
        >
          {link.title}
          <ArrowRight aria-hidden className="size-3.5 shrink-0" />
        </Link>
      ))}
    </div>
  );
}
