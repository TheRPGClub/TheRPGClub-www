"use client";

import type { IgdbSearchCandidate } from "@/lib/api/types";
import { IgdbRow } from "@/components/igdb/igdb-row";

// The IGDB results list, under the "Not here?" box. The picker's is compact,
// with no heading, and says where a picked game goes while it is added.
export function IgdbResults({
  query,
  results,
  picker,
  busyId,
  rowError,
  pendingLine,
  onAdd,
}: {
  query: string;
  results: IgdbSearchCandidate[];
  picker: boolean;
  busyId: number | null;
  rowError: { id: number; message: string } | null;
  // The picker's "you stay here" line for the game being added.
  pendingLine: (name: string) => string;
  onAdd: (hit: IgdbSearchCandidate) => void;
}) {
  const busyHit = results.find((hit) => hit.igdb_id === busyId);
  return (
    <section aria-label="IGDB results">
      {!picker && (
        <div className="mb-2.5 flex items-baseline gap-2.5 border-b border-border pb-1.5">
          <h3 className="font-label text-[1.05rem] font-extrabold">IGDB results</h3>
          <span className="font-label ml-auto text-[0.8rem] tracking-[0.08em] text-faint-foreground">
            {results.length === 0
              ? "No matches"
              : `${results.length} ${results.length === 1 ? "match" : "matches"} · pick one`}
          </span>
        </div>
      )}
      {results.length === 0 ? (
        <p className="px-1 py-2 text-sm text-faint-foreground">
          IGDB has nothing for &ldquo;{query}&rdquo; either. Try another spelling.
        </p>
      ) : (
        <ul>
          {results.map((hit) => (
            <IgdbRow
              key={hit.igdb_id}
              hit={hit}
              compact={picker}
              busy={busyId === hit.igdb_id}
              disabled={busyId !== null}
              error={rowError?.id === hit.igdb_id ? rowError.message : null}
              existingLabel={picker ? "In GameDB · Pick" : "In GameDB · Open game"}
              onAdd={() => onAdd(hit)}
            />
          ))}
        </ul>
      )}
      {picker && busyHit && (
        <p className="mt-2.5 flex items-center gap-2.5 rounded-[2.4px] bg-muted px-3 py-2.5 text-sm text-dim-foreground">
          You stay here. {pendingLine(busyHit.name)} as soon as it is added.
        </p>
      )}
    </section>
  );
}
