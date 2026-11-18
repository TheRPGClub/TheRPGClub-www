import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { headingLinkClass } from "@/components/templates/page-header";

const NOTE = "flex min-h-64 flex-col justify-end gap-3 rounded-md border border-dashed border-border-strong p-7";

// No winners this round yet: the cover waits for the vote.
export function NoRound() {
  return (
    <section className={NOTE}>
      <h2 className="font-headline text-4xl">No winners yet</h2>
      <p className="max-w-[48ch] text-dim-foreground">
        This round&apos;s Game of the Month hasn&apos;t been decided. Once the
        vote is in, the winners land here.
      </p>
      <Link href="/gotm" className={headingLinkClass}>
        Full history
        <ArrowRight aria-hidden />
      </Link>
    </section>
  );
}

// Voting & GOTM is hidden from this viewer: nothing to put on the cover.
// Upcoming Birthdays belong to no Feature, so their line (`birthdays`, or
// nothing) still sits under the note.
export function NoVoting({ birthdays }: { birthdays?: React.ReactNode }) {
  return (
    <div className="space-y-10">
      <section className={NOTE}>
        <h2 className="font-headline text-4xl">Nothing on the cover</h2>
        <p className="max-w-[48ch] text-dim-foreground">
          Game of the Month is taking a break. The rounds and their winners will
          be back here when it returns.
        </p>
      </section>
      {birthdays}
    </div>
  );
}
