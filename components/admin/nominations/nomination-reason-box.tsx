import { useId } from "react";
import { Scissors } from "lucide-react";
import type { Nomination, VotingCategory } from "@/lib/api/types";
import { UNDO_DELAY_MS } from "@/lib/desk";
import { nominatorName, REMOVAL_REASON_MAX, TRACK_NAME } from "@/lib/rounds";
import { fieldLabelType } from "@/components/admin/rounds/styles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NominationNotice } from "./nomination-notice";
import { Label } from "@/components/ui/label";

// The reason box a delete opens in place of the entry: what goes, the
// reason (required unless it is your own) and the bot's notice as it will
// read. Ctrl or Cmd + Enter deletes, Escape cancels.
export function NominationReasonBox({
  category,
  nomination,
  round,
  own,
  viewerName,
  votesCast,
  reason,
  onReason,
  onConfirm,
  onCancel,
}: {
  category: VotingCategory;
  nomination: Nomination;
  round: number;
  own: boolean;
  viewerName: string;
  votesCast: boolean;
  reason: string;
  onReason: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const id = useId();
  const title = nomination.game?.title ?? "No game named";
  const ready = own || reason.trim().length > 0;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h3 className="text-[1.05rem] font-bold break-words">{title}</h3>
        <span className="font-label text-[0.72rem] font-bold tracking-[0.08em] text-highlight">
          Deleting
        </span>
      </div>
      <p className="text-[0.9rem] text-dim-foreground">
        {TRACK_NAME[category]} round {round}, nominated by {nominatorName(nomination)}
        {own && " (you)"}.{votesCast && " Any votes cast on it go too."}
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
        placeholder={own ? "" : "e.g. Already won GOTM in round 120"}
      />
      <p id={`${id}-count`} className="text-right text-[0.75rem] text-faint-foreground">
        {reason.length}/{REMOVAL_REASON_MAX}
      </p>
      {!own && (
        <NominationNotice
          className="mt-1 rounded-sm bg-background p-2.5"
          category={category}
          round={round}
          deleter={viewerName}
          nominator={nominatorName(nomination)}
          title={nomination.game?.title ?? null}
          reason={reason.trim() || "…"}
        />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="destructive-solid" size="sm" disabled={!ready} onClick={onConfirm}>
          <Scissors data-icon="inline-start" />
          {own ? "Delete" : "Delete with reason"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <span className="ml-auto text-[0.8rem] text-faint-foreground">You get {Math.round(UNDO_DELAY_MS / 1000)} s to undo</span>
      </div>
    </div>
  );
}
