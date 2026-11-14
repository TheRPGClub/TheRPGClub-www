import type { VotingRound } from "@/lib/api/types";
import type { TrackData } from "@/lib/voting/load-round";
import { trackResult } from "@/lib/voting/result";
import { SlotNote } from "./slot-note";

// After the vote: the game(s) with the most votes, or the tie the admins are
// settling.
export function ResultSlot({ round, track }: { round: VotingRound; track: TrackData }) {
  const result = trackResult(round, track.category, track.nominations, track.tally.rows);

  if (result.kind === "none") {
    return (
      <SlotNote>
        {result.hadNominations ? "No votes were cast." : "Nothing was on this ballot."}
      </SlotNote>
    );
  }

  return (
    <div className="space-y-1">
      <p className="font-headline text-[1.75rem] leading-[0.95] text-balance">
        {result.titles.join(" / ")}
      </p>
      <p className="text-[0.82rem] font-medium text-highlight-muted-foreground">
        {result.kind === "tie"
          ? result.runoff
            ? "Tied. A runoff between them decides it."
            : "Tied. The admins will pick the winner."
          : `Most votes, with ${result.top} ${result.top === 1 ? "vote" : "votes"}.`}
      </p>
    </div>
  );
}
