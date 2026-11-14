import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// A profile department with nothing in it yet: a dashed slip.
export function ProfileEmpty({
  className,
  children,
}: {
  // Layout only (`mt-4` under a heading with no gap).
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        className,
        "rounded-sm border border-dashed border-border-strong px-4 py-6 text-sm text-faint-foreground",
      )}
    >
      {children}
    </p>
  );
}
