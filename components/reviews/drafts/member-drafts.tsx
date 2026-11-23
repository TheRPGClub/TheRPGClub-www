import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionHeading, headingLinkClass } from "@/components/templates/page-header";
import type { DraftsPage } from "@/lib/reviews/drafts-read";
import { draftCount } from "@/lib/reviews/drafts";
import { DraftsTray } from "./drafts-tray";

// Your own reviews page, with Drafts: the Drafts lie in their tray first,
// apart, and the Published reviews follow under their own heading, never
// mixed. Without Drafts the page is the Published list alone.
export function MemberDrafts({
  read,
  publishedCount,
  children,
}: {
  read: DraftsPage | null;
  publishedCount: number;
  // The Published list.
  children: React.ReactNode;
}) {
  if (!read || read.total === 0) return <>{children}</>;
  const more = read.total > read.drafts.length;
  return (
    <div className="space-y-10">
      <section aria-labelledby="your-drafts" className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 id="your-drafts" className="font-headline m-0 text-3xl leading-none">
            Drafts
          </h2>
          <span className="font-label text-[0.82rem] font-bold text-faint-foreground">
            {read.total} · only you see these
          </span>
          {more && (
            <Link href="/reviews/drafts" className={`${headingLinkClass} ml-auto`}>
              All {draftCount(read.total)}
              <ArrowRight aria-hidden />
            </Link>
          )}
        </div>
        <DraftsTray drafts={read.drafts} now={read.now} />
      </section>
      <section className="space-y-4">
        <SectionHeading
          as="h2"
          title="Published"
          count={`${publishedCount} ${publishedCount === 1 ? "review" : "reviews"}`}
        />
        {children}
      </section>
    </div>
  );
}
