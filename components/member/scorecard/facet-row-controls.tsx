"use client";

import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface FacetRowControlsProps {
  // What the row is called, for the buttons' names.
  named: string;
  disabled?: boolean;
  // Unset at the top and the bottom of the card.
  onUp?: () => void;
  onDown?: () => void;
  onRemove: () => void;
}

// Move a row up or down the card, or take it off.
export function FacetRowControls({ named, disabled, onUp, onDown, onRemove }: FacetRowControlsProps) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Move ${named} up`}
        disabled={disabled || !onUp}
        onClick={onUp}
      >
        <ChevronUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Move ${named} down`}
        disabled={disabled || !onDown}
        onClick={onDown}
      >
        <ChevronDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
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
