import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// The unseen mark (ticket www#238, picks §4): "NEW" in a 1px paper outline
// chip. On a Patch it says the member hasn't seen that Patch; on the
// sidebar and the tab bar, that a Patch is waiting. `label` is what a
// screen reader hears in place of "NEW" where the chip alone wouldn't say
// what is new (a group's row, a tab).
export function NewMark({
  size = "sm",
  label,
  className,
}: {
  size?: "sm" | "nav";
  label?: string;
  className?: string;
}) {
  return (
    <Badge tone="new" size={size} className={cn("leading-none", className)}>
      {label ? (
        <>
          <span aria-hidden>NEW</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        "NEW"
      )}
    </Badge>
  );
}
