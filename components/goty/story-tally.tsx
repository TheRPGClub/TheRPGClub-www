"use client";

import type { CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import type { ResultRow } from "@/lib/goty/awards";
import { memberName } from "@/lib/goty/awards";
import type { GotyAward } from "@/lib/goty/types";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";

// The tally beside a decided Award's story: the runoff's count for an
// Award won in a runoff (with the first count under it), else the top of
// the final tally, each with a bar in the Award's ink; then the full
// result and its voters behind a disclosure.
export function StoryTally({ award, rows, compact }: { award: GotyAward; rows: ResultRow[]; compact: boolean }) {
  const runoff = award.winner?.decided_by === "runoff" || award.winner?.decided_by === "admin";
  const inRunoff = runoff ? rows.filter((r) => award.runoff_ballot.includes(r.game.game_id)) : [];
  const shown = inRunoff.length ? inRunoff : rows.slice(0, compact ? 4 : 6);
  const figure = (r: ResultRow) => (inRunoff.length ? r.runoffVotes : r.votes);
  const max = Math.max(1, ...shown.map(figure));
  const firstCount = [...rows].sort((a, b) => b.votes - a.votes).slice(0, 4);
  return (
    <div className="flex flex-col justify-center gap-2.5 bg-card px-4 pt-3 pb-5.5 md:p-6 md:pb-7">
      <p className="font-label text-[0.8rem] font-extrabold tracking-[0.08em] text-faint-foreground uppercase">
        {inRunoff.length ? "Runoff" : `Final tally · top ${shown.length} of ${award.ballot.length}`}
      </p>
      {shown.length === 0 ? (
        <p className="text-sm text-dim-foreground">No votes were cast.</p>
      ) : (
        <ol className="flex flex-col gap-2.25" style={{ "--progress-ink": "var(--award-ink)" } as CSSProperties}>
          {shown.map((r) => (
            <li key={r.game.game_id}>
              <Progress tone="tint" value={(figure(r) / max) * 100} aria-label={`${r.game.title}: ${figure(r)} votes`} className="gap-x-2.5 gap-y-1">
                <span className="min-w-0 flex-1 truncate text-[0.92rem] font-semibold">{r.game.title}</span>
                <span className="font-headline text-[1.3rem] leading-none">{figure(r)}</span>
              </Progress>
            </li>
          ))}
        </ol>
      )}
      {inRunoff.length > 0 && (
        <p className="text-[0.82rem] text-faint-foreground">
          First count: {firstCount.map((r) => `${r.game.title} ${r.votes}`).join(", ")}.
        </p>
      )}
      {!compact && rows.some((r) => r.voters.length) && (
        <Collapsible>
          <CollapsibleTrigger render={<Button type="button" variant="quiet-link" size="bare" />} className="group/tog items-center mt-1 gap-1 text-[0.78rem] uppercase">
            Full result and voters
            <ChevronDown aria-hidden className="size-3.5 group-data-panel-open/tog:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-1 text-[0.82rem] text-dim-foreground">
            {rows.map((r) => (
              <p key={r.game.game_id}>
                <b className="text-foreground">{r.game.title}</b> ({r.votes}
                {r.runoffVotes ? `, runoff ${r.runoffVotes}` : ""}): {r.voters.map(memberName).join(", ") || "no votes"}
              </p>
            ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
