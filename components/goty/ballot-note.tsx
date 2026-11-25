import { cn } from "@/lib/utils";

// The small faint label under a ballot game's title: where a GOTM / NR-GOTM
// of the Year candidate won ("Round 50 · January"), or who nominated a Game
// of the Year candidate ("Nominated by Rowan"). Nothing when it is empty.
export function BallotNote({ label, className }: { label: string; className?: string }) {
  if (!label) return null;
  return (
    <p className={cn("font-label text-[0.78rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase", className)}>
      {label}
    </p>
  );
}
