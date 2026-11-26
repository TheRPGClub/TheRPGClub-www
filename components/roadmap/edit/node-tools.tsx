"use client";

import { Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isShipped } from "@/lib/roadmap/tree";
import type { RoadmapItem } from "@/lib/roadmap/types";
import { useEditor } from "./editor-context";

// A node's tools in edit mode: the Shipped toggle (it saves at once) and
// Edit, which opens the item dialog. With no area tags to push them
// right, they push themselves.
export function NodeTools({ item, milestoneId }: { item: RoadmapItem; milestoneId: number }) {
  const editor = useEditor();
  const shipped = isShipped(item);
  return (
    <span className={cn("flex shrink-0 gap-0.5 self-center", !item.area && "ml-auto")}>
      <Button
        variant="tool"
        size="icon-sm"
        aria-pressed={shipped}
        aria-label={shipped ? `Un-ship ${item.title}` : `Mark ${item.title} Shipped`}
        title={shipped ? "Shipped: press to un-ship" : "Mark Shipped"}
        disabled={editor.pending}
        onClick={() => editor.toggleShipped(item)}
      >
        <Check aria-hidden />
      </Button>
      <Button
        variant="tool"
        size="icon-sm"
        aria-label={`Edit ${item.title}`}
        title="Edit"
        onClick={() => editor.openDialog({ kind: "item", milestoneId, item })}
      >
        <Pencil aria-hidden />
      </Button>
    </span>
  );
}
