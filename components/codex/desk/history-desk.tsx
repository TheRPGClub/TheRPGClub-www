"use client";

import type { ReactNode } from "react";
import type { Value } from "platejs";
import { useHistoryDesk } from "@/hooks/use-history-desk";
import { historyEventAnchor } from "@/lib/codex/history";
import { HISTORY_PATH } from "@/lib/codex/paths";
import { DESCRIPTION_SCHEMA } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { descriptionEditorPlugins } from "@/components/codex/story/story-editor-kit";
import { HistoryDelete } from "@/components/codex/history/history-delete";
import { DateCard } from "./date-card";
import { DeskTopBar } from "./desk-top-bar";
import { GalleryCard } from "./gallery-card";
import { KindCard } from "./kind-card";
import { ManuscriptSheet } from "./manuscript-sheet";
import { SeeAlsoCard } from "./see-also-card";

// The History Event desk (www#126, design 5D): the Lore desk with its cards
// swapped. The sheet holds the title and an optional description (mentions
// as on the Lore desk); the drawer holds Kind, the required Date and a plain
// gallery of images, then See also (www#127).
export function HistoryDesk({
  entry,
  initialValue,
  badge,
}: {
  entry: CodexEntry | null;
  initialValue: Value;
  badge?: ReactNode;
}) {
  const desk = useHistoryDesk(entry, initialValue);
  const canDelete = !!entry?.viewer.can_delete && desk.entryId !== null;
  return (
    <RichTextProvider
      schema={DESCRIPTION_SCHEMA}
      initialValue={initialValue}
      onChange={desk.setValue}
      plugins={descriptionEditorPlugins}
    >
      <div className="pb-24 sm:pb-0">
        <DeskTopBar
          desk={desk}
          back={desk.entryId ? `${HISTORY_PATH}#${historyEventAnchor(desk.entryId)}` : HISTORY_PATH}
          backLabel="Back to the Club History"
          deleteButton={canDelete && <HistoryDelete id={desk.entryId!} className="hidden sm:inline-flex" />}
          badge={badge}
        />
        {desk.error && (
          <p role="alert" className="mt-3 rounded-sm border border-destructive/60 px-3.5 py-2.5 text-sm text-destructive">
            {desk.error}
          </p>
        )}
        <div className="mt-4.5 grid grid-cols-[minmax(0,1fr)] items-start gap-8.5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <ManuscriptSheet
            desk={desk}
            schema={DESCRIPTION_SCHEMA}
            titleLabel="History Event title"
            textLabel="The description"
            placeholder="Describe what happened, if you like. Type @ to mention a member."
          />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-5.5 pt-1.5">
            <KindCard desk={desk} tilt={-1} />
            <DateCard desk={desk} tilt={0.8} required />
            <GalleryCard desk={desk} tilt={-0.6} />
            <SeeAlsoCard links={desk.links} self={desk.entryId} tilt={0.6} />
          </div>
        </div>
        {canDelete && (
          <div className="mt-10 border-t border-border pt-4 sm:hidden">
            <HistoryDelete id={desk.entryId!} />
          </div>
        )}
      </div>
    </RichTextProvider>
  );
}
