import type { VotingCategory } from "@/lib/api/types";
import { TRACK_NAME, TRACKS } from "@/lib/rounds";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { fieldLabel } from "./styles";

const TONE = { gotm: "gotm", nr_gotm: "nr" } as const;

// The track a new round is for: GOTM or NR-GOTM, the picked one filled in
// its track's colour. Exactly one is always picked.
export function RoundTrackPicker({
  category,
  onPick,
  disabled,
}: {
  category: VotingCategory;
  onPick: (category: VotingCategory) => void;
  disabled: boolean;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-1.5">
      <legend className={fieldLabel}>Track</legend>
      <ToggleGroup
        variant="track"
        value={[category]}
        onValueChange={(value) => {
          const next = TRACKS.find((c) => c === value[0]);
          if (next) onPick(next);
        }}
        disabled={disabled}
        aria-label="Track"
        className="mt-1.5 inline-flex gap-0 border p-0.5"
      >
        {TRACKS.map((c) => (
          <ToggleGroupItem
            key={c}
            value={c}
            tone={TONE[c]}
            className="h-auto min-w-0 px-3.5 py-1.5 text-[0.9rem] transition-colors"
          >
            {TRACK_NAME[c]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </fieldset>
  );
}
