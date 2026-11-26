"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRoadmapEditor, type RoadmapEditor } from "@/hooks/use-roadmap-editor";
import type { Roadmap } from "@/lib/roadmap/types";

const EditorContext = createContext<RoadmapEditor | null>(null);

// Holds the Roadmap for staff editing (www#232), so the page header's
// Editing toggle and the tree share one editor.
export function RoadmapEditorProvider({ initial, children }: { initial: Roadmap; children: ReactNode }) {
  const editor = useRoadmapEditor(initial);
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>;
}

export function useEditor(): RoadmapEditor {
  const editor = useContext(EditorContext);
  if (!editor) throw new Error("useEditor needs a RoadmapEditorProvider");
  return editor;
}
