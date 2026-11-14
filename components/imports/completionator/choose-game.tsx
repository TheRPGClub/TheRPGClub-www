import type { ReactNode } from "react";
import { Undo2 } from "lucide-react";
import type { ImportSelection } from "@/app/actions/imports";
import { ImportCandidateList } from "@/components/imports/import-candidate-list";
import type { CompletionatorReview } from "@/components/imports/completionator/types";
import { Button } from "@/components/ui/button";

// Choosing the row's game: with a match already, pick another or keep it;
// without one, the GameDB candidates.
export function ChooseGame({
  review,
  disabled,
  skip,
  onKeep,
  onMatch,
}: {
  review: CompletionatorReview;
  disabled: boolean;
  skip: ReactNode;
  onKeep: () => void;
  onMatch: (label: string, selection: ImportSelection) => void;
}) {
  if (!review.game) {
    return (
      <ImportCandidateList
        key={review.candidates.map((c) => c.game_id).join("-")}
        candidates={review.candidates}
        confidence={review.match_confidence}
        disabled={disabled}
        chooseLabel="Match this game"
        onChoose={(c) => onMatch(`Matching ${c.title}…`, { game_id: c.game_id })}
        footer={skip}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-dim-foreground">
        Pick the right game from GameDB or IGDB, or keep the one it
        was matched to.
      </p>
      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" disabled={disabled} onClick={onKeep}>
          <Undo2 data-icon="inline-start" /> Keep the matched game
        </Button>
        {skip}
      </div>
    </div>
  );
}
