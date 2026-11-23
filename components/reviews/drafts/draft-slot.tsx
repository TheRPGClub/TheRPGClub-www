import { ArrowRight } from "lucide-react";

import { GameCover } from "@/components/issue/game-cover";
import { ButtonLink } from "@/components/ui/button";
import type { ReviewDraftEntry } from "@/lib/api/types";
import { draftLoss } from "@/lib/reviews/drafts";
import { reviewHref } from "@/lib/reviews/href";
import { DiscardDraft } from "./discard-draft";
import { DraftPaper } from "./draft-paper";
import { DraftFirstLine, DraftPills, DraftScoreBox, DraftTouched } from "./draft-parts";

// The viewer's Draft of a game on that game's pages, in the compose prompt's
// place: a dog-eared page with the cover, "Your draft", the pill row and Last
// touched, the first line, the unprinted score box, then Continue writing
// over Discard. On a phone the score and the actions drop under the text.
export function DraftSlot({
  draft,
  now,
  gameTitle,
  coverUrl,
}: {
  draft: ReviewDraftEntry;
  now: number;
  gameTitle: string;
  coverUrl: string | null | undefined;
}) {
  return (
    <section aria-label="Your draft">
      <DraftPaper
        fold={26}
        className="grid grid-cols-[58px_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 py-[18px] pr-[22px] pl-4 [grid-template-areas:'cover_body'_'score_go'_'score_discard'] sm:grid-cols-[64px_minmax(0,1fr)_auto_auto] sm:gap-x-5 sm:gap-y-[5px] sm:pl-5 sm:[grid-template-areas:'cover_body_score_go'_'cover_body_score_discard']"
      >
        <GameCover
          title={gameTitle}
          coverUrl={coverUrl ?? draft.game?.cover_url}
          className="w-full self-start [grid-area:cover] sm:self-center"
          fallbackClassName="p-1 text-[0.6rem]"
        />
        <div className="min-w-0 [grid-area:body]">
          <h3 className="font-headline m-0 mb-1.5 text-[1.6rem] leading-none">Your draft</h3>
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <DraftPills game={draft.game} kind={draft.kind} />
            <DraftTouched at={draft.updated_at} now={now} />
          </div>
          <DraftFirstLine draft={draft} className="text-[0.98rem]" />
        </div>
        <div className="[grid-area:score] sm:self-center">
          <DraftScoreBox rating={draft.rating} />
        </div>
        <ButtonLink
          href={reviewHref(draft.review_id)}
          variant="dog-ear"
          className="self-end [grid-area:go] max-sm:justify-self-start"
        >
          Continue writing
          <ArrowRight data-icon="inline-end" />
        </ButtonLink>
        <DiscardDraft
          userId={draft.user_id}
          reviewId={draft.review_id}
          gameId={draft.gamedb_game_id}
          gameTitle={gameTitle}
          loss={draftLoss(draft)}
          className="self-start [grid-area:discard] max-sm:justify-self-start"
          askingClassName="[grid-area:auto/1/auto/-1]"
        />
      </DraftPaper>
    </section>
  );
}
