import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Where the counts would be: they stay secret until the vote ends, so an
// early lead can't steer the rest of the ballot.
export function CountsHiddenNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "font-label flex items-center gap-2 text-[0.85rem] font-bold tracking-[0.06em] text-faint-foreground",
        className,
      )}
    >
      <EyeOff aria-hidden className="size-4 shrink-0" />
      Counts hidden until voting ends.
    </p>
  );
}
