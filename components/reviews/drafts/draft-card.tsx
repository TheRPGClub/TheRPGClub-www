import { ArrowRight } from "lucide-react";

import { GameCover } from "@/components/issue/game-cover";
import { ButtonLink } from "@/components/ui/button";
import type { ReviewDraftEntry } from "@/lib/api/types";
import { draftLoss } from "@/lib/reviews/drafts";
import { reviewHref } from "@/lib/reviews/href";
import { DiscardDraft } from "./discard-draft";
import { DraftPaper } from "./draft-paper";
import { DraftFirstLine, DraftPills, DraftScoreBox, DraftTouched } from "./draft-parts";

// One Draft as a dog-eared page in the tray (Your drafts, your reviews page):
// the game with its pill row and the unprinted score box, the first line,
// Last touched and Discard, then Continue writing.
export function DraftCard({ draft, now }: { draft: ReviewDraftEntry; now: number }) {
  const title = draft.game?.title ?? "Game";
  const href = reviewHref(draft.review_id);
  return (
    <DraftPaper className="flex h-full flex-col gap-2.5 px-4 pt-[15px] pb-3.5">
      <div className="flex items-start gap-3">
        <GameCover
          title={title}
          coverUrl={draft.game?.cover_url}
          className="w-[42px]"
          fallbackClassName="p-1 text-[0.5rem]"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-label m-0 text-[1.05rem] leading-[1.1] font-extrabold tracking-[0.03em]">
            {title}
          </h3>
          <div className="mt-1.5">
            <DraftPills game={draft.game} kind={draft.kind} />
          </div>
        </div>
        <DraftScoreBox rating={draft.rating} />
      </div>
      <DraftFirstLine draft={draft} className="min-h-[2.8em] text-[0.9rem]" />
      <DiscardDraft
        userId={draft.user_id}
        reviewId={draft.review_id}
        gameId={draft.gamedb_game_id}
        gameTitle={title}
        loss={draftLoss(draft)}
        className="mt-auto"
      >
        <DraftTouched at={draft.updated_at} now={now} />
      </DiscardDraft>
      <ButtonLink href={href} variant="dog-ear" size="sm" className="h-[30px] self-start">
        Continue writing
        <ArrowRight data-icon="inline-end" />
      </ButtonLink>
    </DraftPaper>
  );
}
