"use client";

import type { ReactNode } from "react";
import type { Value } from "platejs";
import { useLoreDesk } from "@/hooks/use-lore-desk";
import { LORE_PATH } from "@/lib/codex/paths";
import { LORE_SCHEMA } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { storyEditorPlugins } from "@/components/codex/story/story-editor-kit";
import { LoreDelete } from "@/components/codex/lore/lore-delete";
import { DateCard } from "./date-card";
import { DeskTopBar } from "./desk-top-bar";
import { ImagesCard } from "./images-card";
import { ManuscriptSheet } from "./manuscript-sheet";

// The Lore desk (www#125, design 5D): a manuscript sheet for the title and
// the story, and a drawer of cards beside it for the date and the photos.
// `seeAlso` is the drawer's See also card, which www#127 adds.
export function LoreDesk({
  entry,
  initialValue,
  author,
  badge,
  seeAlso,
}: {
  entry: CodexEntry | null;
  initialValue: Value;
  // "by Mog Whisperer" with their avatar: the author, not the editor.
  author: ReactNode;
  badge?: ReactNode;
  seeAlso?: ReactNode;
}) {
  const desk = useLoreDesk(entry, initialValue);
  const canDelete = !!entry?.viewer.can_delete;
  return (
    <RichTextProvider
      schema={LORE_SCHEMA}
      initialValue={initialValue}
      onChange={desk.setValue}
      plugins={storyEditorPlugins}
    >
      <div className="pb-24 sm:pb-0">
        <DeskTopBar
          desk={desk}
          back={desk.entryId ? `${LORE_PATH}/${desk.entryId}` : LORE_PATH}
          backLabel={desk.entryId ? "Back to the Lore Entry" : "Back to Club Lore"}
          deleteButton={canDelete && desk.entryId && <LoreDelete id={desk.entryId} className="hidden sm:inline-flex" />}
          badge={badge}
        />
        {desk.error && (
          <p role="alert" className="mt-3 rounded-sm border border-destructive/60 px-3.5 py-2.5 text-sm text-destructive">
            {desk.error}
          </p>
        )}
        <div className="mt-4.5 grid grid-cols-[minmax(0,1fr)] items-start gap-8.5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ManuscriptSheet desk={desk} author={author} />
          <div className="grid gap-5.5 pt-1.5">
            <DateCard desk={desk} tilt={-1} />
            <ImagesCard desk={desk} tilt={0.8} />
            {seeAlso}
          </div>
        </div>
        {canDelete && entry && (
          <div className="mt-10 border-t border-border pt-4 sm:hidden">
            <LoreDelete id={entry.id} />
          </div>
        )}
      </div>
    </RichTextProvider>
  );
}
