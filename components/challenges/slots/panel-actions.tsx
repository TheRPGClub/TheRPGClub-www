"use client";

import { ArrowLeftRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSlotActions } from "@/components/challenges/slots/slot-actions";

// Your Active Run's actions (surface brief challenges-slots): the yellow
// Pick a past Game Completion while past play counts and a year is open, and
// the outline Move a game while a Cleared game fits another open year.
export function PanelActions({ canMove, hasOpenYear }: { canMove: boolean; hasOpenYear: boolean }) {
  const { pastPlay, openPick, openMove } = useSlotActions();
  return (
    <>
      {pastPlay && hasOpenYear && (
        <Button type="button" variant="highlight" size="sm" onClick={() => openPick(null)}>
          <History aria-hidden /> Pick a past Game Completion
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canMove}
        title={canMove ? undefined : "No Cleared game fits another open year"}
        onClick={openMove}
      >
        <ArrowLeftRight aria-hidden /> Move a game
      </Button>
    </>
  );
}
