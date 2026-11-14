import type { CSSProperties } from "react";
import { PHASE_INK } from "@/lib/suggestions";
import type { BoardTab } from "@/lib/suggestion-board";

const KEY = [
  { ink: PHASE_INK.pending, label: "Pending" },
  { ink: PHASE_INK.approved, label: "Approved, issue open" },
  { ink: PHASE_INK.done, label: "Done" },
] as const;

// Beside the board's tabs: what each band's ink means and the order, or on
// the Rejected tab what it holds.
export function BoardKey({ tab }: { tab: BoardTab }) {
  if (tab === "rejected") {
    return (
      <p className="text-[0.82rem] text-faint-foreground">
        Newest first. Each one carries the reason it was turned down.
      </p>
    );
  }
  return (
    <ul className="font-label flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[0.8rem] text-dim-foreground">
      {KEY.map((k) => (
        <li key={k.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden style={{ background: k.ink } as CSSProperties} className="size-3 rounded-xs" />
          {k.label}
        </li>
      ))}
      <li className="text-faint-foreground">Most upvoted first</li>
    </ul>
  );
}
