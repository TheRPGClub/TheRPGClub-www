import { useId } from "react";
import { Scissors } from "lucide-react";
import type { GotyNomination, GotyVote } from "@/lib/api/goty";
import { UNDO_DELAY_MS } from "@/lib/desk";
import { gotyNominatorName } from "@/lib/goty-desk";
import { REMOVAL_REASON_MAX } from "@/lib/rounds";
import { fieldLabelType } from "@/components/admin/rounds/styles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GotyNominationNotice } from "./goty-nomination-notice";

// The reason box a remove opens in place of the entry, as for a GOTM
// nomination: what goes, the reason (1 to 250, required unless it is your
// own) and the bot's notice as it will read. Ctrl or Cmd + Enter removes,
// Escape cancels.
export function GotyReasonBox({
  vote,
  nomination,
  own,
  viewerName,
  reason,
  onReason,
  onConfirm,
  onCancel,
}: {
  vote: GotyVote;
  nomination: GotyNomination;
  own: boolean;
  viewerName: string;
  reason: string;
  onReason: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  const title = nomination.game?.title ?? `Game ${nomination.gamedb_game_id}`;
  const name = gotyNominatorName(nomination);
  const ready = own || reason.trim().length > 0;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="text-[1.05rem] font-bold break-words">{title}</h3>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-highlight">Removing</span>
      </div>
      <p className="text-[0.9rem] text-dim-foreground">
        Game of the Year, {vote.name}, nominated by {name}
        {own && " (you)"}.
      </p>
      <Label htmlFor={`${id}-reason`} variant="field" className={cn(fieldLabelType, "mt-3")}>
        {own ? "Reason (optional: your own posts nothing)" : "Reason, posted with the change"}
      </Label>
      <Textarea
        id={`${id}-reason`}
        variant="inset"
        value={reason}
        onChange={(e) => onReason(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && ready) onConfirm();
          if (e.key === "Escape") onCancel();
        }}
        rows={2}
        maxLength={REMOVAL_REASON_MAX}
        autoFocus
        aria-describedby={`${id}-count`}
        className="mt-1.5 inline-block min-h-0 px-3 text-sm field-sizing-fixed"
        placeholder={own ? "" : `e.g. Released in ${vote.year - 1}, not ${vote.year}`}
      />
      <p id={`${id}-count`} className="text-right text-[0.75rem] text-faint-foreground">
        {reason.length}/{REMOVAL_REASON_MAX}
      </p>
      {!own && (
        <GotyNominationNotice
          className="mt-1 rounded-sm bg-background p-2.5"
          vote={vote}
          deleter={viewerName}
          nominator={name}
          title={nomination.game?.title ?? null}
          reason={reason.trim() || "…"}
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="destructive-solid" size="sm" disabled={!ready} onClick={onConfirm}>
          <Scissors data-icon="inline-start" />
          {own ? "Remove" : "Remove with reason"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <span className="ml-auto text-[0.8rem] text-faint-foreground">
          You get {Math.round(UNDO_DELAY_MS / 1000)} s to undo
        </span>
      </div>
    </div>
  );
}
