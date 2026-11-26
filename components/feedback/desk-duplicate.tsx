"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Copy } from "lucide-react";
import type { Feedback } from "@/lib/api/types";
import { feedbackPhase, kindMeta, PHASE_LABEL } from "@/lib/feedback";
import { duplicateButtonLabel, duplicateCandidates, type DuplicateCandidate } from "@/lib/feedback-desk";
import { duplicateFeedbackAction, listDuplicateOriginalsAction } from "@/app/actions/feedback-review";
import { useDeskAction } from "@/hooks/use-desk-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeskFormFoot } from "./desk-form-foot";
import type { DeskSheetActions } from "./desk-sheet";

// Duplicate in the review Sheet: search the original by title (Pending,
// Approved or Done Feedback only, never itself), pick it, then "Mark
// duplicate · N upvotes move there". The originals are read once when the
// tab opens; the API has no title search, so the filter runs here.
export function DeskDuplicate({
  feedback,
  onClose,
  onDecided,
  onGone,
}: { feedback: Feedback; onClose: () => void } & DeskSheetActions) {
  const [originals, setOriginals] = useState<DuplicateCandidate[] | null | "error">(null);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<DuplicateCandidate | null>(null);
  const action = useDeskAction(() => onGone(feedback.feedback_id));

  useEffect(() => {
    let live = true;
    listDuplicateOriginalsAction().then((rows) => live && setOriginals(rows ?? "error"));
    return () => {
      live = false;
    };
  }, []);

  const offered = Array.isArray(originals) ? duplicateCandidates(originals, feedback.feedback_id, query) : [];

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!picked) return action.setError("Pick the Feedback it duplicates.");
    action.run(
      () => duplicateFeedbackAction(feedback.feedback_id, picked.feedback_id),
      (saved, jobId) => onDecided({ feedback: saved, outcome: "duplicate", jobId, originalTitle: picked.title }),
    );
  }

  return (
    <form onSubmit={submit} aria-label={`Mark "${feedback.title}" a Duplicate`} className="space-y-3">
      <label htmlFor="duplicate-search" className="font-label block text-[0.8rem] font-bold tracking-[0.06em] text-faint-foreground uppercase">
        Its original
      </label>
      <Input
        id="duplicate-search"
        type="search"
        placeholder="Search Pending, Approved or Done Feedback"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {originals === null && <p className="text-sm text-faint-foreground">Reading the Feedback…</p>}
      {originals === "error" && (
        <p role="alert" className="text-sm text-destructive">{"Couldn't read the Feedback to pick from."}</p>
      )}
      {Array.isArray(originals) && offered.length === 0 && (
        <p className="text-sm text-faint-foreground">No Pending, Approved or Done Feedback matches.</p>
      )}
      {offered.length > 0 && (
        <ul aria-label="Possible originals" className="space-y-1">
          {offered.map((o) => (
            <li key={o.feedback_id}>
              <Button
                type="button"
                variant="pick-row"
                size="bare"
                aria-pressed={picked?.feedback_id === o.feedback_id}
                onClick={() => setPicked(o)}
                className="flex w-full items-start justify-between gap-3 px-2.5 py-2"
              >
                <span className="min-w-0">
                  <span className="block text-sm leading-snug font-medium text-foreground">{o.title}</span>
                  <span className="block text-[0.78rem] text-faint-foreground">
                    {kindMeta(o.kind).label} · {PHASE_LABEL[feedbackPhase(o)]}
                  </span>
                </span>
                <span className="font-headline text-lg leading-none text-foreground">{o.upvote_count}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <DeskFormFoot error={action.error} pending={action.pending} onCancel={onClose}>
        <Button type="submit" variant="highlight" disabled={action.pending || !picked}>
          <Copy data-icon="inline-start" />
          {action.pending ? "Marking…" : duplicateButtonLabel(feedback.upvote_count)}
        </Button>
      </DeskFormFoot>
    </form>
  );
}
