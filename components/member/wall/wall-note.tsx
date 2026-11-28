import type { ReactNode } from "react";

// The members page's one-line note: a failed load, nobody, or no match.
export function WallNote({ children }: { children: ReactNode }) {
  return (
    <p data-slot="shelf-empty" className="rounded-md border border-dashed border-border-strong px-4 py-12 text-center text-dim-foreground">
      {children}
    </p>
  );
}
