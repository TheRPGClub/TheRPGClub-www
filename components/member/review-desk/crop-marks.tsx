import { cn } from "@/lib/utils";

// A printer's crop marks at the four corners of a sheet, just outside it.
// The sheet positions them (it is `relative`). On a Draft they are drawn in
// dashed yellow pencil: the sheet hasn't gone to print yet.
const CORNERS = [
  "-top-3 -left-3 border-r border-b",
  "-top-3 -right-3 border-b border-l",
  "-bottom-3 -left-3 border-t border-r",
  "-right-3 -bottom-3 border-t border-l",
];

export function CropMarks({ pencil = false }: { pencil?: boolean }) {
  return CORNERS.map((corner) => (
    <span
      key={corner}
      aria-hidden
      data-slot="crop-mark"
      className={cn(
        "pointer-events-none absolute size-5.5",
        pencil ? "border-dashed border-highlight/85" : "border-faint-foreground/70",
        corner,
      )}
    />
  ));
}
