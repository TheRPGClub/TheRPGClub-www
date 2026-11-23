"use client";

import { useRouter } from "next/navigation";
import { EyeOff, Pencil, X } from "lucide-react";

import { deleteRevisionAction } from "@/app/actions/reviews";
import { Button, ButtonLink } from "@/components/ui/button";
import { useTakeDelete } from "@/hooks/use-take-delete";
import type { ReviewRevision } from "@/lib/api/types";
import { draftLoss, lastTouched } from "@/lib/reviews/drafts";
import { editRuleDate } from "@/lib/reviews/edit-rules";
import { reviewHref } from "@/lib/reviews/href";
import { scoreChange } from "@/lib/reviews/takes";
import { cn } from "@/lib/utils";
import { DashedSpine, PencilDot, STOP_ROW } from "./revisit-stop";
import { TakeConfirm } from "./take-confirm";

// The author's Draft Revision, in the Revisit stop's place at the top of the
// score line: a dashed yellow stop with its score so far, Keep writing and
// Discard draft. Nobody else sees it, and nothing below moves until it is
// published.
export function DraftRevisionStop({
  draft,
  owner,
  now,
}: {
  draft: ReviewRevision;
  owner: { userId: string; reviewId: number; gameId: number };
  now: number;
}) {
  const router = useRouter();
  const discard = useTakeDelete(
    () => deleteRevisionAction(owner.userId, { reviewId: owner.reviewId, revisionId: draft.revision_id }, owner.gameId),
    () => router.refresh(),
  );
  const box = "font-headline grid place-items-center rounded-[3px] leading-none text-highlight shadow-[inset_0_0_0_2px_var(--color-highlight)]";
  const change = draft.rating !== null ? scoreChange(draft.rating, draft.previous_rating) : "No score yet";
  return (
    <section aria-label="Your draft revision" className={STOP_ROW}>
      <DashedSpine />
      <div className="relative text-right max-md:hidden">
        <PencilDot hollow />
        <span className="font-label block text-[0.74rem] leading-[1.4] font-extrabold tracking-[0.08em] text-highlight uppercase">
          Draft
        </span>
        <span className={cn(box, "mt-2 inline-grid size-[54px] text-[2.1rem]")}>{draft.rating ?? "—"}</span>
        <span className="font-label mt-1.5 block text-[0.74rem] font-extrabold tracking-[0.06em] text-faint-foreground uppercase">
          {change}
        </span>
      </div>
      <div className="min-w-0 space-y-3">
        <div className="rounded-[3px] border-[1.5px] border-dashed border-highlight px-4 py-3.5">
          <p className="font-label m-0 flex items-center gap-1.5 text-[0.8rem] font-extrabold tracking-[0.08em] text-highlight uppercase [&_svg]:size-4">
            <EyeOff aria-hidden />
            Draft revision · only you see this
            <span className={cn(box, "ml-auto size-9 text-[1.35rem] md:hidden")}>{draft.rating ?? "—"}</span>
          </p>
          <p className="mt-2 mb-3 text-[0.92rem] text-dim-foreground">
            Started {editRuleDate(draft.created_at)}, saved {lastTouched(draft.updated_at, now)}.
            {draft.previous_rating !== null && ` The review still shows ${draft.previous_rating}`}
            {draft.previous_rating !== null ? " and nothing" : " Nothing"} on the score line below moves until you publish.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={reviewHref(owner.reviewId, { revisit: true })} variant="highlight" size="sm">
              <Pencil />
              Keep writing
            </ButtonLink>
            <Button type="button" variant="destructive-ghost" size="sm" onClick={discard.ask} aria-expanded={discard.asking}>
              <X />
              Discard draft
            </Button>
          </div>
        </div>
        {discard.asking && (
          <TakeConfirm
            title="Discard this draft?"
            note={draftLoss(draft)}
            confirmLabel="Discard draft"
            keepLabel="Keep writing"
            pending={discard.pending}
            error={discard.error}
            onConfirm={discard.confirm}
            onKeep={discard.keep}
          />
        )}
      </div>
    </section>
  );
}
