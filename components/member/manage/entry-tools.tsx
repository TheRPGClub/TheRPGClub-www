"use client";

import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// The owner's small tokens on an entry's cover (spec api#451, pick 3A):
// Edit opens the entry in place, the x removes it behind Undo. Always shown, so nothing hides behind hover on
// touch.
export function EntryTools({
  title,
  editing,
  onEdit,
  onRemove,
  className,
}: {
  title: string;
  editing?: boolean;
  onEdit?: () => void;
  onRemove: () => void;
  // Placement only.
  className?: string;
}) {
  return (
    <div
      className={cn("absolute top-1.5 right-1.5 z-10 flex gap-1", className)}
    >
      {onEdit && (
        <Button
          type="button"
          variant="cover-token"
          size="icon-sm"
          aria-pressed={editing ?? false}
          aria-label={`Edit ${title}`}
          onClick={onEdit}
        >
          <Pencil aria-hidden />
        </Button>
      )}
      <Button
        type="button"
        variant="cover-token"
        size="icon-sm"
        aria-label={`Remove ${title}`}
        onClick={onRemove}
      >
        <X aria-hidden />
      </Button>
    </div>
  );
}
