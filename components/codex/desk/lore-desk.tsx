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
import { DeskLayout } from "./desk-layout";
import { ImagesCard } from "./images-card";
import { ManuscriptSheet } from "./manuscript-sheet";
import { SeeAlsoCard } from "./see-also-card";

// The Lore desk (www#125, design 5D): a manuscript sheet for the title and
// the story, and a drawer of cards beside it for the date, the photos and
// See also (www#127). Delete shows where the entry's `viewer` allows, and
// on a new Lore Entry once it has been created (its author may always
// delete it), so a publish that stopped half way can be taken back.
export function LoreDesk({
  entry,
  initialValue,
  author,
  badge,
}: {
  entry: CodexEntry | null;
  initialValue: Value;
  // "by Mog Whisperer" with their avatar: the author, not the editor.
  author: ReactNode;
  badge?: ReactNode;
}) {
  const desk = useLoreDesk(entry, initialValue);
  const id = desk.entryId;
  const canDelete = id !== null && (entry ? entry.viewer.can_delete : true);
  return (
    <RichTextProvider schema={LORE_SCHEMA} initialValue={initialValue} onChange={desk.setValue} plugins={storyEditorPlugins}>
      <DeskLayout
        desk={desk}
        back={id ? `${LORE_PATH}/${id}` : LORE_PATH}
        backLabel={id ? "Lore Entry" : "Club Lore"}
        badge={badge}
        error={desk.error}
        remove={canDelete ? (className) => <LoreDelete id={id} className={className} /> : null}
        sheet={<ManuscriptSheet desk={desk} author={author} />}
      >
        <DateCard desk={desk} tilt={-1} />
        <ImagesCard desk={desk} tilt={0.8} />
        <SeeAlsoCard links={desk.links} self={id} tilt={-0.6} />
      </DeskLayout>
    </RichTextProvider>
  );
}
