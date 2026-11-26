"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditor } from "./editor-context";

// The page header's "Edit Roadmap", which turns into the yellow
// "Editing · Done" while staff edit in place (design pick 2).
export function EditingToggle() {
  const editor = useEditor();
  if (editor.editing) {
    return (
      <Button variant="highlight" size="sm" onClick={() => editor.setEditing(false)}>
        Editing · Done
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={() => editor.setEditing(true)}>
      <Pencil aria-hidden />
      Edit Roadmap
    </Button>
  );
}
