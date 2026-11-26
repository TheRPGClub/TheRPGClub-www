"use client";

import { X } from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import { issueRef, kindMeta } from "@/lib/feedback";
import { BotJobStatus } from "@/components/bot-job-status";
import { Button } from "@/components/ui/button";

export interface DeskDecision {
  feedback: Feedback;
  outcome: "approved" | "rejected" | "duplicate";
  // The feedback_outcome bot job announcing it to the author.
  jobId: number | null;
  // A Duplicate's original: its title, and its id and fresh copy (null when
  // it couldn't be read) so its lane can count the moved upvotes.
  originalTitle?: string;
  originalId?: number;
  original?: Feedback | null;
}

function sentence(d: DeskDecision): string {
  const what = `${kindMeta(d.feedback.kind).label} "${d.feedback.title}"`;
  if (d.outcome === "approved") {
    const ref = issueRef(d.feedback);
    return `Approved ${what}${ref ? `: ${ref}` : ""}.`;
  }
  if (d.outcome === "rejected") return `Rejected ${what}.`;
  return `Marked ${what} a Duplicate of "${d.originalTitle ?? "its original"}"; its upvotes moved there.`;
}

// The desk's last decision, once its card has left the lane: what happened
// and whether the bot has told the author yet.
export function DeskNotice({ decision, onDismiss }: { decision: DeskDecision; onDismiss: () => void }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-sm border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm text-foreground">
          {sentence(decision)}{" "}
          {decision.feedback.github_issue_url && (
            <a
              href={decision.feedback.github_issue_url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-gotm decoration-2 underline-offset-4 hover:text-highlight"
            >
              Open the issue
            </a>
          )}
        </p>
        {decision.jobId !== null && (
          <BotJobStatus jobId={decision.jobId} what="The announcement to its author" />
        )}
      </div>
      <Button variant="clear" size="icon-sm" onClick={onDismiss} aria-label="Dismiss">
        <X aria-hidden />
      </Button>
    </div>
  );
}
