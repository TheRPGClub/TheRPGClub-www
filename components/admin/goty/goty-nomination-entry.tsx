import { Trash2 } from "lucide-react";
import type { GotyNomination } from "@/lib/api/goty";
import { gotyNominatorName } from "@/lib/goty-desk";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One Game of the Year nomination on the desk: its game and who nominated
// it (no reason: they carry none), and its remove. A held removal strikes
// it through over the Undo bar.
export function GotyNominationEntry({
  nomination,
  own,
  removable,
  held,
  error,
  delayMs,
  onDelete,
  onUndo,
}: {
  nomination: GotyNomination;
  own: boolean;
  removable: boolean;
  held: boolean;
  error: string | undefined;
  delayMs: number;
  onDelete: () => void;
  onUndo: () => void;
}) {
  const title = nomination.game?.title ?? `Game ${nomination.gamedb_game_id}`;
  const name = gotyNominatorName(nomination);
  const struck = held && "text-faint-foreground line-through decoration-destructive";
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-border py-2.5">
      <span className={cn("text-[1.05rem] font-bold break-words", struck)}>{title}</span>
      <span className={cn("col-start-1 text-[0.93rem] break-words text-dim-foreground italic", struck)}>
        <b className="font-label mr-1.5 text-[0.72rem] tracking-[0.08em] text-faint-foreground not-italic">By</b>
        {name}
        {own && <span className="not-italic"> (you)</span>}
      </span>
      {removable && !held && (
        <span className="col-start-2 row-span-2 row-start-1 self-center">
          <Button
            type="button"
            variant="destructive-row"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Remove the nomination of ${title} by ${name}`}
            title="Remove with a reason"
          >
            <Trash2 />
          </Button>
        </span>
      )}
      {held && (
        <UndoBar
          className="col-span-2 mt-1.5"
          message={own ? "Removed. Your own: no announcement." : "Removed. The bot then posts the change with your reason."}
          delayMs={delayMs}
          onUndo={onUndo}
        />
      )}
      {error && (
        <p role="alert" className="col-span-2 mt-1 text-sm text-destructive">
          {"Couldn't remove it: "}
          {error}
        </p>
      )}
    </li>
  );
}
