"use client";

import { useState } from "react";
import { Download, Search } from "lucide-react";
import type { ImportIgdbCandidate } from "@/lib/api/types";
import {
  igdbSuggestionsHref,
  importErrorMessage,
  type ImportKind,
} from "@/lib/imports/kinds";
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
        <p className="text-sm text-paper-mute">IGDB has nothing for that title.</p>
      )}

      {results && results.length > 0 && (
        <ul>
          {results.map((hit) => {
            const year = hit.first_release_date
              ? new Date(hit.first_release_date).getFullYear()
              : null;
            return (
              <li
                key={hit.igdb_id}
                className="grid grid-cols-[2.1rem_1fr_auto] items-center gap-2.5 border-t border-rule py-2 text-[0.85rem]"
              >
                <span className="block h-11 w-[2.1rem] overflow-hidden rounded-[2px] bg-ink-3">
                  {hit.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hit.cover_url}
                      alt=""
                      className="size-full object-cover"
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold break-words">{hit.name}</span>
                  <span className="block text-xs text-paper-mute">
                    {year && <>{year} · </>}
                    {hit.already_imported ? "already in GameDB" : "new to GameDB"}
                    {" · "}
                    {hit.url ? (
                      <a
                        href={hit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:text-highlight hover:underline"
                      >
                        IGDB #{hit.igdb_id}
                      </a>
                    ) : (
                      <>IGDB #{hit.igdb_id}</>
                    )}
                  </span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => onChoose(hit)}
                >
                  {hit.already_imported ? "Choose" : <><Download /> Import &amp; choose</>}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
