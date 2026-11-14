"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Suggestion } from "@/lib/api/types";
import { validateRejectionReason, type SuggestionTargetRepo } from "@/lib/suggestions";
import {
  approveSuggestionAction,
  rejectSuggestionAction,
} from "@/app/actions/suggestion-review";
import { BotJobStatus } from "@/components/bot-job-status";
import { Button } from "@/components/ui/button";
import { ReviewCardActions } from "./review-card-actions";
import { ReviewForm } from "./review-form";
import { SuggestionCard } from "./suggestion-card";

type Mode = "idle" | "approve" | "reject";

// A Pending Suggestion in the Superadmin's queue: the board's card with
// Approve and Reject in its footer. Approve asks which repo the GitHub issue
// goes in; Reject asks for the reason the author will read. Once decided,
// the card shows the outcome and the bot's announcement job, and stays put
// until the page is refreshed.
export function ReviewCard({
  suggestion: initial,
  reviewerName,
}: {
  suggestion: Suggestion;
  // The signed-in Superadmin, for the rejection slip.
  reviewerName: string;
}) {
  const router = useRouter();
  const [suggestion, setSuggestion] = useState(initial);
  const [mode, setMode] = useState<Mode>("idle");
  const [repo, setRepo] = useState<SuggestionTargetRepo | null>(null);
  const [reason, setReason] = useState("");
  const [jobId, setJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [pending, startTransition] = useTransition();

  const reviewed = suggestion.status !== "pending";

  function open(next: Mode) {
    setError(null);
    setMode(next);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (mode === "reject") {
      const checked = validateRejectionReason(reason);
      if (!checked.ok) return setError(checked.error);
    }
    if (mode === "approve" && !repo) return setError("Pick the repo its issue goes in.");
    startTransition(async () => {
      const res =
        mode === "approve" && repo
          ? await approveSuggestionAction(suggestion.suggestion_id, repo)
          : await rejectSuggestionAction(suggestion.suggestion_id, reason);
      if (res.ok && res.data) {
        setSuggestion(res.data);
        setJobId(res.outcomeJobId ?? null);
        setMode("idle");
      } else {
        setError(res.error ?? "Couldn't save the review.");
        setStale(!!res.stale);
      }
    });
  }

  const actions =
    !reviewed && mode === "idle" && !stale ? (
      <ReviewCardActions onReject={() => open("reject")} onApprove={() => open("approve")} />
    ) : undefined;

  return (
    <div className="space-y-3">
      <SuggestionCard
        suggestion={suggestion}
        tilted={false}
        headingLevel="h2"
        reviewerName={suggestion.status === "rejected" ? reviewerName : null}
        actions={actions}
        highlight={mode !== "idle"}
      />

      {!reviewed && mode !== "idle" && (
        <ReviewForm
          suggestion={suggestion}
          mode={mode}
          repo={repo}
          onRepo={setRepo}
          reason={reason}
          onReason={(next) => {
            setReason(next);
            if (error) setError(null);
          }}
          pending={pending}
          onCancel={() => open("idle")}
          onSubmit={submit}
        />
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-2 px-1 text-sm text-destructive">
          <span>{error}</span>
          {stale && (
            <Button size="sm" variant="outline" onClick={() => router.refresh()}>
              Refresh the queue
            </Button>
          )}
        </div>
      )}

      {jobId !== null && (
        <BotJobStatus jobId={jobId} what="The announcement to its author" className="px-1" />
      )}
    </div>
  );
}
