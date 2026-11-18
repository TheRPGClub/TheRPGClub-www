import { READ_CAP } from "@/lib/api/release-calendar";
import { cn } from "@/lib/utils";

// Said under a read the guard stopped short (READ_CAP Upcoming Releases), so
// a cut-off month or list never looks complete. `what` names what was read.
export function ReadCapNote({ what, className }: { what: string; className?: string }) {
  return (
    <p className={cn("font-label text-[0.8125rem] tracking-[0.08em] text-faint-foreground", className)}>
      Showing the first {READ_CAP.toLocaleString("en-US")} {what}
    </p>
  );
}
