// A printer's crop marks at the four corners of a sheet, just outside it.
// The sheet positions them (it is `relative`).
const CORNERS = [
  "-top-3 -left-3 border-r border-b",
  "-top-3 -right-3 border-b border-l",
  "-bottom-3 -left-3 border-t border-r",
  "-right-3 -bottom-3 border-t border-l",
];

export function CropMarks() {
  return CORNERS.map((corner) => (
    <span
      key={corner}
      aria-hidden
      className={`pointer-events-none absolute size-5.5 border-faint-foreground/70 ${corner}`}
    />
  ));
}
