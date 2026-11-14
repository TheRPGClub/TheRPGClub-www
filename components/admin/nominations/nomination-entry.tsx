import { Trash2 } from "lucide-react";
import type { Nomination } from "@/lib/api/types";
import { nominatorName } from "@/lib/rounds";
import { UndoBar } from "@/components/admin/desk/undo-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// One nomination on the desk: its game, who nominated it and why, and its
// delete. A held delete strikes it through over the Undo bar.
export function NominationEntry({
  nomination,
  own,
  held,
  error,
  delayMs,
  onDelete,
  onUndo,
}: {
  nomination: Nomination;
  own: boolean;
  held: boolean;
  error: string | undefined;
  delayMs: number;
  onDelete: () => void;
  onUndo: () => void;
}) {
  const title = nomination.game?.title ?? "No game named";
  const struck = held && "text-faint-foreground line-through decoration-destructive";
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 border-b border-border py-2.5">
      <span className={cn("text-[1.05rem] font-bold break-words", struck)}>{title}</span>
      <span className={cn("col-start-1 text-[0.93rem] break-words text-dim-foreground italic", struck)}>
        <b className="font-label mr-1.5 text-[0.72rem] tracking-[0.08em] text-faint-foreground not-italic">By</b>
        {nominatorName(nomination)}
        {own && <span className="not-italic"> (you)</span>}
      </span>
      {nomination.reason && (
        <span className={cn("col-start-1 line-clamp-2 text-[0.88rem] text-faint-foreground", struck)}>
          &ldquo;{nomination.reason}&rdquo;
        </span>
      )}
      {!held && (
        <span className="col-start-2 row-span-3 row-start-1 self-center">
          <Button
            type="button"
            variant="destructive-row"
            size="icon-sm"
            onClick={onDelete}
            aria-label={`Delete the nomination of ${title} by ${nominatorName(nomination)}`}
            title="Delete with a reason"
          >
            <Trash2 />
          </Button>
        </span>
      )}
      {held && (
        <UndoBar
          className="col-span-2 mt-1.5"
          message={own ? "Deleted. Your own: no announcement." : "Deleted. The bot then posts the change with your reason."}
          delayMs={delayMs}
          onUndo={onUndo}
        />
      )}
      {error && (
        <p role="alert" className="col-span-2 mt-1 text-sm text-destructive">
          {"Couldn't delete it: "}
          {error}
        </p>
      )}
    </li>
  );
}
