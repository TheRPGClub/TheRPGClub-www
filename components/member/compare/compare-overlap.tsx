import type { CompletionOverlap } from "@/lib/members/compare-page";
import { CompareVenn } from "@/components/issue/member-compare-venn";

type Side = { id: string; name: string };

// The overlap diagram over both members' whole histories, with a note that
// the filters below narrow only the shared list.
export function CompareOverlap({
  overlap,
  left,
  right,
  filtered,
}: {
  overlap: CompletionOverlap;
  left: Side;
  right: Side;
  filtered: boolean;
}) {
  return (
    <div className="space-y-1">
      <CompareVenn
        left={{ ...left, only: overlap.onlyLeft, href: `/members/${left.id}/completed-games` }}
        right={{
          ...right,
          only: overlap.onlyRight,
          href: `/members/${right.id}/completed-games`,
        }}
        both={overlap.both}
      />
      <p className="text-center text-xs text-faint-foreground">
        Distinct games across every completion each has logged
        {filtered ? "; the filters below narrow the shared list only." : "."}
      </p>
    </div>
  );
}
