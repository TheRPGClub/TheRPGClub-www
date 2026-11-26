"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import type { FeedbackKind } from "@/lib/api/types";
import { FEEDBACK_DETAILS_MAX, FEEDBACK_TITLE_MAX } from "@/lib/feedback";
import { previewFeedback } from "@/lib/feedback-preview";
import { createFeedbackAction } from "@/app/actions/feedback";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackField } from "./feedback-field";
import { FeedbackPreview } from "./feedback-preview";
import { FeedbackKindPicker } from "./feedback-kind-picker";

// The Give feedback form (interim until www#226), with a live preview of the
// card it will pin to the board and what happens after.
export function FeedbackForm({ authorId, authorName }: { authorId: string; authorName: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function pick(next: FeedbackKind) {
    setError(null);
    setKind(next);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createFeedbackAction({ kind, title, details });
      if (res.ok && res.data) {
        router.push(`/feedback?pinned=${res.data.feedback_id}`);
      } else {
        setError(res.error ?? "Couldn't submit it. Try again.");
      }
    });
  }

  return (
    <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,640px)_minmax(0,400px)]">
      <form onSubmit={submit} noValidate className="min-w-0">
        <FeedbackField
          id="feedback-title"
          label="Title"
          hint="One line that says what should change."
          length={title.length}
          max={FEEDBACK_TITLE_MAX}
        >
          <Input
            id="feedback-title"
            variant="compose"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            maxLength={FEEDBACK_TITLE_MAX}
            required
            disabled={pending}
            aria-describedby="feedback-title-hint"
            className="mt-1.5 h-9 py-0 text-base md:text-base"
          />
        </FeedbackField>

        <FeedbackField
          id="feedback-details"
          label="Details"
          hint="What it should do, and why it would help."
          length={details.length}
          max={FEEDBACK_DETAILS_MAX}
        >
          <Textarea
            id="feedback-details"
            variant="compose"
            value={details}
            onChange={(e) => {
              setDetails(e.target.value);
              setError(null);
            }}
            maxLength={FEEDBACK_DETAILS_MAX}
            required
            rows={7}
            disabled={pending}
            aria-describedby="feedback-details-hint"
            className="mt-1.5 inline-block min-h-[150px] px-3 py-2 text-base leading-normal field-sizing-fixed md:text-base"
          />
        </FeedbackField>

        <FeedbackKindPicker kind={kind} onPick={pick} disabled={pending} />

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 flex gap-2.5 border-t border-border pt-5">
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send aria-hidden />
            {pending ? "Submitting" : "Submit"}
          </Button>
          <ButtonLink href="/feedback" variant="outline">
            Cancel
          </ButtonLink>
        </div>
      </form>

      <FeedbackPreview
        feedback={previewFeedback({ kind, title, details, authorId, authorName })}
      />
    </div>
  );
}
