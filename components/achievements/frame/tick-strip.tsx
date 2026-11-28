import { cn } from "@/lib/utils";

// A set's progress as a strip of cells, one per Achievement in set order (or
// folded, see tickCells): lit in paper where the member has it, an empty
// outline where they don't. It stretches to its row.
export function TickStrip({
  cells,
  label,
  className,
}: {
  cells: boolean[];
  // What the strip says, for screen readers ("31 of 54 Achievements").
  label: string;
  className?: string;
}) {
  return (
    <span role="img" aria-label={label} data-slot="tick-strip" className={cn("flex h-2 w-full gap-[2px]", className)}>
      {cells.map((on, i) => (
        <span
          key={i}
          data-slot="tick"
          data-on={on ? "" : undefined}
          className={cn(
            "h-full min-w-[2px] flex-1 rounded-[1px]",
            on ? "bg-dim-foreground" : "shadow-[inset_0_0_0_1px_var(--color-border-strong)]",
          )}
        />
      ))}
    </span>
  );
}
