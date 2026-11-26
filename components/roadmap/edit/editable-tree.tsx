"use client";

import { RoadmapBody } from "../roadmap-body";
import { useEditor } from "./editor-context";
import { EditingTree } from "./editing-tree";

// The tree a staff member sees: the read view from the editor's Roadmap
// (so a change shows without a reload), or the editing tree while Editing.
export function EditableTree() {
  const editor = useEditor();
  return editor.editing ? <EditingTree /> : <RoadmapBody roadmap={editor.roadmap} />;
}
