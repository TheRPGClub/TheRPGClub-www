"use client";

import { Check } from "lucide-react";
import type { ImportCandidate, ImportMatchConfidence } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
}

// The GameDB matches the server found for a row, each with a "Choose"
// button. Shared by every import kind's review.
export function ImportCandidateList({
  candidates,
  confidence,
  disabled,
  onChoose,
}: ImportCandidateListProps) {
  if (candidates.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
        No GameDB matches for this title. Search a different title, pick a game
        yourself or try IGDB below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {confidence && (
        <Badge variant="secondary">{CONFIDENCE_LABELS[confidence]}</Badge>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <li
            key={candidate.game_id}
            className="flex items-center gap-3 rounded-lg border bg-card p-2"
          >
            {candidate.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={candidate.cover_url}
                alt=""
                className="h-16 w-12 shrink-0 rounded object-cover"
              />
            ) : (
              <div className="h-16 w-12 shrink-0 rounded bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium">{candidate.title}</p>
              <p className="text-xs text-muted-foreground tabular-nums">
                GameDB #{candidate.game_id}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={() => onChoose(candidate)}
            >
              <Check /> Choose
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
