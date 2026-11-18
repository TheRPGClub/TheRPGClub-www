import { ArrowRight, Check, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";

// The pick card's actions (surface brief challenges-santa-pick): yellow Pick
// this one (Pick this one instead once another game is picked), Next game
// and Shuffle; on the picked game an inert "Picked" and Keep looking.
export function PickActions({
  state,
  pending,
  canMove,
  onPick,
  onNext,
  onShuffle,
}: {
  // none: nothing picked yet; other: another game is picked; this: this one.
  state: "none" | "other" | "this";
  pending: boolean;
  // More than one game to move between.
  canMove: boolean;
  onPick: () => void;
  onNext: () => void;
  onShuffle: () => void;
}) {
  const full = "w-full sm:w-auto";
  if (state === "this") {
    return (
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Button variant="done" size="lg" disabled className={full}>
          <Check data-icon="inline-start" aria-hidden />
          Picked
        </Button>
        {canMove && (
          <Button variant="outline" size="lg" onClick={onNext} className={full}>
            Keep looking
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <Button variant="highlight" size="lg" onClick={onPick} disabled={pending} className={full}>
        {pending ? "Picking…" : state === "other" ? "Pick this one instead" : "Pick this one"}
      </Button>
      {canMove && (
        <>
          <Button variant="outline" size="lg" onClick={onNext} aria-keyshortcuts="ArrowRight" className={full}>
            Next game
            <ArrowRight data-icon="inline-end" aria-hidden />
          </Button>
          <Button variant="ghost" size="lg" onClick={onShuffle} aria-keyshortcuts="S" className={full}>
            <Shuffle data-icon="inline-start" aria-hidden />
            Shuffle
          </Button>
        </>
      )}
    </div>
  );
}
