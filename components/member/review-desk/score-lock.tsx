import { Lock, RotateCcw } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { scoreLockReason } from "@/lib/reviews/edit-rules";

// Under a locked score: why it can't change, and the way round it. The
// Revisit link waits for Revisions; without `revisitHref` it stays hidden.
export function ScoreLock({
  id,
  locksAt,
  revisitHref,
}: {
  id?: string;
  locksAt: number | null;
  revisitHref?: string;
}) {
  return (
    <div className="mt-3">
      <p id={id} className="m-0 flex items-start gap-2 text-[0.9rem] leading-[1.4] text-dim-foreground">
        <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0 text-faint-foreground" />
        <span>{scoreLockReason(locksAt)}</span>
      </p>
      {revisitHref && (
        <ButtonLink href={revisitHref} variant="outline" size="sm" className="mt-2.5">
          <RotateCcw />
          Revisit instead
        </ButtonLink>
      )}
    </div>
  );
}
