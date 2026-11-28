"use client";

import { useId, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { ImportCandidate, ImportMatchConfidence } from "@/lib/api/types";
import { ImportCandidateOption } from "@/components/imports/import-candidate-option";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";

const CONFIDENCE_LABELS: Record<ImportMatchConfidence, string> = {
  exact: "Exact title match",
  fuzzy: "Close matches",
  manual: "Your search",
};

interface ImportCandidateListProps {
  candidates: ImportCandidate[];
  confidence: ImportMatchConfidence | null;
  disabled?: boolean;
  onChoose: (candidate: ImportCandidate) => void;
  // The confirm button's label.
  chooseLabel?: string;
  // Sits beside the confirm button (e.g. Skip).
  footer?: ReactNode;
}

// The GameDB matches the server found for a row, as a radio group with one
// confirm button. An exact title match comes preselected; anything looser
// waits for the member to pick. Shared by every import kind's review.
export function ImportCandidateList({
  candidates,
  confidence,
  disabled,
  onChoose,
  chooseLabel = "Use this match",
  footer,
}: ImportCandidateListProps) {
  const legendId = useId();
  const [selectedId, setSelectedId] = useState<number | null>(
    confidence === "exact" && candidates.length > 0 ? candidates[0].game_id : null,
  );
  const selected = candidates.find((c) => c.game_id === selectedId) ?? null;

  return (
    <div>
      <fieldset>
        <legend
          id={legendId}
          className="font-label flex flex-wrap items-center gap-2.5 text-[0.95rem] font-extrabold tracking-[0.08em]"
        >
          Matches in GameDB
          {confidence && candidates.length > 0 && (
            <Badge className="h-5.5 border-0 text-[0.72rem]">{CONFIDENCE_LABELS[confidence]}</Badge>
          )}
        </legend>

        {candidates.length === 0 ? (
          <p data-slot="shelf-empty" className="mt-2.5 rounded-sm border border-dashed border-border-strong px-4 py-5 text-sm text-faint-foreground">
            No GameDB matches for this title. Search a different title, pick a
            game yourself or try IGDB.
          </p>
        ) : (
          <RadioGroup
            aria-labelledby={legendId}
            value={selectedId}
            onValueChange={(value) => setSelectedId(value as number)}
            disabled={disabled}
            className="mt-2.5"
          >
            {candidates.map((candidate, i) => (
              <ImportCandidateOption
                key={candidate.game_id}
                candidate={candidate}
                exact={i === 0 && confidence === "exact"}
              />
            ))}
          </RadioGroup>
        )}
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {candidates.length > 0 && (
          <Button
            type="button"
            variant="highlight"
            disabled={disabled || !selected}
            onClick={() => selected && onChoose(selected)}
          >
            <Check data-icon="inline-start" />
            {chooseLabel}
          </Button>
        )}
        {footer}
      </div>
    </div>
  );
}
