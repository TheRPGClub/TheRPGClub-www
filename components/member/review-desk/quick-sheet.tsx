"use client";

import { PlateContent } from "platejs/react";

import { RatingInput } from "@/components/member/rating-input";
import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { RichTextToolbar } from "@/components/rich-text/rich-text-toolbar";
import { Textarea } from "@/components/ui/textarea";
import type { ReviewFormState } from "@/hooks/use-review-form";
import { REVIEW_SCHEMA } from "@/lib/api/review-body";
import { MAX_REVIEW_TITLE_LENGTH } from "@/lib/api/review-title";
import type { ReviewAccent } from "@/lib/reviews/accent";
import { cn } from "@/lib/utils";
import { CropMarks } from "./crop-marks";
import { REVIEW_STORY } from "./story";

// The quick review on a game page: the same sheet as the full editor, small.
// No banner (the game page already leads with the game's art) and no
// scorecard (the full editor's job): the title, the score on its ruler, the
// lettering tools, and a few words.
export function QuickSheet({
  form,
  accent,
  note,
  footer,
}: {
  form: ReviewFormState;
  accent: ReviewAccent;
  note?: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-md border border-border bg-[radial-gradient(color-mix(in_oklab,var(--color-foreground)_5%,transparent)_1px,transparent_1px)] bg-size-[18px_18px] p-4 pt-6 sm:p-6">
      <section aria-label="Your review" className="relative space-y-4 bg-card px-4 pt-4 pb-5 shadow-[0_12px_30px_rgb(0_0_0/0.45)] sm:px-6">
        <CropMarks />
        <RichTextProvider
          schema={REVIEW_SCHEMA}
          initialValue={form.initialValue}
          onChange={form.setBody}
          disabled={form.pending}
        >
          <Textarea
            variant="headline"
            rows={1}
            value={form.title}
            maxLength={MAX_REVIEW_TITLE_LENGTH}
            disabled={form.pending}
            aria-label="Review title"
            placeholder="Title your review (optional)"
            onChange={(e) => form.setTitle(e.currentTarget.value.replace(/\n/g, " "))}
            className="font-headline min-h-0 resize-none border-x-0 border-t-0 border-b-2 px-0 pt-0 pb-1.5 text-[1.9rem] leading-[0.95] uppercase md:text-[1.9rem]"
          />
          <RatingInput
            value={form.rating}
            onChange={form.setRating}
            accent={accent}
            size="quick"
            disabled={form.pending}
          />
          <RichTextToolbar
            schema={REVIEW_SCHEMA}
            variant="compact"
            className="border-b border-border-strong pb-1.5"
          />
          <PlateContent
            aria-label="Your review"
            placeholder="What did you think? (optional)"
            disableDefaultStyles
            className={cn(REVIEW_STORY, "min-h-24 text-base")}
          />
        </RichTextProvider>
        {note}
      </section>
      {footer}
    </div>
  );
}
