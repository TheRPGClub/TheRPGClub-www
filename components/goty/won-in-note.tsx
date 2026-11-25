import { cn } from "@/lib/utils";

// Where a GOTM / NR-GOTM of the Year candidate won ("Round 50 · January"),
// in the ballot's small faint label. Nothing when the label is empty.
export function WonInNote({ label, className }: { label: string; className?: string }) {
  if (!label) return null;
  return (
    <p className={cn("font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase", className)}>
      {label}
    </p>
  );
}
