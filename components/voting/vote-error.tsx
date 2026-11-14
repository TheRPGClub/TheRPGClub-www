import type { ComponentProps } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A vote that didn't land, with the x that clears it. The board and a game
// page's ballot panel each set its rule and spacing.
export function VoteError({
  message,
  onDismiss,
  className,
  ...props
}: ComponentProps<"div"> & { message: string; onDismiss: () => void }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-sm border px-3 py-2 text-sm text-destructive",
        className,
      )}
      {...props}
    >
      <p>{message}</p>
      <Button
        type="button"
        variant="dismiss-notice"
        size="icon-xs"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="mt-0.5 size-auto"
      >
        <X className="size-3.5" />
      </Button>
    </div>
  );
}
