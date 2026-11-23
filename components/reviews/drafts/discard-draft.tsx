"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteReviewAction, deleteRevisionAction } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Discard on a Draft in the pile. It asks first, in place: the foot turns
// into the question, naming what goes ("Its score and 412 characters go with
// it."), with Keep it and Discard draft.
export function DiscardDraft({
  userId,
  reviewId,
  revisionId = null,
  gameId,
  gameTitle,
  loss,
  children,
  className,
  askingClassName,
}: {
  userId: string;
  reviewId: number;
  // A Draft Revision: only it goes, the Published Review stays.
  revisionId?: number | null;
  gameId: number;
  gameTitle: string;
  // discardLoss's sentence.
  loss: string;
  // What the foot shows while not asking (Last touched, other actions).
  children?: React.ReactNode;
  className?: string;
  // Added while asking, so a grid can give the question a whole row.
  askingClassName?: string;
}) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const discard = () =>
    start(async () => {
      const res =
        revisionId !== null
          ? await deleteRevisionAction(userId, { reviewId, revisionId }, gameId)
          : await deleteReviewAction(userId, reviewId, gameId);
      if (!res.ok) {
        setError(res.error ?? "The draft couldn't be discarded.");
        return;
      }
      router.refresh();
    });

  if (!asking) {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {children}
        <span className="flex-1" />
        <Button
          type="button"
          variant="destructive-ghost"
          size="xs"
          onClick={() => setAsking(true)}
          aria-label={`Discard your draft of ${gameTitle}`}
        >
          <Trash2 />
          Discard
        </Button>
      </div>
    );
  }

  return (
    <div role="alertdialog" aria-label="Discard this draft?" className={cn("flex flex-wrap items-center gap-2", className, askingClassName)}>
      <p className="m-0 basis-full text-[0.88rem] leading-snug text-dim-foreground">
        <b className="font-semibold text-destructive">Discard this draft?</b>{" "}
        {`${loss} This can't be undone.`}
      </p>
      {error && (
        <p role="alert" className="m-0 basis-full text-[0.85rem] text-destructive">
          {error}
        </p>
      )}
      <span className="flex-1" />
      <Button type="button" variant="ghost" size="xs" onClick={() => setAsking(false)} disabled={pending} autoFocus>
        Keep it
      </Button>
      <Button type="button" variant="destructive-solid" size="xs" onClick={discard} disabled={pending}>
        <Trash2 />
        {pending ? "Discarding" : "Discard draft"}
      </Button>
    </div>
  );
}
