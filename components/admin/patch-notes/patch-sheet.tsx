"use client";

import { PlateContent, useEditorRef } from "platejs/react";

import type { PatchEditorState } from "@/hooks/use-patch-editor";
import { PATCH_TITLE_MAX } from "@/lib/patch-notes/patch-draft";
import { PATCH_SCHEMA } from "@/lib/patch-notes/patch-schema";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { RichTextToolbar } from "@/components/rich-text/rich-text-toolbar";
import { REVIEW_STORY } from "@/components/member/review-desk/story";

// The Patch as written: the review desk's story voice, with section heads
// set as the Patch page sets them (Anton on a 2px paper rule), so New,
// Improved and Fixed read as sections while staff write.
const PATCH_STORY = cn(
  REVIEW_STORY,
  "[&_:is(h1,h2)]:font-headline [&_:is(h1,h2)]:border-b-2 [&_:is(h1,h2)]:border-foreground [&_:is(h1,h2)]:pb-[7px] [&_:is(h1,h2)]:font-normal [&_:is(h1,h2)]:leading-none",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-6",
);

// Step 2's sheet (www#237, pn-editor-steps): the shared editor's toolbar
// sticky across its top (no images, no mentions), the optional title in
// Anton under its Patch number, then the body.
export function PatchSheet({ editor }: { editor: PatchEditorState }) {
  const n = editor.patch.number;
  return (
    <section data-slot="patch-sheet" aria-label="The Patch" className="relative flex flex-col bg-card pb-8">
      <RichTextProvider schema={PATCH_SCHEMA} initialValue={editor.value} onChange={editor.setValue} disabled={editor.busy !== null}>
        <div data-slot="patch-sheet-toolbar" className="sticky top-[env(safe-area-inset-top)] z-20 bg-muted px-3 py-1.5 sm:px-6">
          <RichTextToolbar schema={PATCH_SCHEMA} className="flex-nowrap overflow-x-auto" />
        </div>
        <div className="px-4 pt-6 sm:px-10 sm:pt-8">
          <p className="font-label flex flex-wrap items-center gap-2.5 text-[0.6875rem] font-bold tracking-[0.1em] text-faint-foreground">
            <span data-slot="patch-number-chip" className="px-1.5 pt-0.5 text-foreground">Patch {n}</span>
            Title optional
          </p>
          <TitleField editor={editor} />
          <p className="mt-1.5 text-[0.8125rem] text-faint-foreground">
            {editor.title.trim()
              ? `Shown as "Patch ${n} · ${editor.title.trim()}". Leave it blank for "Patch ${n}".`
              : `Shown as "Patch ${n}". Give a big Patch a name, like "The Franchise update".`}
          </p>
        </div>
        <PlateContent
          aria-label="The Patch's text"
          placeholder="Open with a line on what this Patch brings, then list the changes."
          disableDefaultStyles
          className={cn(PATCH_STORY, "mx-4 mt-6 min-h-72 border-t border-border pt-6 sm:mx-10")}
        />
      </RichTextProvider>
    </section>
  );
}

function TitleField({ editor }: { editor: PatchEditorState }) {
  const plate = useEditorRef();
  return (
    <Textarea
      variant="headline"
      rows={1}
      value={editor.title}
      maxLength={PATCH_TITLE_MAX}
      aria-label="Patch title (optional)"
      placeholder={`Patch ${editor.patch.number}`}
      disabled={editor.busy !== null}
      onChange={(e) => editor.setTitle(e.currentTarget.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        plate.tf.focus({ edge: "start" });
      }}
      className="font-headline mt-1.5 min-h-0 resize-none border-0 px-0 pt-1.5 pb-1 text-[2.5rem] leading-[1] sm:text-[3.5rem] md:text-[3.5rem]"
    />
  );
}
