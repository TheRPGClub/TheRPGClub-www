"use client";

import { useState } from "react";
import { SkipForward } from "lucide-react";
import {
  matchImportItemAction,
  skipImportItemAction,
  type ImportSelection,
} from "@/app/actions/imports";
import type { CompletionatorImportReview } from "@/lib/api/types";
import { completionatorReviewToShow } from "@/lib/imports/completionator";
import { IMPORT_KINDS, importItemLabel, importItemTitle } from "@/lib/imports/kinds";
import type { ImportItemPanelProps } from "@/components/imports/import-item-panel";
import { ImportItemDetails } from "@/components/imports/import-item-details";
import { GameDbPickRoute, IgdbRoute } from "@/components/imports/import-game-routes";
import { ChooseGame } from "@/components/imports/completionator/choose-game";
import { CompletionSteps } from "@/components/imports/completionator/completion-steps";
import { MatchedGame } from "@/components/imports/completionator/matched-game";
import type {
  CompletionatorReview,
  CompletionatorStepProps,
} from "@/components/imports/completionator/types";
import { ImportItemLayout } from "@/components/issue/import-item-layout";
import { Button } from "@/components/ui/button";

// Review of one Completionator row. The API's `next_step` drives it: choose
// the game (`match`), then add the completion, or, when the member already
// has one, confirm it's the same completion and pick what to update. Keyed on
// the step and game so a new `match` result starts from a clean form.
export function CompletionatorItemPanel(props: ImportItemPanelProps) {
  const review = props.review as CompletionatorReview;
  return (
    <CompletionatorStep
      key={`${review.next_step}-${review.game?.game_id ?? 0}`}
      {...props}
      review={review}
    />
  );
}

function CompletionatorStep(props: CompletionatorStepProps) {
  const { kind, userId, review, disabled, perform } = props;
  const { item, game } = review;
  const title = importItemTitle(kind, item);
  const [choosing, setChoosing] = useState(review.next_step === "choose_game" || !game);
  // confirm_same: null until the member answers.
  const [sameCompletion, setSameCompletion] = useState<boolean | null>(null);

  const match = (label: string, selection: ImportSelection) =>
    perform(
      label,
      () => matchImportItemAction(kind, userId, item.item_id, selection),
      (data) => completionatorReviewToShow(data as CompletionatorImportReview),
    );

  const noun = IMPORT_KINDS[kind].itemNoun.one;
  const skip = (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={() =>
        perform("Skipping…", () => skipImportItemAction(kind, userId, item.item_id))
      }
    >
      <SkipForward data-icon="inline-start" /> Skip this {noun}
    </Button>
  );

  return (
    <ImportItemLayout
      label={`${importItemLabel(kind)} ${item.row_index}`}
      title={title || <span className="text-faint-foreground">Untitled {noun}</span>}
      facts={<ImportItemDetails kind={kind} item={item} />}
      routes={
        choosing ? (
          <>
            <GameDbPickRoute
              defaultOpen={review.candidates.length === 0}
              disabled={disabled}
              onUse={(picked) => match(`Matching ${picked.title}…`, { game_id: picked.game_id })}
            />
            <IgdbRoute
              kind={kind}
              itemId={item.item_id}
              title={title}
              disabled={disabled}
              onChoose={(hit) => match(`Importing ${hit.name}…`, { igdb_id: hit.igdb_id })}
            />
          </>
        ) : undefined
      }
    >
      <div className="space-y-6">
        {game && !choosing && (
          <MatchedGame game={game} disabled={disabled} onChange={() => setChoosing(true)} />
        )}
        {choosing ? (
          <ChooseGame
            review={review}
            disabled={disabled}
            skip={skip}
            onKeep={() => setChoosing(false)}
            onMatch={match}
          />
        ) : (
          <CompletionSteps
            {...props}
            sameCompletion={sameCompletion}
            onSameCompletion={setSameCompletion}
            skip={skip}
          />
        )}
      </div>
    </ImportItemLayout>
  );
}
