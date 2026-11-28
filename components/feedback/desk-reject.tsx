"use client";

import { useState, type FormEvent } from "react";
import type { CSSProperties } from "react";
import { X } from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import { REJECTION_REASON_MAX, validateRejectionReason } from "@/lib/feedback";
import { rejectPicksFor } from "@/lib/feedback-desk";
import { rejectFeedbackAction } from "@/app/actions/feedback-review";
import { useDeskAction } from "@/hooks/use-desk-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { DeskFormFoot } from "./desk-form-foot";
import type { DeskSheetActions } from "./desk-sheet";

const CAPTION = "font-label block text-[0.8rem] font-bold tracking-[0.06em] text-faint-foreground";

// Reject in the review Sheet: the reason its author will read. A Bug Report
// offers "Can't reproduce" and "Working as intended" as quick picks; a pick
// fills the reason, which stays editable. The confirm is signal orange.
export function DeskReject({
  feedback,
  onClose,
  onDecided,
  onGone,
}: { feedback: Feedback; onClose: () => void } & DeskSheetActions) {
  const [reason, setReason] = useState("");
  const action = useDeskAction(() => onGone(feedback.feedback_id));
  const picks = rejectPicksFor(feedback.kind);
  const length = reason.trim().length;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const checked = validateRejectionReason(reason);
    if (!checked.ok) return action.setError(checked.error);
    action.run(
      () => rejectFeedbackAction(feedback.feedback_id, checked.reason),
      (saved, jobId) => onDecided({ feedback: saved, outcome: "rejected", jobId }),
    );
  }

  return (
    <form onSubmit={submit} aria-label={`Reject "${feedback.title}"`} className="space-y-3">
      {picks.length > 0 && (
        <div role="group" aria-labelledby="reject-picks" className="space-y-1.5">
          <span id="reject-picks" className={CAPTION}>
            Quick picks
          </span>
          <div className="flex flex-wrap gap-2" style={{ "--tag-ink": "var(--k)" } as CSSProperties}>
            {picks.map((pick) => (
              <Toggle
                key={pick}
                variant="tag"
                pressed={reason.trim() === pick}
                onPressedChange={(on) => setReason(on ? pick : "")}
              >
                {pick}
              </Toggle>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="reject-reason" className={CAPTION}>
            Reason
          </label>
          <span className={cn("text-[0.78rem]", length > REJECTION_REASON_MAX ? "text-destructive" : "text-faint-foreground")}>
            {length}/{REJECTION_REASON_MAX}
          </span>
        </div>
        <Textarea
          id="reject-reason"
          name="rejection_reason"
          rows={3}
          required
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (action.error) action.setError(null);
          }}
          className="min-h-18 px-3 text-sm md:text-sm"
        />
        <p className="text-[0.82rem] text-faint-foreground">
          The bot posts it to {feedback.created_by_name ?? "its author"} on Discord, and it shows on the
          board&apos;s Closed tab.
        </p>
      </div>
      <DeskFormFoot error={action.error} pending={action.pending} onCancel={onClose}>
        <Button type="submit" variant="destructive-solid" disabled={action.pending}>
          <X data-icon="inline-start" />
          {action.pending ? "Rejecting…" : "Reject"}
        </Button>
      </DeskFormFoot>
    </form>
  );
}
