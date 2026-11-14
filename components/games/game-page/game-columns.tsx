import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The game page's middle: the Reviews column beside the rail. Without
// Reviews the rail has the width to itself.
export function GameColumns({
  reviews,
  rail,
}: {
  // The Reviews section, or null when this viewer isn't shown Reviews.
  reviews: ReactNode;
  rail: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mt-7.5 grid gap-8",
        reviews && "lg:grid-cols-[minmax(0,1fr)_21.25rem]",
      )}
    >
      {reviews}
      {rail}
    </div>
  );
}
