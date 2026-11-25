"use client";

import { Trophy } from "lucide-react";
import type { GotyDecidedBy, GotyVote } from "@/lib/api/goty";
import { GOTY_AWARD_SHORT } from "@/lib/goty-desk";
import { Op, OpText } from "@/components/admin/voting/voting-ops";

const DECIDED_BY: Record<GotyDecidedBy, string> = {
  vote: "by the vote",
  runoff: "in the runoff",
  admin: "by an admin",
  uncontested: "uncontested",
};

// The Awards once decided: each winner and how it was decided, so the desk
// confirms a settled tie. An Award with no winner wasn't given that year.
export function GotyWinnersOp({ vote }: { vote: GotyVote }) {
  return (
    <Op icon={Trophy} title="Winners">
      <OpText>{vote.name} is decided. The bot posts the results.</OpText>
      <dl className="grid gap-2">
        {vote.awards.map((award) => (
          <div key={award.award}>
            <dt className="font-label text-[0.75rem] font-bold tracking-[0.08em] text-faint-foreground">
              {GOTY_AWARD_SHORT[award.award]}
            </dt>
            <dd className="text-[0.95rem]">
              {award.winner ? (
                <>
                  <span className="font-semibold">{award.winner.game?.title ?? `Game ${award.winner.gamedb_game_id}`}</span>
                  <span className="text-dim-foreground">, {DECIDED_BY[award.winner.decided_by]}</span>
                </>
              ) : (
                <span className="text-dim-foreground">Not given this year</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Op>
  );
}
