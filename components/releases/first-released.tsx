import { cn } from "@/lib/utils";

// "First released Sep 2025" under an Upcoming Release whose game came out
// before (the label from `firstReleasedLabel`).
export function FirstReleased({ label, className }: { label: string | null; className?: string }) {
  if (!label) return null;
  // The size comes in `className`; the leading goes after it, since a size
  // class would otherwise drop it in `cn`.
  return <p className={cn(className, "leading-[1.3] text-faint-foreground")}>First released {label}</p>;
}
