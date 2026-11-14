"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, GitPullRequestArrow, X } from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import {
  REJECTION_REASON_MAX,
  SUGGESTION_TARGET_REPOS,
  validateRejectionReason,
  type SuggestionTargetRepo,
} from "@/lib/suggestions";
import {
  approveSuggestionAction,
  rejectSuggestionAction,
} from "@/app/actions/suggestion-review";
import { BotJobStatus } from "@/components/bot-job-status";
import { FOOT_LINK } from "@/components/suggestions/board-card";
import { SuggestionCard } from "@/components/suggestions/suggestion-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "idle" | "approve" | "reject";

const FIELD_LABEL = "font-label text-[0.82rem] tracking-[0.06em] text-faint-foreground";

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
  const ids = useId();
  const [suggestion, setSuggestion] = useState(initial);
  const [mode, setMode] = useState<Mode>("idle");
  const [repo, setRepo] = useState<SuggestionTargetRepo | null>(null);
  const [reason, setReason] = useState("");
  const [jobId, setJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [pending, startTransition] = useTransition();

  const reviewed = suggestion.status !== "pending";
  const author = suggestion.created_by_name ?? "its author";

  function open(next: Mode) {
    setError(null);
    setMode(next);
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (mode === "reject") {
      const checked = validateRejectionReason(reason);
      if (!checked.ok) {
        setError(checked.error);
        return;
      }
    }
    if (mode === "approve" && !repo) {
      setError("Pick the repo its issue goes in.");
      return;
    }
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
      <>
        <button
          type="button"
          onClick={() => open("reject")}
          className={cn(FOOT_LINK, "text-destructive hover:bg-destructive/15")}
        >
          <X aria-hidden />
          Reject
        </button>
        <button
          type="button"
          onClick={() => open("approve")}
          className={cn(
            FOOT_LINK,
            "px-2.5 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-faint-foreground)_60%,transparent)] hover:bg-muted hover:shadow-[inset_0_0_0_1px_var(--color-foreground)]",
          )}
        >
          <Check aria-hidden />
          Approve
        </button>
      </>
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
        <form
          onSubmit={submit}
          aria-label={
            mode === "approve"
              ? `Approve "${suggestion.title}"`
              : `Reject "${suggestion.title}"`
          }
          className="space-y-3 rounded-md border border-highlight bg-card p-3"
        >
          {mode === "approve" ? (
            <fieldset className="space-y-2">
              <legend className={FIELD_LABEL}>Open its GitHub issue in</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {SUGGESTION_TARGET_REPOS.map((r) => (
                  <label
                    key={r.value}
                    className="flex cursor-pointer items-start gap-2 rounded-sm bg-muted px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--color-border-strong)] has-checked:shadow-[inset_0_0_0_2px_var(--color-highlight)] has-focus-visible:ring-2 has-focus-visible:ring-highlight/40"
                  >
                    <input
                      type="radio"
                      name={`${ids}-repo`}
                      value={r.value}
                      checked={repo === r.value}
                      onChange={() => setRepo(r.value)}
                      className="mt-1 accent-highlight"
                    />
                    <span className="min-w-0">
                      <span className="font-label block text-[0.92rem] font-extrabold text-foreground">
                        {r.label}
                      </span>
                      <span className="block text-[0.78rem] text-faint-foreground">
                        {r.blurb}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-[0.82rem] text-faint-foreground">
                The issue takes its title, details and labels. The bot then
                tells {author} on Discord.
              </p>
            </fieldset>
          ) : (
            <label className="block space-y-1">
              <span className="flex justify-between gap-3">
                <span className={FIELD_LABEL}>Reason</span>
                <span
                  className={cn(
                    "text-[0.78rem]",
                    reason.trim().length > REJECTION_REASON_MAX
                      ? "text-destructive"
                      : "text-faint-foreground",
                  )}
                >
                  {reason.trim().length}/{REJECTION_REASON_MAX}
                </span>
              </span>
              <textarea
                name="rejection_reason"
                rows={3}
                autoFocus
                required
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full min-w-0 rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground caret-highlight outline-none focus-visible:border-faint-foreground focus-visible:ring-2 focus-visible:ring-highlight/40"
              />
              <span className="block text-[0.82rem] text-faint-foreground">
                The bot posts it to {author} on Discord, and it shows on the
                Board&apos;s Rejected tab.
              </span>
            </label>
          )}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => open("idle")}
              disabled={pending}
            >
              Cancel
            </Button>
            {mode === "approve" ? (
              <Button type="submit" variant="highlight" disabled={pending || !repo}>
                <GitPullRequestArrow data-icon="inline-start" />
                {pending ? "Opening the issue…" : "Approve and open issue"}
              </Button>
            ) : (
              <Button type="submit" variant="destructive" disabled={pending}>
                <X data-icon="inline-start" />
                {pending ? "Rejecting…" : "Reject"}
              </Button>
            )}
          </div>
        </form>
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
        <BotJobStatus
          jobId={jobId}
          what="The announcement to its author"
          className="px-1"
        />
      )}
    </div>
  );
}
