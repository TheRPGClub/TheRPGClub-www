import { Check, EyeOff, Loader2, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

// Where the game stands on the ballot panel: its votes (or that counts are
// hidden), and the viewer's vote toggle while the vote is open.
export function BallotStanding({
  count,
  countsHidden,
  voted,
  pending,
  canVote,
  onVote,
}: {
  count: number;
  countsHidden: boolean;
  voted: boolean;
  pending: boolean;
  canVote: boolean;
  onVote: () => void;
}) {
  return (
    <div className="col-span-full flex items-center gap-4 sm:col-span-1">
      {countsHidden ? (
        <p className="font-label flex items-center gap-1.5 text-[0.82rem] leading-tight font-extrabold tracking-[0.08em] text-faint-foreground sm:max-w-36 sm:text-right">
          <EyeOff aria-hidden className="size-4 shrink-0" />
          Counts hidden until voting ends
        </p>
      ) : (
        <p className="font-label text-[0.82rem] font-extrabold tracking-[0.08em] text-dim-foreground sm:text-right">
          <span className="font-headline mr-1.5 align-baseline text-[2rem] leading-[0.9] text-foreground sm:mr-0 sm:block sm:text-[2.75rem]">
            {count}
          </span>
          {count === 1 ? "vote" : "votes"}
        </p>
      )}

      {canVote && (
        <Button
          type="button"
          variant={voted ? "outline" : "highlight"}
          onClick={onVote}
          disabled={pending}
          aria-pressed={voted}
          className="ml-auto sm:ml-0"
        >
          {pending ? <Loader2 className="motion-safe:animate-spin" /> : voted ? <Check /> : <Vote />}
          {voted ? "Voted" : "Vote"}
        </Button>
      )}
    </div>
  );
}
