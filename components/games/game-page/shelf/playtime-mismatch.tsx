"use client";

import { TriangleAlert } from "lucide-react";
import type { MismatchKeep } from "@/lib/playtime/types";
import type { MismatchView } from "@/lib/playtime/view";
import { Button } from "@/components/ui/button";

// A Provider now reporting a platform the member has Manual Playtime on
// (2D+F): ringed in yellow, with its three ways out. Keep the Provider's
// (the Manual entry goes), keep mine (the Provider's figure stops counting
// there), or keep both (the sum stands and the API stops flagging it).
export function PlaytimeMismatch({
  view,
  pending,
  onKeep,
}: {
  view: MismatchView;
  pending: boolean;
  onKeep: (keep: MismatchKeep) => void;
}) {
  return (
    <div role="group" aria-label="Playtime to check" className="mb-1.5 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-1 rounded-[3px] px-3 py-2.5 inset-ring-[1.5px] inset-ring-highlight">
      <TriangleAlert aria-hidden className="mt-0.5 size-4 text-highlight" />
      <p className="text-[0.88rem] leading-[1.4] text-dim-foreground">
        <b className="font-semibold text-foreground">{view.headline}</b> {view.detail}
      </p>
      <div className="col-start-2 mt-1.5 flex flex-wrap gap-1.5">
        <Button variant="highlight" size="xs" disabled={pending} onClick={() => onKeep("provider")}>
          {view.keepProvider}
        </Button>
        <Button variant="outline" size="xs" disabled={pending} onClick={() => onKeep("manual")}>
          {view.keepMine}
        </Button>
        <Button variant="ghost" size="xs" disabled={pending} onClick={() => onKeep("both")}>
          Keep both
        </Button>
      </div>
    </div>
  );
}
