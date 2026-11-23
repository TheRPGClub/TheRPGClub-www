"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { AutosaveStatus } from "@/lib/reviews/autosave";
import type { DraftChecklist } from "@/lib/reviews/draft";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { DraftChecks } from "./draft-checks";
import { DraftRegister } from "./draft-register";
import { DeskStrip } from "./desk-strip";

// The strip along the desk's foot while a Draft is written, held at the
// bottom of the screen: the autosave's register square, the checklist, then
// Discard draft and Publish. Discard turns the strip into its question.
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
  revision = false,
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
  // A Draft Revision: the register says Revision and Publish says so too.
  revision?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const reasonId = useId();

  return (
    <DeskStrip accent={accent} alarm={confirming}>
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
          <DraftRegister status={status} onRetry={onRetry} label={revision ? "Revision" : "Draft"} />
          <span className="font-label hidden text-[0.72rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase lg:inline">
            {revision ? "only you can see it until you publish" : "only you can see it"}
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
              {revision ? "Publish revision" : "Publish review"}
            </Button>
          </span>
        </div>
      )}
    </DeskStrip>
  );
}
