import type { ReactNode } from "react";
import type { FranchiseRole, FranchiseRow } from "@/lib/games/game-edit/franchises";
import { LANE_COPY } from "@/lib/games/game-edit/franchise-lanes-copy";
import { cn } from "@/lib/utils";

// One role lane (design pick edit-lanes): its name in Anton with a count and
// a quiet hint at the left, then (`lead`, the Add-on parent line) its
// Franchises, the + Add slot (`slot`) and a note. Empty, it says so before
// the slot.
export function FranchiseLane({
  role,
  rows,
  lead,
  slot,
  note,
  empty,
  renderRow,
  last,
}: {
  role: FranchiseRole;
  rows: FranchiseRow[];
  lead?: ReactNode;
  slot: ReactNode;
  note?: string;
  // The words when the lane is empty (the lane's own by default).
  empty?: string;
  renderRow: (row: FranchiseRow) => ReactNode;
  last?: boolean;
}) {
  const copy = LANE_COPY[role];
  const headingId = `lane-${role}`;
  return (
    <section
      aria-labelledby={headingId}
      className={cn("grid gap-x-7 gap-y-3 py-4.5 sm:grid-cols-[13.5rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]", !last && "border-b border-border-strong")}
    >
      <div>
        <h3 id={headingId} className="font-headline text-[1.6rem] leading-[0.95]">
          {copy.title}
          {rows.length > 0 && <small className="ml-1.5 text-[0.95rem] text-faint-foreground">{rows.length}</small>}
        </h3>
        <p className="font-label mt-1.5 text-[0.76rem] leading-snug font-bold tracking-[0.08em] text-faint-foreground">{copy.hint}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-2.5">
        {lead}
        <div className="flex flex-wrap content-start items-center gap-2.5">
          {rows.length === 0 && <p className="mr-1.5 text-[0.92rem] text-faint-foreground">{empty ?? copy.empty}</p>}
          {rows.length > 0 && (
            <ul aria-label={`${copy.title}: Franchises`} className="contents">
              {rows.map(renderRow)}
            </ul>
          )}
          {slot}
        </div>
        {note && <p className="text-[0.86rem] text-faint-foreground">{note}</p>}
      </div>
    </section>
  );
}
