"use client";

import type { ReactNode } from "react";
import type { Value } from "platejs";
import { useHistoryDesk } from "@/hooks/use-history-desk";
import { HISTORY_PATH, historyEventAnchor } from "@/lib/codex/paths";
import { DESCRIPTION_SCHEMA } from "@/lib/codex/story-schema";
import type { CodexEntry } from "@/lib/codex/types";
import { RichTextProvider } from "@/components/rich-text/rich-text-editor";
import { descriptionEditorPlugins } from "@/components/codex/story/story-editor-kit";
import { HistoryDelete } from "@/components/codex/history/history-delete";
import { DateCard } from "./date-card";
import { DeskLayout } from "./desk-layout";
import { GalleryCard } from "./gallery-card";
import { KindCard } from "./kind-card";
import { ManuscriptSheet } from "./manuscript-sheet";
import { SeeAlsoCard } from "./see-also-card";

// The History Event desk (www#126, design 5D): the Lore desk with its cards
// swapped. The sheet holds the title and an optional description (mentions
// as on the Lore desk); the drawer holds Kind, the required Date and a plain
// gallery of images, then See also (www#127). Delete shows where `viewer`
// allows, and on a new History Event once it has been created (only Admins
// write here, and they may delete).
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
  const id = desk.entryId;
  const canDelete = id !== null && (entry ? entry.viewer.can_delete : true);
  return (
    <RichTextProvider
      schema={DESCRIPTION_SCHEMA}
      initialValue={initialValue}
      onChange={desk.setValue}
      plugins={descriptionEditorPlugins}
    >
      <DeskLayout
        desk={desk}
        back={id ? `${HISTORY_PATH}#${historyEventAnchor(id)}` : HISTORY_PATH}
        backLabel="Club History"
        badge={badge}
        error={desk.error}
        remove={canDelete ? (className) => <HistoryDelete id={id} className={className} /> : null}
        sheet={
          <ManuscriptSheet
            desk={desk}
            schema={DESCRIPTION_SCHEMA}
            titleLabel="History Event title"
            textLabel="The description"
            placeholder="Describe what happened, if you like. Type @ to mention a member."
          />
        }
      >
        <KindCard desk={desk} tilt={-1} />
        <DateCard desk={desk} tilt={0.8} required />
        <GalleryCard desk={desk} tilt={-0.6} />
        <SeeAlsoCard links={desk.links} self={id} tilt={0.6} />
      </DeskLayout>
    </RichTextProvider>
  );
}
