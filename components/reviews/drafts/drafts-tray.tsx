import { ArrowLeft } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import type { ReviewDraftEntry } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { DraftCard } from "./draft-card";

// The recessed tray the Drafts lie in, three pages to a row. Empty, the tray
// stays as the well with a short note.
export function DraftsTray({
  drafts,
  now,
  emptyHref = "/reviews",
  className,
}: {
  drafts: ReviewDraftEntry[];
  now: number;
  // Where the empty tray's way out goes.
  emptyHref?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[3.2px] bg-muted p-3.5 shadow-[inset_0_3px_10px_rgb(0_0_0/0.55)] sm:p-[22px]",
        className,
      )}
    >
      {drafts.length === 0 ? (
        <div className="px-4 pt-12 pb-14 text-center sm:px-8">
          <h2 className="font-headline m-0 text-[2.4rem] leading-none">No drafts</h2>
          <p className="mx-auto mt-2.5 mb-[18px] max-w-[52ch] text-dim-foreground">
            A review you start in the full editor saves here as you write, until you publish it.
          </p>
          <ButtonLink href={emptyHref} variant="outline">
            <ArrowLeft data-icon="inline-start" />
            Back to reviews
          </ButtonLink>
        </div>
      ) : (
        <ul className="m-0 grid list-none gap-[18px] p-0 md:grid-cols-2 xl:grid-cols-3">
          {drafts.map((draft) => (
            <li key={draft.review_id} className="min-w-0">
              <DraftCard draft={draft} now={now} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
