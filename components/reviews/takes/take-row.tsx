"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

import { deleteRevisionAction } from "@/app/actions/reviews";
import { Button, ButtonLink } from "@/components/ui/button";
import { useTakeDelete } from "@/hooks/use-take-delete";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { reviewHref, takeAnchor } from "@/lib/reviews/href";
import type { Take } from "@/lib/reviews/takes";
import { cn } from "@/lib/utils";
import { TakeConfirm } from "./take-confirm";
import { SPINE_LINE, TakeStop } from "./take-stop";

// One take on the score line: its stop in the left margin, the take itself
// in the reading column, and its scorecard in the right margin (under the
// take until there is room beside it). The author gets Edit, and on a
// Revision Delete revision, whose question opens above the take.
export function TakeRow({
  take,
  accent,
  owner,
  last,
  deleteNote,
  scorecard,
  children,
}: {
  take: Take;
  accent: ReviewAccent;
  // The author's controls, when the viewer wrote it.
  owner: { userId: string; reviewId: number; gameId: number } | null;
  // The foot of the spine: the line stops at this stop.
  last: boolean;
  // What deleting this Revision does to the score.
  deleteNote: string;
  scorecard: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const revisionId = take.revisionId;
  const del = useTakeDelete(
    () =>
      owner && revisionId !== null
        ? deleteRevisionAction(owner.userId, { reviewId: owner.reviewId, revisionId }, owner.gameId)
        : Promise.resolve({ ok: false }),
    () => router.refresh(),
  );

  const controls = owner && (
    <>
      <ButtonLink
        href={revisionId === null ? reviewHref(owner.reviewId, { edit: true }) : reviewHref(owner.reviewId, { revision: revisionId })}
        variant="ghost"
        size="xs"
      >
        <Pencil />
        Edit
      </ButtonLink>
      {revisionId !== null && (
        <Button type="button" variant="destructive-ghost" size="xs" onClick={del.ask} aria-expanded={del.asking}>
          <Trash2 />
          Delete revision
        </Button>
      )}
    </>
  );

  return (
    <article
      id={revisionId === null ? undefined : takeAnchor(revisionId)}
      aria-label={take.label}
      className="relative grid scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-y-4 pb-11 md:grid-cols-[150px_minmax(0,1fr)] md:gap-x-10 xl:grid-cols-[190px_minmax(0,66ch)_minmax(13rem,1fr)]"
    >
      <span
        aria-hidden
        className={cn("absolute top-2 hidden w-0.5 bg-border-strong md:block", SPINE_LINE, last ? "bottom-0" : "-bottom-2")}
      />
      <TakeStop take={take} accent={accent} controls={controls} />
      <div className="min-w-0 space-y-4">
        {del.asking && (
          <TakeConfirm
            title={`Delete ${take.label}?`}
            note={deleteNote}
            confirmLabel="Delete revision"
            pending={del.pending}
            error={del.error}
            onConfirm={del.confirm}
            onKeep={del.keep}
          />
        )}
        {children}
      </div>
      <div className="min-w-0 md:col-start-2 xl:col-start-3 xl:row-start-1">{scorecard}</div>
    </article>
  );
}
