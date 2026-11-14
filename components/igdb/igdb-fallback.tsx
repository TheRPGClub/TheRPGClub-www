"use client";

import { Download, LoaderCircle } from "lucide-react";
import type { Game } from "@/lib/api/types";
import { useIgdbAdd, useIgdbSearch } from "@/hooks/use-igdb-search";
import { Button } from "@/components/ui/button";
import { IgdbResults } from "@/components/igdb/igdb-results";
import { cn } from "@/lib/utils";

export interface IgdbFallbackProps {
  // The search the GameDB found nothing for.
  query: string;
  // "page": the /games index. Searches IGDB when asked, and opens the game
  // once it's added. "picker": the list game picker. Searches straight away
  // and hands the added game back through `onAdded` to carry on the list flow.
  variant: "page" | "picker";
  // Why the viewer can't add games (signed out, no Members role), or null when
  // they can. The box still says the game isn't here, and why.
  blockedReason?: string | null;
  // The picker's list, for its copy ("on your Backlog").
  listLabel?: string;
  // What the picked game is for: a list (the default, using `listLabel`) or a
  // donated key, which has no list.
  purpose?: "list" | "donation";
  onAdded?: (game: Game) => void;
}

// "Not here? Add it from IGDB": what a game search shows when the GameDB has
// no match. Each IGDB result row adds that game (`POST /games`), or opens it
// when it is already in the GameDB. Key it by `query` so a new search starts
// over.
export function IgdbFallback({
  query,
  variant,
  blockedReason = null,
  listLabel,
  purpose = "list",
  onAdded,
}: IgdbFallbackProps) {
  const picker = variant === "picker";
  const allowed = !blockedReason;
  // Where an added game goes, for the picker's copy.
  const list = listLabel ?? "list";
  const destination = purpose === "donation" ? "picks it for your key" : `on your ${list}`;
  const pending = (name: string) =>
    purpose === "donation" ? `${name} is picked for your key` : `${name} goes on your ${list}`;
  const { search, run: runSearch } = useIgdbSearch(query, picker && allowed);
  const { busyId, rowError, add } = useIgdbAdd(onAdded);

  return (
    <div className={cn(picker ? "space-y-1.5" : "space-y-5")}>
      <div
        className={cn(
          "flex flex-wrap items-center rounded-[3px] border border-dashed border-border-strong",
          picker ? "px-4 py-3.5" : "gap-5 px-6 py-5.5",
        )}
      >
        {picker ? (
          <p className="flex-1 text-sm text-dim-foreground">
            {allowed
              ? `Not in the GameDB. These are from IGDB: adding one puts it in the GameDB and ${destination}.`
              : `Not in the GameDB. ${blockedReason}`}
          </p>
        ) : (
          <>
            <div className="min-w-0 flex-1 basis-64">
              <p className="font-headline text-[2rem]">Not here?</p>
              <p className="mt-2 text-[0.95rem] text-dim-foreground">
                No game in the GameDB matches &ldquo;{query}&rdquo;.{" "}
                {allowed
                  ? "Add it from IGDB and it joins the catalogue for everyone."
                  : blockedReason}
              </p>
            </div>
            {allowed && search.status !== "done" && (
              <Button
                type="button"
                variant="highlight"
                disabled={search.status === "loading"}
                onClick={runSearch}
              >
                {search.status === "loading" ? (
                  <LoaderCircle data-icon="inline-start" className="motion-safe:animate-spin" />
                ) : (
                  <Download data-icon="inline-start" />
                )}
                {search.status === "loading" ? "Searching IGDB" : "Add it from IGDB"}
              </Button>
            )}
          </>
        )}
      </div>

      {picker && search.status === "loading" && (
        <p className="flex items-center gap-2 px-1 py-1.5 text-xs text-faint-foreground">
          <LoaderCircle aria-hidden className="size-3.5 motion-safe:animate-spin" />
          Searching IGDB…
        </p>
      )}

      {search.status === "error" && (
        <p role="alert" className="px-1 text-sm text-destructive">
          {search.message}
        </p>
      )}

      {search.status === "done" && (
        <IgdbResults
          query={query}
          results={search.results}
          picker={picker}
          busyId={busyId}
          rowError={rowError}
          pendingLine={pending}
          onAdd={add}
        />
      )}
    </div>
  );
}
