"use client";

import { useState, type DragEvent, type RefObject } from "react";
import type { PlateEditor } from "platejs/react";
import { useEditorRef } from "platejs/react";
import { photoKey, type DeskPhoto, type SheetDesk } from "@/hooks/use-desk-photos";
import { imageIndex } from "@/lib/codex/lore-story";
import { IMAGE_TYPE, type ImageNode } from "@/lib/codex/story-schema";

// Placing the drawer's photos into the story (5D, picks.md): a photo goes
// after a top-level block, as an image node carrying its id (or, until it
// is uploaded, its pending key) and url. Placing a photo that is already in
// the story moves it.

export const PHOTO_DRAG_TYPE = "application/x-codex-photo";

export function placePhoto(editor: PlateEditor, photo: DeskPhoto, after: number) {
  const existing = imageIndex(editor.children, photoKey(photo));
  let at = Math.min(after + 1, editor.children.length);
  editor.tf.withoutNormalizing(() => {
    let caption: string | undefined;
    if (existing >= 0) {
      caption = (editor.children[existing] as unknown as ImageNode).caption;
      editor.tf.removeNodes({ at: [existing] });
      if (existing < at) at -= 1;
    }
    const node: ImageNode = {
      type: IMAGE_TYPE,
      ...(photo.id !== undefined ? { id: photo.id } : { pendingKey: photo.key }),
      url: photo.url,
      ...(caption ? { caption } : {}),
      children: [{ text: "" }],
    };
    editor.tf.insertNodes(node as never, { at: [at], select: false });
  });
}

// "Place at the caret": after the block holding the caret, else at the end.
export function placeAtCaret(editor: PlateEditor, photo: DeskPhoto) {
  const after = editor.selection ? editor.selection.anchor.path[0] : editor.children.length - 1;
  placePhoto(editor, photo, after);
}

// Dragging a photo from the drawer onto the sheet: the yellow line shows
// below the block it would follow, `line` px down `frame`.
export function usePhotoDrop(desk: Pick<SheetDesk, "photos">, frame: RefObject<HTMLElement | null>) {
  const editor = useEditorRef();
  const [target, setTarget] = useState<{ after: number; line: number } | null>(null);

  function blockAt(event: DragEvent): { after: number; line: number } | null {
    if (!event.dataTransfer.types.includes(PHOTO_DRAG_TYPE) || !frame.current) return null;
    const box = frame.current.getBoundingClientRect();
    const blocks = editor.children;
    let after = blocks.length - 1;
    for (let i = 0; i < blocks.length; i++) {
      const rect = editor.api.toDOMNode(blocks[i])?.getBoundingClientRect();
      if (rect && event.clientY < rect.top + rect.height / 2) {
        after = i - 1;
        break;
      }
    }
    const node = after >= 0 ? editor.api.toDOMNode(blocks[after]) : null;
    const line = node ? node.getBoundingClientRect().bottom - box.top + 4 : 12;
    return { after, line };
  }

  return {
    line: target?.line ?? null,
    onDragOver(event: DragEvent) {
      const next = blockAt(event);
      if (!next) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      if (next.after !== target?.after || next.line !== target?.line) setTarget(next);
    },
    onDragLeave() {
      setTarget(null);
    },
    onDrop(event: DragEvent) {
      const key = event.dataTransfer.getData(PHOTO_DRAG_TYPE);
      const photo = desk.photos.find((p) => p.key === key);
      if (!photo) return;
      event.preventDefault();
      const next = blockAt(event) ?? target;
      setTarget(null);
      placePhoto(editor, photo, next?.after ?? editor.children.length - 1);
    },
  };
}
