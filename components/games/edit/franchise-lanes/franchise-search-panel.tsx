"use client";

import { useState } from "react";
import { Check, FolderPlus, LibraryBig, Plus } from "lucide-react";
import type { FranchiseColumns } from "@/lib/franchises/types";
import { useFranchiseSearch } from "@/hooks/use-franchise-search";
import { Button } from "@/components/ui/button";
import { SearchProblemNote } from "@/components/search-problem-note";
import { SlotSearchField } from "@/components/games/edit/franchise-lanes/slot-search-field";

// The search in a lane's + Add slot: find a Franchise by name and link it in
// the lane's role (`roleLabel` on its button), or make one of that name when
// none has it. A Franchise the game is in, or staged to be, reads "Linked".
export function FranchiseSearchPanel({
  laneTitle,
  roleLabel,
  picked,
  staged,
  onPick,
  onCreate,
  onClose,
}: {
  laneTitle: string;
  roleLabel: string;
  picked: (franchiseId: number) => boolean;
  // Whether a new Franchise of that name is staged already.
  staged: (name: string) => boolean;
  onPick: (franchise: FranchiseColumns) => void;
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const { trimmed, hasQuery, results, loading, problem, settled } = useFranchiseSearch(query);
  const exact = results.some((f) => f.name.trim().toLowerCase() === trimmed.toLowerCase());
  const offerCreate = settled && !exact && !staged(trimmed);

  return (
    <>
      <SlotSearchField value={query} onChange={setQuery} onClose={onClose} label={`Find a Franchise for ${laneTitle}`} placeholder="Find a Franchise by name" />
      {problem && (
        <div className="border-t border-border p-3">
          <SearchProblemNote problem={problem} />
        </div>
      )}
      {hasQuery && !problem && (
        <ul aria-label="Matching Franchises" className="max-h-80 overflow-y-auto">
          {loading && results.length === 0 && <li className="border-t border-border px-3.5 py-2.5 text-sm text-faint-foreground">Searching…</li>}
          {settled && results.length === 0 && !offerCreate && (
            <li className="border-t border-border px-3.5 py-2.5 text-sm text-faint-foreground">No other Franchise has that name.</li>
          )}
          {results.map((f) => (
            <li key={f.franchise_id} className="flex items-center gap-3 border-t border-border py-2 pr-3 pl-3.5">
              <LibraryBig aria-hidden className="size-4 flex-none text-faint-foreground" />
              <span className="font-headline min-w-0 flex-1 truncate text-[1.02rem] leading-tight">{f.name}</span>
              {picked(f.franchise_id) ? (
                <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                  <Check aria-hidden className="size-3.5" />
                  Linked
                </span>
              ) : (
                <Button type="button" variant="outline" size="xs" aria-label={`Link to ${f.name} as ${roleLabel}`} onClick={() => onPick(f)}>
                  <Plus data-icon="inline-start" />
                  {roleLabel}
                </Button>
              )}
            </li>
          ))}
          {offerCreate && (
            <li className="border-t border-border">
              <Button type="button" variant="row" size="bare" className="w-full gap-2.5 px-3.5 py-2.5" onClick={() => onCreate(trimmed)}>
                <FolderPlus aria-hidden className="size-4" />
                Create a Franchise &ldquo;{trimmed}&rdquo;
              </Button>
            </li>
          )}
        </ul>
      )}
    </>
  );
}
