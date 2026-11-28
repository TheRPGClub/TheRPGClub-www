import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A journal surface's dashed note where its content would be: a read that
// failed or a journal with nothing in it yet. `centered` is the roomier note
// that stands in for a whole volume or shelf.
export function JournalNotice({
  centered = false,
  className,
  children,
}: {
  centered?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      data-slot="community-note"
      className={cn(
        "rounded-md border border-dashed border-border-strong px-4 text-sm text-faint-foreground",
        centered ? "py-8 text-center" : "py-6",
        className,
      )}
    >
      {children}
    </p>
  );
}
