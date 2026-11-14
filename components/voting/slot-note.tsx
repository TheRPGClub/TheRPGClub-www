import type { ReactNode } from "react";

// A line of copy in a ballot strip slot, in the strip's muted ink.
export function SlotNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-[0.85rem] font-medium text-highlight-muted-foreground">{children}</p>
  );
}
