import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { draftHref } from "@/lib/reviews/drafts";
import { ButtonLink } from "@/components/ui/button";
import type { ReviewDraftEntry } from "@/lib/api/types";
import { DraftPaper } from "./draft-paper";
import { DraftFirstLine, DraftPills, DraftScoreBox, DraftTouched } from "./draft-parts";

const NAMED = 3;

// The Review Feed's compact drafts row, only ever the viewer's own. One Draft
// is a dog-eared page to continue in place; several are one page with an edge
// under it per extra Draft (up to three): the count, the newest few by name
// (each continues that Draft) and Your drafts. With none it isn't drawn.
export function DraftsRow({
  drafts,
  total,
  now,
}: {
  // The newest first, as the listing serves them.
  drafts: ReviewDraftEntry[];
  total: number;
  now: number;
}) {
  if (total === 0 || drafts.length === 0) return null;
  const newest = drafts[0];
  const row = "flex flex-wrap items-center gap-x-[18px] gap-y-2.5 py-3 pr-[26px] pl-3 sm:min-h-[66px] sm:flex-nowrap sm:pr-[30px] sm:pl-4";

  if (total === 1) {
    return (
      <section aria-label="Your draft" className="mt-4.5">
        <DraftPaper fold={20} className={row}>
          <DraftScoreBox rating={newest.rating} size="sm" />
          <div className="min-w-0 flex-1 basis-[calc(100%-70px)] sm:basis-auto">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="font-label m-0 text-[1.05rem] leading-[1.1] font-extrabold tracking-[0.03em]">
                {newest.game?.title ?? "Game"}
              </p>
              <DraftPills game={newest.game} kind={newest.kind} previousRating={newest.previous_rating} />
            </div>
            <DraftFirstLine draft={newest} lines={1} className="mt-1 text-[0.92rem]" />
          </div>
          <div className="flex shrink-0 basis-full items-center justify-between gap-2 sm:basis-auto">
            <DraftTouched at={newest.updated_at} now={now} className="max-sm:hidden" />
            <ButtonLink href={draftHref(newest)} variant="dog-ear" className="max-sm:ml-auto">
              Continue writing
              <ArrowRight data-icon="inline-end" />
            </ButtonLink>
          </div>
        </DraftPaper>
      </section>
    );
  }

  const named = drafts.slice(0, NAMED);
  const more = total - named.length;
  return (
    <section aria-label="Your drafts" className="mt-4.5">
      <DraftPaper fold={20} edges={total - 1} edgeStep={3.5} className={row}>
        <p className="m-0 flex shrink-0 items-baseline gap-1.5">
          <b className="font-headline text-[2.6rem] leading-[0.85] font-normal">{total}</b>
          <span className="font-label text-[0.9rem] font-extrabold text-dim-foreground">drafts</span>
        </p>
        <ul className="order-3 m-0 flex min-w-0 flex-1 basis-full list-none flex-wrap gap-x-4 gap-y-2 p-0 sm:order-none sm:basis-auto sm:flex-nowrap sm:overflow-hidden">
          {named.map((d) => (
            <li key={d.review_id} className="min-w-0 shrink">
              <Link
                href={draftHref(d)}
                className="font-label flex min-w-0 items-center gap-[7px] text-[0.92rem] font-extrabold tracking-[0.04em] whitespace-nowrap hover:text-highlight"
              >
                <i aria-hidden className="size-[9px] shrink-0 bg-highlight [clip-path:polygon(0_0,0_100%,100%_100%)]" />
                <span className="truncate">{d.game?.title ?? "Game"}</span>
              </Link>
            </li>
          ))}
          {more > 0 && (
            <li className="font-label shrink-0 text-[0.92rem] font-extrabold tracking-[0.04em] whitespace-nowrap text-dim-foreground">
              +{more} more
            </li>
          )}
        </ul>
        <div className="order-4 flex shrink-0 basis-full items-center justify-between gap-2 sm:order-none sm:basis-auto">
          <DraftTouched at={newest.updated_at} now={now} className="max-sm:hidden" />
          <ButtonLink href="/reviews/drafts" variant="dog-ear" className="max-sm:ml-auto">
            Your drafts
            <ArrowRight data-icon="inline-end" />
          </ButtonLink>
        </div>
      </DraftPaper>
    </section>
  );
}
