import { Download } from "lucide-react";
import type { ImportIgdbCandidate } from "@/lib/api/types";
import { Button } from "@/components/ui/button";

// One IGDB search hit: its cover, year, whether GameDB has it yet, and the
// button that imports (if needed) and chooses it.
export function ImportIgdbHit({
  hit,
  disabled,
  onChoose,
}: {
  hit: ImportIgdbCandidate;
  disabled?: boolean;
  onChoose: () => void;
}) {
  const year = hit.first_release_date ? new Date(hit.first_release_date).getFullYear() : null;
  return (
    <li className="grid grid-cols-[2.1rem_1fr_auto] items-center gap-2.5 border-t border-border py-2 text-[0.85rem]">
      <span className="block h-11 w-[2.1rem] overflow-hidden rounded-[2px] bg-muted">
        {hit.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element -- remote game art from the API's image hosts, which next/image isn't configured for
          <img src={hit.cover_url} alt="" className="size-full object-cover" />
        )}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold break-words">{hit.name}</span>
        <span className="block text-xs text-faint-foreground">
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
      <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={onChoose}>
        {hit.already_imported ? "Choose" : <><Download /> Import &amp; choose</>}
      </Button>
    </li>
  );
}
