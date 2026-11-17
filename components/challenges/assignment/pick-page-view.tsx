import { ArrowLeft } from "lucide-react";
import type { PickPage } from "@/lib/challenges/pick-page";
import { pickCards, pickCopy, tasteHints } from "@/lib/challenges/santa-pick";
import { tintStyle } from "@/lib/challenges/tint";
import { ButtonLink } from "@/components/ui/button";
import { NoticeSlip } from "@/components/issue/notice-slip";
import { PickDeal } from "@/components/challenges/assignment/pick-deal";
import { PickHeader } from "@/components/challenges/assignment/pick-header";

// A Santa's private pick page (surface brief challenges-santa-pick, 6C with
// 6A): the header with the deadline, then the deal while picks are open. Any
// other state is a notice slip with the way back to the Edition: picks
// closed (the pick is in), nothing left to pick, or the API's refusal for
// anyone who isn't this Edition's Santa.
export function PickPageView({ page, badge }: { page: PickPage; badge?: React.ReactNode }) {
  const { challenge, view, state, editionId } = page;
  const back = `/challenges/${challenge.id}${editionId ? `?edition=${editionId}` : ""}`;
  const copy = view ? pickCopy(view, page.today) : null;
  const header = view && copy && (state.kind === "open" || state.kind === "empty") && (
    <PickHeader
      chip={copy.chip}
      title={copy.title}
      days={copy.days}
      daysLabel={copy.daysLabel}
      privacy={copy.privacy}
      hints={tasteHints(view.taste, copy.name)}
      badge={badge}
    />
  );
  if (state.kind === "open" && view && copy && editionId) {
    const cards = pickCards(view.backlog ?? []);
    const pick = view.pick?.game;
    return (
      <div style={tintStyle(page.tint)} className="pb-12">
        {header}
        <PickDeal
          editionId={editionId}
          recipient={copy.name}
          cards={cards}
          initial={pick ? { gameId: pick.game_id, title: pick.title, coverUrl: pick.cover_url ?? null } : null}
          note={{ open: copy.note(cards.length, false), picked: copy.note(cards.length, true) }}
        />
      </div>
    );
  }
  const slip = state.kind === "open" ? null : state;
  return (
    <div style={tintStyle(page.tint)} className="pb-12">
      {header}
      {slip && (
        <NoticeSlip
          title={slip.title}
          role={slip.kind === "unread" ? "alert" : "status"}
          className="mt-8 max-w-xl"
          action={
            <ButtonLink href={back} variant="inverse" size="sm">
              <ArrowLeft data-icon="inline-start" aria-hidden />
              Back to {challenge.name}
            </ButtonLink>
          }
        >
          {slip.message}
        </NoticeSlip>
      )}
    </div>
  );
}
