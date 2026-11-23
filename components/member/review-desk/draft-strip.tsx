"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AutosaveStatus } from "@/lib/reviews/autosave";
import type { DraftChecklist } from "@/lib/reviews/draft";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { DraftChecks } from "./draft-checks";
import { DraftRegister } from "./draft-register";

// The printer's colour bar along the strip's top edge, in the paper tones
// and the game's track ink.
const TRACK_INK: Record<ReviewAccent, string> = {
  brand: "bg-gotm",
  purple: "bg-nr",
  neutral: "bg-foreground",
};

// The strip along the desk's foot while a Draft is written, held at the
// bottom of the screen: the autosave's register square, the checklist, then
// Discard draft and Publish. Discard turns the strip into its question. On
// a phone it rides above the tab bar and its round button.
export function DraftStrip({
  status,
  onRetry,
  checks,
  onScore,
  accent,
  pending,
  discardLoss,
  onDiscard,
  onPublish,
}: {
  status: AutosaveStatus;
  onRetry: () => void;
  checks: DraftChecklist;
  onScore: () => void;
  accent: ReviewAccent;
  pending: boolean;
  // "Its score, scorecard and 412 characters go with it."
  discardLoss: string;
  onDiscard: () => void;
  onPublish: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const reasonId = useId();
  const ink = TRACK_INK[accent];
  const bar = [
    "bg-foreground", "bg-dim-foreground", "bg-faint-foreground", "bg-border-strong", ink, "bg-muted",
    "bg-foreground", "bg-faint-foreground", ink, "bg-border-strong", "bg-dim-foreground", "bg-muted",
  ];

  return (
    <div
      className={cn(
        "sticky bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-20 rounded-sm border bg-background shadow-[0_-10px_30px_rgb(0_0_0/0.45)] md:bottom-4",
        confirming ? "border-destructive" : "border-border-strong",
      )}
    >
      <div aria-hidden className="flex h-1.5">
        {bar.map((c, i) => (
          <i key={i} className={cn("flex-1", c)} />
        ))}
      </div>
      {confirming ? (
        <div role="alertdialog" aria-label="Discard this draft?" className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5">
          <p className="m-0 flex-[1_1_100%] text-[0.94rem] text-dim-foreground sm:flex-1">
            <b className="font-semibold text-destructive">Discard this draft?</b>{" "}
            {`${discardLoss} This can't be undone.`}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending} autoFocus>
            Keep writing
          </Button>
          <Button type="button" variant="destructive-solid" size="sm" onClick={onDiscard} disabled={pending}>
            <Trash2 />
            Discard draft
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-3.5 py-2.5">
          <DraftRegister status={status} onRetry={onRetry} />
          <span className="font-label hidden text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase lg:inline">
            only you can see it
          </span>
          <span className="flex-1" />
          <DraftChecks checks={checks} onScore={onScore} reasonId={reasonId} />
          <span aria-hidden className="hidden w-px self-stretch bg-border-strong sm:block" />
          <span className="ml-auto flex items-center gap-2 sm:ml-0">
            <Button type="button" variant="destructive-ghost" size="sm" onClick={() => setConfirming(true)} disabled={pending}>
              <Trash2 />
              Discard<span className="hidden sm:inline">draft</span>
            </Button>
            <Button
              type="button"
              variant="highlight"
              onClick={onPublish}
              disabled={pending || !checks.score}
              aria-describedby={checks.score ? undefined : reasonId}
            >
              Publish review
            </Button>
          </span>
        </div>
      )}
    </div>
  );
}
