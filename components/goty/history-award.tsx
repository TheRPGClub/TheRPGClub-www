"use client";

import { ChevronDown } from "lucide-react";
import type { GotyAward } from "@/lib/goty/types";
import { decidedLine, resultRows } from "@/lib/goty/awards";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AwardCover } from "./award-cover";

// The Award's name in its label ink: soft red, soft violet, paper.
const LABEL = { gotm: "text-gotm-soft", nr_gotm: "text-nr-soft", game_of_the_year: "text-foreground" } as const;

// One Award in a past year: the winner's cover, the Award's name, the
// title, how it won, and the final tally behind a disclosure. An Award
// with no winner says it was not given.
export function HistoryAward({ award }: { award: GotyAward }) {
  const label = (
    <span className={`font-label text-[0.76rem] font-extrabold tracking-[0.08em] uppercase ${LABEL[award.award]}`}>
      {award.name}
    </span>
  );
  const game = award.winner?.game ?? award.ballot.find((g) => g.game_id === award.winner?.gamedb_game_id);
  if (!award.winner || !game) {
    return (
      <div className="flex flex-col gap-1.5 rounded-[3.2px] border border-dashed border-border-strong p-3">
        {label}
        <p className="text-[0.82rem] text-faint-foreground">
          Not given. {award.ballot.length ? "Nobody voted that year." : "No candidates that year."}
        </p>
      </div>
    );
  }
  const rows = resultRows(award);
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-3">
      <AwardCover award={award.award} game={game} fallbackClassName="text-[0.6rem] p-1" />
      <div className="min-w-0">
        {label}
        <p className="font-headline mt-0.75 mb-1 text-[1.4rem] leading-none break-words">{game.title}</p>
        <p className="text-[0.82rem] text-faint-foreground">{decidedLine(award)}</p>
        {rows.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger render={<Button type="button" variant="quiet-link" size="bare" />} className="group/tog items-center gap-1 pt-1 text-[0.78rem] uppercase">
              Final tally
              <ChevronDown aria-hidden className="size-3.5 group-data-panel-open/tog:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ol className="mt-1.5 text-[0.8rem]">
                {rows.map((r) => (
                  <li key={r.game.game_id} className="flex justify-between gap-2 border-t border-border py-0.5">
                    <span className="truncate">{r.game.title}</span>
                    <span className="text-faint-foreground tabular-nums">
                      {r.votes}
                      {r.runoffVotes ? ` / ${r.runoffVotes}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
