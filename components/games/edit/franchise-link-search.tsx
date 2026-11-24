"use client";

import { useState } from "react";
import { Check, FolderPlus, LibraryBig, Plus, Search } from "lucide-react";
import type { FranchiseColumns } from "@/lib/franchises/types";
import { useFranchiseSearch } from "@/hooks/use-franchise-search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchProblemNote } from "@/components/search-problem-note";

// The Franchises tab's search (design pick 7A): find a Franchise by name and
// stage linking the game to it, or stage a new Franchise of that name when
// none has it. A Franchise the game is in, or staged to be, reads "Linked".
export function FranchiseLinkSearch({
  picked,
  staged,
  onPick,
  onCreate,
}: {
  picked: (franchiseId: number) => boolean;
  // Whether a new Franchise of that name is staged already.
  staged: (name: string) => boolean;
  onPick: (franchise: FranchiseColumns) => void;
  onCreate: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const { trimmed, hasQuery, results, loading, problem, settled } = useFranchiseSearch(query);
  const exact = results.some((f) => f.name.trim().toLowerCase() === trimmed.toLowerCase());
  const offerCreate = settled && !exact && !staged(trimmed);

  return (
    <div className="relative w-full sm:w-88">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-faint-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Link to a Franchise"
        aria-label="Link to a Franchise"
        className="pl-8"
      />
      {hasQuery && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-80 overflow-y-auto rounded-sm border border-border-strong bg-muted shadow-[0_12px_30px_rgb(0_0_0/0.45)]">
          {problem ? (
            <div className="p-3">
              <SearchProblemNote problem={problem} />
            </div>
          ) : (
            <ul aria-label="Matching Franchises">
              {loading && results.length === 0 && <li className="px-3 py-2.5 text-xs text-faint-foreground">Searching…</li>}
              {results.map((f) => (
                <li
                  key={f.franchise_id}
                  className="grid grid-cols-[16px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-border px-3 py-2 text-sm first:border-t-0"
                >
                  <LibraryBig aria-hidden className="size-4 text-faint-foreground" />
                  <span className="truncate font-semibold">{f.name}</span>
                  {picked(f.franchise_id) ? (
                    <span className="font-label flex items-center gap-1 px-2 text-[0.75rem] font-extrabold tracking-[0.08em] text-faint-foreground">
                      <Check aria-hidden className="size-3.5" />
                      Linked
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      aria-label={`Link to ${f.name}`}
                      onClick={() => {
                        onPick(f);
                        setQuery("");
                      }}
                    >
                      <Plus data-icon="inline-start" />
                      Link
                    </Button>
                  )}
                </li>
              ))}
              {offerCreate && (
                <li className="border-t border-border first:border-t-0">
                  <Button
                    type="button"
                    variant="row"
                    size="bare"
                    className="w-full gap-2.5 px-3 py-2.5"
                    onClick={() => {
                      onCreate(trimmed);
                      setQuery("");
                    }}
                  >
                    <FolderPlus aria-hidden className="size-4" />
                    Create a Franchise &ldquo;{trimmed}&rdquo;
                  </Button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
