"use client";

import type { CSSProperties } from "react";
import { Send } from "lucide-react";
import type { Feedback, FeedbackKind } from "@/lib/api/types";
import { FEEDBACK_DETAILS_MAX, FEEDBACK_TITLE_MAX, kindMeta } from "@/lib/feedback";
import { useFeedbackForm } from "@/hooks/use-feedback-form";
import { Button } from "@/components/ui/button";
import { DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BugFields } from "./bug-fields";
import { FormRow } from "./form-row";
import { KindHeader } from "./kind-header";
import { ScreenshotField } from "./screenshot-field";

// The Give feedback dialog's card (the locked "card-inked" sketch): its
// header and every stroke, caption and choice in the kind's ink, the fields
// in one column (Title, then Details, or a Bug Report's own rows and its
// screenshot), Cancel and "Post to the board" (or Save, editing) below.
export function FeedbackForm({
  kind: initialKind,
  feedback,
  onCancel,
}: {
  kind: FeedbackKind;
  feedback: Feedback | null;
  onCancel: (savedId: number) => void;
}) {
  const form = useFeedbackForm({ kind: initialKind, feedback });
  const { kind, fields, set, pending, error } = form;
  const bug = kind === "bug_report";

  return (
    <DialogContent
      variant="kind-card"
      showCloseButton={false}
      style={{ "--k": kindMeta(kind).ink } as CSSProperties}
      className="max-h-[calc(100dvh-2rem)] w-[calc(100%-1.5rem)] max-w-[760px] gap-0 p-0 sm:max-h-[calc(100dvh-4rem)] sm:p-0"
    >
      <form onSubmit={form.submit} noValidate>
        <KindHeader kind={kind} editing={form.editing} onKind={form.setKind} disabled={pending} />
        <FormRow id="feedback-title" label="Title">
          <Input
            id="feedback-title"
            variant="kind-title"
            value={fields.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={FEEDBACK_TITLE_MAX}
            required
            disabled={pending}
            className="h-auto px-3 py-2 text-[1.45rem] leading-tight md:text-[1.45rem]"
          />
        </FormRow>
        {bug ? (
          <>
            <BugFields form={form} />
            <ScreenshotField form={form} />
          </>
        ) : (
          <FormRow id="feedback-details" label="Details">
            <Textarea
              id="feedback-details"
              variant="kind"
              value={fields.details}
              onChange={(e) => set("details", e.target.value)}
              maxLength={FEEDBACK_DETAILS_MAX}
              rows={6}
              required
              disabled={pending}
              placeholder={kind === "suggestion" ? "What should change, and why it would help." : "What it should do, and why it would help."}
              className="min-h-32 px-3 py-2 text-[0.95rem] md:text-[0.95rem]"
            />
          </FormRow>
        )}
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 bg-background/60 px-5 py-3.5 sm:px-6">
          {error && (
            <p role="alert" className="mr-auto min-w-0 basis-full text-sm text-destructive sm:basis-0 sm:flex-1">
              {error}
            </p>
          )}
          <Button type="button" variant="ghost" onClick={() => onCancel(form.savedId)} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" variant="highlight" disabled={pending}>
            <Send aria-hidden />
            {form.editing ? (pending ? "Saving" : "Save") : pending ? "Posting" : "Post to the board"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
