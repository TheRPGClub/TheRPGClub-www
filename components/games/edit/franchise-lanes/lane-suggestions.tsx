"use client";

import { EyeOff, LibraryBig, Plus } from "lucide-react";
import type { FranchiseRole } from "@/lib/games/game-edit/franchises";
import {
  laneSuggestions,
  matchingSuggestions,
  suggestedFor,
  suggestionLane,
  suggestionParent,
  suggestionReason,
  suggestionWhy,
  type FranchiseSuggestion,
} from "@/lib/games/game-edit/franchise-suggestions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { SlotExtra } from "@/components/games/edit/franchise-lanes/lane-add-slot";

// The suggestions in an open + Add slot (design pick edit-lanes, www#209):
// "Suggested for <lane>", then each Franchise with its reason chip and one
// button that links it in the lane's role. Those whose likely role is the
// lane's come first, on a muted band with the yellow button. Not this one
// dismisses a suggestion for this game.
export function LaneSuggestions({
  suggestions,
  lane,
  laneTitle,
  roleLabel,
  onPick,
  onDismiss,
}: {
  suggestions: FranchiseSuggestion[];
  lane: FranchiseRole;
  laneTitle: string;
  roleLabel: string;
  onPick: (suggestion: FranchiseSuggestion) => void;
  onDismiss: (franchiseId: number) => void;
}) {
  if (suggestions.length === 0) return null;
  const forLane = suggestions.some((s) => suggestionLane(s) === lane);
  return (
    <div className="border-t border-border">
      <p id={`suggested-${lane}`} className="font-label px-3.5 pt-2 pb-1.5 text-[0.78rem] font-bold tracking-[0.08em] text-faint-foreground">
        {forLane ? `Suggested for ${laneTitle}` : "Suggested"}
      </p>
      <ul aria-labelledby={`suggested-${lane}`}>
        {suggestions.map((s) => {
          const fits = suggestionLane(s) === lane;
          const why = suggestionWhy(s);
          return (
            <li
              key={s.franchise.franchise_id}
              title={why}
              className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border py-2 pr-2 pl-3.5", fits && "bg-muted")}
            >
              <LibraryBig aria-hidden className="size-4 flex-none text-faint-foreground" />
              <span className="font-headline min-w-0 flex-1 basis-[calc(100%-1.75rem)] text-[1.06rem] leading-tight break-words sm:flex-none sm:basis-auto">{s.franchise.name}</span>
              <span className="font-label inline-flex items-center gap-1.5 rounded-xs border border-border-strong px-1.5 pt-1 pb-0.5 text-[0.74rem] font-bold tracking-[0.08em] text-dim-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-highlight" />
                {suggestionReason(s)}
              </span>
              {s.role === "add_on" && s.parent_title && <span className="min-w-0 flex-1 truncate text-[0.84rem] text-faint-foreground">Add-on of {s.parent_title}</span>}
              <span className="sr-only">{why}</span>
              <span className="ml-auto flex flex-none items-center gap-1">
                <Button
                  type="button"
                  variant={fits ? "highlight" : "outline"}
                  size="xs"
                  aria-label={`Link to ${s.franchise.name} as ${roleLabel}`}
                  onClick={() => onPick(s)}
                >
                  <Plus data-icon="inline-start" />
                  {roleLabel}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Not ${s.franchise.name}: stop suggesting it for this game`}
                  title="Not this one"
                  onClick={() => onDismiss(s.franchise.franchise_id)}
                >
                  <EyeOff />
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// A lane's suggestion props for its LaneAddSlot: the list under the search
// (narrowed by what is typed), the Franchises it lists kept out of the
// results, and "N suggested" on the closed Add for those whose likely role
// is the lane's. A suggestion linked, staged or dismissed (`hidden`) is
// gone. One press links it in the lane's role; in Add-on of an Add-on
// suggestion brings its parent, any other asks for one.
export function laneSuggestionSlot({
  suggestions,
  lane,
  laneTitle,
  roleLabel,
  hidden,
  onDismiss,
}: {
  suggestions: FranchiseSuggestion[];
  lane: FranchiseRole;
  laneTitle: string;
  roleLabel: string;
  hidden: (franchiseId: number) => boolean;
  onDismiss: (franchiseId: number) => void;
}): { extra?: SlotExtra; omit?: (franchiseId: number) => boolean; hint?: string } {
  const listed = laneSuggestions(suggestions, lane, hidden);
  if (listed.length === 0) return {};
  const count = suggestedFor(suggestions, lane, hidden);
  return {
    hint: count > 0 ? `${count} suggested` : undefined,
    omit: (id) => listed.some((s) => s.franchise.franchise_id === id),
    extra: ({ query, add }) => (
      <LaneSuggestions
        suggestions={matchingSuggestions(listed, query)}
        lane={lane}
        laneTitle={laneTitle}
        roleLabel={roleLabel}
        onDismiss={onDismiss}
        onPick={(s) => add({ franchise_id: s.franchise.franchise_id, name: s.franchise.name }, lane === "addon" ? suggestionParent(s) : undefined)}
      />
    ),
  };
}
