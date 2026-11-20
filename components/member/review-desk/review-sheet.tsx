"use client";

import { PlateContent, useEditorRef } from "platejs/react";

import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { RichTextToolbar } from "@/components/rich-text/rich-text-toolbar";
import { REVIEW_SCHEMA } from "@/lib/api/review-body";
import { richTextPlainText } from "@/lib/rich-text/text";
import type { ReviewFormState } from "@/hooks/use-review-form";
import { cn } from "@/lib/utils";
import { CropMarks } from "./crop-marks";
import type { ReviewDeskGame } from "./desk-game";
import { SheetBanner } from "./sheet-banner";
import { REVIEW_STORY } from "./story";

// The sheet a review is written on: the game's banner with the title, the
// toolbar sticky under the top bar once the banner scrolls away, then the
// story. The sheet stretches to the height of the notes beside it, and the
// space under a short story is the rest of a lined page that takes a click
// as "carry on writing".
export function ReviewSheet({ form, game }: { form: ReviewFormState; game?: ReviewDeskGame }) {
  return (
    <section
      aria-label="Your review"
      className="relative flex flex-col bg-card pb-6 shadow-[0_18px_40px_rgb(0_0_0/0.5)]"
    >
      <CropMarks />
      <RichTextProvider
        schema={REVIEW_SCHEMA}
        initialValue={form.initialValue}
        onChange={form.setBody}
        disabled={form.pending}
      >
        <SheetBanner
          game={game}
          title={form.title}
          onTitle={form.setTitle}
          count={richTextPlainText(form.body).length}
          disabled={form.pending}
        />
        <div className="sticky top-[60px] z-20 bg-card px-4 sm:px-10">
          <RichTextToolbar
            schema={REVIEW_SCHEMA}
            className="flex-nowrap overflow-x-auto border-b border-border-strong px-1 py-1.5"
          />
        </div>
        <PlateContent
          aria-label="Your review"
          placeholder="What did you think?"
          disableDefaultStyles
          className={cn(REVIEW_STORY, "min-h-40 px-4 pt-6 sm:px-10")}
        />
        <RestOfPage />
      </RichTextProvider>
    </section>
  );
}

function RestOfPage() {
  const editor = useEditorRef();
  return (
    <div
      aria-hidden
      onClick={() => editor.tf.focus({ edge: "end" })}
      className="mx-4 mt-6 min-h-0 flex-1 cursor-text bg-[repeating-linear-gradient(transparent_0_31px,color-mix(in_oklab,var(--color-foreground)_5%,transparent)_31px_32px)] sm:mx-10"
    />
  );
}
