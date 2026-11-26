"use client";

import { useState, type FormEvent } from "react";
import { GitPullRequestArrow } from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import type { FeedbackTargetRepo } from "@/lib/feedback";
import { defaultRepoFor } from "@/lib/feedback-desk";
import { approveFeedbackAction } from "@/app/actions/feedback-review";
import { useDeskAction } from "@/hooks/use-desk-action";
import { Button } from "@/components/ui/button";
import { DeskFormFoot } from "./desk-form-foot";
import { DeskRepoChoice } from "./desk-repo-choice";
import type { DeskSheetActions } from "./desk-sheet";

const LEGEND = "font-label text-[0.8rem] font-bold tracking-[0.06em] text-faint-foreground uppercase";

// Approve in the review Sheet: the repo its GitHub issue opens in (a Bug
// Report's Where picks Bot or Website for you), then "Approve and open issue".
export function DeskApprove({
  feedback,
  onClose,
  onDecided,
  onGone,
}: { feedback: Feedback; onClose: () => void } & DeskSheetActions) {
  const [repo, setRepo] = useState<FeedbackTargetRepo | null>(() => defaultRepoFor(feedback));
  const action = useDeskAction(() => onGone(feedback.feedback_id));

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!repo) return action.setError("Pick the repo its issue goes in.");
    action.run(
      () => approveFeedbackAction(feedback.feedback_id, repo),
      (saved, jobId) => onDecided({ feedback: saved, outcome: "approved", jobId }),
    );
  }

  return (
    <form onSubmit={submit} aria-label={`Approve "${feedback.title}"`} className="space-y-3">
      <DeskRepoChoice
        repo={repo}
        onChange={setRepo}
        author={feedback.created_by_name ?? "its author"}
        labelClassName={LEGEND}
      />
      <DeskFormFoot error={action.error} pending={action.pending} onCancel={onClose}>
        <Button type="submit" variant="highlight" disabled={action.pending || !repo}>
          <GitPullRequestArrow data-icon="inline-start" />
          {action.pending ? "Opening the issue…" : "Approve and open issue"}
        </Button>
      </DeskFormFoot>
    </form>
  );
}
