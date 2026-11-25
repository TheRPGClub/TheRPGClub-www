"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface FacetRowControlsProps {
  // What the row is called, for the button's name.
  named: string;
  disabled?: boolean;
  onRemove: () => void;
}

// Take a row off the card. (Reordering is dragging the row itself.)
export function FacetRowControls({ named, disabled, onRemove }: FacetRowControlsProps) {
  return (
    <div className="flex shrink-0 items-center opacity-0 transition-opacity group-focus-within/facet:opacity-100 group-hover/facet:opacity-100 [@media(hover:none)]:opacity-100">
      <Button
        type="button"
        variant="editor-tool"
        size="icon-xs"
        aria-label={`Remove ${named}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  );
}
