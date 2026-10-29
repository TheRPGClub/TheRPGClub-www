"use client";

import { useId, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { ImportCandidate, ImportMatchConfidence } from "@/lib/api/types";
import { Chip } from "@/components/issue/chip";
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
  const name = useId();
  const [selectedId, setSelectedId] = useState<number | null>(
    confidence === "exact" && candidates.length > 0 ? candidates[0].game_id : null,
  );
  const selected = candidates.find((c) => c.game_id === selectedId) ?? null;

  return (
    <div>
      <fieldset>
        <legend className="font-label flex flex-wrap items-center gap-2.5 text-[0.95rem] font-extrabold tracking-[0.08em]">
          Matches in GameDB
          {confidence && candidates.length > 0 && (
            <Chip className="h-5.5 text-[0.72rem]">{CONFIDENCE_LABELS[confidence]}</Chip>
          )}
        </legend>

        {candidates.length === 0 ? (
          <p className="mt-2.5 rounded-sm border border-dashed border-rule-strong px-4 py-5 text-sm text-paper-mute">
            No GameDB matches for this title. Search a different title, pick a
            game yourself or try IGDB.
          </p>
        ) : (
          <ul className="mt-2.5 space-y-2">
            {candidates.map((candidate, i) => (
              <li key={candidate.game_id}>
                <label className="group/opt grid cursor-pointer grid-cols-[1.25rem_2.9rem_1fr] items-center gap-3.5 rounded-sm px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-rule)] transition-colors hover:bg-ink-3 has-checked:bg-ink-3 has-checked:shadow-[inset_0_0_0_2px_var(--color-highlight)] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-highlight has-disabled:cursor-default has-disabled:opacity-60 sm:grid-cols-[1.25rem_2.9rem_1fr_auto]">
                  <input
                    type="radio"
                    name={name}
                    value={candidate.game_id}
                    checked={selectedId === candidate.game_id}
                    onChange={() => setSelectedId(candidate.game_id)}
                    disabled={disabled}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="size-5 rounded-full shadow-[inset_0_0_0_2px_#4a4a55] transition-shadow group-has-checked/opt:shadow-[inset_0_0_0_6px_var(--color-highlight)]"
                  />
                  <span className="block h-[3.8rem] w-[2.9rem] overflow-hidden rounded-[2px] bg-ink">
                    {candidate.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={candidate.cover_url}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="font-label block text-[1.1rem] leading-[1.05] font-extrabold tracking-[0.02em] break-words">
                      {candidate.title}
                    </span>
                    <span className="mt-0.5 block text-[0.8rem] text-paper-mute tabular-nums">
                      GameDB #{candidate.game_id}
                    </span>
                  </span>
                  {i === 0 && confidence === "exact" && (
                    <Chip className="hidden h-5.5 text-[0.72rem] sm:inline-flex">
                      Exact match
                    </Chip>
                  )}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-4">
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
