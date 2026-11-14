import { MessageSquareText } from "lucide-react";
import type { FeatureState } from "@/lib/features";
import { FEATURE_STATES, STATE_LABEL, type FeatureFlagEntry, type FlagPanel } from "@/lib/feature-flags";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// A row's controls: the speech-bubble reason note and the Off / Preview /
// Live segments. In the table the three segments are equal and fixed in
// width; stacked, they size to their labels. Off, while its confirm is
// open, says so (aria-expanded) and the Theme dashes it red.
export function FlagStateControl({
  entry,
  shown,
  busy,
  panel,
  panelId,
  hasDraft,
  onReason,
  onPick,
}: {
  entry: FeatureFlagEntry;
  shown: FeatureState;
  busy: boolean;
  panel: FlagPanel;
  panelId: string;
  hasDraft: boolean;
  onReason: () => void;
  onPick: (state: FeatureState) => void;
}) {
  const off = entry.state === "off";
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="note"
        size="icon-lg"
        data-filled={hasDraft ? "" : undefined}
        aria-label={`Reason for ${entry.name}'s next change`}
        aria-expanded={panel === "reason"}
        aria-controls={panelId}
        disabled={busy}
        onClick={onReason}
        className="transition-colors min-[85rem]:size-8"
      >
        <MessageSquareText aria-hidden className="size-4" />
      </Button>
      <ToggleGroup
        variant="state"
        value={[shown]}
        aria-label={`${entry.name} state`}
        aria-busy={busy}
        className="grid shrink-0 grid-cols-[repeat(3,auto)] gap-0 min-[85rem]:grid-cols-[repeat(3,4.25rem)]"
      >
        {FEATURE_STATES.map((state) => (
          <ToggleGroupItem
            key={state}
            value={state}
            tone={state}
            aria-expanded={state === "off" && !off ? panel === "confirm" : undefined}
            aria-controls={state === "off" && !off ? panelId : undefined}
            disabled={busy && shown !== state}
            onClick={() => onPick(state)}
            className="h-9 min-w-0 px-2 text-[0.82rem] transition-[color,background-color,box-shadow] duration-150 min-[85rem]:h-8 min-[85rem]:px-1"
          >
            {STATE_LABEL[state]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
