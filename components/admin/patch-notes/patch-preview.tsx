"use client";

import type { ReactNode } from "react";

import type { PatchEditorState } from "@/hooks/use-patch-editor";
import { patchDate, patchTitle } from "@/lib/patch-notes/format";
import { patchCount } from "@/lib/patch-notes/patch-draft";
import { patchPath } from "@/lib/patch-notes/paths";
import { cn } from "@/lib/utils";
import { PatchCard } from "@/components/patch-notes/patch-card";

// Step 2's sticky preview (www#237): the count against Discord's 4000 in
// Anton (signal orange past it), then the real index Patch card, rendered
// from the live value, so it cuts where the index and the post cut. Once
// cut, a note under the card says how much the post leaves out. The
// actions sit under it.
export function PatchPreview({ editor, actions }: { editor: PatchEditorState; actions: ReactNode }) {
  const { patch, text } = editor;
  const count = patchCount(text.length);
  const shown = text.cut ? text.cutMarkdown.length : text.length;
  return (
    <aside data-slot="patch-preview" aria-label="Preview" className="flex flex-col gap-3 lg:sticky lg:top-6">
      <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-2">
        <p className="font-label text-[0.6875rem] leading-[1.5] font-bold tracking-[0.1em] text-faint-foreground">
          Preview · as on /patch-notes
          <br />
          and in #patch-notes
        </p>
        <p aria-live="polite" className="font-headline shrink-0 leading-none whitespace-nowrap">
          <span className={cn("text-[2.25rem]", count.over && "text-destructive")}>{count.count}</span>
          <span className={cn("ml-1.5 text-[1.375rem] text-faint-foreground", count.over && "text-destructive")}>/ {count.max}</span>
          <span className="sr-only"> characters{count.over ? ", over the limit: the post is cut" : ""}</span>
        </p>
      </div>
      <PatchCard
        number={patch.number}
        title={patchTitle({ number: patch.number, title: editor.title.trim() || null })}
        date={editor.published ? patchDate(patch) : ""}
        dateTime={patch.published_at}
        value={editor.clean}
        siteUrl={editor.siteUrl}
        href={editor.published ? patchPath(patch.number) : null}
        headingLevel={3}
      />
      <p className={cn("text-[0.8125rem] leading-[1.5] text-faint-foreground", text.cut && "text-destructive")}>
        {text.cut
          ? `Cut at "..." after ${new Intl.NumberFormat("en-GB").format(shown)} characters: the card and the post leave the rest out, and the Patch's own page keeps the whole Patch.`
          : `Over 4,000, the card and the post are cut at the last whole block or bullet with "...". The Patch's own page keeps the whole Patch.`}
      </p>
      {actions}
    </aside>
  );
}
