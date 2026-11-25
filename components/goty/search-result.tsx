import { Ban } from "lucide-react";
import type { Game } from "@/lib/api/types";
import type { GotyEligibility } from "@/lib/goty/types";
import { eligibilityNote } from "@/lib/goty/copy";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AwardCover } from "./award-cover";

// One search match: its cover and title, then whether it can be nominated.
// An ineligible game is greyed with the reason (and the way to fix an
// unknown release); an eligible one has a Pick, or "Your pick" when the
// viewer already nominated it. Unchecked games stay pickable: the API has
// the final word.
export function SearchResult({
  game,
  eligibility,
  mine,
  nominations,
  picked,
  onPick,
}: {
  game: Game;
  eligibility: GotyEligibility | undefined;
  mine: boolean;
  nominations: number;
  picked: boolean;
  onPick: () => void;
}) {
  const note = eligibility ? eligibilityNote(eligibility) : null;
  const ok = !note || note.ok;
  const extra = nominations ? ` · nominated by ${nominations} ${nominations === 1 ? "member" : "members"}` : "";
  return (
    <li className="flex flex-col gap-2">
      <AwardCover award={null} game={game} ringed={picked} ring="highlight" className={cn(!ok && "opacity-40")} fallbackClassName="text-base" />
      <p className={cn("text-[0.92rem] leading-tight font-semibold", !ok && "opacity-40")}>{game.title}</p>
      {note && (
        <p className={cn("text-[0.82rem]", ok ? "text-faint-foreground" : "text-dim-foreground")}>
          {!ok && <Ban aria-hidden className="mr-1 inline size-3.25 align-[-2px]" />}
          {note.text}
          {ok && extra}
        </p>
      )}
      {ok &&
        (mine ? (
          <Badge tone="highlight" className="mt-1.5">Your pick</Badge>
        ) : (
          <Button type="button" size="sm" variant={picked ? "selected" : "outline"} aria-pressed={picked} onClick={onPick} className="mt-1.5">
            {picked ? "Picked" : "Pick"}
          </Button>
        ))}
    </li>
  );
}
