"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { ImportIgdbCandidate } from "@/lib/api/types";
import {
  igdbSuggestionsHref,
  importErrorMessage,
  type ImportKind,
} from "@/lib/imports/kinds";
import { ImportIgdbHit } from "@/components/imports/import-igdb-hit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImportIgdbSuggestionsProps {
  kind: ImportKind;
  itemId: number;
  initialQuery: string;
  disabled?: boolean;
  onChoose: (candidate: ImportIgdbCandidate) => void;
}

// IGDB search for a row whose game isn't in GameDB yet. It only searches when
// asked, since every search is a call to IGDB. Choosing a hit imports it into
// GameDB and applies it (`apply {igdb_id}`). Shared by every import kind.
export function ImportIgdbSuggestions({
  kind,
  itemId,
  initialQuery,
  disabled,
  onChoose,
}: ImportIgdbSuggestionsProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ImportIgdbCandidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(igdbSuggestionsHref(kind, itemId, query));
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(importErrorMessage(body.error ?? body.message, res.status));
        setResults(null);
        return;
      }
      setResults((body.data ?? []) as ImportIgdbCandidate[]);
    } catch {
      setError("IGDB search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <form onSubmit={search} className="flex flex-col gap-2">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title to look up on IGDB"
          aria-label="IGDB search"
        />
        <Button type="submit" variant="outline" disabled={loading || disabled}>
          <Search data-icon="inline-start" /> {loading ? "Searching…" : "Search IGDB"}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="text-sm text-faint-foreground">IGDB has nothing for that title.</p>
      )}

      {results && results.length > 0 && (
        <ul>
          {results.map((hit) => (
            <ImportIgdbHit
              key={hit.igdb_id}
              hit={hit}
              disabled={disabled}
              onChoose={() => onChoose(hit)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
