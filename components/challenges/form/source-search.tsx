"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ChallengeFormState } from "@/hooks/use-challenge-form";
import { usePoolSources } from "@/hooks/use-pool-sources";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { SearchProblemNote } from "@/components/search-problem-note";

// The Pool editor's source search: Franchises, then Series (IGDB
// collections), matching what the member types, each with how many games it
// brings. Picking one adds its games as Optional Games; one already in the
// Pool is marked.
export function SourceSearch({ form }: { form: ChallengeFormState }) {
  const [query, setQuery] = useState("");
  const { hasQuery, results, loading, problem, settled } = usePoolSources(query);
  const chosen = (kind: string, id: number) => form.draft.sources.some((s) => s.kind === kind && s.id === id);
  return (
    <div className="space-y-1">
      <InputGroup variant="search">
        <InputGroupAddon>
          <Search aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          autoFocus
          aria-label="Search Franchises and Series"
          placeholder="Search Franchises and Series…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </InputGroup>
      {hasQuery && (
        <div className="rounded-md border border-border-strong bg-card p-1.5" aria-live="polite">
          {loading && results.length === 0 && <p className="px-2 py-2 text-sm text-faint-foreground">Searching…</p>}
          {problem && <SearchProblemNote problem={problem} className="px-2 py-2" />}
          {settled && results.length === 0 && !problem && (
            <p className="px-2 py-2 text-sm text-faint-foreground">No Franchises or Series match.</p>
          )}
          <ul className="max-h-72 overflow-y-auto">
            {results.map((source) => {
              const on = chosen(source.kind, source.id);
              return (
                <li key={`${source.kind}-${source.id}`}>
                  <Button
                    type="button"
                    variant="pick-row"
                    size="bare"
                    aria-pressed={on}
                    onClick={() => (on ? form.removeSource(source) : form.addSource(source))}
                    className="flex w-full items-center justify-between gap-3 px-2.5 py-2 text-left"
                  >
                    <span className="min-w-0 truncate">{source.name}</span>
                    <span className="font-label shrink-0 text-[0.76rem] tracking-[0.08em] text-faint-foreground">
                      {source.kind === "franchise" ? "Franchise" : "Series"} · {source.game_count}
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
