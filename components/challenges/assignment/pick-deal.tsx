"use client";

import { usePickDeal, type Picked } from "@/hooks/use-pick-deal";
import type { PickCard as Card } from "@/lib/challenges/santa-pick";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { Button } from "@/components/ui/button";
import { NameTag } from "@/components/challenges/assignment/name-tag";
import { PickActions } from "@/components/challenges/assignment/pick-actions";
import { PickCard } from "@/components/challenges/assignment/pick-card";
import { PickReel } from "@/components/challenges/assignment/pick-reel";

const pad = (n: number) => String(n).padStart(2, "0");

// The Santa's deal (surface brief challenges-santa-pick): one game of the
// recipient's eligible backlog at a time on the pick card, the name tag that
// takes the pick, the reel of every game, and the note under it. A refused
// pick shows the API's reason on a notice slip above the card.
export function PickDeal({
  editionId,
  recipient,
  cards,
  initial,
  note,
}: {
  editionId: number;
  recipient: string;
  cards: readonly Card[];
  initial: Picked | null;
  // The note under the reel, before and after a pick.
  note: { open: string; picked: string };
}) {
  const deal = usePickDeal(editionId, cards, initial);
  const { card, picked } = deal;
  if (!card) return null;
  const state = !picked ? "none" : picked.gameId === card.gameId ? "this" : "other";
  return (
    // The deal's keys (← → S, Enter on the reel) bubble up from its card,
    // buttons and reel; the section itself isn't a stop.
    <section data-slot="pick-deal" aria-label={`Pick a game for ${recipient}`} className="mt-6" onKeyDown={deal.onKeyDown}>
      {deal.error && (
        <NoticeSlip
          title="Not picked"
          role="alert"
          className="mt-2 mb-6 max-w-xl"
          action={
            <Button variant="inverse" size="sm" onClick={deal.dismissError}>
              OK
            </Button>
          }
        >
          {deal.error}
        </NoticeSlip>
      )}
      <PickCard
        card={card}
        position={`${pad(deal.index + 1)} / ${pad(cards.length)} · from ${recipient}'s backlog`}
        swipe={deal.swipe}
        tag={<NameTag recipient={recipient} picked={picked} />}
        actions={
          <PickActions
            state={state}
            pending={deal.pending}
            canMove={cards.length > 1}
            onPick={deal.pick}
            onNext={deal.next}
            onShuffle={deal.shuffle}
          />
        }
      />
      <PickReel
        cards={cards}
        index={deal.index}
        seen={deal.seen}
        pickedId={picked?.gameId ?? null}
        label={`${recipient}'s backlog`}
        onJump={deal.go}
      />
      <p data-slot="pick-reel-note" className="mt-3 max-w-[95ch] text-[0.84rem] leading-normal text-faint-foreground" aria-live="polite">
        {picked ? note.picked : note.open}
      </p>
    </section>
  );
}
