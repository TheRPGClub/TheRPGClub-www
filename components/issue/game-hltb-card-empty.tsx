import { CloudOff, RotateCw, SearchX } from "lucide-react";
import { HLTB_FAILURE_COPY, hltbSearchUrl, type HltbLookupFailure } from "@/lib/hltb";
import { Button } from "@/components/ui/button";
import { SourceLink } from "@/components/issue/game-hltb-card-parts";

// The "Time to beat" card without times: nothing saved yet (with the
// lookup at the heading), or a lookup that didn't find any.

const emptyBoxClass =
  "flex flex-col items-start gap-3 rounded-sm border border-dashed border-border-strong px-4 py-4.5";

export function Empty({ unloaded, canLookUp }: { unloaded: boolean; canLookUp: boolean }) {
  return (
    <div className={emptyBoxClass}>
      <p className="text-[0.9rem] text-dim-foreground">
        {unloaded
          ? "Saved times couldn't be loaded right now."
          : "No HowLongToBeat times saved yet."}{" "}
        {canLookUp
          ? "Look them up with the reload button beside the heading."
          : "Members with the Members role can look them up."}
      </p>
    </div>
  );
}

export function Failure({
  failure,
  message,
  title,
  onRetry,
}: {
  failure: HltbLookupFailure;
  message?: string;
  title: string;
  onRetry?: () => void;
}) {
  const copy = HLTB_FAILURE_COPY[failure];
  const Icon = failure === "no_match" ? SearchX : CloudOff;
  const retry = onRetry && (failure === "failed" || failure === "other");
  return (
    <div className={emptyBoxClass}>
      <div className="flex items-start gap-2.5 text-[0.92rem] text-dim-foreground">
        <Icon aria-hidden className="mt-0.5 size-4.5 shrink-0 text-faint-foreground" />
        <span>
          <b className="font-semibold text-foreground">{copy.title}</b>{" "}
          {message ?? copy.body}
        </span>
      </div>
      {failure === "no_match" && (
        <SourceLink href={hltbSearchUrl(title)}>Search HowLongToBeat</SourceLink>
      )}
      {retry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw data-icon="inline-start" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
