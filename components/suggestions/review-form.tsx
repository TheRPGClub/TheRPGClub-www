"use client";

import type { FormEvent } from "react";
import { GitPullRequestArrow, X } from "lucide-react";
import type { Suggestion } from "@/lib/api/types";
import { REJECTION_REASON_MAX, type SuggestionTargetRepo } from "@/lib/suggestions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ReviewRepoChoice } from "./review-repo-choice";
import { Label } from "@/components/ui/label";

const FIELD_LABEL = "font-label text-[0.82rem] tracking-[0.06em] text-faint-foreground";

// The Superadmin's decision under a Pending card: the repo to approve it into,
// or the reason to reject it with.
export function ReviewForm({
  suggestion,
  mode,
  repo,
  onRepo,
  reason,
  onReason,
  pending,
  onCancel,
  onSubmit,
}: {
  suggestion: Suggestion;
  mode: "approve" | "reject";
  repo: SuggestionTargetRepo | null;
  onRepo: (repo: SuggestionTargetRepo) => void;
  reason: string;
  onReason: (reason: string) => void;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  const author = suggestion.created_by_name ?? "its author";
  const length = reason.trim().length;
  return (
    <form
      onSubmit={onSubmit}
      aria-label={
        mode === "approve" ? `Approve "${suggestion.title}"` : `Reject "${suggestion.title}"`
      }
      className="space-y-3 rounded-md border border-highlight bg-card p-3"
    >
      {mode === "approve" ? (
        <ReviewRepoChoice repo={repo} onChange={onRepo} author={author} labelClassName={FIELD_LABEL} />
      ) : (
        <Label variant="frame" className="block space-y-1">
          <span className="flex justify-between gap-3">
            <span className={FIELD_LABEL}>Reason</span>
            <span
              className={cn(
                "text-[0.78rem]",
                length > REJECTION_REASON_MAX ? "text-destructive" : "text-faint-foreground",
              )}
            >
              {length}/{REJECTION_REASON_MAX}
            </span>
          </span>
          <Textarea
            name="rejection_reason"
            rows={3}
            autoFocus
            required
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            className="inline-block min-h-0 min-w-0 px-3 text-sm field-sizing-fixed md:text-sm"
          />
          <span className="block text-[0.82rem] text-faint-foreground">
            The bot posts it to {author} on Discord, and it shows on the Board&apos;s Rejected tab.
          </span>
        </Label>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
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
  );
}
